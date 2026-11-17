"""Closest pair of points (divide and conquer, O(n log n))."""
import math
import re

from .util import InputError, lines, timed

MAX_POINTS = 20000  # keeps a request inside serverless time limits


def parse(text: str):
    """First line n, then n lines "x y" -> {"points"}, else None."""
    rows = lines(text)
    if not rows or not re.fullmatch(r"\d+", rows[0]):
        return None
    n = int(rows[0])
    if n < 2 or len(rows) != n + 1:
        return None
    try:
        points = [tuple(map(float, r.split())) for r in rows[1:]]
    except ValueError:
        return None
    if any(len(p) != 2 or not all(map(math.isfinite, p)) for p in points):
        return None
    if n > MAX_POINTS:
        raise InputError(f"Inputs are limited to {MAX_POINTS} points.")
    return {"points": points}


def _brute(P, lo, hi):
    """Best (distance, i, j) among P[lo:hi] by checking every pair."""
    best = (math.inf, None, None)
    for i in range(lo, hi):
        for j in range(i + 1, hi):
            d = math.dist(P[i], P[j])
            if d < best[0]:
                best = (d, i, j)
    return best


def _out(best):
    return {"d": best[0], "pair": [best[1], best[2]]}


def closest_pair(points, trace: bool = False):
    """Return (best, calls, steps, sorted_points); best is (d, i, j) indexing the sorted points."""
    P = sorted(points)
    steps, calls = [], 0

    def rec(lo, hi):
        nonlocal calls
        calls += 1
        n = hi - lo
        if n <= 3:
            best = _brute(P, lo, hi)
            if trace:
                steps.append({"type": "base", "lo": lo, "hi": hi, "best": _out(best)})
            return best

        mid = lo + n // 2
        mid_x = P[mid][0]
        if trace:
            steps.append({"type": "divide", "lo": lo, "hi": hi, "mid": mid, "mid_x": mid_x})

        best = min(rec(lo, mid), rec(mid, hi), key=lambda b: b[0])
        d0 = best[0]
        strip = sorted((i for i in range(lo, hi) if abs(P[i][0] - mid_x) < d0), key=lambda i: P[i][1])
        for a in range(len(strip)):
            for b in range(a + 1, len(strip)):
                if P[strip[b]][1] - P[strip[a]][1] >= best[0]:
                    break
                d = math.dist(P[strip[a]], P[strip[b]])
                if d < best[0]:
                    best = (d, strip[a], strip[b])
        if trace:
            steps.append({"type": "combine", "lo": lo, "hi": hi, "mid": mid, "mid_x": mid_x, "d0": d0, "strip": strip, "best": _out(best)})
        return best

    return rec(0, len(P)), calls, steps, P


def is_closest(points, d: float) -> bool:
    """Independent O(n) check: no pair is closer than d (uniform grid with cell size d)."""
    if d == 0:
        return True
    grid = {}
    for p in points:
        grid.setdefault((int(p[0] // d), int(p[1] // d)), []).append(p)
    for (cx, cy), cell in grid.items():
        near = [q for dx in (-1, 0, 1) for dy in (-1, 0, 1) for q in grid.get((cx + dx, cy + dy), [])]
        if any(p is not q and math.dist(p, q) < d - 1e-9 for p in cell for q in near):
            return False
    return True


def solve(data: dict) -> dict:
    points = data["points"]
    (best, calls, _, _), ms = timed(lambda: closest_pair(points))
    best, _, steps, P = closest_pair(points, trace=True)
    return {
        "n": len(points),
        "calls": calls,
        "time_ms": ms,
        "ok": is_closest(points, best[0]),
        "sorted": P,
        "best": _out(best),
        "steps": steps + [{"type": "done", "best": _out(best)}],
    }
