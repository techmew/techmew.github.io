const MODEL = "@cf/zai-org/glm-4.7-flash";

const PREPROCESS_TOOL = {
  type: "function",
  function: {
    name: "submit_preprocess_result",
    description: "日本語校正と安全チェックを一度に返す。",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        corrected_text: { type: "string" },
        corrections: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              before: { type: "string" },
              after: { type: "string" },
              reason: { type: "string" }
            },
            required: ["before", "after", "reason"]
          }
        },
        risk_level: { type: "string", enum: ["none", "low", "medium", "high"] },
        warnings: { type: "array", items: { type: "string" } }
      },
      required: ["corrected_text", "corrections", "risk_level", "warnings"]
    },
    strict: true
  }
};

const RESULT_TOOL = {
  type: "function",
  function: {
    name: "submit_x_post_result",
    description: "校正済み文章を元にコンプラ確認と3つのX投稿案を返す。",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        compliance: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              level: { type: "string", enum: ["low", "medium", "high"] },
              message: { type: "string" }
            },
            required: ["level", "message"]
          }
        },
        variants: {
          type: "array",
          minItems: 3,
          maxItems: 3,
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              title: { type: "string" },
              text: { type: "string" },
              hashtags: { type: "array", maxItems: 3, items: { type: "string" } },
              reason: { type: "string" }
            },
            required: ["title", "text", "hashtags", "reason"]
          }
        }
      },
      required: ["compliance", "variants"]
    },
    strict: true
  }
};

