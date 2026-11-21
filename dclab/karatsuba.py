"""Karatsuba integer multiplication (divide and conquer, O(n^1.585))."""
import re

from .util import InputError, lines, timed

TRACE_DEPTH = 2    # recursion levels recorded for the visualiser
MAX_DIGITS = 3000  # keeps a request inside serverless time limits


def parse(text: str):
    """Two lines, each a positive integer -> {"a", "b"} (strings), else None."""
    rows = lines(text)
    if len(rows) != 2 or not all(re.fullmatch(r"\d+", r) for r in rows):
        return None
    if max(map(len, rows)) > MAX_DIGITS:
        raise InputError(f"Numbers are limited to {MAX_DIGITS} digits.")
    return {"a": rows[0], "b": rows[1]}


def karatsuba(x: int, y: int, trace: bool = False):
    """Return (product, calls, nodes, steps). With trace, the top levels are recorded."""
    calls = 0
    nodes, steps = [], []

    def rec(x, y, depth, parent, role):
        nonlocal calls
        calls += 1
        node = None
        if trace and depth <= TRACE_DEPTH:
            node = {"id": len(nodes), "depth": depth, "role": role, "x": str(x), "y": str(y), "kids": [], "split": None, "first": calls}
            nodes.append(node)
            if parent:
                parent["kids"].append(node["id"])
            steps.append({"type": "enter", "node": node["id"]})

        if x < 10 or y < 10:
            product = x * y
        else:
            half = max(len(str(x)), len(str(y))) // 2
            power = 10 ** half
            a, b = divmod(x, power)
            c, d = divmod(y, power)
            if node:
                node["split"] = {"a": str(a), "b": str(b), "c": str(c), "d": str(d), "half": half}
            ac = rec(a, c, depth + 1, node, "ac")
            bd = rec(b, d, depth + 1, node, "bd")
            mid = rec(a + b, c + d, depth + 1, node, "(a+b)(c+d)")
            product = ac * power**2 + (mid - ac - bd) * power + bd

        if node:
            node["product"] = str(product)
            node["sub_calls"] = calls - node.pop("first") + 1
            steps.append({"type": "exit", "node": node["id"]})
        return product

    product = rec(x, y, 0, None, "x · y")
    return product, calls, nodes, steps


def solve(data: dict) -> dict:
    x, y = int(data["a"]), int(data["b"])
    (product, calls, _, _), ms = timed(lambda: karatsuba(x, y))
    _, _, nodes, steps = karatsuba(x, y, trace=True)
    return {
        "product": str(product),
        "calls": calls,
        "time_ms": ms,
        "ok": product == x * y,
        "digits": [len(data["a"]), len(data["b"])],
        "nodes": nodes,
        "steps": steps + [{"type": "done"}],
    }