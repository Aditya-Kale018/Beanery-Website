// The design prototype expressed every rule as a CSS declaration string in an
// inline `style` attribute, and several of those strings are produced at
// runtime by the component (selected/unselected button states, profile bars).
// Keeping the strings verbatim and parsing them here means the styles in this
// app are byte-identical to the ones in the design - nothing is retyped into
// a React object, so nothing can drift.

const cache = new Map();

function toCamel(prop) {
  if (prop.startsWith('--')) return prop; // custom property, pass through
  return prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

/**
 * Parse a CSS declaration string ("color:#5E2B17;font-size:14px") into the
 * style object React expects. Values stay strings, so React writes them out
 * exactly as authored instead of appending units of its own.
 */
export function st(css) {
  if (!css) return undefined;
  const hit = cache.get(css);
  if (hit) return hit;

  const out = {};
  for (const decl of css.split(';')) {
    const i = decl.indexOf(':');
    if (i < 0) continue;
    const prop = decl.slice(0, i).trim();
    const value = decl.slice(i + 1).trim();
    if (!prop || !value) continue;
    out[toCamel(prop)] = value;
  }

  cache.set(css, out);
  return out;
}
