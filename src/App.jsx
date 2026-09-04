import React from 'react';
import ImageSlot from './components/ImageSlot';
import LocalityMap from './components/LocalityMap';
import ReservationForm from './components/ReservationForm';
import logoDark from './assets/brand/beanery-logo-dark.png';
import logoLight from './assets/brand/beanery-logo-light.png';
import { st } from './lib/style';
import './styles/global.css';
import './styles/hover.css';
import './styles/motion.css';

/**
 * Beanery — Café & Eatery.
 *
 * A React port of the Claude Design prototype (`Beanery Website.dc.html`). The
 * prototype was itself React underneath, so the component logic below is the
 * design's own: same state shape, same content arrays, same reveal and rail
 * behaviour. The markup keeps every style as the CSS declaration string the
 * design authored, parsed by `st()` — nothing was retyped, so nothing drifted.
 *
 * Props mirror the three knobs the design exposed in its properties panel.
 */
export default class App extends React.Component {
  static defaultProps = {
    motion: 'soft', // 'restrained' | 'soft' | 'rich'
    showPrices: true,
  };

  state = {
    page: 'home',
    cup: 0,
    reserve: false,
    menu: false,
    brew: 0,
    bean: 0,
    part: 0,
  };

  dayparts = [
    { key: 'Morning', hours: '08:00 — 11:30', title: 'Espresso at the counter', copy: 'The room opens quiet. Bread out of the oven at seven, the bar dialled in by eight, and the first regulars standing at the counter with a doppio and the paper. No music louder than the conversation.', slot: 'part-morning', shot: 'Morning: sunlight across the counter, espresso being pulled, croissants on a tray, one guest standing' },
    { key: 'Afternoon', hours: '11:30 — 18:00', title: 'Long lunches and quiet work', copy: 'Pasta to order, sandwiches on the day’s levain, filter flights for the curious. Tables turn slowly on purpose — this is the hour for a meeting that runs over, or a book and a second cup.', slot: 'part-afternoon', shot: 'Afternoon: two guests at a window table mid-conversation, plated pasta and a carafe, west light' },
    { key: 'Evening', hours: '18:00 — close', title: 'Small plates, low light', copy: 'The kitchen shifts to plates meant for sharing and the lights come down two stops. Not a restaurant, not a bar — the European hour between the two, with the espresso machine still on.', slot: 'part-evening', shot: 'Evening: low warm light, shared plates and glassware on marble, candle, guests in soft focus' },
  ];

  pillars = [
    { n: '01', name: 'Coffee', copy: 'Traceable lots, roasted for the method. Five ways to brew, dialled twice a day.' },
    { n: '02', name: 'Kitchen', copy: 'European technique, a short board, and plating we’d be happy to send from a restaurant.' },
    { n: '03', name: 'Culture', copy: 'The counter, the long lunch, the unhurried table. Habits borrowed from Rome and Lyon.' },
    { n: '04', name: 'Hospitality', copy: 'Warm, never formal. Nobody is rushed, and nobody is asked to leave.' },
    { n: '05', name: 'Craft', copy: 'The same hands every day — barista, chef, baker — and the standards they refuse to drop.' },
  ];

  pages = [
    ['home', 'Home'], ['story', 'Our Story'], ['coffee', 'Coffee'],
    ['food', 'Food'], ['experiences', 'Experiences'], ['journal', 'Journal'], ['visit', 'Visit Us'],
  ];

  go(page) {
    return (e) => {
      if (e) e.preventDefault();
      this.setState({ page }, () => window.scrollTo({ top: 0, behavior: 'auto' }));
      requestAnimationFrame(() => this.setupReveals(true));
    };
  }

