import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { SLOTS } from '../assets/images';
import './ImageSlot.css';

// The empty-state icon from image-slot.js, unchanged.
function PlaceholderIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="m21 15-5-5L5 21" />
    </svg>
  );
}

/**
 * The design's <image-slot>. Eight slots were filled in with real photography;
 * the rest are still briefs, and render as the same dashed placeholder the
 * design shows.
 *
 * A filled slot reproduces image-slot.js's _applyView() geometry rather than
 * leaning on `object-fit`: the stored crop is a scale plus an x/y pan in frame
 * percentages, and three of the eight slots carry a non-zero pan that
 * object-position cannot express without knowing the frame's aspect ratio.
 */
export default function ImageSlot({ id, placeholder, fit = 'cover' }) {
  const slot = SLOTS[id];
  const hostRef = useRef(null);
  const [frame, setFrame] = useState(null); // { fw, fh }
  const [natural, setNatural] = useState(null); // { iw, ih }

  // Track the frame box so the crop stays put across responsive resizes,
  // exactly as the custom element did.
  useLayoutEffect(() => {
    const el = hostRef.current;
    if (!el || !slot) return undefined;

    const measure = () => {
      const fw = el.clientWidth;
      const fh = el.clientHeight;
      setFrame((prev) =>
        prev && prev.fw === fw && prev.fh === fh ? prev : { fw, fh },
      );
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [slot]);

  // Natural size, whether the decode finishes before or after mount.
  useEffect(() => {
    if (!slot) return undefined;
    let live = true;
    const img = new Image();
    img.onload = () => {
      if (live) setNatural({ iw: img.naturalWidth, ih: img.naturalHeight });
    };
    img.src = slot.src;
    return () => {
      live = false;
    };
  }, [slot]);

  if (!slot) {
    return (
      <div className="imgslot" ref={hostRef} data-slot={id}>
        <div className="frame">
          <div className="empty">
            <PlaceholderIcon />
            <div className="cap">{placeholder || 'Drop an image'}</div>
            <div className="sub">
              or <u>browse files</u>
            </div>
          </div>
          <div className="ring" />
        </div>
      </div>
    );
  }

  // Before either measurement lands, fall back to the centred fit the custom
  // element uses so there is no flash of an unpositioned image.
  let imgStyle = {
    width: '100%',
    height: '100%',
    left: '50%',
    top: '50%',
    objectFit: fit === 'contain' ? 'contain' : 'cover',
  };

  if (frame && natural && frame.fw && frame.fh && natural.iw && natural.ih) {
    const { fw, fh } = frame;
    const { iw, ih } = natural;
    const base =
      fit === 'contain'
        ? Math.min(fw / iw, fh / ih)
        : Math.max(fw / iw, fh / ih);
    const k = base * slot.s;
    imgStyle = {
      width: `${(iw * k) / fw * 100}%`,
      height: `${(ih * k) / fh * 100}%`,
      left: `${50 + slot.x}%`,
      top: `${50 + slot.y}%`,
    };
  }

  return (
    <div className="imgslot" ref={hostRef} data-slot={id} data-filled="">
      <div className="frame">
        <img
          src={slot.src}
          alt=""
          draggable="false"
          loading="lazy"
          decoding="async"
          style={imgStyle}
        />
        <div className="ring" />
      </div>
    </div>
  );
}
