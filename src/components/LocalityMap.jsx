import { st } from '../lib/style';
const COORDS = { lat: 18.53876, lon: 73.82974 };
const MAP_BOUNDS = '73.8246%2C18.5358%2C73.8350%2C18.5417';
const MAP_URL = `https://www.openstreetmap.org/export/embed.html?bbox=${MAP_BOUNDS}&layer=mapnik&marker=${COORDS.lat}%2C${COORDS.lon}`;
const DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${COORDS.lat},${COORDS.lon}`;

export default function LocalityMap() {
  return (
    <div style={st('position:absolute;inset:0;width:100%;height:100%;overflow:hidden;background:#EFE3D8')}>
      <iframe
        title="Interactive map showing Beanery on Senapati Bapat Road, Pune"
        src={MAP_URL}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        style={st('position:absolute;inset:0;width:100%;height:100%;display:block;border:0;filter:grayscale(.8) sepia(.25) saturate(.82) contrast(.92) brightness(1.04)')}
      />

      <a
        href={DIRECTIONS_URL}
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
