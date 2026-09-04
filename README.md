# Beanery — Café & Eatery

React port of the Claude Design prototype `Beanery Website.dc.html`, built to be
visually identical to the design at every breakpoint.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # -> dist/
npm run preview
```

## What this is

The handoff prototype was a single `.dc.html` file driven by a small template
runtime (`sc-if`, `sc-for`, `{{ }}` bindings, `<image-slot>`). That runtime was
React 18 underneath, so the port is close to a one-to-one translation rather
than a rewrite:

| Prototype | Here |
| --- | --- |
| `class Component extends DCLogic` | `class App extends React.Component` — same state, same content arrays, same lifecycle methods |
| `renderVals()` | unchanged; destructured at the top of `render()` |
| `<sc-if value="{{ x }}">` | `{x && (<>…</>)}` |
| `<sc-for list="{{ xs }}" as="x">` | `{xs.map((x, i) => …)}` |
| `style="color:#5E2B17"` | `style={st("color:#5E2B17")}` |
| `style-hover="…"` | a generated `:hover` class in `src/styles/hover.css` |
| `<image-slot id=… placeholder=…>` | `<ImageSlot id=… placeholder=… />` |

The markup was converted mechanically rather than retyped, so the ~850 inline
style declarations are the design's own strings, character for character.

### `st()`

`src/lib/style.js` parses a CSS declaration string into the object React wants,
and memoises the result. Keeping the design's strings intact is what makes the
styles verifiably identical — there was no transcription step to get wrong. It
also handles the styles `renderVals()` builds at runtime (selected/unselected
buttons, the flavour-profile bars).

### Hover

The prototype recorded hover intent in a `style-hover` attribute, which its
export runtime does not implement — but the base styles carry matching
`transition` declarations, so hover is clearly intended. Each distinct
`style-hover` value became one class in `src/styles/hover.css`. The
declarations are `!important` because the base styles are inline, and inline
styles outrank a class selector.

### Images

All 66 image slots are filled. The photography set was supplied as 3840px
JPEGs (138 MB in total, ~2 MB each), which is far too heavy to serve, so each
file was resized and converted to WebP at quality 80 — **134.6 MB → 8.9 MB**,
averaging 138 KB per image. The longest-edge budget follows how wide each slot
actually renders:

| Slots | Longest edge | Why |
| --- | --- | --- |
| `story-hero`, `coffee-hero`, `map-visit` | 2400px | span the full 1560px column |
| `ig-1` … `ig-6` | 900px | six across a grid, ~260px each |
| everything else | 1800px | half- and third-column images |

Originals are untouched in the source folder, so any of this can be redone at a
different budget.

`src/assets/images/index.js` maps slot id → image. Every id in `App.jsx` —
including the ones that come from the data arrays (`sig-*`, `brew-*`, `bean-*`,
`pair-*`, `part-*`, `j-*`) — has an entry, so no slot falls back to the
placeholder. `ImageSlot` still renders the design's dashed placeholder for any
id without an image, which is what you'd see if a mapping went missing.

Each entry carries a crop (`s` scale, `x`/`y` pan in frame percentages),
currently all default — fill the frame, centred. Nudge `x` or `y` on a single
slot if a shot wants reframing:

```js
'dish-1': at(img_dish_1, 0, -6),   // pull the framing up 6%
```

Images are `loading="lazy"` / `decoding="async"`.

### Logo

The Beanery wordmark is in `src/assets/brand/`, in two colourways generated
from the supplied artwork: `beanery-logo-dark.png` (ink `#5E2B17`, for the nav
and the mobile menu) and `beanery-logo-light.png` (natural white `#FBF8F4`, for
the footer's dark ground). The source was white-on-brown, so the field was
keyed out to an alpha mask and recoloured to the design's own tokens rather
than sampled from the JPEG — that keeps the mark crisp on any ground.

It replaces the typeset wordmark in three places. The logo carries "CAFE
EATERY" itself, so it stands in for the whole stacked lockup; in the nav it
lands on the same 175×46 footprint the type occupied. In the footer the
strapline keeps only what the logo does not carry, and now reads "PUNE, INDIA".

### Map

`LocalityMap` renders one baked asset, `src/assets/map/beanery-locality.webp`,
built by `scripts/build-map.py` from real OpenStreetMap tiles.

It is baked rather than embedded live for two reasons. The
`openstreetmap.org/export/embed.html` iframe proved unreliable in place — the
Leaflet instance inside repeatedly sized itself to a fraction of the frame and
tiled only part of it, and nothing can call `invalidateSize()` across the
origin boundary. And OSM's tile usage policy does not cover a production site's
traffic in any case. A baked asset always renders, needs no API key, works
offline and costs one request.

The café sits at **18.53876, 73.82974** (102/B/18, Gokhalenagar, Senapati Bapat
Road — reverse-geocodes to Senapati Bapat Marg, Model Colony, 357 m from the
temple). The build script centres the image on that point, which is what lets
the pin be placed at plain `50%/50%`: with `object-fit: cover` and a centred
position, the centre pixel stays at the centre of the frame at any aspect
ratio, so the pin is correct in both the tall homepage panel and the wide band
on Visit — no projection maths.

The tiles are warmed into the palette with a CSS filter plus a cream multiply
layer. Tiles are © OpenStreetMap contributors (ODbL); the attribution in the
corner is required, not decorative.

To move the pin, change `COORDS` in **both** `scripts/build-map.py` and
`LocalityMap.jsx`, then re-run the script.

### Styles

`src/styles/global.css` is the design's two style layers concatenated in the
order its `<helmet>` loaded them: the Modernist design-system tokens, then the
design's own `<style>` block with the Beanery palette, typography and every
responsive breakpoint.

Those breakpoint rules match on inline-style substrings, e.g.
`[style*="grid-template-columns: repeat"]`. That still works because React
writes these styles onto `element.style` and the browser serialises the `style`
attribute with a space after each colon — the same thing the prototype relied
on.

## Props

`App` takes the three knobs the design exposed in its properties panel:

| Prop | Default | Values |
| --- | --- | --- |
| `motion` | `'soft'` | `'restrained'`, `'soft'`, `'rich'` — reveal distance and duration |
| `showPrices` | `true` | hides every price when `false` |

## The hero

The design offered three hero treatments behind a switcher control. The
**masthead grid** is now the hero: the switcher, the cinematic and split
treatments, and the `heroVariant` prop that selected between them have all been
removed. `hero-cinema` and `hero-split` are consequently unused and are not
bundled, though both images are still in the source folder.

## Layout

```
index.html                  fonts + mount point
src/App.jsx                 the whole design: logic, then markup
src/lib/style.js            st() — CSS string -> React style object
src/components/ImageSlot.*  filled slots and the placeholder state
src/styles/global.css       design system + the design's own stylesheet
src/styles/hover.css        generated from style-hover
src/assets/images/          all 66 slot images, plus the id -> image map
src/assets/brand/           the wordmark, dark and light
src/assets/map/             the baked locality map
scripts/build-map.py        regenerates that map from OSM tiles
_handoff/                   the original bundle, kept for reference
```

## How the port was verified

Both the prototype and this app were run side by side and compared
programmatically, not by eye:

- **DOM** — tag, inline style and attributes for every node, on all 7 pages and
  8 interactive states (three hero variants, pairing selector, day-part
  selector, reservation dialog, mobile menu, origin selector). Identical, after
  discounting the DC editor's own `data-dc-tpl` attribute and the wrapper
  `<span>` its runtime puts around each interpolation.
- **Layout** — `getBoundingClientRect()` plus 26 computed properties (font,
  colour, spacing, borders, grid tracks, …) for every element, at 1440px and at
  390px. Identical on all 7 pages at both widths, including total document
  height to the pixel.

That comparison was made against the untouched design. The hero decision, the
photography and the logo were applied afterwards and are deliberate departures
from it; everything else still matches.
