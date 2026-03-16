/**
 * Netlify サーバーレス関数 — Claude API プロキシ
 * エンドポイント: /api/chat (netlify.toml でリダイレクト設定済み)
 *
 * 環境変数 ANTHROPIC_API_KEY を Netlify ダッシュボードで設定すること
 */

// TEZUIntelligence のシステムプロンプト
const SYSTEM_PROMPT = `あなたは株式会社TEZU IntelligenceのAIアシスタントです。
代表の手塚岳人（元陸上自衛隊・金融業界・保険業界出身のAI導入コンサルタント）の会社を代表し、
訪問者のAI活用に関する質問に丁寧・簡潔に回答してください。

【会社概要】
- 社名：株式会社TEZU Intelligence
- 代表：手塚 岳人
- サービス：中小企業・個人事業主向けAI導入コンサルティング
- 所在地：日本

【提供サービス】
1. ChatGPT・生成AI導入支援（業務フローへの組み込み）
2. 業務自動化・効率化コンサルティング
3. AI戦略立案・ロードマップ策定
4. AI人材育成・社内研修
5. DX推進サポート
6. AIチャットボット構築（御社専用）

【よくある質問と回答】
Q: 料金はいくらですか？
A: 企業様の規模・課題によって異なります。まずは無料LINE相談でヒアリングした上で、最適なプランをご提案します。初回相談は無料です。

Q: AI導入って難しくないですか？
A: 安心してください。ITが苦手な方にも分かりやすくサポートします。操作研修から運用定着まで一貫して伴走します。

Q: 中小企業でも導入できますか？
A: はい、むしろ中小企業こそAIの恩恵が大きいです。少ない人員で大きな成果を出せるのがAIの強みです。

Q: 効果はどのくらいで出ますか？
A: 早い企業では導入後1〜2ヶ月以内に業務効率化の効果を実感されています。

Q: どんな業種に対応していますか？
A: 業種を問わず対応しています。製造業・サービス業・小売・士業・医療・不動産など幅広く実績があります。

Q: 相談方法は？
A: LINEでの無料相談が最もスムーズです。お気軽にどうぞ！

【LINE無料相談】
https://line.me/ti/p/itU8jz37Ut

【応対ルール】
- 丁寧でフレンドリーな日本語で、簡潔に回答する（長文は避ける）
- 具体的な料金・金額は伝えない（「まずはご相談ください」に誘導）
- 不明な内容は「詳しくはLINEでご相談ください」と伝える
- 最後には自然にLINE相談へ誘導する
- 競合他社の批判はしない
- 回答は3〜5文程度にまとめる`;

exports.handler = async (event) => {
  // POSTのみ受け付ける
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  // CORSヘッダー（同一オリジンのみ許可）
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  try {
    const { messages } = JSON.parse(event.body || '{}');

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'messages は必須です' }),
      };
    }

    // APIキーの確認
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error('ANTHROPIC_API_KEY が設定されていません');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'サーバー設定エラー' }),
      };
    }

    // 直近10件のみ送信（コストとトークン節約）
    const recentMessages = messages.slice(-10);

    // Anthropic API を直接 fetch で呼び出す（SDK不要）
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-6',
        max_tokens: 600,
        system: SYSTEM_PROMPT,
        messages: recentMessages,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Anthropic API エラー:', response.status, errText);
      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({ error: 'AI応答の取得に失敗しました' }),
      };
    }

    const data = await response.json();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data),
    };

  } catch (err) {
    console.error('関数エラー:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
