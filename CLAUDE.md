# CLAUDE.md — 株式会社TEZU Intelligence HP プロジェクト

## 🗣️ 基本ルール

- **返答は必ず日本語**で行う
- コード内のコメントも**日本語**で記述する
- 変更前に必ずファイルを読み込み、意図せぬ上書きを避ける

---

## 🎨 デザインポリシー

- **テーマ：** 黒ベース × ゴールドアクセント（`#d6a451`）の高級感ある配色を維持する
- **スタイル：** 最先端・洗練されたデザイン。余白を大きく取り、フォントは Noto Sans JP + Inter
- **アニメーション：** スクロールフェードイン（`.fade-up`）・ホバーエフェクトを積極的に使用
- **3Dキャラクター：** `chara_point.png` / `chara_all.png` を使用。`mix-blend-mode: multiply` + マスクで背景を自然に馴染ませる
- **吹き出し：** `.speech-bubble` クラスを使用。白（デフォルト）または金（`.bubble-gold`）

### カラーパレット
| 変数 | 値 | 用途 |
|------|----|------|
| `--black` | `#000000` | 背景 |
| `--dark` | `#060608` | セクション背景 |
| `--dark2` | `#0d0d10` | カード背景 |
| `--gold` | `#d6a451` | メインアクセント |
| `--gold-light` | `#f0c46a` | ホバー時 |
| `--cyan` | `#00e5ff` | サブアクセント |
| `--white` | `#ffffff` | テキスト |
| `--gray` | `#777777` | サブテキスト |
| `--gray-light` | `#bbbbbb` | 軽めのテキスト |

---

## 📱 レスポンシブ対応（必須）

すべての変更において以下のブレークポイントに対応すること：

- **デスクトップ：** 1100px 以上（基準デザイン）
- **タブレット：** `@media (max-width: 900px)`
- **スマートフォン：** `@media (max-width: 600px)`

### チェックリスト
- [ ] ナビゲーションはスマホで非表示（ハンバーガーメニュー推奨）
- [ ] グリッドは1カラムに折り返す
- [ ] フォントサイズは `clamp()` で流動的に調整
- [ ] タップターゲットは最低 44px 確保
- [ ] 横スクロールが発生しないこと（`overflow-x: hidden`）

---

## 🗂️ ファイル構成

```
New-TEZU-HP/
├── index.html                    # メインHTML（全セクション含む）
├── 代表写真.png                  # 代表者プロフィール写真
├── chara_point.png               # 3Dキャラクター（指差しポーズ）
├── chara_all.png                 # 3Dキャラクター（6ポーズシート・スプライト）
├── netlify.toml                  # Netlifyリダイレクト設定
├── netlify/
│   └── functions/
│       └── chat.js               # チャットボット用サーバーレス関数（Claude API）
└── CLAUDE.md                     # このファイル
```

---

## 🏗️ プロジェクト概要

**株式会社TEZU Intelligence** のコーポレートHP（営業用LP兼用）。

| 項目 | 内容 |
|------|------|
| 業種 | AI導入コンサルティング |
| 代表者 | 手塚　岳人 |
| ターゲット | 中小企業・個人事業主 |
| 主な導線 | LINEでの無料相談 |
| デプロイ先 | Netlify（GitHubと連携・自動デプロイ） |

---

## 📋 現在のセクション構成（最新）

以下の順序で実装済み。変更時はこの順序を維持すること。

| 順番 | ID | 内容 |
|------|----|------|
| 1 | `#hero` | キャッチコピー＋3Dキャラ（浮遊アニメ）＋ヒーローボタン |
| 2 | ticker | テキストティッカー（横スクロール） |
| 3 | `#problems` | よくあるお悩み6項目（腕組みキャラ付き） |
| 4 | `#cta-mid` | 中間CTA（LINE相談ボタン） |
| 5 | `#shindan` | AI活用診断セクション（詳細説明） |
| 6 | `#demo` | AIデモセクション（営業メール・代表プロフィール・議事録の3カード） |
| 7 | `#first-step` | 入口メニュー（AI営業プロフィール作成¥5,000 ／ AI業務診断¥30,000） |
| 8 | `#services` | 提供サービス6項目 |
| 9 | `#process` | 導入の流れ4ステップ |
| 10 | `#why` | 選ばれる理由 |
| 11 | `#ai-cases` | AI活用例（営業メール・議事録・ブログの時間削減カード） |
| 12 | `#profile` | 代表者プロフィール |
| 13 | `#cta` | メインCTA（LINE相談ボタン＋3Dキャラ） |
| 14 | footer | フッター |

