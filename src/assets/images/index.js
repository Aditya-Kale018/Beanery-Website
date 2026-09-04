// Photography for the design's image slots, keyed by slot id. Every id used
// in App.jsx has an image here, so no slot falls back to the placeholder.
//
// `s` / `x` / `y` are the slot's crop: scale, plus an x/y pan expressed in
// percentages of the frame box. These are all default (fill the frame, centred);
// nudge x or y on an individual slot if a shot wants reframing.

import img_bakery_1 from './bakery-1.webp';
import img_bean_col from './bean-col.webp';
import img_bean_eth from './bean-eth.webp';
import img_bean_ind from './bean-ind.webp';
import img_bean_ken from './bean-ken.webp';
import img_bev_hero from './bev-hero.webp';
import img_brew_ap from './brew-ap.webp';
import img_brew_cb from './brew-cb.webp';
import img_brew_esp from './brew-esp.webp';
import img_brew_fp from './brew-fp.webp';
import img_brew_po from './brew-po.webp';
import img_btb_1 from './btb-1.webp';
import img_btb_2 from './btb-2.webp';
import img_btb_3 from './btb-3.webp';
import img_btb_4 from './btb-4.webp';
import img_coffee_hero from './coffee-hero.webp';
import img_dessert_1 from './dessert-1.webp';
import img_dish_1 from './dish-1.webp';
import img_dish_2 from './dish-2.webp';
import img_dish_3 from './dish-3.webp';
import img_dishstory_1 from './dishstory-1.webp';
import img_exp_1 from './exp-1.webp';
import img_exp_2 from './exp-2.webp';
import img_exp_3 from './exp-3.webp';
import img_exp_4 from './exp-4.webp';
import img_exp_banner from './exp-banner.webp';
import img_feat_coffee from './feat-coffee.webp';
import img_food_hero_1 from './food-hero-1.webp';
import img_food_hero_2 from './food-hero-2.webp';
import img_hero_grid_1 from './hero-grid-1.webp';
import img_hero_grid_2 from './hero-grid-2.webp';
import img_hero_grid_3 from './hero-grid-3.webp';
import img_ig_1 from './ig-1.webp';
import img_ig_2 from './ig-2.webp';
import img_ig_3 from './ig-3.webp';
import img_ig_4 from './ig-4.webp';
import img_ig_5 from './ig-5.webp';
import img_ig_6 from './ig-6.webp';
import img_j_1 from './j-1.webp';
import img_j_2 from './j-2.webp';
import img_j_3 from './j-3.webp';
import img_journal_lead from './journal-lead.webp';
import img_pair_cortado from './pair-cortado.webp';
import img_pair_espresso from './pair-espresso.webp';
import img_pair_guji from './pair-guji.webp';
import img_pair_kenya from './pair-kenya.webp';
import img_pair_lychee from './pair-lychee.webp';
import img_part_afternoon from './part-afternoon.webp';
import img_part_evening from './part-evening.webp';
import img_part_morning from './part-morning.webp';
import img_people_1 from './people-1.webp';
import img_people_2 from './people-2.webp';
import img_people_3 from './people-3.webp';
import img_phil_coffee from './phil-coffee.webp';
import img_phil_food from './phil-food.webp';
import img_sig_1 from './sig-1.webp';
import img_sig_2 from './sig-2.webp';
import img_sig_3 from './sig-3.webp';
import img_sig_4 from './sig-4.webp';
import img_sig_5 from './sig-5.webp';
import img_sig_6 from './sig-6.webp';
import img_story_1 from './story-1.webp';
import img_story_hero from './story-hero.webp';
import img_story_preview from './story-preview.webp';

const at = (src, x = 0, y = 0, s = 1) => ({ src, s, x, y });

export const SLOTS = {
  'bakery-1': at(img_bakery_1),
  'bean-col': at(img_bean_col),
  'bean-eth': at(img_bean_eth),
  'bean-ind': at(img_bean_ind),
  'bean-ken': at(img_bean_ken),
  'bev-hero': at(img_bev_hero),
  'brew-ap': at(img_brew_ap),
  'brew-cb': at(img_brew_cb),
  'brew-esp': at(img_brew_esp),
  'brew-fp': at(img_brew_fp),
  'brew-po': at(img_brew_po),
  'btb-1': at(img_btb_1),
  'btb-2': at(img_btb_2),
  'btb-3': at(img_btb_3),
  'btb-4': at(img_btb_4),
  'coffee-hero': at(img_coffee_hero),
  'dessert-1': at(img_dessert_1),
  'dish-1': at(img_dish_1),
  'dish-2': at(img_dish_2),
  'dish-3': at(img_dish_3),
  'dishstory-1': at(img_dishstory_1),
  'exp-1': at(img_exp_1),
  'exp-2': at(img_exp_2),
  'exp-3': at(img_exp_3),
  'exp-4': at(img_exp_4),
  'exp-banner': at(img_exp_banner),
  'feat-coffee': at(img_feat_coffee),
  'food-hero-1': at(img_food_hero_1),
  'food-hero-2': at(img_food_hero_2),
  'hero-grid-1': at(img_hero_grid_1),
  'hero-grid-2': at(img_hero_grid_2),
  'hero-grid-3': at(img_hero_grid_3),
  'ig-1': at(img_ig_1),
  'ig-2': at(img_ig_2),
  'ig-3': at(img_ig_3),
  'ig-4': at(img_ig_4),
  'ig-5': at(img_ig_5),
  'ig-6': at(img_ig_6),
  'j-1': at(img_j_1),
  'j-2': at(img_j_2),
  'j-3': at(img_j_3),
  'journal-lead': at(img_journal_lead),
  'pair-cortado': at(img_pair_cortado),
  'pair-espresso': at(img_pair_espresso),
  'pair-guji': at(img_pair_guji),
  'pair-kenya': at(img_pair_kenya),
  'pair-lychee': at(img_pair_lychee),
  'part-afternoon': at(img_part_afternoon),
  'part-evening': at(img_part_evening),
  'part-morning': at(img_part_morning),
  'people-1': at(img_people_1),
  'people-2': at(img_people_2),
  'people-3': at(img_people_3),
  'phil-coffee': at(img_phil_coffee),
  'phil-food': at(img_phil_food),
  'sig-1': at(img_sig_1),
  'sig-2': at(img_sig_2),
  'sig-3': at(img_sig_3),
  'sig-4': at(img_sig_4),
  'sig-5': at(img_sig_5),
  'sig-6': at(img_sig_6),
  'story-1': at(img_story_1),
  'story-hero': at(img_story_hero),
  'story-preview': at(img_story_preview),
};
