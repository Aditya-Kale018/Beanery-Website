import { st } from '../lib/style';

/**
 * A real map, tinted into the Beanery palette.
 *
 * OpenStreetMap tiles need no API key. They arrive in OSM's own blues and
 * greens, which fight the room, so a filter warms them down and a cream layer
 * sits over the top — that overlay is the only reason this isn't a bare
 * iframe. `pointer-events: none` on the tint keeps the map pannable underneath.
 *
 * The marker is on Chaturshrungi Temple, the landmark the site gives as the
 * address. Swap COORDS for the venue's own once you have them.
 */

const COORDS = { lat: 18.5362, lon: 73.8277 };
const BBOX = [73.8207, 18.5312, 73.8347, 18.5412].join('%2C');

const EMBED =
  `https://www.openstreetmap.org/export/embed.html?bbox=${BBOX}` +
  `&layer=mapnik&marker=${COORDS.lat}%2C${COORDS.lon}`;

const LINK = `https://www.openstreetmap.org/?mlat=${COORDS.lat}&mlon=${COORDS.lon}#map=16/${COORDS.lat}/${COORDS.lon}`;

export default function LocalityMap() {
  return (
    <div style={st('position:absolute;inset:0;overflow:hidden;background:#EFE3D8')}>
      <iframe
        title="Map — Senapati Bapat Road, Pune"
        src={EMBED}
        loading="lazy"
        style={st(
          'width:100%;height:100%;border:0;display:block;' +
          'filter:grayscale(1) sepia(.42) saturate(.75) contrast(.92) brightness(1.04)',
        )}
      />
      {/* Warms the tiles the rest of the way into the palette. */}
      <div
        style={st(
          'position:absolute;inset:0;pointer-events:none;' +
          'background:#B78765;mix-blend-mode:multiply;opacity:.18',
        )}
      />

      <a
        href={LINK}
        target="_blank"
        rel="noopener noreferrer"
        className="hv3"
        style={st(
          'position:absolute;right:24px;bottom:24px;font-size:10px;letter-spacing:.16em;text-transform:uppercase;' +
          'font-weight:500;color:#5E2B17;background:#FBF8F4;border:1px solid rgba(94,43,23,.2);' +
          'padding:12px 16px;transition:background .35s ease,color .35s ease',
        )}
      >
        Open in Maps ↗
      </a>
    </div>
  );
}
