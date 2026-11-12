"""Generates Arteo logo concept SVGs (geometric lowercase built from rings and bars).

Units: x-height H=120, stem S=26, ring outer R=60 / inner r=34 (stroke 26).
Y axis points down; y=0 is the top of the x-height, y=120 the baseline.
"""
import math
import os

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "concepts")
os.makedirs(OUT, exist_ok=True)

H, S, R, r = 120, 26, 60, 34
INK = "#18181C"


def f(v):
    return f"{v:.2f}".rstrip("0").rstrip(".")


def ring(cx, cy, ro=R, ri=r):
    return (f"M{f(cx - ro)} {f(cy)}a{f(ro)} {f(ro)} 0 1 0 {f(2 * ro)} 0a{f(ro)} {f(ro)} 0 1 0 {f(-2 * ro)} 0Z"
            f"M{f(cx - ri)} {f(cy)}a{f(ri)} {f(ri)} 0 1 0 {f(2 * ri)} 0a{f(ri)} {f(ri)} 0 1 0 {f(-2 * ri)} 0Z")


def rect(x0, y0, x1, y1):
    return f"M{f(x0)} {f(y0)}H{f(x1)}V{f(y1)}H{f(x0)}Z"


def pt(cx, cy, rad, deg):
    a = math.radians(deg)
    return cx + rad * math.cos(a), cy + rad * math.sin(a)


def arc_band(cx, cy, a0, a1, ro=R, ri=r):
    """Ring segment from angle a0 to a1 (degrees, screen coords, clockwise positive)."""
    span = (a1 - a0) % 360
    large = 1 if span > 180 else 0
    p0, p1 = pt(cx, cy, ro, a0), pt(cx, cy, ro, a1)
    q1, q0 = pt(cx, cy, ri, a1), pt(cx, cy, ri, a0)
    return (f"M{f(p0[0])} {f(p0[1])}A{f(ro)} {f(ro)} 0 {large} 1 {f(p1[0])} {f(p1[1])}"
            f"L{f(q1[0])} {f(q1[1])}A{f(ri)} {f(ri)} 0 {large} 0 {f(q0[0])} {f(q0[1])}Z")


# --- letters: each returns (list of path d strings, advance width) ---------------------------
def L_a(x):
    return [ring(x + 60, 60), rect(x + 94, 0, x + 120, 120)], 120


def L_r(x):
    # stem + arch springing from the stem's left edge, radial terminal at -50 deg
    return [rect(x, 0, x + S, 120), arc_band(x + 60, 60, 180, 310)], 99


def L_t(x):
    return [rect(x + 18, -34, x + 44, 120), rect(x, 0, x + 66, 22)], 66


def L_e(x, bar_end=118, gap=(10, 40)):
    # ring open at lower right + crossbar slightly thinner than stems
    return [arc_band(x + 60, 60, gap[1], 360 + gap[0]), rect(x + 22, 48, x + bar_end, 70)], 120


def L_o(x):
    return [ring(x + 60, 60)], 120


def wordmark(x0=0, gap=18):
    paths, x = [], x0
    for fn, g in ((L_a, gap), (L_r, gap - 10), (L_t, gap - 6), (L_e, gap), (L_o, 0)):
        p, w = fn(x)
        paths += p
        x += w + g
    return paths, x - x0


def svg(view, body, w=None, h=None):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{view}">\n{body}\n</svg>\n')


def group(paths, tx=0, ty=0, k=1, fill=INK, evenodd=True, extra=""):
    rule = ' fill-rule="evenodd"' if evenodd else ""
    inner = "".join(f'<path d="{d}"/>' for d in paths)
    return f'<g transform="translate({f(tx)} {f(ty)}) scale({f(k)})" fill="{fill}"{rule}{extra}>{inner}</g>'


def save(name, content):
    with open(os.path.join(OUT, name), "w", encoding="utf-8") as fh:
        fh.write(content)


WM, WM_W = wordmark()


def lockup(symbol_body, name):
    k = 0.8
    wx = 300
    ty = 128 - 60 * k  # centre the x-height on the symbol's centre
    body = symbol_body + "\n" + group(WM, wx, ty, k)
    width = wx + WM_W * k + 8
    save(name, svg(f"0 0 {f(width)} 256", body))


