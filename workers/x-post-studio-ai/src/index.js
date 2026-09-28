const PROOFREAD_MODEL = "@cf/zai-org/glm-4.7-flash";
const COMPOSE_MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";

const OUTPUT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    corrected_text: { type: "string" },
    corrections: {
      type: "array",
      items: { type: "string" }
    },
    safety: {
      type: "object",
      additionalProperties: false,
      properties: {
        level: { type: "string", enum: ["none", "low", "medium", "high"] },
        warnings: { type: "array", items: { type: "string" } }
      },
      required: ["level", "warnings"]
    },
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
  required: ["corrected_text", "corrections", "safety", "compliance", "variants"]
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
        proofread_model: PROOFREAD_MODEL,
        compose_model: COMPOSE_MODEL,
        pipeline: "proofread_default_v7"
      }, 200, cors);
    }

    if (request.method !== "POST") {
      return json({ error: "POST only" }, 405, cors);
    }

    let body;
    try {
      body = await request.json();
    } catch (_) {
      return json({ error: "JSON request required" }, 400, cors);
    }

    if (body.action === "ping") {
      return json({
        ok: true,
        service: "X Post Studio AI Worker",
        proofread_model: PROOFREAD_MODEL,
        compose_model: COMPOSE_MODEL,
        pipeline: "proofread_default_v7"
      }, 200, cors);
    }

    if (body.action !== "compose") {
      return json({ error: "Unknown action" }, 400, cors);
    }

    const originalText = String(body.text || "").trim();
    const emojiLevel = ["high", "medium", "none"].includes(body.emojiLevel)
      ? body.emojiLevel
      : "medium";
    const plan = body.plan === "long" ? "long" : "free";

    if (!originalText) {
      return json({ error: "本文が空です" }, 400, cors);
    }

    if (originalText.length > 25000) {
      return json({ error: "本文が長すぎます" }, 400, cors);
    }

    const known = applyKnownTermCorrections(originalText);
    const localSafety = localSafetyCheck(known.text);
    const safeSource = localSafety.text;
    const mode = body.mode === "compose" ? "compose" : "proofread";

    if (mode === "proofread") {
      return handleProofread(env, safeSource, originalText, known.corrections, localSafety, cors);
    }

    const lengthRule = plan === "free"
      ? "通常投稿として280文字以内を意識する。ただし短くするために情報を勝手に削らない。収まらない場合は原文維持を優先する。"
      : "長文投稿として扱い、スレッド分割はしない。";

    const emojiRule = emojiLevel === "none"
      ? "絵文字は追加しない。"
      : emojiLevel === "high"
        ? "絵文字は内容に合うものをやや多めに使ってよいが、原文を壊さない。"
        : "絵文字は必要な場合だけ少量使う。無理に追加しない。";

    const system = [
      "あなたは日本語のX投稿校正アシスタントです。",
      "目的は文章を書き直すことではなく、原文をほぼそのまま残して誤字・誤変換・助詞・明らかな不自然さだけを直すことです。",
      "原文の95%以上を残す意識で処理してください。",
      "文の順番、情報量、主張、口調、語尾、温度感を変えないでください。",
      "要約、再構成、丁寧化、別表現への置換、不要と判断した情報の削除をしないでください。",
      "原文の改行位置・空行・段落順を維持してください。",
      "原文に『↓』『続く』『→』『※』などがあれば削除しないでください。",
      "IMEや音声入力の誤変換は厳しく確認してください。",
      "助詞の『の』が不自然に『ノ』、助詞の『で』が不自然に『出』になっている場合など、文法上明らかな誤変換は直してください。",
      "地名・店名・支店名・施設名は固有名詞候補として注意深く確認してください。ただし確信できない名称を捏造しないでください。",
      "元文にない年、日付、数字、体験、事実、時代背景、評判、トレンドを追加しないでください。",
      "安全上問題のある直接的な危害表現は警告し、怒りや批判の意味を残しながら危害表現だけを弱めてください。",
      "単なる悪態や強い批判は、それだけで文章全体を無難化しないでください。",
      "correctionsには実際に直した箇所だけを短く入れてください。",
      "投稿案は必ず3件返してください。",
      "案1は『原文重視』。corrected_textをほぼそのまま使ってください。",
      "案2は『自然』。語順と情報量を変えず、読みにくい箇所だけ最小限整えてください。",
      "案3は『少し引き締め』。原文を要約せず、表現を少しだけ締める程度にしてください。",
      "3案とも原文の改行構造を維持してください。",
      "ハッシュタグは0〜3個。付けない方が自然なら0個で構いません。",
      "『嫌い』『最悪』『時代錯誤』のような感情だけの雑なタグは避けてください。",
      lengthRule,
      emojiRule
    ].join("\n");

    try {
      const result = await env.AI.run(COMPOSE_MODEL, {
        messages: [
          { role: "system", content: system },
          { role: "user", content: safeSource }
        ],
        response_format: {
          type: "json_schema",
          json_schema: OUTPUT_SCHEMA
        },
        max_completion_tokens: plan === "free" ? 1600 : 4200,
        temperature: 0.05
      });

      const parsed = extractStructured(result);

      if (!isValidResult(parsed)) {
        return json(
          makeFallbackResult(
            safeSource,
            known.corrections,
            localSafety,
            "AIの構造化出力が不完全だったため、原文ベースで返しました。"
          ),
          200,
          cors
        );
      }

      return json(
        finalizeResult(parsed, safeSource, originalText, known.corrections, localSafety),
        200,
        cors
      );
    } catch (error) {
      return json(
        makeFallbackResult(
          safeSource,
          known.corrections,
          localSafety,
          "AIが一時的に応答できなかったため、原文ベースで返しました。"
        ),
        200,
        cors
      );
    }
  }
};

