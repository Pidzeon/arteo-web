"""Second round of Arteo logo concepts (D, E, F). Reuses helpers from build_concepts.py."""
import math

from build_concepts import (INK, S, f, ring, rect, arc_band, group, save, svg, lockup)

BLUE, PINK = "#2A4BD7", "#FF4AA5"
MUL = ' style="mix-blend-mode:multiply"'


# --- elliptical helpers (for E: letters that widen like Mona Sans' width axis) ----------------
def ept(cx, cy, rx, ry, deg):
    a = math.radians(deg)
    return cx + rx * math.cos(a), cy + ry * math.sin(a)


def ering(cx, cy, rxo, ryo, rxi, ryi):
    return (f"M{f(cx - rxo)} {f(cy)}a{f(rxo)} {f(ryo)} 0 1 0 {f(2 * rxo)} 0a{f(rxo)} {f(ryo)} 0 1 0 {f(-2 * rxo)} 0Z"
            f"M{f(cx - rxi)} {f(cy)}a{f(rxi)} {f(ryi)} 0 1 0 {f(2 * rxi)} 0a{f(rxi)} {f(ryi)} 0 1 0 {f(-2 * rxi)} 0Z")


def eband(cx, cy, rxo, ryo, rxi, ryi, a0, a1):
    span = (a1 - a0) % 360
    large = 1 if span > 180 else 0
    p0, p1 = ept(cx, cy, rxo, ryo, a0), ept(cx, cy, rxo, ryo, a1)
    q1, q0 = ept(cx, cy, rxi, ryi, a1), ept(cx, cy, rxi, ryi, a0)
    return (f"M{f(p0[0])} {f(p0[1])}A{f(rxo)} {f(ryo)} 0 {large} 1 {f(p1[0])} {f(p1[1])}"
            f"L{f(q1[0])} {f(q1[1])}A{f(rxi)} {f(ryi)} 0 {large} 0 {f(q0[0])} {f(q0[1])}Z")


def dims(s):
    rxo = 60 * s
    return rxo, 60, rxo - S, 34


def W_a(x, s):
    rxo, ryo, rxi, ryi = dims(s)
    return [ering(x + rxo, 60, rxo, ryo, rxi, ryi), rect(x + 2 * rxo - S, 0, x + 2 * rxo, 120)], 2 * rxo


def W_r(x, s):
    rxo, ryo, rxi, ryi = dims(s)
    return [rect(x, 0, x + S, 120), eband(x + rxo, 60, rxo, ryo, rxi, ryi, 180, 310)], rxo * (1 + math.cos(math.radians(50)))


def W_t(x, s):
    w = 66 * s
    sx = x + w * 0.27
    return [rect(sx, -34, sx + S, 120), rect(x, 0, x + w, 22)], w


def W_e(x, s):
    rxo, ryo, rxi, ryi = dims(s)
    return [eband(x + rxo, 60, rxo, ryo, rxi, ryi, 40, 370), rect(x + S - 4, 48, x + 2 * rxo - 2, 70)], 2 * rxo


def W_o(x, s):
    rxo, ryo, rxi, ryi = dims(s)
    return [ering(x + rxo, 60, rxo, ryo, rxi, ryi)], 2 * rxo


def breathe_wordmark():
    seq = ((W_a, .66, 14), (W_r, .8, 6), (W_t, 1.0, 12), (W_e, 1.24, 18), (W_o, 1.55, 0))
    paths, x = [], 0
    for fn, s, g in seq:
        p, w = fn(x, s)
        paths += p
        x += w + g
    return paths, x


# --- D: Slice -- the "a" cut in two plates that slipped out of register ----------------------
def concept_d():
    cx, cy, ro, ri, sw = 0, 0, 74, 44, 30
    top = [arc_band(cx, cy, 180, 360, ro, ri), rect(cx + ro - sw, cy - ro, cx + ro, cy)]
    bot = [arc_band(cx, cy, 0, 180, ro, ri), rect(cx + ro - sw, cy, cx + ro, cy + ro)]
    sx, sy = 16, 5  # misregistration offset of the top plate
    w = 2 * ro + sx
    ox = 128 - w / 2 + ro
    sym = (group(top, ox + sx, 128 - sy) + group(bot, ox, 128 + sy))
    save("d-slice-symbol.svg", svg("0 0 256 256", sym))
    lockup(sym, "d-slice-lockup.svg")
    col = group(top, ox + sx, 128 - sy, fill=BLUE) + group(bot, ox, 128 + sy, fill=PINK, extra=MUL)
    save("d-slice-symbol-color.svg", svg("0 0 256 256", col))


# --- E: Breathe -- the wordmark widens letter by letter, like the site's width-axis type ------
def concept_e():
    paths, w = breathe_wordmark()
    k = 236 / w
    sym = group(paths, (256 - w * k) / 2, 128 - 43 * k, k)
    save("e-breathe-symbol.svg", svg("0 0 256 256", sym))
    k2 = 0.9
    body = group(paths, 8, 128 - 43 * k2, k2)
    save("e-breathe-lockup.svg", svg(f"0 0 {f(w * k2 + 16)} 256", body))
    col = group(paths[:-1], 8, 128 - 43 * k2, k2, fill=BLUE) + group(paths[-1:], 8, 128 - 43 * k2, k2, fill=PINK)
    save("e-breathe-lockup-color.svg", svg(f"0 0 {f(w * k2 + 16)} 256", col))


# --- F: Bleed -- a print plate with the "a" knocked out; its stem runs off the sheet ---------
def concept_f():
    x0, y0, x1, y1, rr = 24, 24, 232, 232, 18
    plate = (f"M{x0 + rr} {y0}H{x1 - rr}A{rr} {rr} 0 0 1 {x1} {y0 + rr}V{y1 - rr}A{rr} {rr} 0 0 1 {x1 - rr} {y1}"
             f"H{x0 + rr}A{rr} {rr} 0 0 1 {x0} {y1 - rr}V{y0 + rr}A{rr} {rr} 0 0 1 {x0 + rr} {y0}Z")
    cx, cy, ro, ri = 92, 128, 88, 50  # bowl runs past the plate's left trim edge
    sl, sr = cx + ri, cx + ro
    h = math.sqrt(ro * ro - ri * ri)
    a_outline = (f"M{f(sr)} {f(cy - ro)}V{f(cy + ro)}H{f(sl)}V{f(cy + h)}"
                 f"A{ro} {ro} 0 1 1 {f(sl)} {f(cy - h)}V{f(cy - ro)}Z")
    hole = (f"M{cx - ri} {cy}a{ri} {ri} 0 1 0 {2 * ri} 0a{ri} {ri} 0 1 0 {-2 * ri} 0Z")
    d = plate + a_outline + hole
    clip = f'<defs><clipPath id="trim"><path d="{plate}"/></clipPath></defs>'
    sym = clip + f'<path fill="{INK}" fill-rule="evenodd" clip-path="url(#trim)" d="{d}"/>'
    save("f-bleed-symbol.svg", svg("0 0 256 256", sym))
    lockup(sym, "f-bleed-lockup.svg")
    col = (f'<path fill="{PINK}" d="{plate}" transform="translate(7 -7)"{MUL}/>'
           + clip + f'<path fill="{BLUE}" fill-rule="evenodd" clip-path="url(#trim)" d="{d}"{MUL}/>')
    save("f-bleed-symbol-color.svg", svg("0 0 256 256", col))


if __name__ == "__main__":
    concept_d()
    concept_e()
    concept_f()
    print("ok")
