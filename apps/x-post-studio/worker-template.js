export default {
  async fetch(request, env) {
    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "content-type",
      "Access-Control-Allow-Methods": "POST,OPTIONS",
      "Content-Type": "application/json; charset=utf-8"
    };
    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    if (request.method !== "POST") return json({ error: "POST only" }, 405, cors);

    try {
      const body = await request.json();
      if (body.action === "ping") return json({ ok: true }, 200, cors);
      if (body.action !== "compose") return json({ error: "Unknown action" }, 400, cors);

      const text = String(body.text || "").trim();
      const emojiLevel = ["high","medium","none"].includes(body.emojiLevel) ? body.emojiLevel : "medium";
      const plan = body.plan === "long" ? "long" : "free";
      if (!text) return json({ error: "本文が空です" }, 400, cors);
      if (text.length > 25000) return json({ error: "本文が長すぎます" }, 400, cors);

      const lengthRule = plan === "free"
        ? "各案はX通常投稿の280文字以内を強く意識し、余裕を持たせる。URL等でX側の実計算と差が出る可能性にも配慮する。"
        : "長文投稿として内容を削りすぎず整理する。分割しない。";

      const emojiRule = emojiLevel === "none"
        ? "絵文字は一切追加しない。"
        : emojiLevel === "high"
          ? "内容に合う絵文字を多めに使う。ただし読みにくくしない。"
          : "絵文字は自然な範囲で少量から中程度使う。";

      const system = [
        "あなたは日本語のX投稿専門編集者です。",
        "最重要: 元文章から話者の口調・語尾・温度感を推定し、勝手に別人格へ変えない。事実や体験を捏造しない。",
        "1. 誤字脱字、不自然な助詞、明らかな誤変換を修正。",
        "2. 内容の意味を変えず、Xで読みやすい構成を3パターン作る。",
        "3. 案1=自然で伝わりやすい。案2=冒頭フックを強め反応を得やすく。案3=要点を強く短く。ただし過剰な煽りは禁止。",
        "4. 投稿内容に本当に関連するハッシュタグを0〜3個提案。トレンドを取得したふり、人気タグだという断定は禁止。",
        "5. コンプラ確認: 誹謗中傷、差別、個人情報、違法行為、危険行為、医療・金融の断定、著作権侵害を助長する表現、根拠のない断定などを指摘。問題がなければ空配列。",
        "6. 修正した誤字等は corrections に短く列挙。",
        lengthRule,
        emojiRule,
        "出力はJSONのみ。コードフェンス禁止。",
        "形式:",
        "{\"corrections\":[\"...\"],\"compliance\":[{\"level\":\"low|medium|high\",\"message\":\"...\"}],\"variants\":[{\"title\":\"自然\",\"text\":\"本文のみ\",\"hashtags\":[\"#タグ\"],\"reason\":\"この案の特徴\"},{\"title\":\"反応重視\",\"text\":\"本文のみ\",\"hashtags\":[],\"reason\":\"...\"},{\"title\":\"短く強め\",\"text\":\"本文のみ\",\"hashtags\":[],\"reason\":\"...\"}]}"
      ].join("\n");

      const result = await env.AI.run("@cf/zai-org/glm-4.7-flash", {
        messages: [
          { role: "system", content: system },
          { role: "user", content: text }
        ],
        max_tokens: plan === "free" ? 1200 : 3500,
        temperature: 0.55
      });

      const raw = typeof result === "string" ? result : (result.response || result.result || "");
      const parsed = parseJson(raw);
      if (!parsed || !Array.isArray(parsed.variants)) {
        return json({ error: "AIのJSON解析に失敗しました", raw: String(raw).slice(0,500) }, 502, cors);
      }
      return json(parsed, 200, cors);
    } catch (e) {
      return json({ error: (e && e.message) || "Worker error" }, 500, cors);
    }
  }
};

function parseJson(raw) {
  if (raw && typeof raw === "object") return raw;
  let s = String(raw || "").trim();
  while (s.charCodeAt(0) === 96) s = s.slice(1);
  while (s.charCodeAt(s.length - 1) === 96) s = s.slice(0, -1);
  s = s.replace(/^json\s*/i, "").trim();
  try { return JSON.parse(s); } catch (e) {}
  const a = s.indexOf("{");
  const b = s.lastIndexOf("}");
  if (a >= 0 && b > a) {
    try { return JSON.parse(s.slice(a, b + 1)); } catch (e) {}
  }
  return null;
}

function json(obj, status, headers) {
  return new Response(JSON.stringify(obj), { status, headers });
}
