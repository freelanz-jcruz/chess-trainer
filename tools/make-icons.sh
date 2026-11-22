#!/bin/sh
# Genera los iconos PNG de la PWA a partir de assets/icon.svg (macOS: qlmanage + sips).
# Los PNG resultantes se versionan, así que solo hace falta ejecutarlo si cambia el SVG.
set -e
cd "$(dirname "$0")/.."
tmp=$(mktemp -d)
qlmanage -t -s 512 -o "$tmp" assets/icon.svg >/dev/null
for size in 512 192 180; do
  sips -z $size $size "$tmp/icon.svg.png" --out "public/icons/icon-$size.png" >/dev/null
done
rm -rf "$tmp"
echo "Iconos generados en public/icons/"