export default {
  async fetch(request, env) {
    const cors = corsHeaders(request);

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });

    if (request.method === "GET") {
      return json({
        ok: true,
        service: "X Post Studio AI Worker",
        model: MODEL,
        pipeline: "stable_two_call_v4"
      }, 200, cors);
    }

    if (request.method !== "POST") return json({ error: "POST only" }, 405, cors);

    try {
      const body = await request.json();

      if (body.action === "ping") {
        return json({ ok: true, service: "X Post Studio AI Worker", pipeline: "stable_two_call_v4" }, 200, cors);
      }

      if (body.action !== "compose") return json({ error: "Unknown action" }, 400, cors);

      const originalText = String(body.text || "").trim();
      const emojiLevel = ["high", "medium", "none"].includes(body.emojiLevel) ? body.emojiLevel : "medium";
      const plan = body.plan === "long" ? "long" : "free";

      if (!originalText) return json({ error: "本文が空です" }, 400, cors);
      if (originalText.length > 25000) return json({ error: "本文が長すぎます" }, 400, cors);

      // 明示的な危害・死亡願望だけはAIへ渡す前に最低限緩和する。
      // 「馬鹿」「老害」等の侮辱は警告のみで、勝手に無難化しない。
      const correctedKnownTerms = applyKnownTermCorrections(originalText);
      const localSafety = localSafetyCheck(correctedKnownTerms.text);

      const preprocess = await runPreprocess(env, localSafety.text);

      const correctedText = preprocess && preprocess.corrected_text
        ? String(preprocess.corrected_text).trim()
        : localSafety.text;

      const corrections = uniqueStrings([
        ...correctedKnownTerms.corrections,
        ...normalizeCorrections(preprocess && preprocess.corrections)
      ]);
      const aiRisk = preprocess && ["none", "low", "medium", "high"].includes(preprocess.risk_level)
        ? preprocess.risk_level
        : "none";
      const riskLevel = higherRisk(localSafety.level, aiRisk);
      const warnings = uniqueStrings([
        ...localSafety.warnings,
        ...(preprocess && Array.isArray(preprocess.warnings) ? preprocess.warnings : [])
      ]);

      const lengthRule = plan === "free"
        ? "3案ともX通常投稿の280文字以内を強く意識する。URL等の文字数計算差を考え、可能なら本文とハッシュタグ合計を260文字程度までに収める。"
        : "長文投稿として内容を削りすぎず整理する。スレッド分割はしない。";

      const emojiRule = emojiLevel === "none"
        ? "絵文字は追加しない。"
        : emojiLevel === "high"
          ? "内容に合う絵文字を多めに使う。ただし連打して読みにくくしない。"
          : "絵文字は自然な範囲で少量から中程度使う。";

      const system = [
        "あなたは日本語のX投稿専門編集者です。",
        "入力は安全確認と日本語校正を終えた文章です。校正済み表記や安全化された表現を元へ戻さないでください。",
        "必ず submit_x_post_result ツールを1回呼び出してください。通常の文章回答は禁止です。",
        "元文章の口調・語尾・温度感を維持し、別人格へ変えない。",
        "元文の改行位置と段落構造を原則そのまま維持する。",
        "原文に改行がある場合、全文を1段落へ結合してはいけない。",
        "原文に空行が1つある箇所は、その段落区切りを維持する。",
        "読みやすさ目的だけで勝手に改行・空行を追加、削除、移動しない。",
        "原文に『↓』『続く』『→』『※』などの継続・注記記号がある場合、意味上不要と判断して勝手に削除しない。",
        "元文にない事実、体験、数字、年、日付、時代背景、人気、評判、トレンドを絶対に捏造しない。",
        "入力文に年が書かれていない場合、2024年・2025年・2026年など現在年や過去年を推測して追加してはいけない。",
        "『今は○○年なのに』『○○年だし』のような時代背景を勝手に補足しない。",
        "投稿案は必ず3件。",
        "案1は自然で伝わりやすくする。",
        "案2は冒頭を強め、反応を得やすくする。ただし釣り・過剰煽りは禁止。",
        "案3は要点を短く強くまとめる。",
        "ハッシュタグは付けない方が自然なら0個でよい。",
        "ハッシュタグは内容を具体的に表すものだけ0〜3個にする。",
        "『#嫌い』『#最悪』『#時代錯誤』のような感情・評価だけの雑な汎用タグは、検索上の明確な意味がない限り付けない。",
        "リアルタイムトレンドを取得したふりは禁止。",
        "コンプラでは誹謗中傷、差別、個人情報、違法・危険行為、医療・金融の強い断定、著作権侵害を助長する表現、根拠のない断定を注意候補にする。問題がなければ空配列。",
        lengthRule,
        emojiRule
      ].join("\n");

      let structured = null;
      let lastTemporalFacts = [];
      let lastLayoutProblems = [];

      for (let attempt = 0; attempt < 2; attempt++) {
        let retryNote = "";

        if (lastTemporalFacts.length) {
          retryNote += "\n前回の出力には入力文に存在しない年・日付が含まれていました: " +
            lastTemporalFacts.join(", ") +
            "。これらを追加せず、元文にある情報だけで作り直してください。";
        }

        if (lastLayoutProblems.length) {
          retryNote += "\n前回の出力では原文の改行・段落・継続記号が崩れました: " +
            lastLayoutProblems.join(" / ") +
            "。内容を1段落へまとめず、原文の構造を維持してください。";
        }

        if (!retryNote && attempt > 0) {
          retryNote = "\n前回の構造化出力が不完全でした。必須項目をすべて埋めてください。";
        }

        structured = await runCompose(
          env,
          system + retryNote,
          correctedText,
          plan,
          attempt === 0 ? 0.15 : 0.05
        );

        if (!isValidResult(structured)) continue;

        lastTemporalFacts = findUnsupportedTemporalFacts(correctedText, structured);
        lastLayoutProblems = findLayoutProblems(correctedText, structured);

        if (!lastTemporalFacts.length && !lastLayoutProblems.length) break;
        structured = null;
      }

      if (!isValidResult(structured)) {
        let error = "AI出力が安定しませんでした。もう一度実行してください。";
        let errorCode = "STRUCTURED_OUTPUT_FAILED";

        if (lastTemporalFacts.length) {
          error = "AIが入力文にない年・日付を追加したため、出力を破棄しました。もう一度実行してください。";
          errorCode = "UNSUPPORTED_TEMPORAL_FACT";
        } else if (lastLayoutProblems.length) {
          error = "AIが原文の改行・段落構造を崩したため、出力を破棄しました。もう一度実行してください。";
          errorCode = "LAYOUT_MISMATCH";
        }

        return json({ error, error_code: errorCode }, 502, cors);
      }

      return json(normalizeResult(structured, correctedText, corrections, riskLevel, warnings), 200, cors);
    } catch (error) {
      const message = error && error.message ? error.message : "Worker error";
      return json({ error: "AI処理で一時的なエラーが発生しました。もう一度実行してください。", detail: message }, 500, cors);
    }
  }
};

