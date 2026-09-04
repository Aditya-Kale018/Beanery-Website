import { useMemo, useRef, useState } from 'react';
import { st } from '../lib/style';

/**
 * The table reservation form.
 *
 * Constraints come from the café's actual service, as stated across the site:
 * open daily from 8:00, closing 23:00 Mon–Thu and 23:30 Fri–Sun, kitchen until
 * 22:30, and groups over twelve handled by phone. Time slots are generated per
 * weekday rather than hard-coded, so a Friday offers a later last seating than
 * a Tuesday and a late booking is correctly flagged as bar-menu only.
 *
 * NOTE: `submit()` below is where a real booking endpoint goes. Right now it
 * resolves locally after a short delay and issues a reference. The form is
 * complete, the backend is not. It deliberately does not invent availability:
 * every slot within opening hours is offered, because only a real system knows
 * what is actually free.
 */

// - palette, matching the design's tokens -
const INK = '#5E2B17';
const BODY = '#6E4A34';
const META = '#96755C';
const RULE = 'rgba(94,43,23,.22)';
const ACCENT = '#A35730';
const FOREST = '#2E5D36';

const LABEL = `font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:${META};margin-bottom:8px`;
const FIELD_BASE =
  `width:100%;border:1px solid ${RULE};background:transparent;padding:14px 16px;` +
  `font-family:inherit;font-size:14px;color:${INK};border-radius:0;outline:none;` +
  'transition:border-color .3s ease';

const field = (invalid) => (invalid ? `${FIELD_BASE};border-color:${ACCENT}` : FIELD_BASE);
const selectStyle = (invalid) =>
  `${field(invalid)};appearance:none;-webkit-appearance:none;cursor:pointer;padding-right:38px`;

const SEATING = ['No preference', 'Window', 'Banquette', 'At the counter'];
const OCCASIONS = ['No occasion', 'Birthday', 'Anniversary', 'Business lunch', 'Celebration'];

const pad = (n) => String(n).padStart(2, '0');
const isoDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** Service hours for a given date. Mon–Thu close at 23:00, Fri–Sun at 23:30. */
function service(dateStr) {
  const day = new Date(`${dateStr}T00:00:00`).getDay(); // 0 = Sunday
  const close = day >= 1 && day <= 4 ? 23 * 60 : 23 * 60 + 30;
  return { open: 8 * 60, close, lastSeating: close - 30, kitchenClose: 22 * 60 + 30 };
}

function slotsFor(dateStr) {
  if (!dateStr) return [];
  const { open, lastSeating } = service(dateStr);
  const out = [];
  for (let m = open; m <= lastSeating; m += 30) out.push(m);
  return out;
}

const label12 = (m) => {
  const h = Math.floor(m / 60);
  const suffix = h < 12 ? 'AM' : 'PM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${pad(m % 60)} ${suffix}`;
};

const prettyDate = (dateStr) =>
  new Date(`${dateStr}T00:00:00`).toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

function reference() {
  const s = Date.now().toString(36).toUpperCase();
  return `BNY-${s.slice(-4)}`;
}

function validate(v) {
  const e = {};
  if (v.name.trim().length < 2) e.name = 'Please tell us who the table is for.';

  const digits = v.phone.replace(/[^\d]/g, '').replace(/^91/, '');
  if (!digits) e.phone = 'We need a number to confirm on.';
  else if (!/^[6-9]\d{9}$/.test(digits)) e.phone = 'That does not look like a 10-digit mobile number.';

  if (v.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email.trim())) {
    e.email = 'Check the email address.';
  }

  if (!v.date) e.date = 'Pick a date.';
  else {
    const today = isoDate(new Date());
    if (v.date < today) e.date = 'That date has passed.';
  }

  if (!v.time) e.time = 'Pick a time.';
  else if (v.date && !slotsFor(v.date).includes(Number(v.time))) {
    e.time = 'We are closed then. Please choose another time.';
  }

  if (v.guests === '13+') e.guests = 'For thirteen or more, call the café and we will arrange it properly.';

  return e;
}

