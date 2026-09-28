const MODEL = "@cf/zai-org/glm-4.7-flash";


const SAFETY_TOOL = {
  type: "function",
  function: {
    name: "submit_safety_result",
    description: "入力文の危険・攻撃表現を検出し、安全な言い換え方針を返す。",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        risk_level: { type: "string", enum: ["none", "low", "medium", "high"] },
        warnings: {
          type: "array",
          items: { type: "string" }
        },
        softened_text: { type: "string" }
      },
      required: ["risk_level", "warnings", "softened_text"]
    },
    strict: true
  }
};

const CORRECTION_TOOL = {
  type: "function",
  function: {
    name: "submit_proofreading_result",
    description: "日本語の誤字脱字・IME誤変換・助詞誤りだけを修正した校正文を返す。",
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
        }
      },
      required: ["corrected_text", "corrections"]
    },
    strict: true
  }
};

const RESULT_TOOL = {
  type: "function",
  function: {
    name: "submit_x_post_result",
    description: "校正済み文章を元に、コンプラ確認と3つのX投稿案を返す。",
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
              hashtags: {
                type: "array",
                maxItems: 3,
                items: { type: "string" }
              },
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

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    if (request.method === "GET") {
      return json({
        ok: true,
        service: "X Post Studio AI Worker",
        model: MODEL,
        pipeline: "proofread_then_compose_v3"
      }, 200, cors);
    }

    if (request.method !== "POST") {
      return json({ error: "POST only" }, 405, cors);
    }

    try {
      const body = await request.json();

      if (body.action === "ping") {
        return json({
          ok: true,
          service: "X Post Studio AI Worker",
          pipeline: "proofread_then_compose_v3"
        }, 200, cors);
      }

      if (body.action !== "compose") {
        return json({ error: "Unknown action" }, 400, cors);
      }

      const text = String(body.text || "").trim();
      const emojiLevel = ["high", "medium", "none"].includes(body.emojiLevel)
        ? body.emojiLevel
        : "medium";
      const plan = body.plan === "long" ? "long" : "free";

      if (!text) {
        return json({ error: "本文が空です" }, 400, cors);
      }

      if (text.length > 25000) {
        return json({ error: "本文が長すぎます" }, 400, cors);
      }

      const safety = await runSafetyCheck(env, text);

      const textForProofreading =
        safety && safety.risk_level !== "none" && safety.softened_text
          ? String(safety.softened_text).trim()
          : text;

      const proofread = await runProofreading(env, textForProofreading);

      if (!proofread || !proofread.corrected_text) {
        return json({
          error: "日本語校正に失敗しました。もう一度実行してください。",
          error_code: "PROOFREAD_FAILED"
        }, 502, cors);
      }

      const correctedText = String(proofread.corrected_text).trim() || textForProofreading;
      const corrections = normalizeCorrections(proofread.corrections);
      const safetyWarnings =
        safety && Array.isArray(safety.warnings) ? safety.warnings.slice(0, 20).map(String) : [];
      const safetyLevel =
        safety && ["none", "low", "medium", "high"].includes(safety.risk_level)
          ? safety.risk_level
          : "none";

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
        "入力はすでに安全表現への調整と専用の校正工程を通った文章です。校正済みの表記や安全化された表現を勝手に元へ戻さないでください。",
        "必ず submit_x_post_result ツールを1回呼び出して結果を返してください。",
        "通常の文章回答は禁止です。",
        "元文章の口調・語尾・温度感を維持し、別人格へ変えない。",
        "元文にない事実、体験、数字、人気、評判、トレンドを捏造しない。",
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

      let structured = await runCompose(env, system, correctedText, plan, 0.2);

      if (!isValidResult(structured)) {
        structured = await runCompose(
          env,
          system + "\n前回は構造化出力が不完全でした。必須項目をすべて埋め、submit_x_post_result を1回だけ呼び出してください。",
          correctedText,
          plan,
          0.1
        );
      }

      if (!isValidResult(structured)) {
        return json({
          error: "AIの構造化出力に失敗しました。自動再試行でも復旧できませんでした。",
          error_code: "STRUCTURED_OUTPUT_FAILED"
        }, 502, cors);
      }

      return json(
        normalizeResult(structured, correctedText, corrections, safetyLevel, safetyWarnings),
        200,
        cors
      );
    } catch (error) {
      const message = error && error.message ? error.message : "Worker error";
      return json({ error: message }, 500, cors);
    }
  }
};