async function runPreprocess(env, text) {
  const system = [
    "あなたはX投稿の日本語校正と安全チェック担当です。",
    "必ず submit_preprocess_result ツールを1回呼び出してください。通常の文章回答は禁止です。",
    "主張・感情・口調・語尾は変えず、誤字脱字、IME誤変換、助詞誤りだけを厳密に修正してください。",
    "文法上の助詞『の』がカタカナの『ノ』なら『の』へ直す。",
    "文法上の助詞『で』が漢字の『出』なら『で』へ直す。",
    "同様に『は/わ』『に/二』『へ/え』『を/お』等のIME・音声入力由来の明らかな誤変換も確認する。",
    "固有名詞・番組名・商品名の正式表記だと明確な場合は勝手に変えない。",
    "一方で、地名・店名・支店名・施設名の一部がIMEや音声入力で一般語へ誤変換されている可能性は厳しく確認する。",
    "特に『○○店』『○○駅』『○○市』『○○町』『○○病院』『○○学校』の直前語は固有名詞候補として扱い、文脈上不自然な一般語なら同音・近音の地名や名称への誤変換を疑う。",
    "例: 『トライアル可能店』は、文脈上の店舗名として不自然なら『トライアル加納店』のような支店名誤変換を疑う。",
    "ただし確信できない固有名詞を新しく捏造してはいけない。候補が曖昧なら原文を維持する。",
    "表現の言い換え、丁寧化、読みやすい再構成はしない。",
    "改行位置と段落構造は原文を原則そのまま維持する。",
    "原文に改行がある場合、全文を1段落へ結合しない。",
    "原文に空行が1つある箇所は、その段落区切りを維持する。",
    "読みやすさ目的で勝手に改行・空行を追加、削除、移動しない。",
    "原文の『↓』『続く』『→』『※』などの継続・注記記号を勝手に削除しない。",
    "脅迫、殺害・暴行の示唆、他者への死亡願望はhighとして警告する。",
    "『馬鹿』『カス』『老害』『頭おかしい』等の強い侮辱はlowまたはmediumで警告してよいが、それだけを理由に文章を無難化しない。",
    "correctionsには実際に変更した箇所だけをbefore/after/reasonで記録する。"
  ].join("\n");

  try {
    const result = await env.AI.run(MODEL, {
      messages: [{ role: "system", content: system }, { role: "user", content: text }],
      tools: [PREPROCESS_TOOL],
      tool_choice: "required",
      parallel_tool_calls: false,
      max_completion_tokens: 1200,
      temperature: 0.02
    });

    let structured = extractToolArguments(result, "submit_preprocess_result");
    if (!structured) structured = parseJson(extractText(result));
    return isValidPreprocess(structured) ? structured : null;
  } catch (_) {
    return null;
  }
}

async function runCompose(env, system, correctedText, plan, temperature) {
  try {
    const result = await env.AI.run(MODEL, {
      messages: [{ role: "system", content: system }, { role: "user", content: correctedText }],
      tools: [RESULT_TOOL],
      tool_choice: "required",
      parallel_tool_calls: false,
      max_completion_tokens: plan === "free" ? 1500 : 4500,
      temperature
    });

    let structured = extractToolArguments(result, "submit_x_post_result");
    if (!structured) structured = parseJson(extractText(result));
    return structured;
  } catch (_) {
    return null;
  }
}

