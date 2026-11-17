
import os
import random

SIZES = [110, 200, 350, 500, 800, 1000, 2000, 3500, 5000, 10000]
OUT_DIR = "inputs"

random.seed(2026)
os.makedirs(OUT_DIR, exist_ok=True)

for k, n in enumerate(SIZES, start=1):
    coord_range = 100000
    pts = set()
    while len(pts) < n:
        pts.add((random.randint(0, coord_range), random.randint(0, coord_range)))
    pts = list(pts)
    random.shuffle(pts)
    path = os.path.join(OUT_DIR, f"input_{k:02d}_n{n}.txt")
    with open(path, "w") as f:
        f.write(f"{n}\n")
        for x, y in pts:
            f.write(f"{x} {y}\n")
    print("created", path)