async function runSafetyCheck(env, text) {
  const system = [
    "あなたはX投稿の事前安全チェック担当です。",
    "必ず submit_safety_result ツールを1回呼び出してください。通常の文章回答は禁止です。",
    "入力に脅迫、殺害・暴行の示唆、他者への死亡願望、強い差別・侮辱が含まれるかを判定してください。",
    "単なる不満、批判、皮肉、悪態は必要以上に危険扱いしません。",
    "危険表現がある場合は warnings に具体的な理由を短く入れてください。",
    "softened_text は元の怒り・不満・批判の趣旨は残しつつ、脅迫・殺害・暴行・死亡願望を外した投稿可能な表現にしてください。",
    "危険表現がない場合は risk_level を none、warnings を空配列、softened_text は元文をそのまま返してください。",
    "人物や集団への批判そのものは消さず、危害予告だけを除去してください。"
  ].join("\n");

  let result = await env.AI.run(MODEL, {
    messages: [
      { role: "system", content: system },
      { role: "user", content: text }
    ],
    tools: [SAFETY_TOOL],
    tool_choice: "required",
    parallel_tool_calls: false,
    max_completion_tokens: 900,
    temperature: 0.05
  });

  let structured = extractToolArguments(result, "submit_safety_result");
  if (!structured) structured = parseJson(extractText(result));

  if (!structured || typeof structured !== "object") {
    return {
      risk_level: "medium",
      warnings: ["危険表現の判定に失敗したため、安全側で処理しました。"],
      softened_text: text
    };
  }

  return {
    risk_level: ["none", "low", "medium", "high"].includes(structured.risk_level)
      ? structured.risk_level
      : "medium",
    warnings: Array.isArray(structured.warnings) ? structured.warnings : [],
    softened_text:
      typeof structured.softened_text === "string" && structured.softened_text.trim()
        ? structured.softened_text
        : text
  };
}

async function runProofreading(env, text) {
  const system = [
    "あなたは日本語校正だけを担当します。文章の主張・感情・口調・語尾は変えません。",
    "必ず submit_proofreading_result ツールを1回呼び出してください。通常の文章回答は禁止です。",
    "最優先は誤字脱字、IME誤変換、助詞の誤り、かな・カナ・漢字の誤入力を見つけて直すことです。",
    "特に音声入力やスマホ変換で起きる、助詞が別表記へ化けた誤りを厳しく確認してください。",
    "例: 文法上の助詞『の』がカタカナの『ノ』になっている場合は『の』へ直す。",
    "例: 文法上の助詞『で』が漢字の『出』になっている場合は『で』へ直す。",
    "同様に、文脈上明らかな『は/わ』『に/二』『へ/え』『を/お』等のIME・音声入力由来の誤変換も確認する。",
    "ただし固有名詞・番組名・商品名の正式表記だと明確に判断できる場合は勝手に変えない。",
    "固有名詞か単なる誤変換か迷う場合は、前後の日本語文法を優先して判断する。",
    "表現の言い換えや丁寧化、炎上回避、読みやすい再構成はこの工程ではしない。",
    "句読点や改行は明らかに不自然な場合だけ最小限直す。",
    "correctionsには変更した箇所を before / after / reason で必ず記録する。変更がなければ空配列にする。"
  ].join("\n");

  let result = await env.AI.run(MODEL, {
    messages: [
      { role: "system", content: system },
      { role: "user", content: text }
    ],
    tools: [CORRECTION_TOOL],
    tool_choice: "required",
    parallel_tool_calls: false,
    max_completion_tokens: 1000,
    temperature: 0.05
  });

  let structured = extractToolArguments(result, "submit_proofreading_result");
  if (!structured) structured = parseJson(extractText(result));

  if (!isValidProofreading(structured)) {
    result = await env.AI.run(MODEL, {
      messages: [
        {
          role: "system",
          content: system + "\n前回は校正結果が不完全でした。誤字・IME誤変換・助詞をもう一度厳密に確認し、必須項目をすべて返してください。"
        },
        { role: "user", content: text }
      ],
      tools: [CORRECTION_TOOL],
      tool_choice: "required",
      parallel_tool_calls: false,
      max_completion_tokens: 1000,
      temperature: 0
    });
    structured = extractToolArguments(result, "submit_proofreading_result");
    if (!structured) structured = parseJson(extractText(result));
  }

  return isValidProofreading(structured) ? structured : null;
}