async function handleProofread(env, safeSource, originalText, knownCorrections, localSafety, cors) {
  const system = [
    "あなたは日本語の誤字脱字・IME誤変換だけを直す校正者です。",
    "文章を上手く書き直す仕事ではありません。原文の内容・順番・口調・語尾・情報量・改行を変えないでください。",
    "出力は修正後の本文だけ。説明、見出し、引用符、JSON、箇条書きは禁止です。",
    "誤字、脱字、助詞の誤り、かな/カナ/漢字の明らかな誤変換だけを直してください。",
    "音声入力・スマホ変換の誤りを文脈から厳しく確認してください。",
    "例: 『誤字だつじ』→『誤字脱字』。",
    "例: 『めんどいてきに』が文脈上『めんどい時に』の誤変換なら直す。",
    "例: Webサイトの意味で使われた『さいと』は文脈上自然なら『サイト』へ直す。",
    "例: 助詞の『の』が『ノ』、助詞の『で』が『出』になっていれば直す。",
    "固有名詞は確信がある場合だけ直し、推測で新しい名称を作らないでください。",
    "原文にない情報・評価・絵文字・ハッシュタグ・年・日付を追加しないでください。",
    "句読点は誤読を防ぐために必要な場合だけ最小限追加してください。",
    "原文を要約、再構成、丁寧化、言い換えしないでください。"
  ].join("\n");

  try {
    const result = await env.AI.run(PROOFREAD_MODEL, {
      messages: [
        { role: "system", content: system },
        { role: "user", content: safeSource }
      ],
      max_completion_tokens: Math.min(3000, Math.max(300, safeSource.length * 3)),
      temperature: 0
    });

    let corrected = extractPlainText(result);
    corrected = normalizeOutputText(corrected);

    if (!isAcceptableProofread(safeSource, corrected, originalText)) {
      return json(
        makeProofreadResult(
          safeSource,
          knownCorrections,
          localSafety,
          "AIの変更量が大きすぎたため、原文を優先しました。"
        ),
        200,
        cors
      );
    }

    return json(
      makeProofreadResult(
        corrected,
        knownCorrections,
        localSafety,
        corrected === safeSource ? "修正候補は見つかりませんでした。" : "誤字・変換を最小限修正しました。"
      ),
      200,
      cors
    );
  } catch (_) {
    return json(
      makeProofreadResult(
        safeSource,
        knownCorrections,
        localSafety,
        "AIが一時的に応答できなかったため、原文を返しました。"
      ),
      200,
      cors
    );
  }
}

