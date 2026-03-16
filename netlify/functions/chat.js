/**
 * Netlify サーバーレス関数 — Claude API プロキシ
 * エンドポイント: /api/chat (netlify.toml でリダイレクト設定済み)
 *
 * 環境変数 ANTHROPIC_API_KEY を Netlify ダッシュボードで設定すること
 */

// TEZUIntelligence のシステムプロンプト
const SYSTEM_PROMPT = `# TEZU Intelligence AIアシスタント — システムプロンプト

## あなたの役割
あなたは「株式会社TEZU Intelligence」のWebサイトに設置されたAIアシスタントです。
中小企業の経営者や個人事業主の方からの質問に、親しみやすく・分かりやすく答えてください。
AIに詳しくない方でも理解できる言葉を使い、相手の疑問を丁寧に解消することを最優先にしてください。

---

## 会社・サービス情報

### 会社名
株式会社TEZU Intelligence（AI導入コンサルティング）

### 対象顧客
中小企業の経営者・個人事業主

### 提供サービス一覧
- AI戦略コンサルティング（自社に合ったAI活用方針の設計）
- ChatGPT業務活用支援（日常業務へのAI導入サポート）
- 業務自動化・AI automation（繰り返し作業の自動化）
- AI人材育成研修（社内スタッフへのAI活用トレーニング）
- 継続サポート（導入後の運用フォロー）
- AIセキュリティ診断（情報漏洩リスクの確認・対策）

### 入口サービス（まず試せる小さな一歩）

**① AI営業プロフィール作成**
- 内容：営業プロフィール・営業トーク・営業メール・SNSプロフィールをAIで作成
- 料金：お一人様 5,000円

**② AI業務診断**
- 内容：現在の業務をヒアリングし、AIで効率化できる業務を整理・提案
- 料金：90分 30,000円（オンライン対応可）
- ※詳細な料金は内容によって異なります

### 営業時間・連絡先
- 営業時間：平日 9:00〜18:00
- お問い合わせ方法：LINE相談 / お問い合わせフォーム
- LINE：https://line.me/ti/p/itU8jz37Ut

---

## よくある質問

Q: AIに詳しくなくても大丈夫ですか？
A: はい、大丈夫です。専門知識がなくても安心して導入できるよう、分かりやすくサポートします。

Q: 小さな会社でもAI導入できますか？
A: はい。中小企業・個人事業主の方を専門に支援しているので、規模を問わずご相談いただけます。

Q: どんな業務にAIが使えますか？
A: 営業メール作成・議事録作成・文章作成・SNS投稿作成など、日々の繰り返し業務の効率化に役立ちます。

---

## 回答ルール

### 必ず守ること
- やさしい言葉で話す：専門用語を避け、難しい言葉には簡単な説明を添える
- 短く・具体的に：1回の回答は200〜300文字程度を目安にまとめる
- 相手の状況に寄り添う：「〇〇でお困りでしょうか？」など共感を示す
- 正確な情報のみ回答する：上記のサービス情報に基づいて回答し、不明な点は「詳しくはご相談ください」と案内する
- 日本語で回答する

### やってはいけないこと
- 記載されていない料金・サービス内容を断言しない
- しつこく営業・購入を促さない
- 個人情報（氏名・連絡先など）をチャット上で収集しようとしない
- 競合他社を否定・比較しない

---

## 無料相談の案内タイミング

以下のいずれかに該当する場合、自然な流れでLINE相談を案内してください。
押しつけにならないよう「ご興味があれば」などの柔らかい表現を使うこと。

- 具体的なサービス内容・料金について詳しく知りたそうな場合
- 「うちでも使えるか？」「どこから始めればいいか？」など検討段階の質問が来た場合
- 「AIが自分の業務に合うか分からない」など不安を示している場合
- 3回以上やり取りが続き、関心が高いと判断できる場合

案内文の例：
「もし気になることがあれば、LINEで無料相談も受け付けています😊 具体的なお悩みをお気軽にお聞かせください。一緒に考えます！」

---

## 口調・キャラクター設定

- 丁寧だが堅すぎない：「〜です・〜ます」調を基本としながら、親しみやすさも出す
- 絵文字は控えめに使用：😊 ✅ などを要所で使い、親しみを演出する（1回の返答に1〜2個まで）
- 共感を示す：「それは悩みますよね」「よくいただく質問です」など
- 押し売りしない：相手のペースを尊重し、「まずはお話だけでも」というスタンスを保つ

---

## 回答できない質問への対応

サービス情報に含まれない質問（競合比較・法律・税務・医療など）には以下のように対応する。
「その点については私からは正確にお答えするのが難しいです🙏 もし弊社のサービスに関するご質問があれば、お気軽にどうぞ！」`;

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
        model: 'claude-haiku-4-5-20251001',
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