async function runCompose(env, system, correctedText, plan, temperature) {
  const result = await env.AI.run(MODEL, {
    messages: [
      { role: "system", content: system },
      { role: "user", content: correctedText }
    ],
    tools: [RESULT_TOOL],
    tool_choice: "required",
    parallel_tool_calls: false,
    max_completion_tokens: plan === "free" ? 1500 : 4500,
    temperature
  });

  let structured = extractToolArguments(result, "submit_x_post_result");
  if (!structured) structured = parseJson(extractText(result));
  return structured;
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
  if (message && Array.isArray(message.tool_calls)) {
    candidates.push(...message.tool_calls);
  }

  for (const call of candidates) {
    const name = call && (call.name || (call.function && call.function.name));
    if (name !== targetName) continue;

    let args = call.arguments;
    if (args == null && call.function) args = call.function.arguments;

    if (args && typeof args === "object") return args;

    if (typeof args === "string") {
      try {
        return JSON.parse(args);
      } catch (_) {
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
    if (choice.message && typeof choice.message.content === "string") {
      return choice.message.content;
    }
    if (typeof choice.text === "string") return choice.text;
  }
  return "";
}

function parseJson(raw) {
  if (raw && typeof raw === "object") return raw;
  let value = String(raw || "").trim();
  value = value
    .replace(/^\`\`\`json\s*/i, "")
    .replace(/^\`\`\`\s*/i, "")
    .replace(/\`\`\`\s*$/i, "")
    .trim();

  try {
    return JSON.parse(value);
  } catch (_) {}

  const start = value.indexOf("{");
  const end = value.lastIndexOf("}");
  if (start >= 0 && end > start) {
    try {
      return JSON.parse(value.slice(start, end + 1));
    } catch (_) {}
  }
  return null;
}

function isValidProofreading(data) {
  return !!(
    data &&
    typeof data === "object" &&
    typeof data.corrected_text === "string" &&
    Array.isArray(data.corrections)
  );
}

function isValidResult(data) {
  return !!(
    data &&
    typeof data === "object" &&
    Array.isArray(data.compliance) &&
    Array.isArray(data.variants) &&
    data.variants.length >= 3
  );
}

function normalizeCorrections(items) {
  if (!Array.isArray(items)) return [];
  return items.slice(0, 30).map((item) => {
    const before = String(item && item.before ? item.before : "");
    const after = String(item && item.after ? item.after : "");
    const reason = String(item && item.reason ? item.reason : "");
    return before && after
      ? before + " → " + after + (reason ? "（" + reason + "）" : "")
      : reason;
  }).filter(Boolean);
}

function normalizeResult(data, correctedText, corrections, safetyLevel, safetyWarnings) {
  return {
    corrected_text: correctedText,
    corrections,
    safety: {
      level: safetyLevel || "none",
      warnings: Array.isArray(safetyWarnings) ? safetyWarnings : []
    },
    compliance: Array.isArray(data.compliance)
      ? data.compliance.slice(0, 20).map((item) => ({
          level: ["low", "medium", "high"].includes(item && item.level)
            ? item.level
            : "medium",
          message: String(item && item.message ? item.message : "")
        }))
      : [],
    variants: Array.isArray(data.variants)
      ? data.variants.slice(0, 3).map((item, index) => ({
          title: String(
            item && item.title
              ? item.title
              : ["自然", "反応重視", "短く強め"][index] || ("案" + (index + 1))
          ),
          text: String(item && item.text ? item.text : ""),
          hashtags: Array.isArray(item && item.hashtags)
            ? item.hashtags.slice(0, 3).map(String)
            : [],
          reason: String(item && item.reason ? item.reason : "")
        }))
      : []
  };
}

function json(payload, status, headers) {
  return new Response(JSON.stringify(payload), { status, headers });
}
