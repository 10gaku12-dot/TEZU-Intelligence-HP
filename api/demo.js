// Vercel Serverless Function: /api/demo
// AIデモ用API（Claude APIを呼び出してJSON返答）

export default async function handler(req, res) {
  // CORSヘッダー
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { company, industry, task } = req.body || {};

  if (!company || !industry || !task) {
    return res.status(400).json({ error: '会社名・業種・相談業務を入力してください' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'APIキーが設定されていません（Vercel環境変数を確認してください）' });
  }

  // AIへのプロンプト
  const prompt = `あなたは中小企業向けAI導入コンサルタントです。
以下の会社情報をもとに、実用的なAI活用提案をJSON形式で作成してください。

【会社情報】
会社名: ${company}
業種: ${industry}
相談したい業務: ${task}

【出力形式】
以下のJSONのみ返してください。説明文・マークダウン・コードブロックは不要です。

{
  "summary": "${company}様への一言（例：御社の${task}業務はAIで大きく改善できます）",
  "diagnosis": {
    "営業": { "score": 4, "note": "業種に合ったコメント" },
    "事務": { "score": 5, "note": "業種に合ったコメント" },
    "採用": { "score": 3, "note": "業種に合ったコメント" },
    "マーケティング": { "score": 4, "note": "業種に合ったコメント" },
    "顧客対応": { "score": 3, "note": "業種に合ったコメント" }
  },
  "priority_ai": {
    "title": "最も効果の出るAIツール名",
    "reason": "${company}様のような${industry}では〜という理由で最優先です（100文字程度）"
  },
  "ideas": [
    { "title": "アイデア1タイトル", "desc": "${company}様の場合〜（80文字程度の具体的な説明）" },
    { "title": "アイデア2タイトル", "desc": "具体的な説明" },
    { "title": "アイデア3タイトル", "desc": "具体的な説明" }
  ],
  "sales_email": {
    "subject": "${company}様　${task}のAI活用についてご提案",
    "body": "そのまま送れる自然な営業メール本文（署名なし・200文字程度）"
  },
  "effect": {
    "time_saved": "月XX〜XX時間",
    "cost_saved": "年間XX〜XX万円",
    "loss": "現状維持の場合の月間機会損失（例：月5〜10万円相当）"
  }
}

【作成の注意点】
- 業種「${industry}」に合った具体的な業務例を使うこと
  （製造業なら見積・日報・マニュアル、飲食業なら口コミ返信・求人・SNS）
- 相談業務「${task}」を中心に据えた提案にする
- 会社名「${company}」を文中に自然に含める
- 経営者が読んでわかりやすい言葉で書く（専門用語不使用）
- scoreは業種と相談業務に応じてリアルな数値にする（全部5にしない）
- 大げさすぎず信頼感のある表現にする
- JSONのみ返す（前後に余分なテキスト不要）`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 1800,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Anthropic API error:', errText);
      return res.status(502).json({ error: 'AI APIエラー: ' + errText });
    }

    const data = await response.json();
    const rawText = data.content[0].text.trim();

    // JSONを抽出（```json ... ``` で囲まれていても対応）
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('JSON not found in response:', rawText);
      return res.status(500).json({ error: 'AIの返答形式が不正です' });
    }

    const result = JSON.parse(jsonMatch[0]);
    return res.status(200).json(result);

  } catch (err) {
    console.error('Demo function error:', err);
    return res.status(500).json({ error: 'サーバーエラー: ' + err.message });
  }
}
