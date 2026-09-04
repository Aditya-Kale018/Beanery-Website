import { st } from '../lib/style';

/**
 * A drawn locality map for Senapati Bapat Road, rather than a photograph of one.
 *
 * The design briefed these two slots as "muted cream cartography, marker beside
 * Chaturshrungi Temple", which no stock map tile will ever be — tiles arrive in
 * someone else's palette and fight the room. So this is built from the Beanery
 * tokens directly: cream ground, latte road casings, the temple hill in the
 * functional sage, ink for the marker, and Archivo at label sizes.
 *
 * It is a schematic of the neighbourhood, not survey cartography — the streets
 * and landmarks are in their real relationships, drawn for legibility at a
 * glance. "Open in Maps" hands off to the real thing.
 *
 * The viewBox is cropped like a cover image (`slice`), so the same drawing
 * works in the tall half-viewport panel on the homepage and the wide band on
 * the Visit page. The marker sits mid-frame so it survives both crops.
 */

const GROUND = '#EFE3D8';
const BLOCK = '#E5D4C4';
const BLOCK_2 = '#DFCBB9';
const ROAD = '#FBF8F4';
const CASING = '#D8BFA9';
const GREEN = '#A7B88F';
const GREEN_INK = '#2E5D36';
const INK = '#5E2B17';
const ACCENT = '#A35730';
const META = '#96755C';

const LABEL = { fontFamily: 'Archivo, system-ui, sans-serif', letterSpacing: '.18em', textTransform: 'uppercase' };

const MAPS_URL =
  'https://www.google.com/maps/search/?api=1&query=Chaturshrungi+Temple%2C+Senapati+Bapat+Road%2C+Pune+411016';