function extractPlainText(result) {
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

function makeProofreadResult(text, knownCorrections, localSafety, reason) {
  return {
    corrected_text: text,
    corrections: knownCorrections,
    safety: {
      level: localSafety.level,
      warnings: localSafety.warnings
    },
    compliance: [],
    variants: [
      {
        title: "校正結果",
        text,
        hashtags: [],
        reason
      }
    ]
  };
}

function isAcceptableProofread(source, output, originalText) {
  if (!output) return false;
  if (layoutBroken(source, output)) return false;
  if (hasUnsupportedTemporalFact(originalText, output)) return false;
  if (protectedCorrectionMissing(source, output)) return false;

  const s = String(source || "");
  const o = String(output || "");

  if (s.length >= 20) {
    if (o.length < s.length * 0.72 || o.length > s.length * 1.28) return false;
  }

  const ratio = editChangeRatio(s, o);
  const limit = s.length < 20 ? 0.42 : 0.28;
  return ratio <= limit;
}

function editChangeRatio(a, b) {
  a = Array.from(String(a || ""));
  b = Array.from(String(b || ""));
  const maxLen = Math.max(a.length, b.length, 1);

  if (maxLen > 1200) {
    return Math.abs(a.length - b.length) / maxLen;
  }

  if (a.length > b.length) {
    const tmp = a; a = b; b = tmp;
  }

  let prev = Array.from({ length: a.length + 1 }, (_, i) => i);
  let cur = new Array(a.length + 1);

  for (let j = 1; j <= b.length; j++) {
    cur[0] = j;
    for (let i = 1; i <= a.length; i++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[i] = Math.min(
        prev[i] + 1,
        cur[i - 1] + 1,
        prev[i - 1] + cost
      );
    }
    const tmp = prev; prev = cur; cur = tmp;
  }

  return prev[a.length] / maxLen;
}

function extractStructured(result) {
  if (!result) return null;

  if (result.response && typeof result.response === "object") {
    return result.response;
  }

  if (typeof result.response === "string") {
    return parseJson(result.response);
  }

  const choice = Array.isArray(result.choices) ? result.choices[0] : null;
  const message = choice && choice.message ? choice.message : null;

  if (message && message.parsed && typeof message.parsed === "object") {
    return message.parsed;
  }

  if (message && typeof message.content === "string") {
    return parseJson(message.content);
  }

  if (typeof result === "string") {
    return parseJson(result);
  }

  return null;
}

function parseJson(value) {
  try {
    return JSON.parse(String(value || "").trim());
  } catch (_) {
    return null;
  }
}

function isValidResult(data) {
  return !!(
    data &&
    typeof data === "object" &&
    typeof data.corrected_text === "string" &&
    Array.isArray(data.corrections) &&
    data.safety &&
    Array.isArray(data.safety.warnings) &&
    Array.isArray(data.compliance) &&
    Array.isArray(data.variants) &&
    data.variants.length >= 3
  );
}

function finalizeResult(data, safeSource, originalText, knownCorrections, localSafety) {
  let correctedText = normalizeOutputText(String(data.corrected_text || ""));

  if (
    !correctedText ||
    hasUnsupportedTemporalFact(originalText, correctedText) ||
    layoutBroken(safeSource, correctedText)
  ) {
    correctedText = safeSource;
  }

  const corrections = uniqueStrings([
    ...knownCorrections,
    ...(Array.isArray(data.corrections) ? data.corrections.map(String) : [])
  ]);

  const safetyWarnings = uniqueStrings([
    ...localSafety.warnings,
    ...(data.safety && Array.isArray(data.safety.warnings)
      ? data.safety.warnings.map(String)
      : [])
  ]);

  const safetyLevel = higherRisk(
    localSafety.level,
    data.safety && ["none", "low", "medium", "high"].includes(data.safety.level)
      ? data.safety.level
      : "none"
  );

  const variants = data.variants.slice(0, 3).map((item, index) => {
    let text = normalizeOutputText(String(item && item.text ? item.text : ""));

    if (
      !text ||
      hasUnsupportedTemporalFact(originalText, text) ||
      layoutBroken(safeSource, text)
    ) {
      text = correctedText;
    }

    return {
      title: String(
        item && item.title
          ? item.title
          : ["原文重視", "自然", "少し引き締め"][index] || ("案" + (index + 1))
      ),
      text,
      hashtags: Array.isArray(item && item.hashtags)
        ? item.hashtags.slice(0, 3).map(String)
        : [],
      reason: String(item && item.reason ? item.reason : "")
    };
  });

  while (variants.length < 3) {
    variants.push({
      title: "原文重視",
      text: correctedText,
      hashtags: [],
      reason: "原文を優先しました。"
    });
  }

  return {
    corrected_text: correctedText,
    corrections,
    safety: {
      level: safetyLevel,
      warnings: safetyWarnings
    },
    compliance: Array.isArray(data.compliance)
      ? data.compliance.slice(0, 20).map((item) => ({
          level: ["low", "medium", "high"].includes(item && item.level)
            ? item.level
            : "medium",
          message: String(item && item.message ? item.message : "")
        }))
      : [],
    variants
  };
}

function makeFallbackResult(source, knownCorrections, localSafety, reason) {
  return {
    corrected_text: source,
    corrections: knownCorrections,
    safety: {
      level: localSafety.level,
      warnings: uniqueStrings([...localSafety.warnings, reason])
    },
    compliance: [],
    variants: [
      { title: "原文重視", text: source, hashtags: [], reason },
      { title: "原文重視", text: source, hashtags: [], reason },
      { title: "原文重視", text: source, hashtags: [], reason }
    ]
  };
}

function applyKnownTermCorrections(input) {
  let text = String(input || "");
  const corrections = [];

  const rules = [
    {
      pattern: /トライアル可能店/g,
      replacement: "トライアル加納店",
      note: "トライアル可能店 → トライアル加納店（支店名の誤変換）"
    },
    {
      pattern: /誤字[だダ]つじ/g,
      replacement: "誤字脱字",
      note: "誤字だつじ → 誤字脱字"
    },
    {
      pattern: /めんどい(?:てき|とき)に/g,
      replacement: "めんどい時に",
      note: "めんどいてきに → めんどい時に"
    },
    {
      pattern: /さいと(?=(?:の|を|で|に|へ|が|は))/g,
      replacement: "サイト",
      note: "さいと → サイト（Webサイトの文脈）"
    },
    {
      pattern: /漢字変換(?=めんど)/g,
      replacement: "漢字変換が",
      note: "漢字変換めんどい → 漢字変換がめんどい"
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

  replace(/ぶっ?殺してやろうか|殺してやろうか|ぶっ?殺したい|殺したい/g, "本当に腹が立つ", "直接的な危害表現をマイルドな表現へ変更しました。");
  replace(/死ねばいい|死んでほしい|死ね(?!ば)/g, "もう勘弁してほしい", "他者への死亡願望表現をマイルドな表現へ変更しました。");

  if (/(?:馬鹿|バカ|アホ|カス|老害|頭おかし)/.test(text) && level !== "high") {
    level = "medium";
    warnings.push("強い侮辱表現が含まれています。投稿は継続できます。");
  }

  return { text, level, warnings };
}

function protectedCorrectionMissing(source, output) {
  const s = String(source || "");
  const o = String(output || "");
  const phrases = ["誤字脱字", "めんどい時に", "サイト"];
  return phrases.some((phrase) => s.includes(phrase) && !o.includes(phrase));
}

function layoutBroken(source, output) {
  const s = String(source || "").replace(/\r\n/g, "\n");
  const o = String(output || "").replace(/\r\n/g, "\n");

  if (s.includes("\n") && !o.includes("\n")) return true;
  if (s.includes("\n\n") && !o.includes("\n\n")) return true;

  for (const marker of ["↓", "続く", "→", "※"]) {
    if (s.includes(marker) && !o.includes(marker)) return true;
  }

  return false;
}

function hasUnsupportedTemporalFact(source, output) {
  const sourceTokens = new Set(extractTemporalTokens(source));
  for (const token of extractTemporalTokens(output)) {
    if (!sourceTokens.has(token)) return true;
  }
  return false;
}

function extractTemporalTokens(value) {
  const text = String(value || "").normalize("NFKC");
  const matches = text.match(
    /(?:19|20)\d{2}年|(?:19|20)\d{2}[\/.-](?:0?[1-9]|1[0-2])[\/.-](?:0?[1-9]|[12]\d|3[01])|(?:0?[1-9]|1[0-2])月(?:0?[1-9]|[12]\d|3[01])日/g
  );
  return matches || [];
}

function normalizeOutputText(value) {
  return String(value || "")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function higherRisk(a, b) {
  const rank = { none: 0, low: 1, medium: 2, high: 3 };
  return (rank[b] || 0) > (rank[a] || 0) ? b : a;
}

function uniqueStrings(items) {
  return Array.from(
    new Set((items || []).map((x) => String(x || "").trim()).filter(Boolean))
  );
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

function json(payload, status, headers) {
  return new Response(JSON.stringify(payload), { status, headers });
}
