const MODEL = "@cf/zai-org/glm-4.7-flash";

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
      }, 200, cors);
    }

    if (request.method !== "POST") {
      return json({ error: "POST only" }, 405, cors);
    }

    try {
      const body = await request.json();

      if (body.action === "ping") {
        return json({ ok: true, service: "X Post Studio AI Worker" }, 200, cors);
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
        ? "各案はX通常投稿の280文字以内を強く意識する。URL等のX側の文字数計算差を考慮し、可能なら260文字程度までに収める。"
        : "長文投稿として内容を削りすぎず整理する。スレッド分割はしない。";

      const emojiRule = emojiLevel === "none"
        ? "絵文字は追加しない。元文にある絵文字も、意味上必要でなければ増やさない。"
        : emojiLevel === "high"
          ? "内容に合う絵文字を多めに使う。ただし文章の可読性を落とすほど連打しない。"
          : "絵文字は自然な範囲で少量から中程度使う。";

      const system = [
        "あなたは日本語のX投稿専門編集者です。",
        "元文章から話者の口調・語尾・温度感を推定し、勝手に別人格へ変えない。",
        "元文にない事実、体験、数字、人気、評判、トレンドを捏造しない。",
        "誤字脱字、不自然な助詞、明らかな誤変換を修正する。",
        "意味を変えず、Xで読みやすい投稿を3パターン作る。",
        "案1は自然で伝わりやすくする。",
        "案2は冒頭を強くして反応を得やすくする。ただし釣り・過剰煽りは禁止。",
        "案3は要点を短く強くまとめる。",
        "投稿内容に本当に関連するハッシュタグを0〜3個提案する。リアルタイムトレンドを取得したふりはしない。",
        "コンプラ確認では、誹謗中傷、差別、個人情報、違法・危険行為、医療・金融の強い断定、著作権侵害を助長する表現、根拠のない断定を注意候補として挙げる。問題がなければ空配列にする。",
        "修正した誤字や明らかな表記修正はcorrectionsへ短く列挙する。",
        lengthRule,
        emojiRule,
        "必ずJSONだけを返す。Markdownコードフェンスや前置きは禁止。",
        "{\"corrections\":[\"...\"],\"compliance\":[{\"level\":\"low|medium|high\",\"message\":\"...\"}],\"variants\":[{\"title\":\"自然\",\"text\":\"本文のみ\",\"hashtags\":[\"#タグ\"],\"reason\":\"特徴\"},{\"title\":\"反応重視\",\"text\":\"本文のみ\",\"hashtags\":[],\"reason\":\"特徴\"},{\"title\":\"短く強め\",\"text\":\"本文のみ\",\"hashtags\":[],\"reason\":\"特徴\"}]}"
      ].join("\n");

      const result = await env.AI.run(MODEL, {
        messages: [
          { role: "system", content: system },
          { role: "user", content: text },
        ],
        max_completion_tokens: plan === "free" ? 1400 : 4000,
        temperature: 0.45,
      });

      const raw = extractText(result);
      const parsed = parseJson(raw);

      if (!parsed || !Array.isArray(parsed.variants)) {
        return json({
          error: "AIのJSON解析に失敗しました",
          raw: String(raw || "").slice(0, 500),
        }, 502, cors);
      }

      return json(normalizeResult(parsed), 200, cors);
    } catch (error) {
      return json({
        error: error && error.message ? error.message : "Worker error",
      }, 500, cors);
    }
  },
};

function corsHeaders(request) {
  const origin = request.headers.get("Origin") || "*";
  return {
    "Access-Control-Allow-Origin": origin,
    "Vary": "Origin",
    "Access-Control-Allow-Headers": "content-type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  };
}

function extractText(result) {
  if (typeof result === "string") return result;
  if (!result || typeof result !== "object") return "";
  if (typeof result.response === "string") return result.response;
  if (typeof result.result === "string") return result.result;
  if (Array.isArray(result.choices) && result.choices.length) {
    const choice = result.choices[0] || {};
    if (choice.message && typeof choice.message.content === "string") {
      return choice.message.content;
    }
    if (typeof choice.text === "string") return choice.text;
  }
  return JSON.stringify(result);
}

function parseJson(raw) {
  if (raw && typeof raw === "object") return raw;
  let value = String(raw || "").trim();
  value = value.replace(/^\`\`\`json\s*/i, "").replace(/^\`\`\`\s*/i, "").replace(/\`\`\`\s*$/i, "").trim();

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

function normalizeResult(data) {
  return {
    corrections: Array.isArray(data.corrections) ? data.corrections.slice(0, 20) : [],
    compliance: Array.isArray(data.compliance) ? data.compliance.slice(0, 20) : [],
    variants: Array.isArray(data.variants)
      ? data.variants.slice(0, 3).map((item, index) => ({
          title: String(item && item.title ? item.title : ["自然", "反応重視", "短く強め"][index] || ("案" + (index + 1))),
          text: String(item && item.text ? item.text : ""),
          hashtags: Array.isArray(item && item.hashtags) ? item.hashtags.slice(0, 3).map(String) : [],
          reason: String(item && item.reason ? item.reason : ""),
        }))
      : [],
  };
}

function json(payload, status, headers) {
  return new Response(JSON.stringify(payload), { status, headers });
}