export default function LocalityMap({ label = 'Beanery' }) {
  return (
    <div style={st('position:absolute;inset:0;overflow:hidden;background:' + GROUND)}>
      <svg
        viewBox="0 0 1200 900"
        preserveAspectRatio="xMidYMid slice"
        style={st('width:100%;height:100%;display:block')}
        role="img"
        aria-label="Map of Senapati Bapat Road, Pune, showing Beanery beside Chaturshrungi Temple"
      >
        <defs>
          {/* Road geometry, reused for the casing, the fill and the labels. */}
          <path id="sbRoad" d="M 70 880 L 560 470 L 1010 120" />
          <path id="ganeshkhind" d="M 700 30 L 900 250 L 1190 430" />
          <path id="uniRoad" d="M 250 120 L 700 470 L 900 780" />
          <path id="lane1" d="M 330 690 L 780 300" />
          <path id="lane2" d="M 620 880 L 900 560" />
          <path id="lane3" d="M 120 470 L 420 720" />

          <pattern id="blocks" width="132" height="104" patternUnits="userSpaceOnUse"
                   patternTransform="rotate(-41 600 450)">
            <rect x="5" y="5" width="52" height="34" fill={BLOCK} opacity="0.62" />
            <rect x="64" y="5" width="60" height="24" fill={BLOCK_2} opacity="0.5" />
            <rect x="64" y="34" width="26" height="26" fill={BLOCK} opacity="0.55" />
            <rect x="96" y="34" width="28" height="26" fill={BLOCK_2} opacity="0.42" />
            <rect x="5" y="47" width="34" height="50" fill={BLOCK_2} opacity="0.52" />
            <rect x="46" y="66" width="78" height="31" fill={BLOCK} opacity="0.58" />
          </pattern>

          <clipPath id="frame"><rect x="0" y="0" width="1200" height="900" /></clipPath>
        </defs>

        <g clipPath="url(#frame)">
          <rect x="0" y="0" width="1200" height="900" fill={GROUND} />

          {/* Block texture rather than hand-placed massing: the drawing has to
              read as a neighbourhood at every crop, and the two slots crop it
              very differently. Roads are painted opaquely over the top, which
              is what carves the streets back out of it. */}
          <rect x="-40" y="-40" width="1280" height="980" fill="url(#blocks)" />

          {/* — Chaturshrungi hill: the temple sits on high ground west of the road — */}
          <g>
            <path
              d="M 120 210 C 240 120, 430 130, 520 240 C 600 335, 560 470, 430 520 C 300 566, 170 520, 120 420 Z"
              fill={GREEN} opacity="0.42"
            />
            <path
              d="M 190 260 C 280 195, 410 205, 470 285 C 520 352, 490 445, 400 478 C 305 512, 220 470, 190 400 Z"
              fill="none" stroke={GREEN_INK} strokeWidth="1.1" opacity="0.3"
            />
            <path
              d="M 255 305 C 315 265, 395 272, 432 322 C 462 364, 444 420, 388 440 C 330 460, 278 434, 258 392 Z"
              fill="none" stroke={GREEN_INK} strokeWidth="1.1" opacity="0.22"
            />
          </g>

          {/* — minor lanes — */}
          <g stroke={CASING} strokeWidth="13" fill="none" strokeLinecap="round" opacity="0.85">
            <use href="#lane1" /><use href="#lane2" /><use href="#lane3" />
          </g>
          <g stroke={ROAD} strokeWidth="8" fill="none" strokeLinecap="round">
            <use href="#lane1" /><use href="#lane2" /><use href="#lane3" />
          </g>

          {/* — secondary roads — */}
          <g stroke={CASING} strokeWidth="26" fill="none" strokeLinecap="round">
            <use href="#ganeshkhind" /><use href="#uniRoad" />
          </g>
          <g stroke={ROAD} strokeWidth="18" fill="none" strokeLinecap="round">
            <use href="#ganeshkhind" /><use href="#uniRoad" />
          </g>

          {/* — Senapati Bapat Road, the artery — */}
          <use href="#sbRoad" stroke={CASING} strokeWidth="42" fill="none" strokeLinecap="round" />
          <use href="#sbRoad" stroke={ROAD} strokeWidth="30" fill="none" strokeLinecap="round" />
          <use
            href="#sbRoad" stroke={CASING} strokeWidth="1.4" fill="none"
            strokeDasharray="14 16" opacity="0.75"
          />

          {/* — road names, set along the geometry — */}
          <text style={{ ...LABEL, fontSize: 19, fill: META }} dy="-26">
            <textPath href="#sbRoad" startOffset="46%">Senapati Bapat Road</textPath>
          </text>
          <text style={{ ...LABEL, fontSize: 14, fill: META }} dy="-16" opacity="0.9">
            <textPath href="#ganeshkhind" startOffset="52%">Ganeshkhind Road</textPath>
          </text>
          <text style={{ ...LABEL, fontSize: 14, fill: META }} dy="-15" opacity="0.9">
            <textPath href="#uniRoad" startOffset="20%">University Road</textPath>
          </text>

          {/* — the temple — */}
          <g transform="translate(352 330)">
            <circle r="9" fill={GREEN_INK} />
            <circle r="17" fill="none" stroke={GREEN_INK} strokeWidth="1.2" opacity="0.55" />
            <path d="M 0 -30 L 8 -18 L -8 -18 Z" fill={GREEN_INK} opacity="0.9" />
          </g>
          <text x="352" y="392" textAnchor="middle" style={{ ...LABEL, fontSize: 15, fill: GREEN_INK }}>
            Chaturshrungi
          </text>
          <text x="352" y="414" textAnchor="middle" style={{ ...LABEL, fontSize: 15, fill: GREEN_INK }}>
            Temple
          </text>

          {/* — neighbourhood names, set quietly into the ground — */}
          <text x="905" y="690" textAnchor="middle" style={{ ...LABEL, fontSize: 15, fill: META }} opacity="0.85">
            Model Colony
          </text>
          <text x="985" y="205" textAnchor="middle" style={{ ...LABEL, fontSize: 15, fill: META }} opacity="0.85">
            University Circle
          </text>
          <text x="190" y="820" textAnchor="middle" style={{ ...LABEL, fontSize: 15, fill: META }} opacity="0.85">
            Shivajinagar
          </text>

          {/* — Beanery: 200 m down the road from the temple — */}
          <g transform="translate(560 470)">
            <circle r="40" fill={ACCENT} opacity="0.10" />
            <circle r="25" fill="none" stroke={ACCENT} strokeWidth="1.2" opacity="0.55" />
            <circle r="11" fill={INK} />
            <circle r="4" fill={ROAD} />
          </g>
          <g transform="translate(560 470)">
            <path d="M 26 -34 L 74 -34" stroke={INK} strokeWidth="1.2" />
            <text x="74" y="-42" style={{ ...LABEL, fontSize: 21, fill: INK, letterSpacing: '.24em' }}>
              {label}
            </text>
            <text x="74" y="-18" style={{ ...LABEL, fontSize: 12.5, fill: META }}>
              Café &amp; Eatery
            </text>
          </g>

          {/* — the walk from the temple — */}
          <path
            d="M 372 348 L 545 455" stroke={ACCENT} strokeWidth="2"
            strokeDasharray="5 8" fill="none" opacity="0.8"
          />
          <text x="440" y="386" textAnchor="middle" style={{ ...LABEL, fontSize: 12, fill: ACCENT }}>
            200 m
          </text>

          {/* — north — */}
          <g transform="translate(1108 96)">
            <path d="M 0 -26 L 8 8 L 0 1 L -8 8 Z" fill={INK} opacity="0.75" />
            <text x="0" y="30" textAnchor="middle" style={{ ...LABEL, fontSize: 12, fill: META }}>N</text>
          </g>

          {/* — scale — */}
          <g transform="translate(64 836)">
            <line x1="0" y1="0" x2="118" y2="0" stroke={INK} strokeWidth="1.4" opacity="0.7" />
            <line x1="0" y1="-5" x2="0" y2="5" stroke={INK} strokeWidth="1.4" opacity="0.7" />
            <line x1="118" y1="-5" x2="118" y2="5" stroke={INK} strokeWidth="1.4" opacity="0.7" />
            <text x="0" y="-12" style={{ ...LABEL, fontSize: 11.5, fill: META }}>250 m</text>
          </g>
        </g>
      </svg>

      <a
        href={MAPS_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="hv3"
        style={st(
          'position:absolute;right:24px;bottom:24px;font-size:10px;letter-spacing:.16em;text-transform:uppercase;' +
          'font-weight:500;color:' + INK + ';background:#FBF8F4;border:1px solid rgba(94,43,23,.2);' +
          'padding:12px 16px;transition:background .35s ease,color .35s ease',
        )}
      >
        Open in Maps ↗
      </a>
    </div>
  );
}
