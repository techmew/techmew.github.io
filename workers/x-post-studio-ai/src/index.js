const MODEL = "@cf/zai-org/glm-4.7-flash";

const RESULT_TOOL = {
  type: "function",
  function: {
    name: "submit_x_post_result",
    description: "X投稿の校正結果、コンプラ確認、3つの投稿案を返す。",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        corrections: {
          type: "array",
          items: { type: "string" }
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
      required: ["corrections", "compliance", "variants"]
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
        structured_output: "function_calling_v2"
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
          structured_output: "function_calling_v2"
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
        "必ず submit_x_post_result ツールを1回呼び出して結果を返してください。",
        "通常の文章回答は禁止です。",
        "元文章の口調・語尾・温度感を維持し、別人格へ変えない。",
        "元文にない事実、体験、数字、人気、評判、トレンドを捏造しない。",
        "誤字脱字、不自然な助詞、明らかな誤変換を修正する。",
        "投稿案は必ず3件。",
        "案1は自然で伝わりやすくする。",
        "案2は冒頭を強め、反応を得やすくする。ただし釣り・過剰煽りは禁止。",
        "案3は要点を短く強くまとめる。",
        "ハッシュタグは内容に本当に関連するものを0〜3個。リアルタイムトレンドを取得したふりは禁止。",
        "コンプラでは誹謗中傷、差別、個人情報、違法・危険行為、医療・金融の強い断定、著作権侵害を助長する表現、根拠のない断定を注意候補にする。問題がなければ空配列。",
        "correctionsには実際に直した箇所だけを短く入れる。",
        lengthRule,
        emojiRule
      ].join("\n");

      const result = await env.AI.run(MODEL, {
        messages: [
          { role: "system", content: system },
          { role: "user", content: text }
        ],
        tools: [RESULT_TOOL],
        tool_choice: "required",
        parallel_tool_calls: false,
        max_completion_tokens: plan === "free" ? 1500 : 4500,
        temperature: 0.2
      });

      let structured = extractToolArguments(result);

      // 一部のバックエンドがtool callを返さなかった場合のみ、従来形式を救済する。
      if (!structured) {
        structured = parseJson(extractText(result));
      }

      if (!isValidResult(structured)) {
        return json({
          error: "AIの構造化出力に失敗しました。もう一度実行してください。",
          error_code: "STRUCTURED_OUTPUT_FAILED"
        }, 502, cors);
      }

      return json(normalizeResult(structured), 200, cors);
    } catch (error) {
      const message = error && error.message ? error.message : "Worker error";
      return json({
        error: message.includes("JSON Mode couldn't be met")
          ? "AIの構造化出力に失敗しました。もう一度実行してください。"
          : message
      }, 500, cors);
    }
  }
};

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

function extractToolArguments(result) {
  if (!result || typeof result !== "object") return null;

  const candidates = [];

  if (Array.isArray(result.tool_calls)) {
    candidates.push(...result.tool_calls);
  }

  const choice = Array.isArray(result.choices) ? result.choices[0] : null;
  const message = choice && choice.message ? choice.message : null;

  if (message && Array.isArray(message.tool_calls)) {
    candidates.push(...message.tool_calls);
  }

  for (const call of candidates) {
    const name = call && (call.name || (call.function && call.function.name));
    if (name !== "submit_x_post_result") continue;

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

function isValidResult(data) {
  return !!(
    data &&
    typeof data === "object" &&
    Array.isArray(data.corrections) &&
    Array.isArray(data.compliance) &&
    Array.isArray(data.variants) &&
    data.variants.length >= 3
  );
}

function normalizeResult(data) {
  return {
    corrections: Array.isArray(data.corrections)
      ? data.corrections.slice(0, 20).map(String)
      : [],
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