export default function ReservationForm({ onClose, initial }) {
  const today = useMemo(() => isoDate(new Date()), []);
  const maxDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 90);
    return isoDate(d);
  }, []);

  const [v, setV] = useState({
    name: '', phone: '', email: '',
    date: initial?.date || today,
    time: initial?.time || '',
    guests: initial?.guests || '2',
    seating: initial?.seating || SEATING[0],
    occasion: OCCASIONS[0],
    notes: '',
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [state, setState] = useState('editing'); // editing | sending | done
  const [confirmed, setConfirmed] = useState(null);
  const errorRef = useRef(null);

  const set = (k) => (e) => {
    const value = e.target.value;
    setV((prev) => {
      const next = { ...prev, [k]: value };
      // Changing the date can invalidate the chosen time (Mon–Thu close earlier).
      if (k === 'date' && next.time && !slotsFor(value).includes(Number(next.time))) next.time = '';
      return next;
    });
    if (touched[k] || errors[k]) setErrors((prev) => ({ ...prev, [k]: undefined }));
  };

  const blur = (k) => () => {
    setTouched((t) => ({ ...t, [k]: true }));
    setErrors((prev) => ({ ...prev, [k]: validate(v)[k] }));
  };

  const slots = slotsFor(v.date);
  const { kitchenClose } = v.date ? service(v.date) : { kitchenClose: Infinity };
  const barOnly = v.time && Number(v.time) > kitchenClose;
  const bigParty = v.guests === '13+';

  async function submit(e) {
    e.preventDefault();
    const found = validate(v);
    setErrors(found);
    setTouched(Object.keys(v).reduce((a, k) => ({ ...a, [k]: true }), {}));
    if (Object.values(found).some(Boolean)) {
      requestAnimationFrame(() => errorRef.current?.focus());
      return;
    }

    setState('sending');
    // TODO: POST to the booking endpoint. Until then, resolve locally.
    await new Promise((r) => setTimeout(r, 900));
    setConfirmed({ ...v, ref: reference() });
    setState('done');
  }

  if (state === 'done' && confirmed) {
    const rows = [
      ['Reference', confirmed.ref],
      ['Name', confirmed.name.trim()],
      ['When', `${prettyDate(confirmed.date)}, ${label12(Number(confirmed.time))}`],
      ['Guests', confirmed.guests === '1' ? '1 guest' : `${confirmed.guests} guests`],
      ['Seating', confirmed.seating],
    ];
    if (confirmed.occasion !== OCCASIONS[0]) rows.push(['Occasion', confirmed.occasion]);

    return (
      <div>
        <div style={st(`display:flex;align-items:center;gap:12px`)}>
          <span style={st(`width:34px;height:1px;background:${FOREST};display:block`)} />
          <span style={st(`font-size:10.5px;letter-spacing:.2em;text-transform:uppercase;color:${FOREST};font-weight:500`)}>
            Request received
          </span>
        </div>
        <h3 style={st("font-family:'Playfair Display',Georgia,serif;font-weight:400;font-size:40px;line-height:1.05;margin-top:14px")}>
          We&rsquo;ll hold it for you
        </h3>
        <p style={st(`font-size:14.5px;line-height:1.8;color:${BODY};margin-top:14px;max-width:44ch`)}>
          A message goes to {confirmed.phone.trim()} within the hour to confirm. If anything changes, call the café
          and quote your reference.
        </p>

        <div style={st('margin-top:30px;border-top:1px solid rgba(94,43,23,.14)')}>
          {rows.map(([k, val]) => (
            <div
              key={k}
              style={st('display:flex;justify-content:space-between;gap:24px;padding:15px 0;border-bottom:1px solid rgba(94,43,23,.14)')}
            >
              <span style={st(`font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:${META};white-space:nowrap`)}>
                {k}
              </span>
              <span style={st(`font-size:14.5px;color:${INK};text-align:right`)}>{val}</span>
            </div>
          ))}
        </div>

        {Number(confirmed.time) > kitchenClose && (
          <p style={st(`font-size:12.5px;line-height:1.7;color:${META};margin-top:16px`)}>
            The kitchen closes at 10:30 PM, so that sitting is drinks and the bar menu.
          </p>
        )}

        <button
          type="button"
          className="hv2"
          onClick={onClose}
          style={st(`margin-top:26px;width:100%;text-align:left;font-size:11.5px;letter-spacing:.15em;text-transform:uppercase;font-weight:500;color:#FBF8F4;background:${INK};border:none;padding:19px 26px;cursor:pointer;transition:background .35s ease`)}
        >
          Done
        </button>
      </div>
    );
  }

  const Err = ({ k }) =>
    errors[k] ? (
      <div style={st(`font-size:11.5px;line-height:1.6;color:${ACCENT};margin-top:7px`)}>{errors[k]}</div>
    ) : null;

  const Chevron = () => (
    <span
      aria-hidden="true"
      style={st(`position:absolute;right:16px;bottom:17px;font-size:10px;color:${META};pointer-events:none`)}
    >
      ▾
    </span>
  );

  return (
    <form onSubmit={submit} noValidate>
      <div style={st(`font-size:10.5px;letter-spacing:.2em;text-transform:uppercase;color:${ACCENT};font-weight:500`)}>
        Reservations
      </div>
      <h3 style={st("font-family:'Playfair Display',Georgia,serif;font-weight:400;font-size:40px;line-height:1.05;margin-top:14px")}>
        Reserve a table
      </h3>
      <p style={st(`font-size:14.5px;line-height:1.8;color:${BODY};margin-top:14px;max-width:44ch`)}>
        Share your details and preferred date. We’ll confirm the table by message. For groups over twelve, call Beanery directly.
      </p>

      <div style={st('display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:30px')}>
        <div>
          <div style={st(LABEL)}>Name</div>
          <input
            ref={errorRef}
            type="text" name="name" autoComplete="name" placeholder="Your name"
            value={v.name} onChange={set('name')} onBlur={blur('name')}
            aria-invalid={!!errors.name}
            style={st(field(errors.name))}
          />
          <Err k="name" />
        </div>

        <div>
          <div style={st(LABEL)}>Phone</div>
          <input
            type="tel" name="phone" autoComplete="tel" inputMode="tel" placeholder="+91 98765 43210"
            value={v.phone} onChange={set('phone')} onBlur={blur('phone')}
            aria-invalid={!!errors.phone}
            style={st(field(errors.phone))}
          />
          <Err k="phone" />
        </div>

        <div style={st('grid-column:1 / -1')}>
          <div style={st(LABEL)}>Email (optional)</div>
          <input
            type="email" name="email" autoComplete="email" placeholder="you@example.com"
            value={v.email} onChange={set('email')} onBlur={blur('email')}
            aria-invalid={!!errors.email}
            style={st(field(errors.email))}
          />
          <Err k="email" />
        </div>

        <div>
          <div style={st(LABEL)}>Date</div>
          <input
            type="date" name="date" min={today} max={maxDate}
            value={v.date} onChange={set('date')} onBlur={blur('date')}
            aria-invalid={!!errors.date}
            style={st(field(errors.date))}
          />
          <Err k="date" />
        </div>

        <div style={st('position:relative')}>
          <div style={st(LABEL)}>Time</div>
          <select
            name="time" value={v.time} onChange={set('time')} onBlur={blur('time')}
            aria-invalid={!!errors.time}
            style={st(selectStyle(errors.time))}
          >
            <option value="">Select a time</option>
            {slots.map((m) => (
              <option key={m} value={m}>
                {label12(m)}{m > kitchenClose ? ' · bar menu' : ''}
              </option>
            ))}
          </select>
          <Chevron />
          <Err k="time" />
        </div>

        <div style={st('position:relative')}>
          <div style={st(LABEL)}>Guests</div>
          <select
            name="guests" value={v.guests} onChange={set('guests')} onBlur={blur('guests')}
            aria-invalid={!!errors.guests}
            style={st(selectStyle(errors.guests))}
          >
            {Array.from({ length: 12 }, (_, i) => String(i + 1)).map((n) => (
              <option key={n} value={n}>{n === '1' ? '1 guest' : `${n} guests`}</option>
            ))}
            <option value="13+">13 or more</option>
          </select>
          <Chevron />
          <Err k="guests" />
        </div>

        <div style={st('position:relative')}>
          <div style={st(LABEL)}>Seating</div>
          <select name="seating" value={v.seating} onChange={set('seating')} style={st(selectStyle(false))}>
            {SEATING.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <Chevron />
        </div>

        <div style={st('grid-column:1 / -1;position:relative')}>
          <div style={st(LABEL)}>Occasion (optional)</div>
          <select name="occasion" value={v.occasion} onChange={set('occasion')} style={st(selectStyle(false))}>
            {OCCASIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
          <Chevron />
        </div>

        <div style={st('grid-column:1 / -1')}>
          <div style={st(LABEL)}>Anything we should know (optional)</div>
          <textarea
            name="notes" rows={3} maxLength={300}
            placeholder="Allergies, a high chair, a quiet corner…"
            value={v.notes} onChange={set('notes')}
            style={st(`${FIELD_BASE};resize:vertical;min-height:84px;line-height:1.6`)}
          />
          <div style={st(`font-size:11px;color:${META};margin-top:6px;text-align:right`)}>
            {v.notes.length}/300
          </div>
        </div>
      </div>

      {barOnly && !bigParty && (
        <div style={st(`display:flex;gap:12px;align-items:flex-start;margin-top:20px;padding:16px 18px;background:#EFE3D8`)}>
          <span style={st(`width:7px;height:7px;background:${ACCENT};display:block;margin-top:6px;flex:none`)} />
          <p style={st(`font-size:12.5px;line-height:1.7;color:${BODY}`)}>
            The kitchen closes at 10:30 PM; that sitting is drinks and the bar menu. Book 10:00 PM or earlier for
            the full board.
          </p>
        </div>
      )}

      {bigParty && (
        <div style={st(`display:flex;gap:12px;align-items:flex-start;margin-top:20px;padding:16px 18px;background:#EFE3D8`)}>
          <span style={st(`width:7px;height:7px;background:${ACCENT};display:block;margin-top:6px;flex:none`)} />
          <p style={st(`font-size:12.5px;line-height:1.7;color:${BODY}`)}>
            For thirteen or more we write the menu with you first.{' '}
            <a href="tel:+919860934080" style={st(`color:${ACCENT};border-bottom:1px solid ${ACCENT}`)}>
              call +91 98609 34080
            </a>
            .
          </p>
        </div>
      )}

      <button
        type="submit"
        className="hv2"
        disabled={state === 'sending' || bigParty}
        style={st(
          `margin-top:26px;width:100%;text-align:left;font-size:11.5px;letter-spacing:.15em;text-transform:uppercase;` +
          `font-weight:500;color:#FBF8F4;background:${INK};border:none;padding:19px 26px;transition:background .35s ease;` +
          (state === 'sending' || bigParty ? 'opacity:.45;cursor:not-allowed' : 'cursor:pointer'),
        )}
      >
        {state === 'sending' ? 'Sending…' : 'Request a table'}
      </button>

      <div style={st(`font-size:11.5px;color:${META};margin-top:16px`)}>
        Or call +91 98609 34080 · doors open daily at 8 AM
      </div>
    </form>
  );
}
