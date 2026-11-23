"""Genera los iconos PNG de la PWA a partir de assets/icon.png (requiere Pillow: pip install pillow).

Los PNG resultantes se versionan, así que solo hace falta ejecutarlo si cambia el icono de origen.
- icon-192 / icon-512: el icono tal cual (cuadrado redondeado con margen transparente).
- icon-180 (iOS): solo el interior del cuadrado, opaco; iOS pone las esquinas redondeadas.
- icon-maskable-512 (Android): fondo a sangre y la figura dentro de la zona segura (círculo del 80 %).

También genera public/brand-symbol.png, la marca de la cabecera, a partir de assets/symbol.png: una máscara
(solo transparencia) en la que lo oscuro es opaco y los detalles claros quedan huecos. Se pinta con el color
del texto (CSS mask), así se adapta al tema claro y al oscuro.
"""
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'assets' / 'icon.png'
SYMBOL = ROOT / 'assets' / 'symbol.png'
OUT = ROOT / 'public' / 'icons'

# Interior del cuadrado redondeado en el original (678 px), sin el borde claro.
INNER = (51, 51, 630, 630)
MASKABLE_SCALE = 0.78


def main() -> None:
    src = Image.open(SRC).convert('RGBA')
    k = src.width / 678
    inner = src.crop(tuple(round(v * k) for v in INNER))

    for size in (512, 192):
        src.resize((size, size), Image.LANCZOS).save(OUT / f'icon-{size}.png', optimize=True)

    inner.resize((180, 180), Image.LANCZOS).convert('RGB').save(OUT / 'icon-180.png', optimize=True)

    # Maskable: de fondo, un degradado suave con los colores del propio icono (lejos de las esquinas
    # redondeadas); encima, la figura blanca reducida para que quede dentro de la zona segura.
    size = 512
    # Color de cada esquina (una muestra pequeña, a salvo del redondeo), interpolado en todo el lienzo.
    w = inner.width
    a, b = round(w * 0.1), round(w * 0.18)
    corners = Image.new('RGBA', (2, 2))
    for x, y, box in ((0, 0, (a, a, b, b)), (1, 0, (w - b, a, w - a, b)), (0, 1, (a, w - b, b, w - a)), (1, 1, (w - b, w - b, w - a, w - a))):
        corners.putpixel((x, y), inner.crop(box).resize((1, 1), Image.BOX).getpixel((0, 0)))
    canvas = corners.resize((size, size), Image.BILINEAR)
    # Solo la figura (lo claro), recortada por luminosidad: así no hay costuras con el fondo. Los trazos oscuros
    # del interior quedan huecos y dejan ver el degradado, del mismo tono que en el original.
    s = round(size * MASKABLE_SCALE)
    fg = inner.resize((s, s), Image.LANCZOS)
    lum = fg.convert('L')
    alpha = lum.point(lambda v: max(0, min(255, round((v - 140) * 255 / 70))))
    # Fuera las esquinas: ahí asoma el borde claro del cuadrado redondeado original.
    keep = Image.new('L', (s, s), 0)
    ImageDraw.Draw(keep).rounded_rectangle((0, 0, s - 1, s - 1), radius=round(s * 0.2), fill=255)
    alpha = ImageChops.multiply(alpha, keep)
    off = (size - s) // 2
    canvas.paste(fg, (off, off), alpha)
    canvas.convert('RGB').save(OUT / 'icon-maskable-512.png', optimize=True)
    sym = Image.open(SYMBOL).convert('RGBA')
    sym = sym.crop(sym.getchannel('A').getbbox())
    # Oscuro → opaco, claro → hueco, respetando la transparencia original.
    dark = Image.composite(sym.convert('L').point(lambda v: 255 - v), Image.new('L', sym.size, 0), sym.getchannel('A'))
    # El azul marino no es negro puro: se estira el contraste para que el trazo quede opaco del todo.
    lo, hi = 40, max(dark.getdata()) - 20
    alpha = dark.point(lambda v: max(0, min(255, round((v - lo) * 255 / (hi - lo)))))
    mask = Image.new('RGBA', sym.size, (0, 0, 0, 0))
    mask.putalpha(alpha)
    mask.save(ROOT / 'public' / 'brand-symbol.png', optimize=True)
    print(f'Iconos generados en {OUT.relative_to(ROOT)}/')


if __name__ == '__main__':
    main()
