#!/bin/sh
# Netlify公開用フォルダ(dist)を作る。公開してよいファイルだけを明示的にコピーする(許可リスト方式)。
#
# ・CLAUDE.md / api/ / netlify/ / netlify.toml / scripts/ / .claude/ などの内部ファイルは dist に入れない。
# ・新しい公開ファイル(ページ・画像など)を追加したときは、ここのコピー対象にも追加すること。
#   (追加し忘れると本番に出ない。逆に、書かれていないファイルは絶対に公開されない)
# ・Netlify Functions は netlify/functions から別にビルドされるため、この script とは無関係に動作する。
# ・失敗(exit 1)した場合、Netlify は直前の公開版を維持する。
set -eu

rm -rf dist
mkdir -p dist

# ページ
cp index.html ai-course.html flyer.html dist/
# SEO
cp robots.txt sitemap.xml dist/
# 画像・ロゴ
cp logo.png chara_point.png chara_nayami.png dist/
cp "代表写真.png" dist/
cp -R images dist/images

# 必須ファイルが揃っていなければビルドを失敗させる
for f in index.html ai-course.html robots.txt sitemap.xml logo.png chara_point.png chara_nayami.png "代表写真.png" images/ai-education-visual.jpg; do
  [ -f "dist/$f" ] || { echo "ERROR: dist/$f がありません" >&2; exit 1; }
done

echo "dist ready: $(find dist -type f | wc -l) files"
