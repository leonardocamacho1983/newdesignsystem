"""Monta GIF e WebP animados a partir de uma pasta de quadros PNG.

Os dois saem sem perda, e isso não é preciosismo: a marca é feita de partícula
de borda dura, e qualquer codec com perda borra exatamente o grão que a
identifica. Para conteúdo preto e branco a paleta do GIF não custa nada, e os
dois formatos embutem em e-mail, apresentação e social sem player.

Uso: anim-frames.py <pasta-de-quadros> <destino-sem-extensao> <ms-por-quadro>
"""
import sys, pathlib
from PIL import Image

pasta, destino, ms = pathlib.Path(sys.argv[1]), sys.argv[2], int(sys.argv[3])
quadros = [Image.open(p).convert('RGB') for p in sorted(pasta.glob('*.png'))]
if not quadros:
    sys.exit(f'sem quadros em {pasta}')

# GIF: reduz para metade da largura — em preto e branco continua legível e o
# arquivo cabe em e-mail.
gif = [q.resize((q.width // 2, q.height // 2), Image.LANCZOS) for q in quadros]
gif[0].save(f'{destino}.gif', save_all=True, append_images=gif[1:],
            duration=ms, loop=1, optimize=True)

quadros[0].save(f'{destino}.webp', save_all=True, append_images=quadros[1:],
                duration=ms, loop=1, lossless=True, method=4)

for ext in ('gif', 'webp'):
    kb = pathlib.Path(f'{destino}.{ext}').stat().st_size / 1024
    print(f'  {destino}.{ext} · {kb:.0f} KB')