function applyKnownTermCorrections(input) {
  let text = String(input || "");
  const corrections = [];

  const rules = [
    {
      pattern: /トライアル可能店/g,
      replacement: "トライアル加納店",
      note: "トライアル可能店 → トライアル加納店（支店名の誤変換）"
    }
  ];

  for (const rule of rules) {
    if (rule.pattern.test(text)) {
      rule.pattern.lastIndex = 0;
      text = text.replace(rule.pattern, rule.replacement);
      corrections.push(rule.note);
    }
  }

  return { text, corrections };
}

function localSafetyCheck(input) {
  let text = String(input || "");
  const warnings = [];
  let level = "none";

  const replace = (pattern, replacement, warning) => {
    if (!pattern.test(text)) return;
    pattern.lastIndex = 0;
    text = text.replace(pattern, replacement);
    warnings.push(warning);
    level = "high";
  };

  replace(/ぶっ?殺してやろうか|殺してやろうか|ぶっ?殺したい|殺したい/g, "本当に腹が立つ", "直接的な殺害・危害表現をマイルドな表現へ変更しました。");
  replace(/死ねばいい|死んでほしい|死ね(?!ば)/g, "もう勘弁してほしい", "他者への死亡願望表現をマイルドな表現へ変更しました。");

  if (/(?:馬鹿|バカ|アホ|カス|老害|頭おかし)/.test(text) && level !== "high") {
    level = "medium";
    warnings.push("強い侮辱表現が含まれています。投稿は継続できます。");
  }

  return { text, level, warnings };
}

function higherRisk(a, b) {
  const rank = { none: 0, low: 1, medium: 2, high: 3 };
  return (rank[b] || 0) > (rank[a] || 0) ? b : a;
}

function uniqueStrings(items) {
  return Array.from(new Set((items || []).map((x) => String(x || "").trim()).filter(Boolean)));
}