---

## 🤖 チャットボット（実装済み）

### 概要
- **実装方式：** Netlify サーバーレス関数（`/api/chat`）＋ Claude API
- **UIの場所：** `index.html` 内、右下固定のチャットウィジェット（`.chat-widget`）
- **APIキー管理：** Netlifyダッシュボードの環境変数 `ANTHROPIC_API_KEY` で設定

### ファイル
```
netlify/functions/chat.js   ← システムプロンプト・APIロジックはここ
```

### システムプロンプトの更新方法
`chat.js` 冒頭の `const SYSTEM_PROMPT = \`...\`` の中身を書き換えてgit pushするだけ。

### チャットボットの設定値
| 項目 | 値 |
|------|----|
| モデル | `claude-opus-4-6` |
| max_tokens | `600` |
| 送信メッセージ数 | 直近10件のみ（コスト節約） |

### ナビゲーション
```html
<a href="#problems">お悩み</a>
<a href="#shindan">AI活用診断</a>
<a href="#demo">デモ</a>
<a href="#services">サービス</a>
<a href="#why">選ばれる理由</a>
<a href="#profile">代表者紹介</a>
<a href="#cta" class="nav-cta">無料相談</a>
```

---

## 🎭 3Dキャラクター仕様

### chara_all.png（スプライトシート）
- 3列×2行の6ポーズシート
- 腕組みポーズ（Problems用）：`background-position: 50% 100%`（下段中央）

```css
.chara-nayami-wrap {
  overflow: hidden;
  width: 196px;
  flex-shrink: 0;
  display: flex;
  justify-content: flex-start;
}
.chara-nayami {
  width: 230px;
  height: 308px;
  flex-shrink: 0;
  background: url('chara_all.png') no-repeat;
  background-size: 300% 200%;
  background-position: 50% 100%;
  mix-blend-mode: multiply;
  filter: drop-shadow(0 8px 28px rgba(0,0,0,0.5));
  -webkit-mask-image: radial-gradient(ellipse 84% 92% at 46% 52%, black 62%, transparent 100%);
  mask-image: radial-gradient(ellipse 84% 92% at 46% 52%, black 62%, transparent 100%);
}
```

---

## 💡 ビジネスアドバイス（AI × コンサルで稼ぐために）

### 今すぐできる収益化アクション

1. **単価を明示しない戦略で高単価を取る**
   - HPに料金表を載せず「まずはLINE相談」に誘導 → 個別提案で単価交渉しやすい
   - 目標：初回契約30〜50万円、継続月額5〜15万円

2. **「お試しパック」で入口を下げる**
   - AI営業プロフィール作成（¥5,000）・AI業務診断（¥30,000）が入口商品
   - 満足した顧客が大型契約に繋がりやすい

3. **SNS発信と連動させる**
   - X（Twitter）・Instagram で「AI活用Tips」を毎日発信
   - HPはそのプロフィールリンク先として機能させる
   - フォロワー1,000人で問い合わせが安定し始める目安

4. **チャットボット自体を商品にする**
   - 「御社専用AIチャットボット構築」として1件30〜100万円で販売
   - 運用保守を月額5万円で継続収益化

5. **実績を積み上げてLP・HPに掲載する**
   - 最初の3〜5社は格安or無料で導入 → 事例として掲載許可をもらう
   - 「100社以上の実績」が信頼の核になる

### 中長期戦略
- **セミナー・勉強会の開催** → 参加費＋バックエンドでコンサル契約
- **電子書籍・note の有料記事** → 知名度向上 + 収益化
- **法人向け研修パッケージ** → 1社あたり50〜200万円の大型案件狙い

---

## ⚠️ 注意事項

- `代表写真.png` のファイル名に日本語を使用している（Windows環境では問題なし。Web公開時はリネーム推奨）
- 画像は `mix-blend-mode: multiply` を使っているため、**白い背景のセクションでは効果が逆転**する点に注意
- LINEリンク（`https://line.me/ti/p/itU8jz37Ut`）は変更時に忘れず更新すること
- チャットボットのAPIキー（`ANTHROPIC_API_KEY`）はNetlifyの環境変数で管理。コードに直書きしないこと
