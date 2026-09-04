#!/usr/bin/env python3
"""Render the locality map once, from real OpenStreetMap tiles.

The live `openstreetmap.org/export/embed.html` iframe proved unreliable — the
Leaflet instance inside repeatedly sized itself to a fraction of the frame and
tiled only part of it, with no way to call invalidateSize() across the origin
boundary. OSM's tile policy also does not cover a production site's traffic.

So the tiles are fetched once, here, and composited into a single asset the
site ships. The result always renders, needs no key and no network at runtime,
and — because this script chooses the centre — the café sits exactly at the
centre pixel, which is what lets the overlay pin be positioned with no maths.

Needs Pillow (not a project dependency — it only runs here, by hand):

    python3 -m venv .venv && .venv/bin/pip install Pillow
    .venv/bin/python scripts/build-map.py

Re-run after changing COORDS or ZOOM.
"""
import io
import math
import sys
import urllib.request

from PIL import Image

COORDS = (18.53876, 73.82974)   # Beanery, Senapati Bapat Road
ZOOM = 17
OUT_W, OUT_H = 2048, 1536
OUT = "src/assets/map/beanery-locality.webp"

TILE = 256
UA = "beanery-website/1.0 (one-off locality map build; contact: hello@beanery.cafe)"


def project(lat, lon, z):
    """lat/lon -> global pixel coordinates at zoom z."""
    n = 2 ** z
    x = (lon + 180.0) / 360.0 * n * TILE
    r = math.radians(lat)
    y = (1.0 - math.log(math.tan(r) + 1.0 / math.cos(r)) / math.pi) / 2.0 * n * TILE
    return x, y


def fetch(z, x, y):
    url = f"https://tile.openstreetmap.org/{z}/{x}/{y}.png"
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=30) as r:
        return Image.open(io.BytesIO(r.read())).convert("RGB")


def main():
    cx, cy = project(*COORDS, ZOOM)
    left, top = cx - OUT_W / 2, cy - OUT_H / 2

    tx0, ty0 = int(left // TILE), int(top // TILE)
    tx1, ty1 = int((left + OUT_W) // TILE), int((top + OUT_H) // TILE)
    n = (tx1 - tx0 + 1) * (ty1 - ty0 + 1)
    print(f"zoom {ZOOM}, {n} tiles ({tx1-tx0+1}x{ty1-ty0+1})")

    canvas = Image.new("RGB", ((tx1 - tx0 + 1) * TILE, (ty1 - ty0 + 1) * TILE))
    for i, tx in enumerate(range(tx0, tx1 + 1)):
        for j, ty in enumerate(range(ty0, ty1 + 1)):
            try:
                canvas.paste(fetch(ZOOM, tx, ty), (i * TILE, j * TILE))
            except Exception as e:  # noqa: BLE001
                print(f"  tile {tx},{ty} failed: {e}", file=sys.stderr)

    ox, oy = int(left - tx0 * TILE), int(top - ty0 * TILE)
    out = canvas.crop((ox, oy, ox + OUT_W, oy + OUT_H))
    out.save(OUT, "WEBP", quality=88, method=6)
    print(f"wrote {OUT}  {out.size[0]}x{out.size[1]}")
    print("centre pixel = the cafe; the overlay pin sits at 50%/50%.")


main()
