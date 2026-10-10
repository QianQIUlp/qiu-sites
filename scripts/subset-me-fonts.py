"""Regenerate the homepage WOFF2 assets with fonttools + brotli.

Pass a directory containing the original TTFs and OFL files listed in
src/assets/me/fonts/README.md. This is an asset task, not part of the build.
"""
from pathlib import Path
import re
import sys

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

root = Path(__file__).resolve().parents[1]
sources = Path(sys.argv[1])
output = root / "src/assets/me/fonts"
output.mkdir(parents=True, exist_ok=True)
files = [root / "src/layouts/PersonalHome.astro"]
files += list((root / "src/components/me").glob("*.astro"))
files += list((root / "src/scripts/me").glob("*.js"))
characters = set("".join(path.read_text(encoding="utf-8") for path in files))
cjk = {c for c in characters if 0x3000 <= ord(c) <= 0x9FFF or 0xFF00 <= ord(c) <= 0xFFEF}
latin = {c for c in characters if 0x20 <= ord(c) < 0x3000}
latin.update(chr(n) for n in range(0x20, 0x7F))  # Live numbers and project names.


def save(source, target, text, weight=None):
    font = TTFont(sources / source)
    if weight is not None:
        font = instantiateVariableFont(font, {"wght": weight}, inplace=True)
    options = subset.Options()
    options.flavor = "woff2"
    subsetter = subset.Subsetter(options=options)
    subsetter.populate(text="".join(sorted(text)))
    subsetter.subset(font)
    family = source.removesuffix(".ttf").removesuffix("-italic")
    license_text = (sources / f"{family}-OFL.txt").read_text(encoding="utf-8")
    font["name"].setName(license_text, 13, 3, 1, 0x409)
    font["name"].setName("https://openfontlicense.org", 14, 3, 1, 0x409)
    font.flavor = "woff2"
    font.save(output / target)
    return font


save("arimo.ttf", "arimo-latin.woff2", latin)
save("gelasio.ttf", "gelasio-latin.woff2", latin)
save("gelasio-italic.ttf", "gelasio-italic-latin.woff2", latin, 400)
save("cousine.ttf", "cousine-latin.woff2", latin)
cjk_font = save("noto-sans-sc.ttf", "noto-sans-sc-ui.woff2", cjk, (400, 900))
serif_cjk = save("noto-serif-sc.ttf", "noto-serif-sc-ui.woff2", cjk, 400)
display = save("noto-sans-sc.ttf", "noto-sans-sc-display.woff2", set("千秋确定空"), 900)
assert {ord(c) for c in cjk} <= cjk_font.getBestCmap().keys(), "Missing homepage CJK glyphs"
assert {ord(c) for c in cjk} <= serif_cjk.getBestCmap().keys(), "Missing homepage serif CJK glyphs"
assert {ord(c) for c in "千秋确定空"} <= display.getBestCmap().keys()

# Pencil handwriting (page drafts, pencil notes): only the quoted strings between the
# `// hand-font:start` / `// hand-font:end` markers of the homepage components.
blocks = [text.split("// hand-font:end", 1)[0] for path in (root / "src/components/me").glob("*.astro")
          for text in path.read_text(encoding="utf-8").split("// hand-font:start")[1:]]
hand = set("".join(re.findall(r"'([^']*)'", "".join(blocks))))
hand_cjk = {c for c in hand if 0x3000 <= ord(c) <= 0x9FFF or 0xFF00 <= ord(c) <= 0xFFEF}
hand_cjk_font = save("long-cang.ttf", "long-cang-hand.woff2", hand_cjk)
save("caveat.ttf", "caveat-hand.woff2", hand - hand_cjk, 450)
assert {ord(c) for c in hand_cjk} <= hand_cjk_font.getBestCmap().keys(), "Missing handwriting glyphs"
for family in ("arimo", "gelasio", "cousine", "noto-sans-sc", "noto-serif-sc", "long-cang", "caveat"):
    (output / f"{family}-OFL.txt").write_bytes((sources / f"{family}-OFL.txt").read_bytes())
for path in output.glob("*.woff2"):
    print(f"{path.name}: {path.stat().st_size:,} bytes")
