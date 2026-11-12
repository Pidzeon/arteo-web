"""Final Arteo logo artwork (Ligature direction): wordmark with the shared a/r stem, the "ar" symbol,
a heavier small-size cut and two-ink colour versions. Output: ./final/

Geometry (units, y down, x-height 0..120):
  rounds: outer radius 61.5, inner 35.5, centre y 60 -> 1.5 overshoot top and bottom, 26 side stroke
  stems 26 wide, t crossbar and e bar 22 (horizontals optically thinner)
"""
import math
import os

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "final")
os.makedirs(OUT, exist_ok=True)

INK, BLUE, PINK = "#18181C", "#2A4BD7", "#FF4AA5"
OVER = "#2A168B"  # blue x pink multiplied (overprint), as a flat colour for files and print
D_BLUE, D_PINK, D_OVER, D_INK = "#5672FF", "#FF5DB1", "#FFA5FF", "#ECECE6"  # dark (screen blend)


def f(v):
    return f"{v:.2f}".rstrip("0").rstrip(".")


def circle(cx, cy, rad):
    return f"M{f(cx - rad)} {f(cy)}a{f(rad)} {f(rad)} 0 1 0 {f(2 * rad)} 0a{f(rad)} {f(rad)} 0 1 0 {f(-2 * rad)} 0Z"


def rect(x0, y0, x1, y1):
    return f"M{f(x0)} {f(y0)}H{f(x1)}V{f(y1)}H{f(x0)}Z"


def pt(cx, cy, rad, deg):
    a = math.radians(deg)
    return cx + rad * math.cos(a), cy + rad * math.sin(a)


def band(cx, cy, a0, a1, ro, ri):
    span = (a1 - a0) % 360
    large = 1 if span > 180 else 0
    p0, p1 = pt(cx, cy, ro, a0), pt(cx, cy, ro, a1)
    q1, q0 = pt(cx, cy, ri, a1), pt(cx, cy, ri, a0)
    return (f"M{f(p0[0])} {f(p0[1])}A{f(ro)} {f(ro)} 0 {large} 1 {f(p1[0])} {f(p1[1])}"
            f"L{f(q1[0])} {f(q1[1])}A{f(ri)} {f(ri)} 0 {large} 0 {f(q0[0])} {f(q0[1])}Z")


class Cut:
    """One weight of the type: regular (logo) or heavy (small sizes)."""

    def __init__(self, ro=61.5, stroke=26, bar=22):
        self.ro, self.s, self.bar = ro, stroke, bar
        self.ri = ro - stroke
        self.cy = 60

    # "ar" ligature: bowl, shared stem, r arch springing from the stem's left edge
    def ar(self, x):
        ro, ri, s, cy = self.ro, self.ri, self.s, self.cy
        ca = x + ro
        stem_l, stem_r = ca + ri, ca + ro
        cr = stem_l + ro                      # arch centre: its outer circle starts at the stem's left edge
        bowl = circle(ca, cy, ro) + circle(ca, cy, ri)
        stem = rect(stem_l, 0, stem_r, 120)
        arch = band(cr, cy, 180, 310, ro, ri)
        # overprint zone: part of the arch lying over the stem
        h = math.sqrt(ro * ro - (ro - s) ** 2)
        over = (f"M{f(stem_l)} {f(cy)}A{f(ro)} {f(ro)} 0 0 1 {f(stem_r)} {f(cy - h)}V{f(cy)}Z")
        end = cr + ro * math.cos(math.radians(50))
        return {"bowl": bowl, "stem": stem, "arch": arch, "over": over}, end - x

    def t(self, x):
        w = 66
        return [rect(x + 18, -34, x + 18 + self.s, 120), rect(x, 0, x + w, self.bar)], w

    def e(self, x):
        ro, ri, cy = self.ro, self.ri, self.cy
        c = x + ro
        top = cy - 12
        return [band(c, cy, 40, 370, ro, ri), rect(c - ri - 4, top, c + ro - 2, top + self.bar)], 2 * ro

    def o(self, x):
        c = x + self.ro
        return [circle(c, self.cy, self.ro) + circle(c, self.cy, self.ri)], 2 * self.ro


REG, HEAVY = Cut(), Cut(ro=62, stroke=32, bar=28)


def wordmark(cut=REG):
    ar, w = cut.ar(0)
    x = w + 10
    t, wt = cut.t(x)
    x += wt + 14
    e, we = cut.e(x)
    x += we + 16
    o, wo = cut.o(x)
    return ar, t + e + o, x + wo


def paths(ds, fill, evenodd=True):
    rule = ' fill-rule="evenodd"' if evenodd else ""
    return "".join(f'<path fill="{fill}"{rule} d="{d}"/>' for d in ds)


def doc(view, title, body):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{view}" role="img">'
            f'<title>{title}</title>\n{body}\n</svg>\n')


def save(name, content):
    with open(os.path.join(OUT, name), "w", encoding="utf-8") as fh:
        fh.write(content)


def ar_body(ar, ink=None, blue=BLUE, pink=PINK, over=OVER):
    if ink:
        return paths([ar["bowl"]], ink) + paths([ar["stem"], ar["arch"]], ink)
    return (paths([ar["bowl"]], blue) + paths([ar["stem"]], blue) + paths([ar["arch"]], pink) +
            paths([ar["over"]], over))


def build_symbol(cut, suffix):
    ar, w = cut.ar(0)
    # fit into 256 square, centred on the x-height (optically centred: 2 % above centre)
    k = 200 / w
    tx = (256 - w * k) / 2
    ty = 128 - 60 * k - 256 * 0.01
    g = f'<g transform="translate({f(tx)} {f(ty)}) scale({f(k)})">'
    save(f"arteo-symbol{suffix}.svg", doc("0 0 256 256", "Arteo", g + ar_body(ar, ink=INK) + "</g>"))
    save(f"arteo-symbol{suffix}-color.svg", doc("0 0 256 256", "Arteo", g + ar_body(ar) + "</g>"))
    save(f"arteo-symbol{suffix}-color-dark.svg",
         doc("0 0 256 256", "Arteo", g + ar_body(ar, blue=D_BLUE, pink=D_PINK, over=D_OVER) + "</g>"))


def build_wordmark():
    ar, rest, w = wordmark()
    pad = 8
    view = f"{f(-pad)} {f(-34 - pad)} {f(w + 2 * pad)} {f(154 + 2 * pad)}"
    save("arteo-wordmark.svg", doc(view, "Arteo", ar_body(ar, ink=INK) + paths(rest, INK)))
    save("arteo-wordmark-color.svg", doc(view, "Arteo", ar_body(ar) + paths(rest, BLUE)))
    save("arteo-wordmark-color-ink.svg", doc(view, "Arteo", ar_body(ar) + paths(rest, INK)))
    save("arteo-wordmark-color-dark.svg",
         doc(view, "Arteo", ar_body(ar, blue=D_BLUE, pink=D_PINK, over=D_OVER) + paths(rest, D_INK)))
    return w


if __name__ == "__main__":
    build_symbol(REG, "")
    build_symbol(HEAVY, "-small")
    w = build_wordmark()
    print("final artwork written, wordmark width", round(w, 1))
