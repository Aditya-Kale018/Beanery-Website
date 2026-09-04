import { st } from '../lib/style';
import mapImage from '../assets/map/beanery-locality.webp';

/**
 * The locality map, with the café pinned.
 *
 * The tiles are baked into one asset by `scripts/build-map.py` rather than
 * embedded live. The OSM iframe embed was unreliable here — the Leaflet
 * instance inside kept sizing itself to a fraction of the frame and tiling
 * only part of it, and nothing can call invalidateSize() across the origin
 * boundary — and OSM's tile policy does not cover a production site's traffic
 * anyway. A baked asset always renders, needs no key, and costs one request.
 *
 * Two things follow from the build script centring the image on the café:
 * `object-fit: cover` with a centred position keeps that pixel at the centre of
 * the frame at any aspect ratio, so the pin is simply placed at 50%/50% — no
 * projection maths, and it stays correct in both the tall homepage panel and
 * the wide band on Visit.
 *
 * Tiles are © OpenStreetMap contributors (ODbL) — the attribution below is
 * required, not decorative.
 */

const COORDS = { lat: 18.53876, lon: 73.82974 };
const LINK = `https://www.openstreetmap.org/?mlat=${COORDS.lat}&mlon=${COORDS.lon}#map=17/${COORDS.lat}/${COORDS.lon}`;

export default function LocalityMap() {
  return (
    <div style={st('position:absolute;inset:0;overflow:hidden;background:#EFE3D8')}>
      <img
        src={mapImage}
        alt="Map of Senapati Bapat Road, Pune, with Beanery marked beside Chaturshrungi Temple"
        loading="lazy"
        decoding="async"
        style={st(
          'width:100%;height:100%;object-fit:cover;object-position:center;display:block;' +
          'filter:grayscale(1) sepia(.45) saturate(.8) contrast(.9) brightness(1.05)',
        )}
      />

      {/* Warms the tiles the rest of the way into the palette. */}
      <div
        style={st(
          'position:absolute;inset:0;pointer-events:none;' +
          'background:#B78765;mix-blend-mode:multiply;opacity:.2',
        )}
      />

      {/* The café. Above the tint, so it keeps its own colour. */}
      <div
        style={st(
          'position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);' +
          'pointer-events:none;display:flex;flex-direction:column;align-items:center;gap:10px',
        )}
      >
        <div style={st('background:#FBF8F4;padding:8px 13px;white-space:nowrap')}>
          <span style={st('font-size:9.5px;letter-spacing:.2em;text-transform:uppercase;font-weight:500;color:#5E2B17')}>
            Beanery
          </span>
        </div>
        <div style={st('position:relative;width:34px;height:34px')}>
          <span style={st('position:absolute;inset:0;border:1px solid rgba(163,87,48,.6);border-radius:50%')} />
          <span
            style={st(
              'position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);' +
              'width:14px;height:14px;border-radius:50%;background:#5E2B17;box-shadow:0 0 0 3px #FBF8F4',
            )}
          />
        </div>
      </div>

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

      {/* ODbL attribution for the tile data. */}
      <a
        href="https://www.openstreetmap.org/copyright"
        target="_blank"
        rel="noopener noreferrer"
        style={st(
          'position:absolute;left:0;bottom:0;font-size:9px;letter-spacing:.04em;color:#6E4A34;' +
          'background:rgba(251,248,244,.72);padding:4px 8px',
        )}
      >
        © OpenStreetMap contributors
      </a>
    </div>
  );
}