  componentDidMount() {
    this.onScroll = () => {
      const n = this.navRef; if (!n) return;
      const s = window.scrollY > 40;
      n.style.background = s ? '#FBF8F4' : 'rgba(251,248,244,0)';
      n.style.boxShadow = s ? '0 1px 0 rgba(94,43,23,.12)' : 'none';
      n.style.backdropFilter = 'none';
      n.style.padding = s ? '14px 40px' : '26px 40px';
    };
    window.addEventListener('scroll', this.onScroll, { passive: true });
    this.onScroll();
    this.setupReveals();
    this.pulse = setInterval(() => this.setupReveals(), 400);
    this.pulseStop = setTimeout(() => { clearInterval(this.pulse); this.setupReveals(true); }, 6000);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.onScroll);
    if (this.revealScroll) { window.removeEventListener('scroll', this.revealScroll); window.removeEventListener('resize', this.revealScroll); }
    clearInterval(this.pulse);
    clearTimeout(this.pulseStop);
  }

  componentDidUpdate() { this.setupReveals(); }

  motionSpec() {
    const m = this.props.motion || 'soft';
    if (m === 'restrained') return { y: 10, d: 520 };
    if (m === 'rich') return { y: 46, d: 1100 };
    return { y: 22, d: 780 };
  }

  reveal(el, delay) {
    el.setAttribute('data-rv', 'shown');
    el.style.transitionDelay = (delay || 0) + 'ms';
    el.style.opacity = '1';
    el.style.transform = 'none';
  }

  // Scroll-driven, no IntersectionObserver: every pass looks at ALL [data-reveal]
  // nodes, so nothing can ever be stranded invisible.
  setupReveals(forceAll) {
    const { y, d } = this.motionSpec();
    const nodes = document.querySelectorAll('[data-reveal]');
    const vh = window.innerHeight;
    nodes.forEach((el) => {
      const state = el.getAttribute('data-rv');
      if (state !== 'hidden' && state !== 'shown') {
        el.style.transition = `opacity ${d}ms cubic-bezier(.2,.7,.2,1), transform ${d}ms cubic-bezier(.2,.7,.2,1)`;
        el.style.opacity = '0';
        el.style.transform = `translateY(${y}px)`;
        el.setAttribute('data-rv', 'hidden');
      }
      if (state === 'shown') return;
      const delay = parseFloat(el.getAttribute('data-reveal')) || 0;
      if (forceAll) { this.reveal(el, 0); return; }
      if (el.getBoundingClientRect().top < vh * 0.92) this.reveal(el, delay);
    });
    if (!this.revealScroll) {
      this.revealScroll = () => {
        if (this.revealQueued) return;
        this.revealQueued = true;
        requestAnimationFrame(() => { this.revealQueued = false; this.setupReveals(); });
      };
      window.addEventListener('scroll', this.revealScroll, { passive: true });
      window.addEventListener('resize', this.revealScroll, { passive: true });
    }
  }

  scrollRail(key, dir) {
    return () => {
      const el = this.rails && this.rails[key];
      if (!el) return;
      el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.72, 620), behavior: 'smooth' });
    };
  }

  railRef(key) {
    return (el) => { this.rails = this.rails || {}; if (el) this.rails[key] = el; };
  }

  cups = [
    {
      cup: 'Ethiopia Guji · Pour-Over',
      notes: 'Jasmine, bergamot, white peach',
      body: 'Light roast, 1:16, 92°C',
      dish: 'Burnt Basque Cheesecake',
      dishNote: 'The caramelised, almost-bitter top of the Basque meets the tea-like florals of the Guji. Cream flattens the acidity just enough to let the peach come forward.',
      slot: 'pair-guji',
      shot: 'Overhead: Basque cheesecake wedge on ceramic, pour-over carafe alongside, warm daylight',
    },
    {
      cup: 'Lychee Cold Brew',
      notes: 'Lychee, cane sugar, cocoa nib',
      body: '18-hour steep, served over clear ice',
      dish: 'Aglio Olio Pasta',
      dishNote: 'Chilli, garlic and olive oil need something cold and faintly sweet. The lychee resets the palate between forkfuls without fighting the heat.',
      slot: 'pair-lychee',
      shot: 'Aglio olio being twirled, tall glass of cold brew sweating beside it, linen napkin',
    },
    {
      cup: 'House Espresso · Doppio',
      notes: 'Dark chocolate, date, walnut',
      body: '18g in, 38g out, 27 seconds',
      dish: 'Cured Ham & Comté Baguette',
      dishNote: 'A classic Parisian counter pairing: salt and nuttiness against a syrupy, cocoa-heavy shot. Best standing up, at eleven.',
      slot: 'pair-espresso',
      shot: 'Close-up: espresso crema in a small ceramic cup, baguette half in soft focus',
    },
    {
      cup: 'Cortado',
      notes: 'Toasted hazelnut, brown butter',
      body: 'Doppio with 60ml silk-textured milk',
      dish: 'Almond Croissant',
      dishNote: 'Frangipane and browned butter sit exactly where the cortado does. Two bites, two sips, no sugar needed.',
      slot: 'pair-cortado',
      shot: 'Almond croissant with flaked almonds, cortado glass, marble tabletop',
    },
    {
      cup: 'Kenya Nyeri · AeroPress',
      notes: 'Blackcurrant, tomato leaf, cane',
      body: '15g, 200ml, 2:10 inverted',
      dish: 'Tomato & Burrata Sourdough',
      dishNote: 'Both sides bring bright acidity. The burrata is the hinge — fat holding the blackcurrant and the tomato in the same sentence.',
      slot: 'pair-kenya',
      shot: 'Open-faced sourdough with burrata and tomato, AeroPress mid-plunge behind',
    },
  ];

  beans = [
    { origin: 'Ethiopia', farm: 'Guji · Hambela Wamena', alt: '2,050 m', process: 'Natural, 18 days raised bed', roast: 'Light', varietal: 'Heirloom', notes: ['Jasmine', 'Bergamot', 'White peach'], profile: { Acidity: 88, Body: 46, Sweetness: 72, Florality: 92, Bitterness: 22 }, slot: 'bean-eth', shot: 'Ethiopian green beans in a linen bag, hand-lettered origin tag' },
    { origin: 'Colombia', farm: 'Huila · Finca La Esperanza', alt: '1,750 m', process: 'Washed, 36-hour ferment', roast: 'Medium', varietal: 'Caturra, Castillo', notes: ['Red apple', 'Panela', 'Almond'], profile: { Acidity: 62, Body: 70, Sweetness: 84, Florality: 40, Bitterness: 34 }, slot: 'bean-col', shot: 'Roasted beans cascading from a scoop, close-up, warm light' },
    { origin: 'Kenya', farm: 'Nyeri · Gichathaini', alt: '1,880 m', process: 'Washed, double soaked', roast: 'Light-medium', varietal: 'SL28, SL34', notes: ['Blackcurrant', 'Tomato leaf', 'Cane'], profile: { Acidity: 94, Body: 58, Sweetness: 66, Florality: 55, Bitterness: 28 }, slot: 'bean-ken', shot: 'Cupping table: spoons, bowls, slurping in progress' },
    { origin: 'India', farm: 'Chikmagalur · Estate No. 4', alt: '1,300 m', process: 'Monsooned, honey lot', roast: 'Medium-dark', varietal: 'S795', notes: ['Cocoa', 'Date', 'Toasted walnut'], profile: { Acidity: 38, Body: 90, Sweetness: 78, Florality: 18, Bitterness: 58 }, slot: 'bean-ind', shot: 'Drying beds on an Indian estate, low morning sun' },
  ];

  brews = [
    { name: 'Espresso', kicker: '27 seconds', spec: ['18 g in · 38 g out', '93°C, 9 bar', 'Served in ceramic'], copy: 'Our bar standard — a syrupy doppio pulled on the house blend, dialled twice a day against the humidity.', price: '₹180', slot: 'brew-esp', shot: 'Espresso pulling into a warm cup, crema forming' },
    { name: 'Pour-Over', kicker: '3:30 total', spec: ['15 g · 240 ml', '1:16, 92°C', 'Four-pour cascade'], copy: 'Single origin, brewed to order on a V60. Clarity over strength — the cup you take to the window seat.', price: '₹320', slot: 'brew-po', shot: 'Gooseneck kettle pouring in a spiral, steam catching daylight' },
    { name: 'French Press', kicker: '4 minutes', spec: ['30 g · 500 ml', 'Full immersion', 'Served for two'], copy: 'Unfiltered and generous. Heavier body, softer edges — built for a slow table and a second cup.', price: '₹340', slot: 'brew-fp', shot: 'French press on a linen tray, two cups, morning table' },
    { name: 'AeroPress', kicker: '2:10 inverted', spec: ['15 g · 200 ml', 'Inverted, one press', 'Bright and clean'], copy: 'Our barista’s recipe, printed on the card. Sweet, punchy, and the most forgiving brew on the bar.', price: '₹290', slot: 'brew-ap', shot: 'AeroPress mid-plunge, barista hands, close crop' },
    { name: 'Cold Brew', kicker: '18 hours', spec: ['1:8 concentrate', 'Steeped cold, never heated', 'Lychee or classic'], copy: 'Steeped overnight in the walk-in and served over clear ice. The lychee version is the one Pune keeps coming back for.', price: '₹280', slot: 'brew-cb', shot: 'Tall glass of cold brew, clear ice, condensation, dark wood' },
  ];

  signature = [
    { kicker: 'Coffee', name: 'Lychee Cold Brew', copy: 'Eighteen hours cold, finished with lychee and a whisper of cane.', slot: 'sig-1', shot: 'Lychee cold brew, tall glass, clear ice, backlit garnish' },
    { kicker: 'Pasta', name: 'Aglio Olio', copy: 'Garlic, chilli, good olive oil, and nothing that isn’t needed.', slot: 'sig-2', shot: 'Aglio olio plated restaurant-style, chilli oil, overhead' },
    { kicker: 'Dessert', name: 'Burnt Basque Cheesecake', copy: 'Baked hot and fast until the top gives up and caramelises.', slot: 'sig-3', shot: 'Basque cheesecake wedge plated, burnt top, cracked surface, cake fork' },
    { kicker: 'Bakery', name: 'Levain Sourdough', copy: 'Three-day ferment, baked at seven, gone by noon.', slot: 'sig-4', shot: 'Levain loaf, scored crust, flour dust, board' },
    { kicker: 'Sandwich', name: 'Comté & Cured Ham', copy: 'On baguette, with cultured butter and cornichons.', slot: 'sig-5', shot: 'Comté and ham baguette cut clean, plated with cornichons' },
    { kicker: 'Seasonal', name: 'Saffron Cardamom Latte', copy: 'A short winter run — Kashmiri saffron, green cardamom, whole milk.', slot: 'sig-6', shot: 'Saffron latte, threads on foam, ceramic cup, warm tones' },
  ];

  journal = [
    { cat: 'Coffee', date: 'August 2026', title: 'What “washed” actually tastes like', dek: 'A cupping-table walk through three processes on the same Colombian lot.', read: '6 min', slot: 'j-1', shot: 'Cupping spoons and bowls on a dark table, overhead' },
    { cat: 'Café Culture', date: 'July 2026', title: 'The Roman rule of standing up', dek: 'Why the best coffee in Italy is drunk in ninety seconds, at the bar.', read: '4 min', slot: 'j-2', shot: 'Standing bar counter, cups on saucers, motion blur of a barista' },
    { cat: 'Kitchen', date: 'July 2026', title: 'Three days for one loaf', dek: 'Our baker on ferment schedules, Pune humidity, and knowing when to stop.', read: '8 min', slot: 'j-3', shot: 'Baker hands shaping dough, flour, morning light' },
  ];

  testimonials = [
    { quote: 'The only place in Pune where I’ll order a pour-over and a pasta in the same sitting and not feel silly about it.', who: 'Aditi R.', meta: 'Regular since 2023' },
    { quote: 'I came for the cheesecake. I stayed because someone explained the Kenya to me for ten minutes and meant it.', who: 'Kabir M.', meta: 'Sunday brunch' },
    { quote: 'It feels European without pretending to be somewhere else. The light at four in the afternoon is the reason I work here.', who: 'Sana D.', meta: 'Afternoon regular' },
  ];

  renderVals() {
    const page = this.state.page;
    const mk = (arr) => arr.map(([key, label]) => ({
      key, label, go: this.go(key), active: page === key ? '1' : '0',
      style: page === key ? 'font-size:12px;letter-spacing:.11em;text-transform:uppercase;font-weight:500;color:#A35730;cursor:pointer' : 'font-size:12px;letter-spacing:.11em;text-transform:uppercase;font-weight:500;color:#5E2B17;cursor:pointer',
    }));
    const cup = this.cups[this.state.cup] || this.cups[0];
    const bean = this.beans[this.state.bean] || this.beans[0];
    const part = this.dayparts[this.state.part] || this.dayparts[0];

    return {
      pillars: this.pillars,
      dayparts: this.dayparts.map((d, i) => ({
        ...d, i,
        pick: () => this.setState({ part: i }),
        style: i === this.state.part
          ? 'display:flex;justify-content:space-between;align-items:baseline;gap:20px;width:100%;text-align:left;padding:22px 24px;border:none;border-top:1px solid rgba(94,43,23,.16);background:#5E2B17;color:#FBF8F4;cursor:pointer;transition:background .4s ease,color .4s ease'
          : 'display:flex;justify-content:space-between;align-items:baseline;gap:20px;width:100%;text-align:left;padding:22px 24px;border:none;border-top:1px solid rgba(94,43,23,.16);background:transparent;color:#5E2B17;cursor:pointer;transition:background .4s ease,color .4s ease',
        hourStyle: i === this.state.part ? 'font-size:11px;letter-spacing:.14em;color:rgba(251,248,244,.65)' : 'font-size:11px;letter-spacing:.14em;color:#96755C',
      })),
      part,
      menuOpen: this.state.menu,
      openMenu: (e) => { if (e) e.preventDefault(); this.setState({ menu: true }); },
      closeMenu: (e) => { if (e) e.preventDefault(); this.setState({ menu: false }); },
      navAll: this.pages.map(([key, label]) => ({
        key, label,
        go: (e) => { if (e) e.preventDefault(); this.setState({ menu: false, page: key }, () => window.scrollTo({ top: 0 })); requestAnimationFrame(() => this.setupReveals(true)); },
      })),
      navRef: (el) => { this.navRef = el; },
      navLeft: mk(this.pages.slice(0, 4)),
      navRight: mk(this.pages.slice(4)),
      goHome: this.go('home'),
      isHome: page === 'home', isStory: page === 'story', isCoffee: page === 'coffee',
      isFood: page === 'food', isExp: page === 'experiences', isJournal: page === 'journal',
      isVisit: page === 'visit',
      signature: this.signature,
      journal: this.journal,
      testimonials: this.testimonials,
      brews: this.brews,
      showPrices: this.props.showPrices !== false,
      cups: this.cups.map((c, i) => ({
        ...c, i,
        pick: () => this.setState({ cup: i }),
        style: i === this.state.cup
          ? 'display:block;width:100%;text-align:left;padding:18px 20px;border:none;border-top:1px solid rgba(94,43,23,.14);background:#5E2B17;color:#FBF8F4;cursor:pointer;transition:background .35s ease,color .35s ease'
          : 'display:block;width:100%;text-align:left;padding:18px 20px;border:none;border-top:1px solid rgba(94,43,23,.14);background:transparent;color:#5E2B17;cursor:pointer;transition:background .35s ease,color .35s ease',
        subStyle: i === this.state.cup ? 'font-size:11.5px;color:rgba(251,248,244,.7);margin-top:5px' : 'font-size:11.5px;color:#96755C;margin-top:5px',
      })),
      cup,
      beans: this.beans.map((b, i) => ({
        ...b, i,
        pick: () => this.setState({ bean: i }),
        style: i === this.state.bean
          ? 'font-size:11px;letter-spacing:.14em;text-transform:uppercase;padding:11px 18px;border:1px solid #5E2B17;background:#5E2B17;color:#FBF8F4;cursor:pointer;transition:all .3s ease'
          : 'font-size:11px;letter-spacing:.14em;text-transform:uppercase;padding:11px 18px;border:1px solid rgba(94,43,23,.22);background:transparent;color:#5E2B17;cursor:pointer;transition:all .3s ease',
      })),
      bean,
      beanProfile: Object.keys(bean.profile).map((k) => ({
        label: k, value: bean.profile[k],
        barStyle: `height:2px;background:#A35730;width:${bean.profile[k]}%;transition:width .7s cubic-bezier(.2,.7,.2,1)`,
        num: bean.profile[k],
      })),
      railRefSig: this.railRef('sig'), railSigPrev: this.scrollRail('sig', -1), railSigNext: this.scrollRail('sig', 1),
      railRefBrew: this.railRef('brew'), railBrewPrev: this.scrollRail('brew', -1), railBrewNext: this.scrollRail('brew', 1),
      railRefExp: this.railRef('exp'), railExpPrev: this.scrollRail('exp', -1), railExpNext: this.scrollRail('exp', 1),
      openReserve: (e) => { if (e) e.preventDefault(); this.setState({ reserve: true }); },
      closeReserve: (e) => { if (e) e.preventDefault(); this.setState({ reserve: false }); },
      reserveOpen: this.state.reserve,
      goCoffee: this.go('coffee'), goFood: this.go('food'), goStory: this.go('story'),
      goJournal: this.go('journal'), goVisit: this.go('visit'), goExp: this.go('experiences'),
    };
  }

  render() {
    const {
      bean, beanProfile, beans, brews, closeMenu, closeReserve, cup, cups, dayparts,
      goCoffee, goExp, goFood, goHome, goJournal, goStory, goVisit,
      isCoffee, isExp, isFood, isHome, isJournal, isStory, isVisit,
      journal, menuOpen, navAll, navLeft, navRef, navRight, openMenu, openReserve,
      part, pillars, railBrewNext, railBrewPrev, railExpNext, railExpPrev, railRefBrew,
      railRefExp, railRefSig, railSigNext, railSigPrev, reserveOpen,
      showPrices, signature, testimonials,
    } = this.renderVals();

    return (
      <>
      <div data-r="nav" style={st("position:fixed;top:0;left:0;right:0;z-index:90;background:rgba(251,248,244,0);transition:background .45s ease,box-shadow .45s ease,padding .45s ease;padding:26px 40px")} ref={navRef}>
        <div style={st("display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:24px;max-width:1560px;margin:0 auto")}>
          <button onClick={openMenu} data-r="mobonly" aria-label="Menu" style={st("display:none;align-items:center;gap:10px;background:transparent;border:none;padding:0;cursor:pointer;font-size:10.5px;letter-spacing:.18em;text-transform:uppercase;color:#5E2B17")}>
            <span style={st("display:flex;flex-direction:column;gap:4px;width:22px")}>
              <span style={st("height:1px;background:#5E2B17;display:block")} />
              <span style={st("height:1px;background:#5E2B17;display:block")} />
            </span>
            {" Menu "}
          </button>
          <nav data-r="deskonly" style={st("display:flex;gap:26px;align-items:center")}>
            {navLeft.map((item, i) => (
              <a key={i} className="hv1" href="#top" onClick={item.go} data-navlink="1" data-navactive={item.active} style={st("font-size:12px;letter-spacing:.11em;text-transform:uppercase;font-weight:500;padding-bottom:5px;cursor:pointer")}>
                {item.label}
              </a>
            ))}
          </nav>
          <a href="#top" onClick={goHome} style={st("text-align:center;display:flex;flex-direction:column;align-items:center;cursor:pointer")}>
            <img src={logoDark} alt="Beanery — Café & Eatery" style={st("width:175px;height:auto;display:block")} />
          </a>
          <nav data-r="deskonly" style={st("display:flex;gap:26px;align-items:center;justify-content:flex-end")}>
            {navRight.map((item, i) => (
              <a key={i} className="hv1" href="#top" onClick={item.go} data-navlink="1" data-navactive={item.active} style={st("font-size:12px;letter-spacing:.11em;text-transform:uppercase;font-weight:500;padding-bottom:5px;cursor:pointer")}>
                {item.label}
              </a>
            ))}
            <button className="hv2" onClick={openReserve} style={st("font-size:11px;letter-spacing:.14em;text-transform:uppercase;font-weight:500;color:#FBF8F4;background:#5E2B17;border:none;padding:13px 22px;cursor:pointer;transition:background .3s ease")}>
              Reserve a Table
            </button>
          </nav>
          <div data-r="mobonly" style={st("display:none;justify-content:flex-end")}>
            <button onClick={openReserve} style={st("font-size:10px;letter-spacing:.14em;text-transform:uppercase;font-weight:500;color:#FBF8F4;background:#5E2B17;border:none;padding:11px 16px;cursor:pointer")}>
              Reserve
            </button>
          </div>
        </div>
      </div>
      {menuOpen && (
        <>
          <div data-overlay="menu" style={st("position:fixed;inset:0;z-index:150;background:#FBF8F4;display:flex;flex-direction:column;padding:26px 24px 40px")}>
            <div style={st("display:flex;justify-content:space-between;align-items:center")}>
              <img src={logoDark} alt="Beanery — Café & Eatery" style={st("width:136px;height:auto;display:block")} />
              <button onClick={closeMenu} aria-label="Close menu" style={st("background:transparent;border:none;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#96755C;cursor:pointer")}>
                Close ×
              </button>
            </div>
            <nav style={st("display:flex;flex-direction:column;margin-top:44px;border-top:1px solid rgba(94,43,23,.14)")}>
              {navAll.map((item, i) => (
                <a key={i} href="#top" onClick={item.go} style={st("font-family:'Playfair Display',Georgia,serif;font-size:34px;font-weight:400;padding:18px 0;border-bottom:1px solid rgba(94,43,23,.14);cursor:pointer")}>
                  {item.label}
                </a>
              ))}
            </nav>
            <div style={st("margin-top:auto;padding-top:34px;display:flex;flex-direction:column;gap:14px")}>
              <button onClick={openReserve} style={st("text-align:left;font-size:11.5px;letter-spacing:.15em;text-transform:uppercase;font-weight:500;color:#FBF8F4;background:#5E2B17;border:none;padding:19px 24px;cursor:pointer")}>
                Reserve a Table
              </button>
              <div style={st("font-size:12.5px;line-height:1.8;color:#96755C")}>
                Senapati Bapat Road, Pune · Daily from 8 AM
                <br />
                +91 98609 34080
              </div>
            </div>
          </div>
        </>
      )}
      <div id="top" />
      <div key={this.state.page} data-page-enter="">
        {isHome && (
          <>
            <div>
              <section style={st("padding:146px 40px 0;background:#FBF8F4")}>
                <div style={st("max-width:1560px;margin:0 auto")}>
                  <div style={st("display:flex;justify-content:space-between;align-items:flex-end;gap:40px;flex-wrap:wrap;padding-bottom:26px;border-bottom:1px solid rgba(94,43,23,.14)")}>
                    <div style={st("font-size:10.5px;letter-spacing:.2em;text-transform:uppercase;color:#A35730;font-weight:500")}>
                      Est. 2023 · Pune, India
                    </div>
                    <div style={st("font-size:10.5px;letter-spacing:.2em;text-transform:uppercase;color:#96755C")}>
                      Specialty coffee · European kitchen
                    </div>
                  </div>
                  <h1 data-reveal="0" style={st("font-family:'Playfair Display',Georgia,serif;font-weight:400;font-size:clamp(46px,8.6vw,158px);line-height:.9;letter-spacing:-.03em;margin:52px 0 0")}>
                    European café culture,
                    <br />
                    {"thoughtfully "}
                    <span style={st("font-style:italic;color:#A35730")}>served.</span>
                  </h1>
                  <div data-reveal="120" style={st("display:grid;grid-template-columns:1.1fr 1fr;gap:56px;align-items:end;margin:56px 0 60px")}>
                    <p style={st("font-size:16.5px;line-height:1.75;color:#6E4A34;max-width:56ch")}>
                      A café beside Chaturshrungi Temple on Senapati Bapat Road, built around traceable beans, five manual brew methods and a kitchen that cooks the way small European cafés do — few dishes, done properly.
                    </p>
                    <div style={st("display:flex;gap:14px;justify-content:flex-end;flex-wrap:wrap")}>
                      <button className="hv2" onClick={openReserve} style={st("font-size:11.5px;letter-spacing:.15em;text-transform:uppercase;font-weight:500;color:#FBF8F4;background:#5E2B17;border:none;padding:19px 34px;cursor:pointer;transition:background .35s ease")}>
                        Reserve a Table
                      </button>
                      <button className="hv5" style={st("font-size:11.5px;letter-spacing:.15em;text-transform:uppercase;font-weight:500;color:#5E2B17;background:transparent;border:1px solid rgba(94,43,23,.3);padding:19px 34px;cursor:pointer;transition:all .35s ease")}>
                        Order Now
                      </button>
                    </div>
                  </div>
                  <div data-reveal="200" style={st("display:grid;grid-template-columns:1.5fr 1fr 1fr;gap:18px;align-items:end")}>
                    <div style={st("overflow:hidden;height:60vh;min-height:420px;background:#EFE3D8")}>
                      <div className="hv7" style={st("width:100%;height:100%;transition:transform 1.4s cubic-bezier(.2,.7,.2,1)")}>
                        <ImageSlot id="hero-grid-1" placeholder="Wide: the dining room in warm daylight — banquette, glassware, marble counter, guests mid-meal" />
                      </div>
                    </div>
                    <div style={st("overflow:hidden;height:44vh;min-height:320px;background:#DFCBB9")}>
                      <div className="hv7" style={st("width:100%;height:100%;transition:transform 1.4s cubic-bezier(.2,.7,.2,1)")}>
                        <ImageSlot id="hero-grid-2" placeholder="Close craft: espresso extraction into a warm cup, crema forming, barista hands, shallow depth" />
                      </div>
                    </div>
                    <div style={st("overflow:hidden;height:52vh;min-height:380px;background:#EFE3D8")}>
                      <div className="hv7" style={st("width:100%;height:100%;transition:transform 1.4s cubic-bezier(.2,.7,.2,1)")}>
                        <ImageSlot id="hero-grid-3" placeholder="Restaurant plating: chef's hands finishing a dish with sauce and oil, overhead, dark ceramic" />
                      </div>
                    </div>
                  </div>
                </div>
              </section>
              <section style={st("padding:140px 40px 120px;background:#FBF8F4")}>
                <div style={st("max-width:1560px;margin:0 auto")}>
                  <div data-reveal="0" style={st("display:flex;align-items:baseline;gap:18px;padding-bottom:26px;border-bottom:1px solid rgba(94,43,23,.14)")}>
                    <span style={st("font-size:10.5px;letter-spacing:.2em;text-transform:uppercase;color:#A35730;font-weight:500")}>
                      Brand statement
                    </span>
                    <span style={st("font-size:10.5px;letter-spacing:.2em;text-transform:uppercase;color:#96755C")}>
                      Beanery, in its own words
                    </span>
                  </div>
                  <p data-reveal="60" style={st("font-family:'Playfair Display',Georgia,serif;font-size:clamp(30px,4.4vw,74px);line-height:1.14;font-weight:400;letter-spacing:-.025em;max-width:26ch;margin-top:56px")}>
                    {"Not quite a restaurant. Well past a coffee shop. "}
                    <span style={st("font-style:italic;color:#A35730")}>A European café, taken seriously.</span>
                  </p>
                  <div data-reveal="140" style={st("display:grid;grid-template-columns:1fr 1fr 1fr;gap:44px;margin-top:76px;padding-top:36px;border-top:1px solid rgba(94,43,23,.14)")}>
                    <p style={st("font-size:14.5px;line-height:1.85;color:#6E4A34")}>
                      Four origins live on the bar at any time, roasted for the method rather than the menu. We change them when the season changes, not when the marketing calendar does.
                    </p>
                    <p style={st("font-size:14.5px;line-height:1.85;color:#6E4A34")}>
                      The kitchen is deliberately narrow and cooks to restaurant standards: sauces made that morning, plates finished by hand, nothing out of a freezer. A short board, done properly.
                    </p>
                    <p style={st("font-size:14.5px;line-height:1.85;color:#6E4A34")}>
                      And the room carries the rest. Marble, linen, west light at four, and no pressure to leave when your cup is empty — the same table works for a meeting, a date, or a Tuesday alone.
                    </p>
                  </div>
                </div>
              </section>
              <section style={st("padding:0 40px 130px;background:#FBF8F4")}>
                <div style={st("max-width:1560px;margin:0 auto")}>
                  <div data-reveal="0" style={st("display:flex;justify-content:space-between;align-items:flex-end;gap:30px;flex-wrap:wrap;padding-bottom:24px;border-bottom:1px solid rgba(94,43,23,.14)")}>
                    <div style={st("font-size:10.5px;letter-spacing:.2em;text-transform:uppercase;color:#A35730;font-weight:500")}>
                      The five pillars
                    </div>
                    <div style={st("font-size:10.5px;letter-spacing:.2em;text-transform:uppercase;color:#96755C")}>
                      What every Beanery is built on
                    </div>
                  </div>
                  <div style={st("display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:0;border-bottom:1px solid rgba(94,43,23,.14)")}>
                    {pillars.map((p, i) => (
                      <div key={i} className="hv8" data-reveal="40" style={st("padding:34px 24px 38px;border-right:1px solid rgba(94,43,23,.14);color:#5E2B17;transition:background .55s cubic-bezier(.22,.7,.2,1),color .55s ease")}>
                        <div style={st("font-family:'Playfair Display',Georgia,serif;font-size:13px;letter-spacing:.24em;color:#B78765")}>
                          {p.n}
                        </div>
                        <h3 style={st("font-family:'Playfair Display',Georgia,serif;font-weight:400;font-size:25px;margin-top:14px;line-height:1.12;color:inherit")}>
                          {p.name}
                        </h3>
                        <p style={st("font-size:13px;line-height:1.7;color:inherit;opacity:.72;margin-top:10px")}>
                          {p.copy}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
              <section style={st("background:#EFE3D8;padding:120px 40px")}>
                <div style={st("max-width:1560px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:76px;align-items:center")}>
                  <div data-reveal="0" style={st("overflow:hidden;background:#DFCBB9;aspect-ratio:4/5")}>
                    <div className="hv7" style={st("width:100%;height:100%;transition:transform 1.5s cubic-bezier(.2,.7,.2,1)")}>
                      <ImageSlot id="feat-coffee" placeholder="Close craft: V60 pour in a spiral, gooseneck kettle, steam catching daylight (portrait 4:5)" />
                    </div>
                  </div>
                  <div>
                    <div data-reveal="40" style={st("font-size:10.5px;letter-spacing:.2em;text-transform:uppercase;color:#A35730;font-weight:500")}>
                      Featured coffee · This month
                    </div>
                    <h2 data-reveal="90" style={st("font-family:'Playfair Display',Georgia,serif;font-weight:400;font-size:clamp(38px,4.4vw,66px);line-height:1.02;letter-spacing:-.02em;margin:22px 0 0")}>
                      Ethiopia Guji
                      <br />
                      <span style={st("font-style:italic")}>Hambela Wamena</span>
                    </h2>
                    <p data-reveal="140" style={st("font-size:15.5px;line-height:1.8;color:#6E4A34;margin-top:28px;max-width:48ch")}>
                      An 18-day raised-bed natural from 2,050 metres, roasted light for filter. It arrives tasting like a good cup of jasmine tea and finishes on white peach. We brew it on V60 and AeroPress; it is the cup we hand people who say they don't like coffee.
                    </p>
                    <div data-reveal="190" style={st("margin-top:40px;border-top:1px solid rgba(94,43,23,.18)")}>
                      <div style={st("display:flex;justify-content:space-between;padding:16px 0;border-bottom:1px solid rgba(94,43,23,.12);font-size:13px")}>
                        <span style={st("letter-spacing:.14em;text-transform:uppercase;font-size:10.5px;color:#96755C")}>
                          Process
                        </span>
                        <span>Natural · raised bed, 18 days</span>
                      </div>
                      <div style={st("display:flex;justify-content:space-between;padding:16px 0;border-bottom:1px solid rgba(94,43,23,.12);font-size:13px")}>
                        <span style={st("letter-spacing:.14em;text-transform:uppercase;font-size:10.5px;color:#96755C")}>
                          Altitude
                        </span>
                        <span>2,050 m</span>
                      </div>
                      <div style={st("display:flex;justify-content:space-between;padding:16px 0;border-bottom:1px solid rgba(94,43,23,.12);font-size:13px")}>
                        <span style={st("letter-spacing:.14em;text-transform:uppercase;font-size:10.5px;color:#96755C")}>
                          Roast
                        </span>
                        <span>Light · filter</span>
                      </div>
                      <div style={st("display:flex;justify-content:space-between;padding:16px 0;font-size:13px")}>
                        <span style={st("letter-spacing:.14em;text-transform:uppercase;font-size:10.5px;color:#96755C")}>
                          Notes
                        </span>
                        <span>Jasmine · bergamot · white peach</span>
                      </div>
                    </div>
                    <a className="hv9" href="#top" onClick={goCoffee} data-reveal="240" style={st("display:inline-flex;align-items:center;gap:12px;margin-top:36px;font-size:11.5px;letter-spacing:.15em;text-transform:uppercase;font-weight:500;padding-bottom:8px;border-bottom:1px solid #5E2B17")}>
                      {"Explore our beans "}
                      <span style={st("font-family:Georgia,serif")}>→</span>
                    </a>
                  </div>
                </div>
              </section>
              <section style={st("padding:130px 40px;background:#FBF8F4")}>
                <div style={st("max-width:1560px;margin:0 auto")}>
                  <div data-reveal="0" style={st("display:flex;justify-content:space-between;align-items:flex-end;gap:36px;flex-wrap:wrap;padding-bottom:28px;border-bottom:1px solid rgba(94,43,23,.14)")}>
                    <div>
                      <div style={st("font-size:10.5px;letter-spacing:.2em;text-transform:uppercase;color:#A35730;font-weight:500")}>
                        From the kitchen
                      </div>
                      <h2 style={st("font-family:'Playfair Display',Georgia,serif;font-weight:400;font-size:clamp(34px,4vw,58px);line-height:1.04;letter-spacing:-.02em;margin-top:18px")}>
                        European dishes,
                        <br />
                        cooked the small-café way
                      </h2>
                    </div>
                    <a className="hv9" href="#top" onClick={goFood} style={st("font-size:11.5px;letter-spacing:.15em;text-transform:uppercase;font-weight:500;padding-bottom:8px;border-bottom:1px solid #5E2B17;white-space:nowrap")}>
                      All of the food →
                    </a>
                  </div>
                  <div style={st("display:grid;grid-template-columns:repeat(3,1fr);gap:28px;margin-top:56px")}>
                    <div data-reveal="40">
                      <div style={st("overflow:hidden;background:#EFE3D8;aspect-ratio:3/4")}>
                        <div className="hv10" style={st("width:100%;height:100%;transition:transform 1.4s cubic-bezier(.2,.7,.2,1)")}>
                          <ImageSlot id="dish-1" placeholder="Restaurant plating: aglio olio nested with tongs, chilli oil and parsley, dark ceramic, overhead" />
                        </div>
                      </div>
                      <div style={st("display:flex;justify-content:space-between;align-items:baseline;margin-top:20px;gap:16px")}>
                        <div style={st("display:flex;align-items:center;gap:10px")}>
                          <span style={st("font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:#A35730")}>
                            Italy
                          </span>
                          <span style={st("display:flex;align-items:center;gap:6px;font-size:9.5px;letter-spacing:.16em;text-transform:uppercase;color:#2E5D36;border:1px solid rgba(107,143,90,.6);padding:4px 8px")}>
                            <span style={st("width:5px;height:5px;background:#6B8F5A;display:block")} />
                            Veg
                          </span>
                        </div>
                        <div style={st("font-size:11px;color:#96755C")}>Most ordered</div>
                      </div>
                      <h3 style={st("font-family:'Playfair Display',Georgia,serif;font-weight:400;font-size:27px;margin-top:10px")}>
                        Aglio Olio
                      </h3>
                      <p style={st("font-size:14px;line-height:1.75;color:#6E4A34;margin-top:10px")}>
                        Garlic bloomed slowly in olive oil, chilli, parsley, a spoon of pasta water. Restraint is the recipe.
                      </p>
                    </div>
                    <div data-reveal="120">
                      <div style={st("overflow:hidden;background:#EFE3D8;aspect-ratio:3/4")}>
                        <div className="hv10" style={st("width:100%;height:100%;transition:transform 1.4s cubic-bezier(.2,.7,.2,1)")}>
                          <ImageSlot id="dish-2" placeholder="Croque monsieur cut clean, béchamel edge caught under the grill, on ceramic with cornichons" />
                        </div>
                      </div>
                      <div style={st("display:flex;justify-content:space-between;align-items:baseline;margin-top:20px;gap:16px")}>
                        <div style={st("font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:#A35730")}>
                          France
                        </div>
                        <div style={st("font-size:11px;color:#96755C")}>All day</div>
                      </div>
                      <h3 style={st("font-family:'Playfair Display',Georgia,serif;font-weight:400;font-size:27px;margin-top:10px")}>
                        Croque Monsieur
                      </h3>
                      <p style={st("font-size:14px;line-height:1.75;color:#6E4A34;margin-top:10px")}>
                        Our sourdough, Comté béchamel, cured ham, grilled until the edges catch. Served with cornichons.
                      </p>
                    </div>
                    <div data-reveal="200">
                      <div style={st("overflow:hidden;background:#EFE3D8;aspect-ratio:3/4")}>
                        <div className="hv10" style={st("width:100%;height:100%;transition:transform 1.4s cubic-bezier(.2,.7,.2,1)")}>
                          <ImageSlot id="dish-3" placeholder="Basque cheesecake: caramelised top, one wedge lifted, crumb visible, cake fork and linen" />
                        </div>
                      </div>
                      <div style={st("display:flex;justify-content:space-between;align-items:baseline;margin-top:20px;gap:16px")}>
                        <div style={st("display:flex;align-items:center;gap:10px")}>
                          <span style={st("font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:#A35730")}>
                            Spain
                          </span>
                          <span style={st("display:flex;align-items:center;gap:6px;font-size:9.5px;letter-spacing:.16em;text-transform:uppercase;color:#2E5D36;border:1px solid rgba(107,143,90,.6);padding:4px 8px")}>
                            <span style={st("width:5px;height:5px;background:#6B8F5A;display:block")} />
                            Veg
                          </span>
                        </div>
                        <div style={st("font-size:11px;color:#96755C")}>Baked daily at 3</div>
                      </div>
                      <h3 style={st("font-family:'Playfair Display',Georgia,serif;font-weight:400;font-size:27px;margin-top:10px")}>
                        Burnt Basque Cheesecake
                      </h3>
                      <p style={st("font-size:14px;line-height:1.75;color:#6E4A34;margin-top:10px")}>
                        Hot and fast in a lined tin until the top surrenders. Set at the edge, still loose in the middle.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
              <section style={st("padding:120px 0 130px;background:#5E2B17;color:#FBF8F4;overflow:hidden")}>
                <div style={st("max-width:1560px;margin:0 auto;padding:0 40px")}>
                  <div data-reveal="0" style={st("display:flex;justify-content:space-between;align-items:flex-end;gap:36px;flex-wrap:wrap;padding-bottom:26px;border-bottom:1px solid rgba(251,248,244,.2)")}>
                    <div>
                      <div style={st("font-size:10.5px;letter-spacing:.2em;text-transform:uppercase;color:#B78765;font-weight:500")}>
                        Signature collection
                      </div>
                      <h2 style={st("font-family:'Playfair Display',Georgia,serif;font-weight:400;font-size:clamp(34px,4vw,58px);line-height:1.04;letter-spacing:-.02em;margin-top:18px")}>
                        The plates and cups
                        <br />
                        that made the room
                      </h2>
                    </div>
                    <div style={st("display:flex;gap:8px")}>
                      <button className="hv11" onClick={railSigPrev} aria-label="Previous" style={st("width:48px;height:48px;border:1px solid rgba(251,248,244,.3);background:transparent;color:#FBF8F4;cursor:pointer;font-size:16px;transition:all .3s ease")}>
                        ←
                      </button>
                      <button className="hv11" onClick={railSigNext} aria-label="Next" style={st("width:48px;height:48px;border:1px solid rgba(251,248,244,.3);background:transparent;color:#FBF8F4;cursor:pointer;font-size:16px;transition:all .3s ease")}>
                        →
                      </button>
                    </div>
                  </div>
                </div>
                <div data-reveal="60" data-rail="" ref={railRefSig} style={st("display:flex;gap:26px;overflow-x:auto;scroll-snap-type:x mandatory;padding:52px 40px 12px;max-width:1640px;margin:0 auto")}>
                  {signature.map((s, i) => (
                    <div key={i} style={st("flex:0 0 380px;scroll-snap-align:start")}>
                      <div style={st("overflow:hidden;background:#71351C;aspect-ratio:1/1")}>
                        <div className="hv12" style={st("width:100%;height:100%;transition:transform 1.4s cubic-bezier(.2,.7,.2,1)")}>
                          <ImageSlot id={s.slot} placeholder={s.shot} />
                        </div>
                      </div>
                      <div style={st("font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:#B78765;margin-top:22px")}>
                        {s.kicker}
                      </div>
                      <h3 style={st("font-family:'Playfair Display',Georgia,serif;font-weight:400;font-size:26px;margin-top:11px")}>
                        {s.name}
                      </h3>
                      <p style={st("font-size:13.5px;line-height:1.75;color:rgba(251,248,244,.62);margin-top:10px")}>
                        {s.copy}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
              <section style={st("display:grid;grid-template-columns:1fr 1fr;min-height:88vh;background:#FBF8F4")}>
                <div style={st("padding:130px 40px 130px 70px;max-width:820px;margin-right:auto;display:flex;flex-direction:column;justify-content:center;order:2")}>
                  <div data-reveal="0" style={st("font-size:10.5px;letter-spacing:.2em;text-transform:uppercase;color:#A35730;font-weight:500")}>
                    Our story
                  </div>
                  <h2 data-reveal="60" style={st("font-family:'Playfair Display',Georgia,serif;font-weight:400;font-size:clamp(36px,4.3vw,64px);line-height:1.03;letter-spacing:-.02em;margin-top:22px")}>
                    It began with a
                    <br />
                    borrowed espresso
                    <br />
                    <span style={st("font-style:italic")}>machine</span>
                  </h2>
                  <p data-reveal="120" style={st("font-size:15.5px;line-height:1.8;color:#6E4A34;margin-top:30px;max-width:48ch")}>
                    Two of us, a second-hand two-group lever, and a small room off Senapati Bapat Road that got the afternoon sun. We spent the first year learning what Pune actually wanted at four in the afternoon — and the answer, it turned out, was a proper cup and somewhere to sit with it.
                  </p>
                  <p data-reveal="170" style={st("font-family:'Cormorant Garamond',Georgia,serif;font-size:23px;line-height:1.55;font-style:italic;color:#5E2B17;margin-top:34px;padding-left:24px;border-left:1px solid #A35730;max-width:40ch")}>
                    “We never wanted to be a coffee shop with food. We wanted to be a café — the European kind, where both are taken seriously.”
                  </p>
                  <a className="hv9" href="#top" onClick={goStory} data-reveal="220" style={st("display:inline-flex;align-items:center;gap:12px;margin-top:40px;font-size:11.5px;letter-spacing:.15em;text-transform:uppercase;font-weight:500;padding-bottom:8px;border-bottom:1px solid #5E2B17;align-self:flex-start")}>
                    {"Read our story "}
                    <span style={st("font-family:Georgia,serif")}>→</span>
                  </a>
                </div>
                <div style={st("position:relative;overflow:hidden;background:#DFCBB9;min-height:520px;order:1")}>
                  <div className="hv7" style={st("position:absolute;inset:0;transition:transform 1.5s cubic-bezier(.2,.7,.2,1)")}>
                    <ImageSlot id="story-preview" placeholder="Candid portrait: the founders behind the bar mid-service, unposed, warm daylight (portrait, full-bleed)" />
                  </div>
                </div>
              </section>
              <section style={st("padding:0 0 0;background:#FBF8F4")}>
                <div style={st("max-width:1560px;margin:0 auto;padding:0 40px")}>
                  <div style={st("height:1px;background:rgba(94,43,23,.14)")} />
                </div>
                <div style={st("display:grid;grid-template-columns:1fr 1fr;gap:0;align-items:stretch")}>
                  <div style={st("padding:120px 60px 120px 40px;max-width:820px;margin-left:auto")}>
                    <div data-reveal="0" style={st("font-size:10.5px;letter-spacing:.2em;text-transform:uppercase;color:#A35730;font-weight:500")}>
                      Coffee philosophy
                    </div>
                    <h3 data-reveal="60" style={st("font-family:'Playfair Display',Georgia,serif;font-weight:400;font-size:clamp(30px,3.3vw,46px);line-height:1.08;margin-top:20px")}>
                      Traceable, then
                      <br />
                      roasted for the method
                    </h3>
                    <p data-reveal="110" style={st("font-size:15px;line-height:1.8;color:#6E4A34;margin-top:24px;max-width:46ch")}>
                      We buy in small lots and we know the farm on every bag. Filter roasts stay light enough to keep the fruit; espresso goes further, for body and sweetness under milk. Nothing sits longer than three weeks past roast date, and the date is on the bag, not hidden inside it.
                    </p>
                    <div data-reveal="160" style={st("display:grid;grid-template-columns:1fr 1fr;gap:26px;margin-top:38px")}>
                      <div style={st("border-top:1px solid rgba(94,43,23,.18);padding-top:16px")}>
                        <div style={st("font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:#96755C")}>
                          Sourcing
                        </div>
                        <div style={st("font-size:14px;margin-top:8px;line-height:1.6")}>
                          Small lots, named farms, seasonal rotation
                        </div>
                      </div>
                      <div style={st("border-top:1px solid rgba(94,43,23,.18);padding-top:16px")}>
                        <div style={st("font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:#96755C")}>
                          On bar
                        </div>
                        <div style={st("font-size:14px;margin-top:8px;line-height:1.6")}>
                          Two espressos, two filters, always
                        </div>
                      </div>
                      <div style={st("border-top:1px solid rgba(94,43,23,.18);padding-top:16px")}>
                        <div style={st("font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:#96755C")}>
                          Water
                        </div>
                        <div style={st("font-size:14px;margin-top:8px;line-height:1.6")}>
                          Remineralised to 80 ppm hardness
                        </div>
                      </div>
                      <div style={st("border-top:1px solid rgba(94,43,23,.18);padding-top:16px")}>
                        <div style={st("font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:#96755C")}>
                          Dialling
                        </div>
                        <div style={st("font-size:14px;margin-top:8px;line-height:1.6")}>
                          Twice daily, logged on the bar card
                        </div>
                      </div>
                    </div>
                  </div>
                  <div style={st("overflow:hidden;background:#EFE3D8;min-height:600px")}>
                    <div className="hv7" style={st("width:100%;height:100%;transition:transform 1.5s cubic-bezier(.2,.7,.2,1)")}>
                      <ImageSlot id="phil-coffee" placeholder="Craft detail: grinder chute and dosed portafilter, hands, textural close crop (full-bleed)" />
                    </div>
                  </div>
                </div>
                <div style={st("display:grid;grid-template-columns:1fr 1fr;gap:0;align-items:stretch;border-top:1px solid rgba(94,43,23,.14)")}>
                  <div style={st("overflow:hidden;background:#DFCBB9;min-height:600px;order:1")}>
                    <div className="hv7" style={st("width:100%;height:100%;transition:transform 1.5s cubic-bezier(.2,.7,.2,1)")}>
                      <ImageSlot id="phil-food" placeholder="Ingredient detail: sourdough crumb torn open, olive oil pooling, marble and linen (full-bleed)" />
                    </div>
                  </div>
                  <div style={st("padding:120px 40px 120px 60px;max-width:820px;order:2")}>
                    <div data-reveal="0" style={st("font-size:10.5px;letter-spacing:.2em;text-transform:uppercase;color:#A35730;font-weight:500")}>
                      Food philosophy
                    </div>
                    <h3 data-reveal="60" style={st("font-family:'Playfair Display',Georgia,serif;font-weight:400;font-size:clamp(30px,3.3vw,46px);line-height:1.08;margin-top:20px")}>
                      A short menu, made
                      <br />
                      properly, every day
                    </h3>
                    <p data-reveal="110" style={st("font-size:15px;line-height:1.8;color:#6E4A34;margin-top:24px;max-width:46ch")}>
                      European cafés don't cook everything — they cook a handful of things well and repeat them until they're right. We bake our own sourdough on a three-day ferment, make pasta to order, and keep the dessert case to four things. If a dish isn't good enough to be someone's reason for coming, it comes off.
                    </p>
                    <div data-reveal="160" style={st("display:grid;grid-template-columns:1fr 1fr;gap:26px;margin-top:38px")}>
                      <div style={st("border-top:1px solid rgba(94,43,23,.18);padding-top:16px")}>
                        <div style={st("font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:#96755C")}>
                          Bread
                        </div>
                        <div style={st("font-size:14px;margin-top:8px;line-height:1.6")}>
                          Levain, three-day cold ferment
                        </div>
                      </div>
                      <div style={st("border-top:1px solid rgba(94,43,23,.18);padding-top:16px")}>
                        <div style={st("display:flex;align-items:center;gap:8px;font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:#2E5D36")}>
                          <span style={st("width:7px;height:7px;background:#6B8F5A;display:block")} />
                          Produce
                        </div>
                        <div style={st("font-size:14px;margin-top:8px;line-height:1.6")}>
                          Market twice a week, Pune growers
                        </div>
                      </div>
                      <div style={st("border-top:1px solid rgba(94,43,23,.18);padding-top:16px")}>
                        <div style={st("font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:#96755C")}>
                          Kitchen
                        </div>
                        <div style={st("font-size:14px;margin-top:8px;line-height:1.6")}>
                          No freezer, no par-cooked pasta
                        </div>
                      </div>
                      <div style={st("border-top:1px solid rgba(94,43,23,.18);padding-top:16px")}>
                        <div style={st("font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:#96755C")}>
                          Case
                        </div>
                        <div style={st("font-size:14px;margin-top:8px;line-height:1.6")}>
                          Four desserts, baked that morning
                        </div>
                      </div>
                    </div>
                    <div data-reveal="200" style={st("margin-top:34px;background:#2E5D36;color:#FBF8F4;padding:30px 32px;border-top:3px solid #6B8F5A;display:grid;grid-template-columns:auto 1fr;gap:34px;align-items:center;max-width:46ch")}>
                      <div>
                        <div style={st("font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:#A7B88F")}>
                          Meat-free
                        </div>
                        <div style={st("font-family:'Playfair Display',Georgia,serif;font-size:38px;line-height:1;margin-top:10px")}>
                          14/22
                        </div>
                      </div>
                      <div>
                        <p style={st("font-size:13.5px;line-height:1.75;color:rgba(251,248,244,.82)")}>
                          Most of the board is vegetarian and marked as such. Produce comes from Pune growers every Tuesday and Friday.
                        </p>
                        <div style={st("display:flex;gap:16px;flex-wrap:wrap;margin-top:14px")}>
                          <span style={st("display:flex;align-items:center;gap:7px;font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:#A7B88F")}>
                            <span style={st("width:7px;height:7px;background:#6B8F5A;display:block")} />
                            Vegetarian
                          </span>
                          <span style={st("display:flex;align-items:center;gap:7px;font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:#A7B88F")}>
                            <span style={st("width:7px;height:7px;background:#6B8F5A;display:block")} />
                            Market fresh
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
              <section style={st("padding:130px 40px;background:#EFE3D8")}>
                <div style={st("max-width:1560px;margin:0 auto")}>
                  <div data-reveal="0" style={st("display:flex;justify-content:space-between;align-items:flex-end;gap:36px;flex-wrap:wrap;padding-bottom:26px;border-bottom:1px solid rgba(94,43,23,.18)")}>
                    <div>
                      <div style={st("font-size:10.5px;letter-spacing:.2em;text-transform:uppercase;color:#A35730;font-weight:500")}>
                        Pair your cup
                      </div>
                      <h2 style={st("font-family:'Playfair Display',Georgia,serif;font-weight:400;font-size:clamp(34px,4vw,58px);line-height:1.04;letter-spacing:-.02em;margin-top:18px")}>
                        Choose a cup.
                        <br />
                        We'll find the plate.
                      </h2>
                    </div>
                    <p style={st("font-size:14px;line-height:1.75;color:#6E4A34;max-width:34ch")}>
                      Our baristas and kitchen taste together every Monday. These are the five pairings we'd put our name on.
                    </p>
                  </div>
                  <div style={st("display:grid;grid-template-columns:minmax(300px,1fr) 1.55fr;gap:56px;margin-top:56px;align-items:start")}>
                    <div data-reveal="40" style={st("border-bottom:1px solid rgba(94,43,23,.14)")}>
                      {cups.map((c, i) => (
                        <button key={i} onClick={c.pick} style={st(c.style)}>
                          <div style={st("font-size:14.5px;font-weight:500;letter-spacing:.01em")}>{c.cup}</div>
                          <div style={st(c.subStyle)}>{c.notes}</div>
                        </button>
                      ))}
                    </div>
                    <div data-reveal="100" style={st("display:grid;grid-template-columns:1fr 1fr;gap:0;background:#FBF8F4")}>
                      <div style={st("overflow:hidden;background:#DFCBB9;min-height:460px")}>
                        <div className="hv10" style={st("width:100%;height:100%;transition:transform 1.4s cubic-bezier(.2,.7,.2,1)")}>
                          <ImageSlot id={cup.slot} placeholder={cup.shot} />
                        </div>
                      </div>
                      <div style={st("padding:44px 40px;display:flex;flex-direction:column;justify-content:center")}>
                        <div style={st("font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:#A35730")}>
                          Pairs with
                        </div>
                        <h3 style={st("font-family:'Playfair Display',Georgia,serif;font-weight:400;font-size:clamp(26px,2.6vw,38px);line-height:1.1;margin-top:14px")}>
                          {cup.dish}
                        </h3>
                        <p style={st("font-size:14.5px;line-height:1.8;color:#6E4A34;margin-top:18px")}>
                          {cup.dishNote}
                        </p>
                        <div style={st("margin-top:28px;padding-top:18px;border-top:1px solid rgba(94,43,23,.14)")}>
                          <div style={st("font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:#96755C")}>
                            In the cup
                          </div>
                          <div style={st("font-size:14px;margin-top:8px")}>{cup.notes}</div>
                          <div style={st("font-size:12.5px;color:#96755C;margin-top:6px")}>{cup.body}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
              <section style={st("padding:120px 0;background:#FBF8F4")}>
                <div style={st("max-width:1560px;margin:0 auto;padding:0 40px")}>
                  <div data-reveal="0" style={st("display:grid;grid-template-columns:1fr auto;gap:40px;align-items:end;padding-bottom:28px;border-bottom:1px solid rgba(94,43,23,.14)")}>
                    <h2 style={st("font-family:'Playfair Display',Georgia,serif;font-weight:400;font-size:clamp(30px,3.4vw,50px);line-height:1.05;letter-spacing:-.02em")}>
                      Behind the bar
                    </h2>
                    <div style={st("font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#96755C")}>
                      Six in the morning until close
                    </div>
                  </div>
                  <div data-reveal="60" style={st("display:grid;grid-template-columns:repeat(4,1fr);grid-template-rows:220px 300px;gap:16px;margin-top:44px")}>
                    <div style={st("grid-column:span 2;grid-row:span 2;overflow:hidden;background:#EFE3D8")}>
                      <div className="hv7" style={st("width:100%;height:100%;transition:transform 1.5s cubic-bezier(.2,.7,.2,1)")}>
                        <ImageSlot id="btb-1" placeholder="Candid portrait: barista at the machine mid-shot, apron, concentrated, warm daylight (tall)" />
                      </div>
                    </div>
                    <div style={st("overflow:hidden;background:#DFCBB9")}>
                      <div className="hv10" style={st("width:100%;height:100%;transition:transform 1.5s cubic-bezier(.2,.7,.2,1)")}>
                        <ImageSlot id="btb-2" placeholder="Detail: scale, timer, tamper and cloth laid out on the bar" />
                      </div>
                    </div>
                    <div style={st("overflow:hidden;background:#EFE3D8")}>
                      <div className="hv10" style={st("width:100%;height:100%;transition:transform 1.5s cubic-bezier(.2,.7,.2,1)")}>
                        <ImageSlot id="btb-3" placeholder="Milk poured into a cortado, latte art closing, close crop" />
                      </div>
                    </div>
                    <div style={st("grid-column:span 2;overflow:hidden;background:#DFCBB9")}>
                      <div className="hv7" style={st("width:100%;height:100%;transition:transform 1.5s cubic-bezier(.2,.7,.2,1)")}>
                        <ImageSlot id="btb-4" placeholder="Wide: the pass mid-service — plated dishes waiting under the lamp, chef wiping a rim" />
                      </div>
                    </div>
                  </div>
                </div>
              </section>
              <section style={st("padding:130px 40px;background:#FBF8F4")}>
                <div style={st("max-width:1560px;margin:0 auto")}>
                  <div data-reveal="0" style={st("display:flex;justify-content:space-between;align-items:flex-end;gap:36px;flex-wrap:wrap;padding-bottom:26px;border-bottom:1px solid rgba(94,43,23,.14)")}>
                    <div>
                      <div style={st("font-size:10.5px;letter-spacing:.2em;text-transform:uppercase;color:#A35730;font-weight:500")}>
                        The Beanery experience
                      </div>
                      <h2 style={st("font-family:'Playfair Display',Georgia,serif;font-weight:400;font-size:clamp(34px,4.2vw,62px);line-height:1.02;letter-spacing:-.022em;margin-top:18px")}>
                        One room,
                        <br />
                        from eight until late
                      </h2>
                    </div>
                    <p style={st("font-size:14.5px;line-height:1.8;color:#6E4A34;max-width:34ch")}>
                      The same tables carry a morning espresso, a two-hour lunch and an evening of shared plates. The light changes; the standards don't.
                    </p>
                  </div>
                  <div style={st("display:grid;grid-template-columns:minmax(280px,.72fr) 1.28fr;gap:56px;margin-top:54px;align-items:start")}>
                    <div data-reveal="40" style={st("border-bottom:1px solid rgba(94,43,23,.16)")}>
                      {dayparts.map((d, i) => (
                        <button key={i} onClick={d.pick} style={st(d.style)}>
                          <span style={st("font-family:'Playfair Display',Georgia,serif;font-size:27px;font-weight:400")}>
                            {d.key}
                          </span>
                          <span style={st(d.hourStyle)}>{d.hours}</span>
                        </button>
                      ))}
                      <div style={st("padding:30px 24px 34px;border-top:1px solid rgba(94,43,23,.16)")}>
                        <div style={st("font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:#A35730")}>
                          Right now
                        </div>
                        <p style={st("font-family:'Cormorant Garamond',Georgia,serif;font-size:22px;line-height:1.5;font-style:italic;margin-top:12px")}>
                          {part.title}
                        </p>
                      </div>
                    </div>
                    <div data-reveal="100" style={st("position:relative")}>
                      <div style={st("overflow:hidden;background:#DFCBB9;aspect-ratio:16/9")}>
                        <div className="hv7" style={st("width:100%;height:100%;transition:transform 1.6s cubic-bezier(.2,.7,.2,1)")}>
                          <ImageSlot id={part.slot} placeholder={part.shot} />
                        </div>
                      </div>
                      <div style={st("display:grid;grid-template-columns:auto 1fr;gap:44px;margin-top:34px;padding-top:26px;border-top:1px solid rgba(94,43,23,.14)")}>
                        <div style={st("font-family:'Playfair Display',Georgia,serif;font-size:clamp(28px,3vw,44px);line-height:1;white-space:nowrap")}>
                          {part.key}
                        </div>
                        <p style={st("font-size:15px;line-height:1.85;color:#6E4A34;max-width:52ch")}>{part.copy}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
              <section style={st("background:#A35730;color:#FBF8F4;padding:96px 40px")}>
                <div style={st("max-width:1560px;margin:0 auto;display:grid;grid-template-columns:1fr auto;gap:56px;align-items:end")}>
                  <p data-reveal="0" style={st("font-family:'Playfair Display',Georgia,serif;font-weight:400;font-size:clamp(30px,4.4vw,74px);line-height:1.02;letter-spacing:-.025em;max-width:24ch")}>
                    {"One room. Coffee at eight, "}
                    <span style={st("font-style:italic")}>plates at eight.</span>
                  </p>
                  <div data-reveal="80" style={st("display:flex;flex-direction:column;gap:14px;padding-bottom:10px")}>
                    <span style={st("font-size:10.5px;letter-spacing:.2em;text-transform:uppercase;color:rgba(251,248,244,.75)")}>
                      Beanery · Senapati Bapat Road
                    </span>
                    <a className="hv13" href="#top" onClick={goExp} style={st("font-size:11.5px;letter-spacing:.15em;text-transform:uppercase;font-weight:500;color:#FBF8F4;padding-bottom:8px;border-bottom:1px solid rgba(251,248,244,.6);white-space:nowrap")}>
                      See what's on this month →
                    </a>
                  </div>
                </div>
              </section>
              <section style={st("padding:120px 40px;background:#5E2B17;color:#FBF8F4")}>
                <div style={st("max-width:1560px;margin:0 auto")}>
                  <div data-reveal="0" style={st("font-size:10.5px;letter-spacing:.2em;text-transform:uppercase;color:#B78765;font-weight:500")}>
                    In their words
                  </div>
                  <div style={st("display:grid;grid-template-columns:repeat(3,1fr);gap:56px;margin-top:56px")}>
                    {testimonials.map((t, i) => (
                      <figure key={i} data-reveal="60" style={st("border-top:1px solid rgba(251,248,244,.22);padding-top:30px")}>
                        <blockquote style={st("font-family:'Cormorant Garamond',Georgia,serif;font-size:26px;line-height:1.48;font-style:italic;font-weight:300;margin:0")}>
                          {"“"}{t.quote}{"”"}
                        </blockquote>
                        <figcaption style={st("margin-top:26px;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:rgba(251,248,244,.62)")}>
                          {t.who}{" · "}{t.meta}
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                </div>
              </section>
              <section style={st("padding:130px 40px;background:#FBF8F4")}>
                <div style={st("max-width:1560px;margin:0 auto")}>
                  <div data-reveal="0" style={st("display:flex;justify-content:space-between;align-items:flex-end;gap:36px;flex-wrap:wrap;padding-bottom:26px;border-bottom:1px solid rgba(94,43,23,.14)")}>
                    <div>
                      <div style={st("font-size:10.5px;letter-spacing:.2em;text-transform:uppercase;color:#A35730;font-weight:500")}>
                        The Journal
                      </div>
                      <h2 style={st("font-family:'Playfair Display',Georgia,serif;font-weight:400;font-size:clamp(34px,4vw,58px);line-height:1.04;letter-spacing:-.02em;margin-top:18px")}>
                        Notes from the
                        <br />
                        bar and the kitchen
                      </h2>
                    </div>
                    <a className="hv9" href="#top" onClick={goJournal} style={st("font-size:11.5px;letter-spacing:.15em;text-transform:uppercase;font-weight:500;padding-bottom:8px;border-bottom:1px solid #5E2B17;white-space:nowrap")}>
                      All stories →
                    </a>
                  </div>
                  <div style={st("display:grid;grid-template-columns:repeat(3,1fr);gap:30px;margin-top:52px")}>
                    {journal.map((a, i) => (
                      <a key={i} href="#top" onClick={goJournal} data-reveal="60" style={st("display:block;cursor:pointer")}>
                        <div style={st("overflow:hidden;background:#EFE3D8;aspect-ratio:16/11")}>
                          <div className="hv10" style={st("width:100%;height:100%;transition:transform 1.4s cubic-bezier(.2,.7,.2,1)")}>
                            <ImageSlot id={a.slot} placeholder={a.shot} />
                          </div>
                        </div>
                        <div style={st("display:flex;gap:14px;align-items:center;margin-top:20px;font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:#A35730")}>
                          {a.cat}{" "}
                          <span style={st("width:16px;height:1px;background:rgba(94,43,23,.25);display:block")} />
                          {" "}
                          <span style={st("color:#96755C")}>{a.date}</span>
                        </div>
                        <h3 style={st("font-family:'Playfair Display',Georgia,serif;font-weight:400;font-size:25px;line-height:1.2;margin-top:12px")}>
                          {a.title}
                        </h3>
                        <p style={st("font-size:14px;line-height:1.75;color:#6E4A34;margin-top:10px")}>{a.dek}</p>
                        <div style={st("font-size:11px;color:#96755C;margin-top:14px")}>{a.read}{" read"}</div>
                      </a>
                    ))}
                  </div>
                </div>
              </section>
              <section style={st("padding:0 0 130px;background:#FBF8F4")}>
                <div style={st("max-width:1560px;margin:0 auto;padding:0 40px")}>
                  <div data-reveal="0" style={st("display:flex;justify-content:space-between;align-items:baseline;gap:30px;flex-wrap:wrap;padding-bottom:22px;border-bottom:1px solid rgba(94,43,23,.14)")}>
                    <div style={st("font-size:10.5px;letter-spacing:.2em;text-transform:uppercase;color:#A35730;font-weight:500")}>
                      @beanery.pune
                    </div>
                    <div style={st("font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#96755C")}>
                      Follow along
                    </div>
                  </div>
                  <div data-reveal="40" style={st("display:grid;grid-template-columns:repeat(6,1fr);gap:10px;margin-top:26px")}>
                    <div style={st("overflow:hidden;aspect-ratio:1/1;background:#EFE3D8")}>
                      <div className="hv14" style={st("width:100%;height:100%;transition:transform 1.2s cubic-bezier(.2,.7,.2,1)")}>
                        <ImageSlot id="ig-1" placeholder="Square: cortado and cake fork on marble" />
                      </div>
                    </div>
                    <div style={st("overflow:hidden;aspect-ratio:1/1;background:#DFCBB9")}>
                      <div className="hv14" style={st("width:100%;height:100%;transition:transform 1.2s cubic-bezier(.2,.7,.2,1)")}>
                        <ImageSlot id="ig-2" placeholder="Square: window seat, west light, half-finished plate" />
                      </div>
                    </div>
                    <div style={st("overflow:hidden;aspect-ratio:1/1;background:#EFE3D8")}>
                      <div className="hv14" style={st("width:100%;height:100%;transition:transform 1.2s cubic-bezier(.2,.7,.2,1)")}>
                        <ImageSlot id="ig-3" placeholder="Square: croissants racked, laminated layers visible" />
                      </div>
                    </div>
                    <div style={st("overflow:hidden;aspect-ratio:1/1;background:#DFCBB9")}>
                      <div className="hv14" style={st("width:100%;height:100%;transition:transform 1.2s cubic-bezier(.2,.7,.2,1)")}>
                        <ImageSlot id="ig-4" placeholder="Square: cold brew over clear ice, condensation" />
                      </div>
                    </div>
                    <div style={st("overflow:hidden;aspect-ratio:1/1;background:#EFE3D8")}>
                      <div className="hv14" style={st("width:100%;height:100%;transition:transform 1.2s cubic-bezier(.2,.7,.2,1)")}>
                        <ImageSlot id="ig-5" placeholder="Square: plated pasta, tongs, dark ceramic, overhead" />
                      </div>
                    </div>
                    <div style={st("overflow:hidden;aspect-ratio:1/1;background:#DFCBB9")}>
                      <div className="hv14" style={st("width:100%;height:100%;transition:transform 1.2s cubic-bezier(.2,.7,.2,1)")}>
                        <ImageSlot id="ig-6" placeholder="Square: the team at the end of service, candid" />
                      </div>
                    </div>
                  </div>
                </div>
              </section>
              <section style={st("background:#EFE3D8;display:grid;grid-template-columns:1.1fr 1fr;align-items:stretch")}>
                <div style={st("padding:120px 60px 120px 40px;max-width:840px;margin-left:auto")}>
                  <div data-reveal="0" style={st("font-size:10.5px;letter-spacing:.2em;text-transform:uppercase;color:#A35730;font-weight:500")}>
                    Visit us
                  </div>
                  <h2 data-reveal="50" style={st("font-family:'Playfair Display',Georgia,serif;font-weight:400;font-size:clamp(34px,4.2vw,60px);line-height:1.03;letter-spacing:-.02em;margin-top:20px")}>
                    Beside Chaturshrungi
                    <br />
                    Temple, from 8 AM
                  </h2>
                  <div data-reveal="110" style={st("display:grid;grid-template-columns:1fr 1fr;gap:36px;margin-top:46px")}>
                    <div>
                      <div style={st("font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:#96755C;padding-bottom:12px;border-bottom:1px solid rgba(94,43,23,.18)")}>
                        Address
                      </div>
                      <p style={st("font-size:15px;line-height:1.75;margin-top:14px")}>
                        Beanery Café & Eatery
                        <br />
                        Beside Chaturshrungi Temple
                        <br />
                        Senapati Bapat Road
                        <br />
                        Pune 411016
                      </p>
                    </div>
                    <div>
                      <div style={st("font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:#96755C;padding-bottom:12px;border-bottom:1px solid rgba(94,43,23,.18)")}>
                        Hours
                      </div>
                      <div style={st("margin-top:14px;font-size:14.5px;line-height:1.9")}>
                        <div style={st("display:flex;justify-content:space-between;gap:14px")}>
                          <span>Mon – Thu</span>
                          <span style={st("color:#6E4A34")}>8:00 – 23:00</span>
                        </div>
                        <div style={st("display:flex;justify-content:space-between;gap:14px")}>
                          <span>Fri – Sun</span>
                          <span style={st("color:#6E4A34")}>8:00 – 23:30</span>
                        </div>
                        <div style={st("display:flex;justify-content:space-between;gap:14px")}>
                          <span>Kitchen</span>
                          <span style={st("color:#6E4A34")}>until 22:30</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div data-reveal="160" style={st("display:flex;gap:14px;margin-top:46px;flex-wrap:wrap")}>
                    <button className="hv2" onClick={openReserve} style={st("font-size:11.5px;letter-spacing:.15em;text-transform:uppercase;font-weight:500;color:#FBF8F4;background:#5E2B17;border:none;padding:19px 34px;cursor:pointer;transition:background .35s ease")}>
                      Reserve a Table
                    </button>
                    <a className="hv15" href="tel:+919860934080" style={st("font-size:11.5px;letter-spacing:.15em;text-transform:uppercase;font-weight:500;color:#5E2B17;border:1px solid rgba(94,43,23,.3);padding:19px 34px;transition:all .35s ease")}>
                      +91 98609 34080
                    </a>
                  </div>
                </div>
                <div style={st("position:relative;overflow:hidden;background:#DFCBB9;min-height:600px")}>
                  <LocalityMap />
                  <div style={st("position:absolute;left:32px;top:32px;background:#FBF8F4;padding:16px 20px;pointer-events:none")}>
                    <div style={st("font-size:9.5px;letter-spacing:.2em;text-transform:uppercase;color:#A35730")}>
                      Find us
                    </div>
                    <div style={st("font-family:'Playfair Display',Georgia,serif;font-size:17px;margin-top:6px")}>
                      Senapati Bapat Road
                    </div>
                  </div>
                </div>
              </section>
              <section style={st("background:#B78765;color:#5E2B17;padding:110px 40px")}>
                <div style={st("max-width:1560px;margin:0 auto;display:flex;justify-content:space-between;align-items:flex-end;gap:48px;flex-wrap:wrap")}>
                  <div>
                    <div data-reveal="0" style={st("font-size:10.5px;letter-spacing:.2em;text-transform:uppercase;color:rgba(94,43,23,.72);font-weight:500")}>
                      Reservations
                    </div>
                    <h2 data-reveal="50" style={st("font-family:'Playfair Display',Georgia,serif;font-weight:400;font-size:clamp(38px,5.6vw,86px);line-height:.98;letter-spacing:-.025em;margin-top:20px")}>
                      Keep a table
                      <br />
                      for the afternoon.
                    </h2>
                  </div>
                  <div data-reveal="110" style={st("display:flex;gap:14px;flex-wrap:wrap")}>
                    <button className="hv2" onClick={openReserve} style={st("font-size:11.5px;letter-spacing:.15em;text-transform:uppercase;font-weight:500;color:#FBF8F4;background:#5E2B17;border:none;padding:21px 38px;cursor:pointer;transition:all .35s ease")}>
                      Reserve a Table
                    </button>
                    <button className="hv16" style={st("font-size:11.5px;letter-spacing:.15em;text-transform:uppercase;font-weight:500;color:#5E2B17;background:transparent;border:1px solid rgba(94,43,23,.5);padding:21px 38px;cursor:pointer;transition:all .35s ease")}>
                      Order Now
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </>
        )}
        {isCoffee && (
          <>
            <div>
              <section style={st("padding:146px 40px 0;background:#FBF8F4")}>
                <div style={st("max-width:1560px;margin:0 auto")}>
                  <div style={st("display:flex;justify-content:space-between;align-items:flex-end;gap:30px;flex-wrap:wrap;padding-bottom:24px;border-bottom:1px solid rgba(94,43,23,.14)")}>
                    <div style={st("font-size:10.5px;letter-spacing:.2em;text-transform:uppercase;color:#A35730;font-weight:500")}>
                      Coffee
                    </div>
                    <div style={st("font-size:10.5px;letter-spacing:.2em;text-transform:uppercase;color:#96755C")}>
                      Beans · Brews · Tasting notes
                    </div>
                  </div>
                  <div style={st("display:grid;grid-template-columns:1.35fr 1fr;gap:64px;align-items:end;margin-top:52px")}>
                    <h1 data-reveal="0" style={st("font-family:'Playfair Display',Georgia,serif;font-weight:400;font-size:clamp(44px,7vw,124px);line-height:.93;letter-spacing:-.03em")}>
                      Four origins,
                      <br />
                      five ways to
                      <br />
                      <span style={st("font-style:italic;color:#A35730")}>brew them.</span>
                    </h1>
                    <p data-reveal="80" style={st("font-size:16px;line-height:1.8;color:#6E4A34;max-width:44ch;padding-bottom:14px")}>
                      Everything on our bar is bought in small lots with the farm named on the bag. We roast for the method — light for filter, a little further for espresso — and we tell you the date it happened.
                    </p>
                  </div>
                  <div data-reveal="140" style={st("margin-top:64px;overflow:hidden;height:62vh;min-height:430px;background:#EFE3D8")}>
                    <div className="hv6" style={st("width:100%;height:100%;transition:transform 1.6s cubic-bezier(.2,.7,.2,1)")}>
                      <ImageSlot id="coffee-hero" placeholder="Full-width: cupping table mid-session — bowls, spoons, green and roasted lots, hands (wide editorial crop)" />
                    </div>
                  </div>
                </div>
              </section>
              <section style={st("padding:120px 40px;background:#FBF8F4")}>
                <div style={st("max-width:1560px;margin:0 auto")}>
                  <div data-reveal="0" style={st("display:flex;justify-content:space-between;align-items:flex-end;gap:30px;flex-wrap:wrap;padding-bottom:26px;border-bottom:1px solid rgba(94,43,23,.14)")}>
                    <div>
                      <div style={st("font-size:10.5px;letter-spacing:.2em;text-transform:uppercase;color:#A35730;font-weight:500")}>
                        Our beans
                      </div>
                      <h2 style={st("font-family:'Playfair Display',Georgia,serif;font-weight:400;font-size:clamp(32px,3.8vw,54px);line-height:1.04;margin-top:16px")}>
                        Origin cards
                      </h2>
                    </div>
                    <div style={st("display:flex;gap:8px;flex-wrap:wrap")}>
                      {beans.map((b, i) => (
                        <button key={i} onClick={b.pick} style={st(b.style)}>{b.origin}</button>
                      ))}
                    </div>
                  </div>
                  <div data-reveal="60" style={st("display:grid;grid-template-columns:0.85fr 1fr 0.9fr;gap:0;margin-top:48px;border:1px solid rgba(94,43,23,.16);background:#FBF8F4")}>
                    <div style={st("overflow:hidden;background:#DFCBB9;min-height:520px")}>
                      <div className="hv10" style={st("width:100%;height:100%;transition:transform 1.5s cubic-bezier(.2,.7,.2,1)")}>
                        <ImageSlot id={bean.slot} placeholder={bean.shot} />
                      </div>
                    </div>
                    <div style={st("padding:46px 42px;border-right:1px solid rgba(94,43,23,.16)")}>
                      <div style={st("font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:#A35730")}>
                        Origin
                      </div>
                      <h3 style={st("font-family:'Playfair Display',Georgia,serif;font-weight:400;font-size:clamp(30px,3.2vw,44px);line-height:1.05;margin-top:12px")}>
                        {bean.origin}
                      </h3>
                      <div style={st("font-family:'Cormorant Garamond',Georgia,serif;font-style:italic;font-size:21px;color:#6E4A34;margin-top:8px")}>
                        {bean.farm}
                      </div>
                      <div style={st("margin-top:34px")}>
                        <div style={st("display:flex;justify-content:space-between;padding:14px 0;border-top:1px solid rgba(94,43,23,.14);font-size:13.5px")}>
                          <span style={st("font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:#96755C")}>
                            Altitude
                          </span>
                          <span>{bean.alt}</span>
                        </div>
                        <div style={st("display:flex;justify-content:space-between;padding:14px 0;border-top:1px solid rgba(94,43,23,.14);font-size:13.5px;gap:20px")}>
                          <span style={st("font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:#96755C;white-space:nowrap")}>
                            Process
                          </span>
                          <span style={st("text-align:right")}>{bean.process}</span>
                        </div>
                        <div style={st("display:flex;justify-content:space-between;padding:14px 0;border-top:1px solid rgba(94,43,23,.14);font-size:13.5px")}>
                          <span style={st("font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:#96755C")}>
                            Varietal
                          </span>
                          <span>{bean.varietal}</span>
                        </div>
                        <div style={st("display:flex;justify-content:space-between;padding:14px 0;border-top:1px solid rgba(94,43,23,.14);border-bottom:1px solid rgba(94,43,23,.14);font-size:13.5px")}>
                          <span style={st("font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:#96755C")}>
                            Roast
                          </span>
                          <span>{bean.roast}</span>
                        </div>
                      </div>
                      <div style={st("display:flex;gap:8px;flex-wrap:wrap;margin-top:26px")}>
                        {bean.notes.map((n, i) => (
                          <span key={i} style={st("font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;color:#A35730;border:1px solid rgba(163,87,48,.4);padding:8px 12px")}>
                            {n}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div style={st("padding:46px 42px;background:#EFE3D8")}>
                      <div style={st("font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:#96755C")}>
                        Flavour profile
                      </div>
                      <div style={st("margin-top:30px")}>
                        {beanProfile.map((p, i) => (
                          <div key={i} style={st("margin-bottom:24px")}>
                            <div style={st("display:flex;justify-content:space-between;align-items:baseline;margin-bottom:9px")}>
                              <span style={st("font-size:11.5px;letter-spacing:.1em;text-transform:uppercase")}>
                                {p.label}
                              </span>
                              <span style={st("font-family:'Playfair Display',Georgia,serif;font-size:15px;color:#96755C")}>
                                {p.num}
                              </span>
                            </div>
                            <div style={st("height:2px;background:rgba(94,43,23,.14);position:relative")}>
                              <div style={st(p.barStyle)} />
                            </div>
                          </div>
                        ))}
                      </div>
                      <p style={st("font-size:12.5px;line-height:1.7;color:#96755C;margin-top:30px;padding-top:18px;border-top:1px solid rgba(94,43,23,.14)")}>
                        Scored on our own cupping table, out of 100, against the SCA sensory wheel. Retasted every time a new lot lands.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
              <section style={st("padding:120px 0;background:#5E2B17;color:#FBF8F4")}>
                <div style={st("max-width:1560px;margin:0 auto;padding:0 40px")}>
                  <div data-reveal="0" style={st("display:flex;justify-content:space-between;align-items:flex-end;gap:36px;flex-wrap:wrap;padding-bottom:26px;border-bottom:1px solid rgba(251,248,244,.2)")}>
                    <div>
                      <div style={st("font-size:10.5px;letter-spacing:.2em;text-transform:uppercase;color:#B78765;font-weight:500")}>
                        Brew methods
                      </div>
                      <h2 style={st("font-family:'Playfair Display',Georgia,serif;font-weight:400;font-size:clamp(32px,3.8vw,54px);line-height:1.04;margin-top:16px")}>
                        Five ways, one bar card
                      </h2>
                    </div>
                    <div style={st("display:flex;gap:8px")}>
                      <button className="hv11" onClick={railBrewPrev} aria-label="Previous" style={st("width:48px;height:48px;border:1px solid rgba(251,248,244,.3);background:transparent;color:#FBF8F4;cursor:pointer;font-size:16px;transition:all .3s ease")}>
                        ←
                      </button>
                      <button className="hv11" onClick={railBrewNext} aria-label="Next" style={st("width:48px;height:48px;border:1px solid rgba(251,248,244,.3);background:transparent;color:#FBF8F4;cursor:pointer;font-size:16px;transition:all .3s ease")}>
                        →
                      </button>
                    </div>
                  </div>
                </div>
                <div data-reveal="60" data-rail="" ref={railRefBrew} style={st("display:flex;gap:24px;overflow-x:auto;scroll-snap-type:x mandatory;padding:48px 40px 14px;max-width:1640px;margin:0 auto")}>
                  {brews.map((b, i) => (
                    <div key={i} style={st("flex:0 0 400px;scroll-snap-align:start;border:1px solid rgba(251,248,244,.2)")}>
                      <div style={st("overflow:hidden;aspect-ratio:4/3;background:#71351C")}>
                        <div className="hv12" style={st("width:100%;height:100%;transition:transform 1.4s cubic-bezier(.2,.7,.2,1)")}>
                          <ImageSlot id={b.slot} placeholder={b.shot} />
                        </div>
                      </div>
                      <div style={st("padding:30px 28px 34px")}>
                        <div style={st("display:flex;justify-content:space-between;align-items:baseline;gap:16px")}>
                          <h3 style={st("font-family:'Playfair Display',Georgia,serif;font-weight:400;font-size:28px")}>
                            {b.name}
                          </h3>
                          {showPrices && (
                            <>
                              <span style={st("font-size:14px;color:#B78765")}>{b.price}</span>
                            </>
                          )}
                        </div>
                        <div style={st("font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:rgba(251,248,244,.55);margin-top:8px")}>
                          {b.kicker}
                        </div>
                        <p style={st("font-size:13.5px;line-height:1.75;color:rgba(251,248,244,.66);margin-top:16px")}>
                          {b.copy}
                        </p>
                        <div style={st("margin-top:22px;padding-top:16px;border-top:1px solid rgba(251,248,244,.18)")}>
                          {b.spec.map((s, i) => (
                            <div key={i} style={st("font-size:12.5px;color:rgba(251,248,244,.8);padding:5px 0")}>
                              {s}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
              <section style={st("padding:120px 40px;background:#FBF8F4")}>
                <div style={st("max-width:1560px;margin:0 auto;display:grid;grid-template-columns:1fr 1.15fr;gap:76px;align-items:start")}>
                  <div>
                    <div data-reveal="0" style={st("font-size:10.5px;letter-spacing:.2em;text-transform:uppercase;color:#A35730;font-weight:500")}>
                      Beverage stories
                    </div>
                    <h2 data-reveal="50" style={st("font-family:'Playfair Display',Georgia,serif;font-weight:400;font-size:clamp(30px,3.4vw,48px);line-height:1.05;margin-top:18px")}>
                      Beyond the
                      <br />
                      espresso bar
                    </h2>
                    <p data-reveal="100" style={st("font-size:15px;line-height:1.8;color:#6E4A34;margin-top:22px;max-width:42ch")}>
                      Specialty drinks, single-estate teas, drinking chocolate, cold beverages and a seasonal list that changes four times a year. Each one has a card on the bar explaining what it is and why we made it.
                    </p>
                    <div data-reveal="150" style={st("overflow:hidden;margin-top:40px;aspect-ratio:4/5;background:#EFE3D8")}>
                      <div className="hv7" style={st("width:100%;height:100%;transition:transform 1.5s cubic-bezier(.2,.7,.2,1)")}>
                        <ImageSlot id="bev-hero" placeholder="Seasonal drink on marble — saffron latte in glass, cardamom and linen props, cinematic light (portrait)" />
                      </div>
                    </div>
                  </div>
                  <div data-reveal="80">
                    <div style={st("display:flex;justify-content:space-between;align-items:baseline;padding-bottom:14px;border-bottom:1px solid rgba(94,43,23,.18)")}>
                      <span style={st("font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:#96755C")}>
                        On the list
                      </span>
                      {showPrices && (
                        <>
                          <span style={st("font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:#96755C")}>
                            Price
                          </span>
                        </>
                      )}
                    </div>
                    <div style={st("display:flex;justify-content:space-between;gap:24px;padding:22px 0;border-bottom:1px solid rgba(94,43,23,.1)")}>
                      <div>
                        <div style={st("font-size:16px")}>Lychee Cold Brew</div>
                        <div style={st("font-size:12.5px;color:#96755C;margin-top:5px")}>
                          18-hour steep, lychee, cane · house signature
                        </div>
                      </div>
                      {showPrices && (
                        <>
                          <div style={st("font-size:14px;color:#6E4A34;white-space:nowrap")}>₹280</div>
                        </>
                      )}
                    </div>
                    <div style={st("display:flex;justify-content:space-between;gap:24px;padding:22px 0;border-bottom:1px solid rgba(94,43,23,.1)")}>
                      <div>
                        <div style={st("font-size:16px")}>Saffron Cardamom Latte</div>
                        <div style={st("font-size:12.5px;color:#96755C;margin-top:5px")}>
                          Kashmiri saffron, green cardamom · winter only
                        </div>
                      </div>
                      {showPrices && (
                        <>
                          <div style={st("font-size:14px;color:#6E4A34;white-space:nowrap")}>₹300</div>
                        </>
                      )}
                    </div>
                    <div style={st("display:flex;justify-content:space-between;gap:24px;padding:22px 0;border-bottom:1px solid rgba(94,43,23,.1)")}>
                      <div>
                        <div style={st("font-size:16px")}>Darjeeling First Flush</div>
                        <div style={st("font-size:12.5px;color:#96755C;margin-top:5px")}>
                          Single estate, brewed in glass, 3 minutes
                        </div>
                      </div>
                      {showPrices && (
                        <>
                          <div style={st("font-size:14px;color:#6E4A34;white-space:nowrap")}>₹260</div>
                        </>
                      )}
                    </div>
                    <div style={st("display:flex;justify-content:space-between;gap:24px;padding:22px 0;border-bottom:1px solid rgba(94,43,23,.1)")}>
                      <div>
                        <div style={st("display:flex;align-items:center;gap:10px")}>
                          <span style={st("font-size:16px")}>Ceremonial Matcha</span>
                          <span style={st("width:7px;height:7px;background:#6B8F5A;display:block")} />
                        </div>
                        <div style={st("font-size:12.5px;color:#96755C;margin-top:5px")}>
                          First-harvest Uji, whisked, milk on the side
                        </div>
                      </div>
                      {showPrices && (
                        <>
                          <div style={st("font-size:14px;color:#6E4A34;white-space:nowrap")}>₹320</div>
                        </>
                      )}
                    </div>
                    <div style={st("display:flex;justify-content:space-between;gap:24px;padding:22px 0;border-bottom:1px solid rgba(94,43,23,.1)")}>
                      <div>
                        <div style={st("font-size:16px")}>Drinking Chocolate</div>
                        <div style={st("font-size:12.5px;color:#96755C;margin-top:5px")}>
                          70% single-origin, whole milk, no sugar added
                        </div>
                      </div>
                      {showPrices && (
                        <>
                          <div style={st("font-size:14px;color:#6E4A34;white-space:nowrap")}>₹290</div>
                        </>
                      )}
                    </div>
                    <div style={st("display:flex;justify-content:space-between;gap:24px;padding:22px 0;border-bottom:1px solid rgba(94,43,23,.1)")}>
                      <div>
                        <div style={st("font-size:16px")}>Espresso Tonic</div>
                        <div style={st("font-size:12.5px;color:#96755C;margin-top:5px")}>
                          Doppio, tonic, orange peel · summer list
                        </div>
                      </div>
                      {showPrices && (
                        <>
                          <div style={st("font-size:14px;color:#6E4A34;white-space:nowrap")}>₹270</div>
                        </>
                      )}
                    </div>
                    <div style={st("display:flex;justify-content:space-between;gap:24px;padding:22px 0")}>
                      <div>
                        <div style={st("font-size:16px")}>Filter Flight</div>
                        <div style={st("font-size:12.5px;color:#96755C;margin-top:5px")}>
                          Three origins, 60 ml each, tasting card included
                        </div>
                      </div>
                      {showPrices && (
                        <>
                          <div style={st("font-size:14px;color:#6E4A34;white-space:nowrap")}>₹480</div>
                        </>
                      )}
                    </div>
                    <div style={st("margin-top:44px;padding:34px 32px;background:#EFE3D8")}>
                      <div style={st("font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:#A35730")}>
                        Barista's note
                      </div>
                      <p style={st("font-family:'Cormorant Garamond',Georgia,serif;font-size:22px;line-height:1.55;font-style:italic;margin-top:14px")}>
                        “If it's your first time, take the filter flight and sit at the bar. We'll talk you through it, and you'll leave knowing which origin is yours.”
                      </p>
                      <div style={st("font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#96755C;margin-top:18px")}>
                        Head barista
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </>
        )}
        {isFood && (
          <>
            <div>
              <section style={st("padding:146px 40px 0;background:#FBF8F4")}>
                <div style={st("max-width:1560px;margin:0 auto")}>
                  <div style={st("display:flex;justify-content:space-between;align-items:flex-end;gap:30px;flex-wrap:wrap;padding-bottom:24px;border-bottom:1px solid rgba(94,43,23,.14)")}>
                    <div style={st("font-size:10.5px;letter-spacing:.2em;text-transform:uppercase;color:#A35730;font-weight:500")}>
                      Food
                    </div>
                    <div style={st("font-size:10.5px;letter-spacing:.2em;text-transform:uppercase;color:#96755C")}>
                      Italy · France · Spain · Europe
                    </div>
                  </div>
                  <h1 data-reveal="0" style={st("font-family:'Playfair Display',Georgia,serif;font-weight:400;font-size:clamp(44px,7.4vw,132px);line-height:.92;letter-spacing:-.03em;margin-top:52px")}>
                    Borrowed from
                    <br />
                    {"the cafés of "}
                    <span style={st("font-style:italic;color:#A35730")}>Europe.</span>
                  </h1>
                  <div data-reveal="80" style={st("display:grid;grid-template-columns:1fr 1fr 1fr;gap:34px;margin-top:52px;padding-top:30px;border-top:1px solid rgba(94,43,23,.14)")}>
                    <p style={st("font-size:15px;line-height:1.8;color:#6E4A34")}>
                      A narrow menu on purpose: pasta made to order, sandwiches on our own sourdough, and four desserts. Everything is cooked in one small kitchen by people who eat it themselves.
                    </p>
                    <p style={st("font-size:15px;line-height:1.8;color:#6E4A34")}>
                      We are not trying to be authentic to any one country. We cook the way small European cafés actually cook — a handful of dishes, repeated until they're right.
                    </p>
                    <p style={st("font-size:15px;line-height:1.8;color:#6E4A34")}>
                      Bread goes into the oven at seven each morning on a three-day ferment. When it's gone, it's gone, and the sandwiches come off the board.
                    </p>
                  </div>
                  <div data-reveal="140" style={st("margin-top:60px;display:grid;grid-template-columns:1.6fr 1fr;gap:18px;align-items:end")}>
                    <div style={st("overflow:hidden;height:58vh;min-height:400px;background:#EFE3D8")}>
                      <div className="hv6" style={st("width:100%;height:100%;transition:transform 1.6s cubic-bezier(.2,.7,.2,1)")}>
                        <ImageSlot id="food-hero-1" placeholder="Table presentation: a full spread — plated pasta, shared boards, glassware, linen, hands reaching (wide)" />
                      </div>
                    </div>
                    <div style={st("overflow:hidden;height:42vh;min-height:300px;background:#DFCBB9")}>
                      <div className="hv7" style={st("width:100%;height:100%;transition:transform 1.6s cubic-bezier(.2,.7,.2,1)")}>
                        <ImageSlot id="food-hero-2" placeholder="Chef detail: tweezers finishing a plate, sauce spooned, motion at the pass" />
                      </div>
                    </div>
                  </div>
                </div>
              </section>
              <section style={st("padding:120px 40px;background:#FBF8F4")}>
                <div style={st("max-width:1560px;margin:0 auto")}>
                  <div data-reveal="0" style={st("font-size:10.5px;letter-spacing:.2em;text-transform:uppercase;color:#A35730;font-weight:500;padding-bottom:26px;border-bottom:1px solid rgba(94,43,23,.14)")}>
                    Influences
                  </div>
                  <div style={st("display:grid;grid-template-columns:repeat(4,1fr);gap:0;margin-top:0;border-bottom:1px solid rgba(94,43,23,.14)")}>
                    <div data-reveal="40" style={st("padding:40px 32px 44px 0;border-right:1px solid rgba(94,43,23,.14)")}>
                      <div style={st("font-family:'Playfair Display',Georgia,serif;font-size:15px;letter-spacing:.24em;color:#AF6E43")}>
                        01
                      </div>
                      <h3 style={st("font-family:'Playfair Display',Georgia,serif;font-weight:400;font-size:30px;margin-top:18px")}>
                        Italy
                      </h3>
                      <p style={st("font-size:14px;line-height:1.75;color:#6E4A34;margin-top:14px")}>
                        Pasta to order, espresso standing up, and the discipline of five ingredients. Aglio olio, cacio e pepe, a ragù on Sundays.
                      </p>
                    </div>
                    <div data-reveal="90" style={st("padding:40px 32px 44px;border-right:1px solid rgba(94,43,23,.14)")}>
                      <div style={st("font-family:'Playfair Display',Georgia,serif;font-size:15px;letter-spacing:.24em;color:#AF6E43")}>
                        02
                      </div>
                      <h3 style={st("font-family:'Playfair Display',Georgia,serif;font-weight:400;font-size:30px;margin-top:18px")}>
                        France
                      </h3>
                      <p style={st("font-size:14px;line-height:1.75;color:#6E4A34;margin-top:14px")}>
                        The bakery half of the room. Croissants laminated in-house, croque monsieur, cultured butter and a lot of good salt.
                      </p>
                    </div>
                    <div data-reveal="140" style={st("padding:40px 32px 44px;border-right:1px solid rgba(94,43,23,.14)")}>
                      <div style={st("font-family:'Playfair Display',Georgia,serif;font-size:15px;letter-spacing:.24em;color:#AF6E43")}>
                        03
                      </div>
                      <h3 style={st("font-family:'Playfair Display',Georgia,serif;font-weight:400;font-size:30px;margin-top:18px")}>
                        Spain
                      </h3>
                      <p style={st("font-size:14px;line-height:1.75;color:#6E4A34;margin-top:14px")}>
                        San Sebastián taught us the cheesecake and the habit of small plates in the afternoon. Tortilla, pan con tomate, olives.
                      </p>
                    </div>
                    <div data-reveal="190" style={st("padding:40px 0 44px 32px")}>
                      <div style={st("font-family:'Playfair Display',Georgia,serif;font-size:15px;letter-spacing:.24em;color:#AF6E43")}>
                        04
                      </div>
                      <h3 style={st("font-family:'Playfair Display',Georgia,serif;font-weight:400;font-size:30px;margin-top:18px")}>
                        Wider Europe
                      </h3>
                      <p style={st("font-size:14px;line-height:1.75;color:#6E4A34;margin-top:14px")}>
                        Viennese cake culture, Lisbon custard tarts, Copenhagen open sandwiches. Whatever earns its place on the board.
                      </p>
                    </div>
                  </div>
                  <div data-reveal="40" style={st("margin-top:80px;background:#2E5D36;color:#FBF8F4;display:grid;grid-template-columns:1fr 1.35fr;align-items:stretch")}>
                    <div style={st("padding:56px 48px")}>
                      <div style={st("display:flex;align-items:center;gap:12px")}>
                        <span style={st("width:34px;height:1px;background:#A7B88F;display:block")} />
                        <span style={st("font-size:10.5px;letter-spacing:.2em;text-transform:uppercase;color:#A7B88F;font-weight:500")}>
                          From the market
                        </span>
                      </div>
                      <h3 style={st("font-family:'Playfair Display',Georgia,serif;font-weight:400;font-size:clamp(28px,3.2vw,46px);line-height:1.05;margin-top:20px")}>
                        Twice a week,
                        <br />
                        from Pune growers
                      </h3>
                      <p style={st("font-size:15px;line-height:1.8;color:rgba(251,248,244,.82);margin-top:20px;max-width:38ch")}>
                        Produce is bought on Tuesday and Friday mornings and cooked within the week. What doesn't sell becomes stock, staff lunch or the compost bin behind the kitchen — in that order.
                      </p>
                    </div>
                    <div style={st("display:grid;grid-template-columns:1fr 1fr 1fr;border-left:1px solid rgba(251,248,244,.22)")}>
                      <div style={st("padding:48px 26px;border-right:1px solid rgba(251,248,244,.22)")}>
                        <div style={st("font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:#A7B88F")}>
                          Vegetarian
                        </div>
                        <div style={st("font-family:'Playfair Display',Georgia,serif;font-size:38px;margin-top:16px")}>
                          14
                        </div>
                        <p style={st("font-size:13px;line-height:1.7;color:rgba(251,248,244,.72);margin-top:10px")}>
                          of 22 dishes on the board are meat-free, and marked as such.
                        </p>
                      </div>
                      <div style={st("padding:48px 26px;border-right:1px solid rgba(251,248,244,.22)")}>
                        <div style={st("font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:#A7B88F")}>
                          Sourced within
                        </div>
                        <div style={st("font-family:'Playfair Display',Georgia,serif;font-size:38px;margin-top:16px")}>
                          40 km
                        </div>
                        <p style={st("font-size:13px;line-height:1.7;color:rgba(251,248,244,.72);margin-top:10px")}>
                          Greens, tomatoes, herbs and dairy — all from around Pune.
                        </p>
                      </div>
                      <div style={st("padding:48px 26px")}>
                        <div style={st("font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:#A7B88F")}>
                          Kitchen waste
                        </div>
                        <div style={st("font-family:'Playfair Display',Georgia,serif;font-size:38px;margin-top:16px")}>
                          Zero
                        </div>
                        <p style={st("font-size:13px;line-height:1.7;color:rgba(251,248,244,.72);margin-top:10px")}>
                          Trim to stock, bread to crumb, grounds to the herb boxes out front.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
              <section style={st("padding:0 40px 120px;background:#FBF8F4")}>
                <div style={st("max-width:1560px;margin:0 auto")}>
                  <div data-reveal="0" style={st("font-size:10.5px;letter-spacing:.2em;text-transform:uppercase;color:#A35730;font-weight:500;margin-bottom:30px")}>
                    Dish story
                  </div>
                  <div data-reveal="40" style={st("border:1px solid rgba(94,43,23,.16);display:grid;grid-template-columns:1.05fr 1fr")}>
                    <div style={st("overflow:hidden;min-height:640px;background:#DFCBB9")}>
                      <div className="hv7" style={st("width:100%;height:100%;transition:transform 1.6s cubic-bezier(.2,.7,.2,1)")}>
                        <ImageSlot id="dishstory-1" placeholder="Hero dish: aglio olio plated restaurant-style — nested strands, chilli oil, parsley oil dots, dark ceramic on linen (portrait, full-bleed)" />
                      </div>
                    </div>
                    <div style={st("padding:54px 48px")}>
                      <div style={st("display:flex;justify-content:space-between;align-items:baseline;gap:20px")}>
                        <div style={st("font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:#A35730")}>
                          Italy · Most ordered
                        </div>
                        {showPrices && (
                          <>
                            <div style={st("font-size:14px;color:#6E4A34")}>₹420</div>
                          </>
                        )}
                      </div>
                      <h2 style={st("font-family:'Playfair Display',Georgia,serif;font-weight:400;font-size:clamp(34px,3.8vw,54px);line-height:1.02;margin-top:16px")}>
                        Aglio Olio
                      </h2>
                      <p style={st("font-family:'Cormorant Garamond',Georgia,serif;font-size:23px;line-height:1.55;font-style:italic;color:#6E4A34;margin-top:16px")}>
                        Four ingredients, no hiding place.
                      </p>
                      <div style={st("margin-top:36px")}>
                        <div style={st("padding:20px 0;border-top:1px solid rgba(94,43,23,.14)")}>
                          <div style={st("font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:#96755C")}>
                            Inspiration
                          </div>
                          <p style={st("font-size:14.5px;line-height:1.75;margin-top:9px")}>
                            A midnight plate in Trastevere, cooked by a friend's mother who insisted we watch the garlic and nothing else.
                          </p>
                        </div>
                        <div style={st("padding:20px 0;border-top:1px solid rgba(94,43,23,.14)")}>
                          <div style={st("font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:#2E5D36")}>
                            Ingredients
                          </div>
                          <p style={st("font-size:14.5px;line-height:1.75;margin-top:9px")}>
                            Bronze-cut spaghetti, Sicilian olive oil, four cloves of garlic, dried peperoncino, flat parsley, sea salt.
                          </p>
                        </div>
                        <div style={st("padding:20px 0;border-top:1px solid rgba(94,43,23,.14)")}>
                          <div style={st("font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:#96755C")}>
                            Technique
                          </div>
                          <p style={st("font-size:14.5px;line-height:1.75;margin-top:9px")}>
                            Garlic sliced thin and bloomed slowly in cold-start oil until it just turns blonde. Emulsified off the heat with starch water until the sauce clings.
                          </p>
                        </div>
                        <div style={st("padding:20px 0;border-top:1px solid rgba(94,43,23,.14)")}>
                          <div style={st("font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:#96755C")}>
                            Flavour notes
                          </div>
                          <div style={st("display:flex;gap:8px;flex-wrap:wrap;margin-top:12px")}>
                            <span style={st("font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;color:#2E5D36;border:1px solid rgba(46,93,54,.45);padding:8px 12px")}>
                              Vegetarian
                            </span>
                            <span style={st("font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;color:#A35730;border:1px solid rgba(163,87,48,.4);padding:8px 12px")}>
                              Sweet garlic
                            </span>
                            <span style={st("font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;color:#A35730;border:1px solid rgba(163,87,48,.4);padding:8px 12px")}>
                              Grassy oil
                            </span>
                            <span style={st("font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;color:#A35730;border:1px solid rgba(163,87,48,.4);padding:8px 12px")}>
                              Slow chilli
                            </span>
                          </div>
                        </div>
                        <div style={st("padding:20px 0;border-top:1px solid rgba(94,43,23,.14);border-bottom:1px solid rgba(94,43,23,.14);display:flex;justify-content:space-between;gap:20px;align-items:baseline")}>
                          <div style={st("font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:#96755C")}>
                            Pairing
                          </div>
                          <div style={st("font-size:14.5px;text-align:right")}>Lychee Cold Brew</div>
                        </div>
                      </div>
                      <div style={st("margin-top:30px;padding:28px 26px;background:#EFE3D8")}>
                        <div style={st("font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:#A35730")}>
                          Chef's note
                        </div>
                        <p style={st("font-family:'Cormorant Garamond',Georgia,serif;font-size:21px;line-height:1.55;font-style:italic;margin-top:12px")}>
                          “If you can taste the garlic before you taste the oil, I've gone too far. Send it back — I'd want to know.”
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
              <section style={st("padding:0 40px 130px;background:#FBF8F4")}>
                <div style={st("max-width:1560px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:64px")}>
                  <div data-reveal="0">
                    <div style={st("overflow:hidden;aspect-ratio:5/4;background:#EFE3D8")}>
                      <div className="hv7" style={st("width:100%;height:100%;transition:transform 1.5s cubic-bezier(.2,.7,.2,1)")}>
                        <ImageSlot id="bakery-1" placeholder="Bakery: levain loaves cooling on racks, scored crust, flour and morning light" />
                      </div>
                    </div>
                    <h3 style={st("font-family:'Playfair Display',Georgia,serif;font-weight:400;font-size:clamp(28px,3vw,42px);line-height:1.06;margin-top:30px")}>
                      Bakery & sourdough
                    </h3>
                    <p style={st("font-size:15px;line-height:1.8;color:#6E4A34;margin-top:16px;max-width:44ch")}>
                      One levain, kept since the first week we opened, on a three-day cold ferment. Loaves at eight, croissants at nine, and the sandwich board closes when the bread runs out.
                    </p>
                    <div style={st("margin-top:26px")}>
                      <div style={st("display:flex;justify-content:space-between;gap:20px;padding:16px 0;border-top:1px solid rgba(94,43,23,.14);font-size:14.5px")}>
                        <span>Country levain, whole loaf</span>
                        {showPrices && (
                          <>
                            <span style={st("color:#6E4A34")}>₹340</span>
                          </>
                        )}
                      </div>
                      <div style={st("display:flex;justify-content:space-between;gap:20px;padding:16px 0;border-top:1px solid rgba(94,43,23,.14);font-size:14.5px")}>
                        <span>Almond croissant</span>
                        {showPrices && (
                          <>
                            <span style={st("color:#6E4A34")}>₹260</span>
                          </>
                        )}
                      </div>
                      <div style={st("display:flex;justify-content:space-between;gap:20px;padding:16px 0;border-top:1px solid rgba(94,43,23,.14);border-bottom:1px solid rgba(94,43,23,.14);font-size:14.5px")}>
                        <span>Focaccia, rosemary & sea salt</span>
                        {showPrices && (
                          <>
                            <span style={st("color:#6E4A34")}>₹220</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div data-reveal="80">
                    <div style={st("overflow:hidden;aspect-ratio:5/4;background:#DFCBB9")}>
                      <div className="hv7" style={st("width:100%;height:100%;transition:transform 1.5s cubic-bezier(.2,.7,.2,1)")}>
                        <ImageSlot id="dessert-1" placeholder="Dessert presentation: Basque cheesecake, tarts and tiramisu plated for the case, overhead" />
                      </div>
                    </div>
                    <h3 style={st("font-family:'Playfair Display',Georgia,serif;font-weight:400;font-size:clamp(28px,3vw,42px);line-height:1.06;margin-top:30px")}>
                      Desserts
                    </h3>
                    <p style={st("font-size:15px;line-height:1.8;color:#6E4A34;margin-top:16px;max-width:44ch")}>
                      Four at a time, baked that morning, listed on the case in chalk. The Basque has never come off — the other three rotate with the season and the kitchen's mood.
                    </p>
                    <div style={st("margin-top:26px")}>
                      <div style={st("display:flex;justify-content:space-between;gap:20px;padding:16px 0;border-top:1px solid rgba(94,43,23,.14);font-size:14.5px")}>
                        <span>Burnt Basque cheesecake</span>
                        {showPrices && (
                          <>
                            <span style={st("color:#6E4A34")}>₹320</span>
                          </>
                        )}
                      </div>
                      <div style={st("display:flex;justify-content:space-between;gap:20px;padding:16px 0;border-top:1px solid rgba(94,43,23,.14);font-size:14.5px")}>
                        <span>Tiramisu, our espresso</span>
                        {showPrices && (
                          <>
                            <span style={st("color:#6E4A34")}>₹340</span>
                          </>
                        )}
                      </div>
                      <div style={st("display:flex;justify-content:space-between;gap:20px;padding:16px 0;border-top:1px solid rgba(94,43,23,.14);border-bottom:1px solid rgba(94,43,23,.14);font-size:14.5px")}>
                        <span>Pastel de nata, two pieces</span>
                        {showPrices && (
                          <>
                            <span style={st("color:#6E4A34")}>₹240</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </>
        )}
        {isStory && (
          <>
            <div>
              <section style={st("padding:146px 40px 0;background:#FBF8F4")}>
                <div style={st("max-width:1560px;margin:0 auto")}>
                  <div style={st("display:flex;justify-content:space-between;align-items:flex-end;gap:30px;flex-wrap:wrap;padding-bottom:24px;border-bottom:1px solid rgba(94,43,23,.14)")}>
                    <div style={st("font-size:10.5px;letter-spacing:.2em;text-transform:uppercase;color:#A35730;font-weight:500")}>
                      Our story
                    </div>
                    <div style={st("font-size:10.5px;letter-spacing:.2em;text-transform:uppercase;color:#96755C")}>
                      Est. 2023 · Pune
                    </div>
                  </div>
                  <h1 data-reveal="0" style={st("font-family:'Playfair Display',Georgia,serif;font-weight:400;font-size:clamp(44px,7.4vw,132px);line-height:.92;letter-spacing:-.03em;margin-top:52px")}>
                    A room with
                    <br />
                    good light and
                    <br />
                    <span style={st("font-style:italic;color:#A35730")}>no hurry.</span>
                  </h1>
                  <div data-reveal="120" style={st("margin-top:60px;overflow:hidden;height:66vh;min-height:440px;background:#EFE3D8")}>
                    <div className="hv6" style={st("width:100%;height:100%;transition:transform 1.6s cubic-bezier(.2,.7,.2,1)")}>
                      <ImageSlot id="story-hero" placeholder="Full-width: the room in afternoon light — occupied tables, glassware, west sun across marble (wide)" />
                    </div>
                  </div>
                </div>
              </section>
              <section style={st("padding:120px 40px;background:#FBF8F4")}>
                <div style={st("max-width:1560px;margin:0 auto")}>
                  <div data-reveal="0" style={st("display:grid;grid-template-columns:280px 1fr;gap:56px;padding:48px 0;border-top:1px solid rgba(94,43,23,.14)")}>
                    <div>
                      <div style={st("font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:#A35730")}>
                        01
                      </div>
                      <h3 style={st("font-family:'Playfair Display',Georgia,serif;font-weight:400;font-size:32px;margin-top:12px;line-height:1.1")}>
                        Where it started
                      </h3>
                    </div>
                    <div style={st("display:grid;grid-template-columns:1fr 1fr;gap:44px;align-items:start")}>
                      <p style={st("font-size:15.5px;line-height:1.8;color:#6E4A34")}>
                        A second-hand two-group lever, a rented room off Senapati Bapat Road, and about four months of pulling shots for friends before we let anyone pay for one. The first bag we ever bought was a Chikmagalur honey lot, and it is still on the bar today.
                      </p>
                      <div style={st("overflow:hidden;aspect-ratio:4/3;background:#DFCBB9")}>
                        <div className="hv10" style={st("width:100%;height:100%;transition:transform 1.4s cubic-bezier(.2,.7,.2,1)")}>
                          <ImageSlot id="story-1" placeholder="Archive-feel: the first espresso machine, early days of the café" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div data-reveal="0" style={st("display:grid;grid-template-columns:280px 1fr;gap:56px;padding:48px 0;border-top:1px solid rgba(94,43,23,.14)")}>
                    <div>
                      <div style={st("font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:#A35730")}>
                        02
                      </div>
                      <h3 style={st("font-family:'Playfair Display',Georgia,serif;font-weight:400;font-size:32px;margin-top:12px;line-height:1.1")}>
                        The inspiration
                      </h3>
                    </div>
                    <div style={st("display:grid;grid-template-columns:1fr 1fr;gap:44px;align-items:start")}>
                      <p style={st("font-size:15.5px;line-height:1.8;color:#6E4A34")}>
                        Six weeks of eating our way through Rome, Lyon and San Sebastián, and noticing that the best cafés were never the fanciest. They were the ones where the same person made your coffee every morning and the food was worth sitting down for.
                      </p>
                      <p style={st("font-family:'Cormorant Garamond',Georgia,serif;font-size:24px;line-height:1.5;font-style:italic;padding-left:24px;border-left:1px solid #A35730")}>
                        “Nobody in San Sebastián was performing hospitality. They were just doing it, every day, for forty years.”
                      </p>
                    </div>
                  </div>
                  <div data-reveal="0" style={st("display:grid;grid-template-columns:280px 1fr;gap:56px;padding:48px 0;border-top:1px solid rgba(94,43,23,.14)")}>
                    <div>
                      <div style={st("font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:#A35730")}>
                        03
                      </div>
                      <h3 style={st("font-family:'Playfair Display',Georgia,serif;font-weight:400;font-size:32px;margin-top:12px;line-height:1.1")}>
                        What we believe
                      </h3>
                    </div>
                    <div style={st("display:grid;grid-template-columns:repeat(3,1fr);gap:32px")}>
                      <div>
                        <div style={st("font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:#96755C;padding-bottom:12px;border-bottom:1px solid rgba(94,43,23,.14)")}>
                          Traceability
                        </div>
                        <p style={st("font-size:14px;line-height:1.75;color:#6E4A34;margin-top:14px")}>
                          If we can't name the farm, we don't buy the coffee.
                        </p>
                      </div>
                      <div>
                        <div style={st("font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:#96755C;padding-bottom:12px;border-bottom:1px solid rgba(94,43,23,.14)")}>
                          Restraint
                        </div>
                        <p style={st("font-size:14px;line-height:1.75;color:#6E4A34;margin-top:14px")}>
                          A short menu, cooked properly, beats a long one cooked adequately.
                        </p>
                      </div>
                      <div>
                        <div style={st("font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:#96755C;padding-bottom:12px;border-bottom:1px solid rgba(94,43,23,.14)")}>
                          The room
                        </div>
                        <p style={st("font-size:14px;line-height:1.75;color:#6E4A34;margin-top:14px")}>
                          Nobody is ever asked to leave because their cup is empty.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div data-reveal="0" style={st("display:grid;grid-template-columns:280px 1fr;gap:56px;padding:48px 0;border-top:1px solid rgba(94,43,23,.14)")}>
                    <div>
                      <div style={st("font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:#A35730")}>
                        04
                      </div>
                      <h3 style={st("font-family:'Playfair Display',Georgia,serif;font-weight:400;font-size:32px;margin-top:12px;line-height:1.1")}>
                        Our people
                      </h3>
                    </div>
                    <div style={st("display:grid;grid-template-columns:repeat(3,1fr);gap:26px")}>
                      <div>
                        <div style={st("overflow:hidden;aspect-ratio:3/4;background:#EFE3D8")}>
                          <div className="hv10" style={st("width:100%;height:100%;transition:transform 1.4s cubic-bezier(.2,.7,.2,1)")}>
                            <ImageSlot id="people-1" placeholder="Portrait: head barista at the bar, natural light" />
                          </div>
                        </div>
                        <div style={st("font-size:15px;margin-top:16px")}>Head barista</div>
                        <div style={st("font-size:12.5px;color:#96755C;margin-top:4px")}>
                          Dials the bar, runs the workshops
                        </div>
                      </div>
                      <div>
                        <div style={st("overflow:hidden;aspect-ratio:3/4;background:#DFCBB9")}>
                          <div className="hv10" style={st("width:100%;height:100%;transition:transform 1.4s cubic-bezier(.2,.7,.2,1)")}>
                            <ImageSlot id="people-2" placeholder="Portrait: head chef in the kitchen, apron, mid-service" />
                          </div>
                        </div>
                        <div style={st("font-size:15px;margin-top:16px")}>Head chef</div>
                        <div style={st("font-size:12.5px;color:#96755C;margin-top:4px")}>
                          Writes the board every Monday
                        </div>
                      </div>
                      <div>
                        <div style={st("overflow:hidden;aspect-ratio:3/4;background:#EFE3D8")}>
                          <div className="hv10" style={st("width:100%;height:100%;transition:transform 1.4s cubic-bezier(.2,.7,.2,1)")}>
                            <ImageSlot id="people-3" placeholder="Portrait: baker with dough, early morning" />
                          </div>
                        </div>
                        <div style={st("font-size:15px;margin-top:16px")}>Baker</div>
                        <div style={st("font-size:12.5px;color:#96755C;margin-top:4px")}>In at four, out by noon</div>
                      </div>
                    </div>
                  </div>
                  <div data-reveal="0" style={st("display:grid;grid-template-columns:280px 1fr;gap:56px;padding:48px 0;border-top:1px solid rgba(94,43,23,.14);border-bottom:1px solid rgba(94,43,23,.14)")}>
                    <div>
                      <div style={st("font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:#A35730")}>
                        05
                      </div>
                      <h3 style={st("font-family:'Playfair Display',Georgia,serif;font-weight:400;font-size:32px;margin-top:12px;line-height:1.1")}>
                        Where we're going
                      </h3>
                    </div>
                    <div>
                      <p style={st("font-family:'Cormorant Garamond',Georgia,serif;font-size:clamp(24px,2.7vw,38px);line-height:1.45;font-weight:300;max-width:38ch")}>
                        A roastery of our own, a bread counter that opens at seven, and a second room somewhere in Pune that feels exactly like this one.
                      </p>
                      <a className="hv9" href="#top" onClick={goVisit} style={st("display:inline-flex;align-items:center;gap:12px;margin-top:36px;font-size:11.5px;letter-spacing:.15em;text-transform:uppercase;font-weight:500;padding-bottom:8px;border-bottom:1px solid #5E2B17")}>
                        {"Come and see the first one "}
                        <span style={st("font-family:Georgia,serif")}>→</span>
                      </a>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </>
        )}
        {isExp && (
          <>
            <div>
              <section style={st("padding:146px 40px 0;background:#FBF8F4")}>
                <div style={st("max-width:1560px;margin:0 auto")}>
                  <div style={st("display:flex;justify-content:space-between;align-items:flex-end;gap:30px;flex-wrap:wrap;padding-bottom:24px;border-bottom:1px solid rgba(94,43,23,.14)")}>
                    <div style={st("font-size:10.5px;letter-spacing:.2em;text-transform:uppercase;color:#A35730;font-weight:500")}>
                      Experiences
                    </div>
                    <div style={st("font-size:10.5px;letter-spacing:.2em;text-transform:uppercase;color:#96755C")}>
                      Brunches · Workshops · Tastings · Private
                    </div>
                  </div>
                  <h1 data-reveal="0" style={st("font-family:'Playfair Display',Georgia,serif;font-weight:400;font-size:clamp(44px,7vw,124px);line-height:.93;letter-spacing:-.03em;margin-top:52px")}>
                    Things worth
                    <br />
                    booking a
                    <br />
                    <span style={st("font-style:italic;color:#A35730")}>morning for.</span>
                  </h1>
                </div>
              </section>
              <section style={st("padding:80px 0 40px;background:#FBF8F4")}>
                <div style={st("max-width:1560px;margin:0 auto;padding:0 40px")}>
                  <div data-reveal="0" style={st("background:#A35730;color:#FBF8F4;display:grid;grid-template-columns:1fr 1fr;align-items:stretch")}>
                    <div style={st("padding:64px 56px")}>
                      <div style={st("font-size:10.5px;letter-spacing:.2em;text-transform:uppercase;color:rgba(251,248,244,.75)")}>
                        Seasonal · Monsoon series
                      </div>
                      <h2 style={st("font-family:'Playfair Display',Georgia,serif;font-weight:400;font-size:clamp(32px,3.8vw,56px);line-height:1.02;margin-top:18px")}>
                        Long Table
                        <br />
                        Sunday Brunch
                      </h2>
                      <p style={st("font-size:15px;line-height:1.8;color:rgba(251,248,244,.85);margin-top:20px;max-width:40ch")}>
                        One table, twenty seats, four courses and a filter flight between them. Every second Sunday until October.
                      </p>
                      <div style={st("display:flex;gap:36px;margin-top:34px;padding-top:22px;border-top:1px solid rgba(251,248,244,.35);flex-wrap:wrap")}>
                        <div>
                          <div style={st("font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:rgba(251,248,244,.7)")}>
                            Next date
                          </div>
                          <div style={st("font-family:'Playfair Display',Georgia,serif;font-size:22px;margin-top:7px")}>
                            14 Sept
                          </div>
                        </div>
                        <div>
                          <div style={st("font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:rgba(251,248,244,.7)")}>
                            Seats left
                          </div>
                          <div style={st("font-family:'Playfair Display',Georgia,serif;font-size:22px;margin-top:7px")}>
                            6
                          </div>
                        </div>
                        <div>
                          <div style={st("font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:rgba(251,248,244,.7)")}>
                            Per guest
                          </div>
                          <div style={st("font-family:'Playfair Display',Georgia,serif;font-size:22px;margin-top:7px")}>
                            ₹1,850
                          </div>
                        </div>
                      </div>
                      <button className="hv8" onClick={openReserve} style={st("margin-top:38px;font-size:11.5px;letter-spacing:.15em;text-transform:uppercase;font-weight:500;color:#5E2B17;background:#FBF8F4;border:none;padding:19px 34px;cursor:pointer;transition:all .35s ease")}>
                        Request a seat
                      </button>
                    </div>
                    <div style={st("overflow:hidden;min-height:440px")}>
                      <div className="hv7" style={st("width:100%;height:100%;transition:transform 1.6s cubic-bezier(.2,.7,.2,1)")}>
                        <ImageSlot id="exp-banner" placeholder="Long communal table set for brunch, linen, dishes being passed (full-bleed)" />
                      </div>
                    </div>
                  </div>
                </div>
              </section>
              <section style={st("padding:80px 0 120px;background:#FBF8F4")}>
                <div style={st("max-width:1560px;margin:0 auto;padding:0 40px")}>
                  <div data-reveal="0" style={st("display:flex;justify-content:space-between;align-items:flex-end;gap:30px;padding-bottom:24px;border-bottom:1px solid rgba(94,43,23,.14)")}>
                    <div style={st("font-size:10.5px;letter-spacing:.2em;text-transform:uppercase;color:#A35730;font-weight:500")}>
                      All experiences
                    </div>
                    <div style={st("display:flex;gap:8px")}>
                      <button className="hv8" onClick={railExpPrev} aria-label="Previous" style={st("width:48px;height:48px;border:1px solid rgba(94,43,23,.25);background:transparent;color:#5E2B17;cursor:pointer;font-size:16px;transition:all .3s ease")}>
                        ←
                      </button>
                      <button className="hv8" onClick={railExpNext} aria-label="Next" style={st("width:48px;height:48px;border:1px solid rgba(94,43,23,.25);background:transparent;color:#5E2B17;cursor:pointer;font-size:16px;transition:all .3s ease")}>
                        →
                      </button>
                    </div>
                  </div>
                </div>
                <div data-reveal="60" data-rail="" ref={railRefExp} style={st("display:flex;gap:24px;overflow-x:auto;scroll-snap-type:x mandatory;padding:44px 40px 14px;max-width:1640px;margin:0 auto")}>
                  <div style={st("flex:0 0 360px;scroll-snap-align:start")}>
                    <div style={st("overflow:hidden;aspect-ratio:1/1;background:#EFE3D8")}>
                      <div className="hv12" style={st("width:100%;height:100%;transition:transform 1.4s cubic-bezier(.2,.7,.2,1)")}>
                        <ImageSlot id="exp-1" placeholder="Coffee workshop: guests at the bar with scales and V60s" />
                      </div>
                    </div>
                    <div style={st("font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:#A35730;margin-top:20px")}>
                      Saturdays · 10 AM
                    </div>
                    <h3 style={st("font-family:'Playfair Display',Georgia,serif;font-weight:400;font-size:26px;margin-top:10px")}>
                      Brew at Home
                    </h3>
                    <p style={st("font-size:13.5px;line-height:1.75;color:#6E4A34;margin-top:10px")}>
                      Two hours on grind, water and ratio. You leave with a recipe card and 250 g of beans.
                    </p>
                    <div style={st("font-size:13px;color:#96755C;margin-top:12px")}>₹1,400 · 8 seats</div>
                  </div>
                  <div style={st("flex:0 0 360px;scroll-snap-align:start")}>
                    <div style={st("overflow:hidden;aspect-ratio:1/1;background:#DFCBB9")}>
                      <div className="hv12" style={st("width:100%;height:100%;transition:transform 1.4s cubic-bezier(.2,.7,.2,1)")}>
                        <ImageSlot id="exp-2" placeholder="Cupping table with bowls and spoons, guests slurping" />
                      </div>
                    </div>
                    <div style={st("font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:#A35730;margin-top:20px")}>
                      Last Friday · 6 PM
                    </div>
                    <h3 style={st("font-family:'Playfair Display',Georgia,serif;font-weight:400;font-size:26px;margin-top:10px")}>
                      Origin Tasting
                    </h3>
                    <p style={st("font-size:13.5px;line-height:1.75;color:#6E4A34;margin-top:10px")}>
                      Four origins side by side, blind, with the bar's scoring sheets in your hand.
                    </p>
                    <div style={st("font-size:13px;color:#96755C;margin-top:12px")}>₹1,100 · 12 seats</div>
                  </div>
                  <div style={st("flex:0 0 360px;scroll-snap-align:start")}>
                    <div style={st("overflow:hidden;aspect-ratio:1/1;background:#EFE3D8")}>
                      <div className="hv12" style={st("width:100%;height:100%;transition:transform 1.4s cubic-bezier(.2,.7,.2,1)")}>
                        <ImageSlot id="exp-3" placeholder="Private gathering: the room set for an evening event, candles" />
                      </div>
                    </div>
                    <div style={st("font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:#A35730;margin-top:20px")}>
                      By arrangement
                    </div>
                    <h3 style={st("font-family:'Playfair Display',Georgia,serif;font-weight:400;font-size:26px;margin-top:10px")}>
                      Private Room
                    </h3>
                    <p style={st("font-size:13.5px;line-height:1.75;color:#6E4A34;margin-top:10px")}>
                      The whole café after eight, a set menu written with you, and the bar kept open.
                    </p>
                    <div style={st("font-size:13px;color:#96755C;margin-top:12px")}>From ₹28,000 · up to 40</div>
                  </div>
                  <div style={st("flex:0 0 360px;scroll-snap-align:start")}>
                    <div style={st("overflow:hidden;aspect-ratio:1/1;background:#DFCBB9")}>
                      <div className="hv12" style={st("width:100%;height:100%;transition:transform 1.4s cubic-bezier(.2,.7,.2,1)")}>
                        <ImageSlot id="exp-4" placeholder="Baking class: hands shaping dough on a floured counter" />
                      </div>
                    </div>
                    <div style={st("font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:#A35730;margin-top:20px")}>
                      Monthly · Sunday
                    </div>
                    <h3 style={st("font-family:'Playfair Display',Georgia,serif;font-weight:400;font-size:26px;margin-top:10px")}>
                      Sourdough Morning
                    </h3>
                    <p style={st("font-size:13.5px;line-height:1.75;color:#6E4A34;margin-top:10px")}>
                      Shape, score, bake, eat. You go home with a loaf and a jar of our levain.
                    </p>
                    <div style={st("font-size:13px;color:#96755C;margin-top:12px")}>₹1,600 · 10 seats</div>
                  </div>
                </div>
              </section>
            </div>
          </>
        )}
        {isJournal && (
          <>
            <div>
              <section style={st("padding:146px 40px 0;background:#FBF8F4")}>
                <div style={st("max-width:1560px;margin:0 auto")}>
                  <div style={st("display:flex;justify-content:space-between;align-items:flex-end;gap:30px;flex-wrap:wrap;padding-bottom:24px;border-bottom:1px solid rgba(94,43,23,.14)")}>
                    <div style={st("font-size:10.5px;letter-spacing:.2em;text-transform:uppercase;color:#A35730;font-weight:500")}>
                      Journal
                    </div>
                    <div style={st("font-size:10.5px;letter-spacing:.2em;text-transform:uppercase;color:#96755C")}>
                      Coffee · Food · Café culture · Behind the scenes
                    </div>
                  </div>
                  <h1 data-reveal="0" style={st("font-family:'Playfair Display',Georgia,serif;font-weight:400;font-size:clamp(44px,7vw,124px);line-height:.93;letter-spacing:-.03em;margin-top:52px")}>
                    Written between
                    <br />
                    <span style={st("font-style:italic;color:#A35730")}>services.</span>
                  </h1>
                </div>
              </section>
              <section style={st("padding:80px 40px 120px;background:#FBF8F4")}>
                <div style={st("max-width:1560px;margin:0 auto")}>
                  <a href="#top" data-reveal="0" style={st("display:grid;grid-template-columns:1.25fr 1fr;gap:56px;align-items:center;padding-bottom:56px;border-bottom:1px solid rgba(94,43,23,.14);cursor:pointer")}>
                    <div style={st("overflow:hidden;aspect-ratio:16/10;background:#EFE3D8")}>
                      <div className="hv7" style={st("width:100%;height:100%;transition:transform 1.5s cubic-bezier(.2,.7,.2,1)")}>
                        <ImageSlot id="journal-lead" placeholder="Lead story image: roastery drum, beans mid-roast, warm smoke (wide)" />
                      </div>
                    </div>
                    <div>
                      <div style={st("display:flex;gap:14px;align-items:center;font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:#A35730")}>
                        {"Behind the scenes "}
                        <span style={st("width:16px;height:1px;background:rgba(94,43,23,.25);display:block")} />
                        {" "}
                        <span style={st("color:#96755C")}>September 2026</span>
                      </div>
                      <h2 style={st("font-family:'Playfair Display',Georgia,serif;font-weight:400;font-size:clamp(30px,3.6vw,52px);line-height:1.06;margin-top:16px")}>
                        The week we decided to roast our own
                      </h2>
                      <p style={st("font-size:15.5px;line-height:1.8;color:#6E4A34;margin-top:18px;max-width:46ch")}>
                        A 12 kg drum, a rented unit in Bhosari, and eight weeks of getting it wrong before the first lot we'd actually serve. Notes from the middle of it.
                      </p>
                      <div style={st("font-size:11.5px;letter-spacing:.14em;text-transform:uppercase;color:#96755C;margin-top:22px")}>
                        11 min read
                      </div>
                    </div>
                  </a>
                  <div style={st("display:grid;grid-template-columns:repeat(3,1fr);gap:30px;margin-top:56px")}>
                    {journal.map((a, i) => (
                      <a key={i} href="#top" data-reveal="60" style={st("display:block;cursor:pointer")}>
                        <div style={st("overflow:hidden;background:#EFE3D8;aspect-ratio:16/11")}>
                          <div className="hv10" style={st("width:100%;height:100%;transition:transform 1.4s cubic-bezier(.2,.7,.2,1)")}>
                            <ImageSlot id={a.slot} placeholder={a.shot} />
                          </div>
                        </div>
                        <div style={st("display:flex;gap:14px;align-items:center;margin-top:20px;font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:#A35730")}>
                          {a.cat}{" "}
                          <span style={st("width:16px;height:1px;background:rgba(94,43,23,.25);display:block")} />
                          {" "}
                          <span style={st("color:#96755C")}>{a.date}</span>
                        </div>
                        <h3 style={st("font-family:'Playfair Display',Georgia,serif;font-weight:400;font-size:25px;line-height:1.2;margin-top:12px")}>
                          {a.title}
                        </h3>
                        <p style={st("font-size:14px;line-height:1.75;color:#6E4A34;margin-top:10px")}>{a.dek}</p>
                        <div style={st("font-size:11px;color:#96755C;margin-top:14px")}>{a.read}{" read"}</div>
                      </a>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          </>
        )}
        {isVisit && (
          <>
            <div>
              <section style={st("padding:146px 40px 0;background:#FBF8F4")}>
                <div style={st("max-width:1560px;margin:0 auto")}>
                  <div style={st("display:flex;justify-content:space-between;align-items:flex-end;gap:30px;flex-wrap:wrap;padding-bottom:24px;border-bottom:1px solid rgba(94,43,23,.14)")}>
                    <div style={st("font-size:10.5px;letter-spacing:.2em;text-transform:uppercase;color:#A35730;font-weight:500")}>
                      Visit us
                    </div>
                    <div style={st("font-size:10.5px;letter-spacing:.2em;text-transform:uppercase;color:#96755C")}>
                      Open daily from 8 AM
                    </div>
                  </div>
                  <h1 data-reveal="0" style={st("font-family:'Playfair Display',Georgia,serif;font-weight:400;font-size:clamp(44px,7vw,124px);line-height:.93;letter-spacing:-.03em;margin-top:52px")}>
                    Senapati Bapat
                    <br />
                    {"Road, "}
                    <span style={st("font-style:italic;color:#A35730")}>Pune.</span>
                  </h1>
                  <div data-reveal="80" style={st("display:grid;grid-template-columns:repeat(4,1fr);gap:32px;margin-top:60px;padding-top:32px;border-top:1px solid rgba(94,43,23,.14)")}>
                    <div>
                      <div style={st("font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:#96755C")}>
                        Address
                      </div>
                      <p style={st("font-size:14.5px;line-height:1.75;margin-top:14px")}>
                        Beside Chaturshrungi Temple
                        <br />
                        Senapati Bapat Road
                        <br />
                        Pune 411016
                      </p>
                    </div>
                    <div>
                      <div style={st("font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:#96755C")}>
                        Hours
                      </div>
                      <p style={st("font-size:14.5px;line-height:1.75;margin-top:14px")}>
                        Mon – Thu 8:00 – 23:00
                        <br />
                        Fri – Sun 8:00 – 23:30
                        <br />
                        Kitchen until 22:30
                      </p>
                    </div>
                    <div>
                      <div style={st("font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:#96755C")}>
                        Contact
                      </div>
                      <p style={st("font-size:14.5px;line-height:1.75;margin-top:14px")}>
                        +91 98609 34080
                        <br />
                        hello@beanery.cafe
                        <br />
                        @beanery.pune
                      </p>
                    </div>
                    <div>
                      <div style={st("font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:#2E5D36")}>
                        Good to know
                      </div>
                      <p style={st("font-size:14.5px;line-height:1.75;margin-top:14px")}>
                        Walk-ins always welcome
                        <br />
                        Laptops until 5 PM
                        <br />
                        Street parking after 7
                      </p>
                    </div>
                  </div>
                  <div data-reveal="140" style={st("margin-top:60px;overflow:hidden;height:56vh;min-height:400px;background:#DFCBB9;position:relative")}>
                    <LocalityMap />
                    <div style={st("position:absolute;left:32px;bottom:32px;background:#FBF8F4;padding:20px 24px;pointer-events:none")}>
                      <div style={st("font-size:9.5px;letter-spacing:.2em;text-transform:uppercase;color:#A35730")}>
                        Nearest landmark
                      </div>
                      <div style={st("font-family:'Playfair Display',Georgia,serif;font-size:19px;margin-top:6px")}>
                        Chaturshrungi Temple · 200 m
                      </div>
                    </div>
                  </div>
                </div>
              </section>
              <section style={st("padding:120px 40px;background:#FBF8F4")}>
                <div style={st("max-width:1560px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:0;border:1px solid rgba(94,43,23,.16)")}>
                  <div data-reveal="0" style={st("padding:56px 48px;border-right:1px solid rgba(94,43,23,.16)")}>
                    <div style={st("font-size:10.5px;letter-spacing:.2em;text-transform:uppercase;color:#A35730;font-weight:500")}>
                      Reservations
                    </div>
                    <h2 style={st("font-family:'Playfair Display',Georgia,serif;font-weight:400;font-size:clamp(28px,3.2vw,44px);line-height:1.05;margin-top:16px")}>
                      Hold a table
                    </h2>
                    <p style={st("font-size:14.5px;line-height:1.8;color:#6E4A34;margin-top:16px;max-width:40ch")}>
                      We keep half the room for walk-ins. Book for anything from two to twelve; larger groups, call us and we'll arrange it properly.
                    </p>
                    <div style={st("display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-top:32px")}>
                      <div>
                        <div style={st("font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:#96755C;margin-bottom:9px")}>
                          Date
                        </div>
                        <div style={st("border:1px solid rgba(94,43,23,.22);padding:14px 16px;font-size:14px;color:#6E4A34")}>
                          14 September 2026
                        </div>
                      </div>
                      <div>
                        <div style={st("font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:#96755C;margin-bottom:9px")}>
                          Time
                        </div>
                        <div style={st("border:1px solid rgba(94,43,23,.22);padding:14px 16px;font-size:14px;color:#6E4A34")}>
                          4:30 PM
                        </div>
                      </div>
                      <div>
                        <div style={st("font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:#96755C;margin-bottom:9px")}>
                          Guests
                        </div>
                        <div style={st("border:1px solid rgba(94,43,23,.22);padding:14px 16px;font-size:14px;color:#6E4A34")}>
                          2
                        </div>
                      </div>
                      <div>
                        <div style={st("font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:#96755C;margin-bottom:9px")}>
                          Seating
                        </div>
                        <div style={st("border:1px solid rgba(94,43,23,.22);padding:14px 16px;font-size:14px;color:#6E4A34")}>
                          Window
                        </div>
                      </div>
                    </div>
                    <button className="hv2" onClick={openReserve} style={st("margin-top:28px;width:100%;text-align:left;font-size:11.5px;letter-spacing:.15em;text-transform:uppercase;font-weight:500;color:#FBF8F4;background:#5E2B17;border:none;padding:19px 26px;cursor:pointer;transition:background .35s ease")}>
                      Check availability
                    </button>
                  </div>
                  <div data-reveal="60" style={st("padding:56px 48px;background:#EFE3D8")}>
                    <div style={st("font-size:10.5px;letter-spacing:.2em;text-transform:uppercase;color:#A35730;font-weight:500")}>
                      Ordering
                    </div>
                    <h2 style={st("font-family:'Playfair Display',Georgia,serif;font-weight:400;font-size:clamp(28px,3.2vw,44px);line-height:1.05;margin-top:16px")}>
                      Take it with you
                    </h2>
                    <p style={st("font-size:14.5px;line-height:1.8;color:#6E4A34;margin-top:16px;max-width:40ch")}>
                      Beans, bread and the full menu for collection or delivery across Shivajinagar, Kothrud and Aundh.
                    </p>
                    <div style={st("margin-top:32px")}>
                      <div style={st("display:flex;justify-content:space-between;padding:16px 0;border-top:1px solid rgba(94,43,23,.16);font-size:14.5px")}>
                        <span>Collection</span>
                        <span style={st("color:#6E4A34")}>15 min, at the bar</span>
                      </div>
                      <div style={st("display:flex;justify-content:space-between;padding:16px 0;border-top:1px solid rgba(94,43,23,.16);font-size:14.5px")}>
                        <span>Delivery</span>
                        <span style={st("color:#6E4A34")}>Within 6 km</span>
                      </div>
                      <div style={st("display:flex;justify-content:space-between;padding:16px 0;border-top:1px solid rgba(94,43,23,.16);border-bottom:1px solid rgba(94,43,23,.16);font-size:14.5px")}>
                        <span>Beans by post</span>
                        <span style={st("color:#6E4A34")}>All India, roasted Tuesdays</span>
                      </div>
                    </div>
                    <div style={st("display:flex;gap:12px;margin-top:28px;flex-wrap:wrap")}>
                      <button className="hv2" style={st("font-size:11.5px;letter-spacing:.15em;text-transform:uppercase;font-weight:500;color:#FBF8F4;background:#5E2B17;border:none;padding:19px 30px;cursor:pointer;transition:background .35s ease")}>
                        Order Now
                      </button>
                      <a className="hv15" href="tel:+919860934080" style={st("font-size:11.5px;letter-spacing:.15em;text-transform:uppercase;font-weight:500;border:1px solid rgba(94,43,23,.3);padding:19px 30px;transition:all .3s ease")}>
                        Call the café
                      </a>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </>
        )}
      </div>
      <footer style={st("background:#5E2B17;color:#FBF8F4;padding:110px 40px 44px")}>
        <div style={st("max-width:1560px;margin:0 auto")}>
          <div style={st("display:grid;grid-template-columns:1.6fr 1fr 1fr 1fr;gap:48px;padding-bottom:56px;border-bottom:1px solid rgba(251,248,244,.2)")}>
            <div>
              <img src={logoLight} alt="Beanery — Café & Eatery" style={st("width:360px;max-width:100%;height:auto;display:block")} />
              <div style={st("font-size:9px;letter-spacing:.42em;color:rgba(251,248,244,.55);margin-top:16px;padding-left:.42em")}>
                PUNE, INDIA
              </div>
              <p style={st("font-family:'Cormorant Garamond',Georgia,serif;font-size:23px;line-height:1.5;font-style:italic;color:rgba(251,248,244,.8);margin-top:32px;max-width:26ch")}>
                European café culture, thoughtfully served — beside Chaturshrungi Temple since 2023.
              </p>
              <div style={st("margin-top:34px;padding-top:20px;border-top:1px solid rgba(251,248,244,.2);max-width:380px")}>
                <div style={st("font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:rgba(251,248,244,.5)")}>
                  Rooms
                </div>
                <div style={st("display:flex;gap:18px;flex-wrap:wrap;margin-top:14px;font-size:13.5px;color:rgba(251,248,244,.85)")}>
                  <span>Pune</span>
                  <span style={st("color:rgba(251,248,244,.4)")}>Mumbai — soon</span>
                  <span style={st("color:rgba(251,248,244,.4)")}>Bengaluru — soon</span>
                </div>
              </div>
              <div style={st("margin-top:30px;max-width:380px")}>
                <div style={st("font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:rgba(251,248,244,.5)")}>
                  The Beanery letter
                </div>
                <div style={st("display:flex;align-items:stretch;margin-top:14px;border:1px solid rgba(251,248,244,.28)")}>
                  <div style={st("flex:1;padding:14px 16px;font-size:13px;color:rgba(251,248,244,.45)")}>
                    your@email.com
                  </div>
                  <button className="hv3" style={st("background:#FBF8F4;color:#5E2B17;border:none;padding:0 20px;font-size:10px;letter-spacing:.16em;text-transform:uppercase;cursor:pointer;transition:background .3s ease")}>
                    Join
                  </button>
                </div>
                <div style={st("font-size:11.5px;color:rgba(251,248,244,.45);margin-top:10px")}>
                  Seasonal menus, new lots, and dates for the long table. Once a month.
                </div>
              </div>
            </div>
            <div>
              <div style={st("font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:rgba(251,248,244,.5)")}>
                Explore
              </div>
              <div style={st("display:flex;flex-direction:column;gap:12px;margin-top:20px;font-size:14px")}>
                <a className="hv17" href="#top" onClick={goStory} style={st("color:rgba(251,248,244,.85)")}>
                  Our Story
                </a>
                <a className="hv17" href="#top" onClick={goCoffee} style={st("color:rgba(251,248,244,.85)")}>
                  Coffee
                </a>
                <a className="hv17" href="#top" onClick={goFood} style={st("color:rgba(251,248,244,.85)")}>Food</a>
                <a className="hv17" href="#top" onClick={goExp} style={st("color:rgba(251,248,244,.85)")}>
                  Experiences
                </a>
                <a className="hv17" href="#top" onClick={goJournal} style={st("color:rgba(251,248,244,.85)")}>
                  Journal
                </a>
              </div>
            </div>
            <div>
              <div style={st("font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:rgba(251,248,244,.5)")}>
                Visit
              </div>
              <div style={st("font-size:14px;line-height:1.9;color:rgba(251,248,244,.85);margin-top:20px")}>
                Beside Chaturshrungi Temple
                <br />
                Senapati Bapat Road
                <br />
                Pune 411016
                <br />
                <br />
                Daily from 8:00
                <br />
                +91 98609 34080
              </div>
            </div>
            <div>
              <div style={st("font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:rgba(251,248,244,.5)")}>
                Follow
              </div>
              <div style={st("display:flex;flex-direction:column;gap:12px;margin-top:20px;font-size:14px")}>
                <a className="hv17" href="#top" style={st("color:rgba(251,248,244,.85)")}>Instagram</a>
                <a className="hv17" href="#top" style={st("color:rgba(251,248,244,.85)")}>Newsletter</a>
                <a className="hv17" href="#top" style={st("color:rgba(251,248,244,.85)")}>Careers</a>
                <a className="hv17" href="#top" style={st("color:rgba(251,248,244,.85)")}>Wholesale beans</a>
              </div>
              <button className="hv3" onClick={openReserve} style={st("margin-top:28px;font-size:11px;letter-spacing:.14em;text-transform:uppercase;font-weight:500;color:#5E2B17;background:#FBF8F4;border:none;padding:15px 24px;cursor:pointer;transition:all .3s ease")}>
                Reserve
              </button>
            </div>
          </div>
          <div style={st("display:flex;justify-content:space-between;gap:24px;flex-wrap:wrap;margin-top:26px;font-size:11px;letter-spacing:.1em;color:rgba(251,248,244,.45)")}>
            <span>© 2026 Beanery Café & Eatery</span>
            <span>Privacy · Terms · Accessibility</span>
          </div>
        </div>
      </footer>
      {reserveOpen && (
        <>
          <div data-overlay="reserve" style={st("position:fixed;inset:0;z-index:200;background:rgba(94,43,23,.62);display:flex;align-items:center;justify-content:center;padding:32px")} onClick={closeReserve}>
            <div
              style={st("background:#FBF8F4;max-width:620px;width:100%;padding:52px 48px;position:relative;max-height:calc(100vh - 64px);overflow-y:auto")}
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={closeReserve} aria-label="Close" style={st("position:absolute;top:20px;right:20px;background:transparent;border:none;font-size:20px;cursor:pointer;color:#96755C;line-height:1")}>
                ×
              </button>
              <ReservationForm onClose={closeReserve} />
            </div>
          </div>
        </>
      )}
      </>
    );
  }
}