function corsHeaders(request) {
  const origin = request.headers.get("Origin") || "*";
  return {
    "Access-Control-Allow-Origin": origin,
    "Vary": "Origin",
    "Access-Control-Allow-Headers": "content-type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  };
}

function extractToolArguments(result, targetName) {
  if (!result || typeof result !== "object") return null;
  const candidates = [];
  if (Array.isArray(result.tool_calls)) candidates.push(...result.tool_calls);
  const choice = Array.isArray(result.choices) ? result.choices[0] : null;
  const message = choice && choice.message ? choice.message : null;
  if (message && Array.isArray(message.tool_calls)) candidates.push(...message.tool_calls);

  for (const call of candidates) {
    const name = call && (call.name || (call.function && call.function.name));
    if (name !== targetName) continue;
    let args = call.arguments;
    if (args == null && call.function) args = call.function.arguments;
    if (args && typeof args === "object") return args;
    if (typeof args === "string") {
      try { return JSON.parse(args); } catch (_) {
        const parsed = parseJson(args);
        if (parsed) return parsed;
      }
    }
  }
  return null;
}

function extractText(result) {
  if (typeof result === "string") return result;
  if (!result || typeof result !== "object") return "";
  if (typeof result.response === "string") return result.response;
  if (typeof result.result === "string") return result.result;
  const choice = Array.isArray(result.choices) ? result.choices[0] : null;
  if (choice) {
    if (choice.message && typeof choice.message.content === "string") return choice.message.content;
    if (typeof choice.text === "string") return choice.text;
  }
  return "";
}

function parseJson(raw) {
  if (raw && typeof raw === "object") return raw;
  let value = String(raw || "").trim()
    .replace(/^\`\`\`json\s*/i, "")
    .replace(/^\`\`\`\s*/i, "")
    .replace(/\`\`\`\s*$/i, "")
    .trim();

  try { return JSON.parse(value); } catch (_) {}
  const start = value.indexOf("{");
  const end = value.lastIndexOf("}");
  if (start >= 0 && end > start) {
    try { return JSON.parse(value.slice(start, end + 1)); } catch (_) {}
  }
  return null;
}

function isValidPreprocess(data) {
  return !!(data && typeof data === "object" && typeof data.corrected_text === "string" && Array.isArray(data.corrections) && Array.isArray(data.warnings));
}

function isValidResult(data) {
  return !!(data && typeof data === "object" && Array.isArray(data.compliance) && Array.isArray(data.variants) && data.variants.length >= 3);
}

function findLayoutProblems(sourceText, data) {
  const source = String(sourceText || "").replace(/\r\n/g, "\n");
  const needsLineBreak = source.includes("\n");
  const needsParagraphBreak = source.includes("\n\n");
  const requiredMarkers = ["↓", "続く", "→", "※"].filter((m) => source.includes(m));
  const problems = [];

  if (!data || !Array.isArray(data.variants)) return ["出力案がありません"];

  data.variants.forEach((item, index) => {
    const text = String(item && item.text ? item.text : "").replace(/\r\n/g, "\n");
    if (needsLineBreak && !text.includes("\n")) {
      problems.push("案" + (index + 1) + "で原文の改行が消えています");
    }
    if (needsParagraphBreak && !text.includes("\n\n")) {
      problems.push("案" + (index + 1) + "で原文の段落区切りが消えています");
    }
    for (const marker of requiredMarkers) {
      if (!text.includes(marker)) problems.push("案" + (index + 1) + "で「" + marker + "」が消えています");
    }
  });

  return problems;
}

function findUnsupportedTemporalFacts(sourceText, data) {
  const sourceTokens = new Set(extractTemporalTokens(String(sourceText || "").normalize("NFKC")));
  const found = new Set();
  const texts = [];

  if (data && Array.isArray(data.variants)) {
    for (const item of data.variants) {
      texts.push(String(item && item.text ? item.text : ""));
      if (Array.isArray(item && item.hashtags)) texts.push(item.hashtags.map(String).join(" "));
    }
  }

  for (const output of texts) {
    for (const token of extractTemporalTokens(output)) {
      if (!sourceTokens.has(token)) found.add(token);
    }
  }
  return Array.from(found);
}

function extractTemporalTokens(value) {
  const text = String(value || "").normalize("NFKC");
  const matches = text.match(/(?:19|20)\d{2}年|(?:19|20)\d{2}[\/.-](?:0?[1-9]|1[0-2])[\/.-](?:0?[1-9]|[12]\d|3[01])|(?:0?[1-9]|1[0-2])月(?:0?[1-9]|[12]\d|3[01])日/g);
  return matches ? matches : [];
}

function normalizeOutputText(value) {
  return String(value || "")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function normalizeCorrections(items) {
  if (!Array.isArray(items)) return [];
  return items.slice(0, 30).map((item) => {
    const before = String(item && item.before ? item.before : "");
    const after = String(item && item.after ? item.after : "");
    const reason = String(item && item.reason ? item.reason : "");
    return before && after ? before + " → " + after + (reason ? "（" + reason + "）" : "") : reason;
  }).filter(Boolean);
}

function normalizeResult(data, correctedText, corrections, safetyLevel, safetyWarnings) {
  return {
    corrected_text: correctedText,
    corrections,
    safety: { level: safetyLevel || "none", warnings: Array.isArray(safetyWarnings) ? safetyWarnings : [] },
    compliance: Array.isArray(data.compliance)
      ? data.compliance.slice(0, 20).map((item) => ({
          level: ["low", "medium", "high"].includes(item && item.level) ? item.level : "medium",
          message: String(item && item.message ? item.message : "")
        }))
      : [],
    variants: Array.isArray(data.variants)
      ? data.variants.slice(0, 3).map((item, index) => ({
          title: String(item && item.title ? item.title : ["自然", "反応重視", "短く強め"][index] || ("案" + (index + 1))),
          text: normalizeOutputText(String(item && item.text ? item.text : "")),
          hashtags: Array.isArray(item && item.hashtags) ? item.hashtags.slice(0, 3).map(String) : [],
          reason: String(item && item.reason ? item.reason : "")
        }))
      : []
  };
}

function json(payload, status, headers) {
  return new Response(JSON.stringify(payload), { status, headers });
}