# --- A: Register -- single-storey "a" whose bowl is a printer's registration target ---------
def concept_a():
    cx, cy, ro, ri = 112, 128, 74, 44
    stem = rect(cx + ro - 30, cy - ro, cx + ro, cy + ro)
    t = 12  # crosshair weight
    cross_h = rect(cx - ro - 22, cy - t / 2, cx + ro - 30, cy + t / 2)
    cross_v = rect(cx - t / 2, cy - ro - 22, cx + t / 2, cy + ro + 22)
    body_paths = [ring(cx, cy, ro, ri), stem]
    # center the symbol horizontally: bbox x from cx-ro-22 to cx+ro
    x0, x1 = cx - ro - 22, cx + ro
    dx = 128 - (x0 + x1) / 2
    sym = (group(body_paths, dx, 0, 1) + group([cross_h, cross_v], dx, 0, 1, evenodd=False))
    save("a-register-symbol.svg", svg("0 0 256 256", sym))
    lockup(sym, "a-register-lockup.svg")
    # two-ink preview
    ink2 = (group(body_paths, dx, 0, 1, fill="#2A4BD7") +
            group([cross_h, cross_v], dx, 0, 1, fill="#FF4AA5", evenodd=False, extra=' style="mix-blend-mode:multiply"'))
    save("a-register-symbol-color.svg", svg("0 0 256 256", ink2))


# --- B: Overprint -- custom wordmark, the "e" and "o" overprint like two inks ---------------
def concept_b():
    pe, _ = L_e(0, bar_end=94, gap=(30, 60))
    eo_rings = [pe[0] + ring(94 + 60, 60)]  # o shifted onto e by one stroke
    bar = pe[1]
    k = 1.06
    w = 214 * k
    tx, ty = (256 - w) / 2, 128 - 60 * k
    sym = group(eo_rings, tx, ty, k) + group([bar], tx, ty, k, evenodd=False)
    save("b-overprint-symbol.svg", svg("0 0 256 256", sym))
    # full wordmark with the eo overprint
    paths, x = [], 0
    for fn, g in ((L_a, 18), (L_r, 8), (L_t, 12)):
        p, wd = fn(x)
        paths += p
        x += wd + g
    e_paths, _ = L_e(x, bar_end=94, gap=(30, 60))
    rings = [e_paths[0] + ring(x + 94 + 60, 60)]
    width = x + 214
    k = 0.8
    tx, ty = 8, 128 - 60 * k
    body = (group(paths, tx, ty, k) + group(rings, tx, ty, k) +
            group([e_paths[1]], tx, ty, k, evenodd=False))
    save("b-overprint-lockup.svg", svg(f"0 0 {f(width * k + 16)} 256", body))
    color = (group(paths, tx, ty, k, fill=INK) +
             group([e_paths[0], e_paths[1]], tx, ty, k, fill="#2A4BD7", evenodd=False) +
             group([ring(x + 94 + 60, 60)], tx, ty, k, fill="#FF4AA5", extra=' style="mix-blend-mode:multiply"'))
    save("b-overprint-lockup-color.svg", svg(f"0 0 {f(width * k + 16)} 256", color))


# --- C: Ligature -- "a" and "r" share one stem: art starts with a single stroke ---------------
def concept_c():
    pa, _ = L_a(0)
    arch = arc_band(94 + 60, 60, 180, 310)
    paths = pa + [arch]
    w = 94 + 99
    k = 1.12
    tx, ty = (256 - w * k) / 2, 128 - 60 * k
    sym = group(paths, tx, ty, k, evenodd=True)
    # ring needs evenodd; stem/arch overlap nothing inside the hole -> separate groups
    sym = group([pa[0]], tx, ty, k) + group([pa[1], arch], tx, ty, k, evenodd=False)
    save("c-ligature-symbol.svg", svg("0 0 256 256", sym))
    lockup(sym, "c-ligature-lockup.svg")
    col = group([pa[0]], tx, ty, k, fill="#2A4BD7") + group([pa[1]], tx, ty, k, fill="#2A4BD7", evenodd=False) + \
        group([arch], tx, ty, k, fill="#FF4AA5", evenodd=False, extra=' style="mix-blend-mode:multiply"')
    save("c-ligature-symbol-color.svg", svg("0 0 256 256", col))


def wordmark_only():
    k = 1
    body = group(WM, 8, 50, k)
    save("wordmark.svg", svg(f"0 0 {f(WM_W + 16)} 190", body))


if __name__ == "__main__":
    concept_a()
    concept_b()
    concept_c()
    wordmark_only()
    print("written to", OUT)
