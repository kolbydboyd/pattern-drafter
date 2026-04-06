// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * Garment registry -- import and export all available garments.
 * Modules with a `variants` array are expanded into separate registry
 * entries so each variant gets its own catalog listing, pricing, and URL.
 */

import cargoShorts  from './cargo-shorts.js';
import gymShorts    from './gym-shorts.js';
import swimTrunks   from './swim-trunks.js';
import pleatedShorts from './pleated-shorts.js';
import straightJeans from './straight-jeans.js';
import baggyJeans    from './baggy-jeans.js';
import baggyShorts   from './baggy-shorts.js';
import chinos        from './chinos.js';
import workPants874  from './874-work-pants.js';
import pleatedTrousers from './pleated-trousers.js';
import sweatpants    from './sweatpants.js';
import tee           from './tee.js';
import campShirt     from './camp-shirt.js';
import buttonUp      from './button-up.js';
import crewneck      from './crewneck.js';
import hoodie        from './hoodie.js';
import cropJacket    from './crop-jacket.js';
import athleticFormalJacket from './athletic-formal-jacket.js';
import denimJacket   from './denim-jacket.js';
import cargoWorkPants from './cargo-work-pants.js';
import wideLegTrouserW   from './wide-leg-trouser-w.js';
import straightTrouserW  from './straight-trouser-w.js';
import easyPantW         from './easy-pant-w.js';
import buttonUpW         from './button-up-w.js';
import shellBlouseW      from './shell-blouse-w.js';
import fittedTeeW        from './fitted-tee-w.js';
import slipSkirtW        from './slip-skirt-w.js';
import aLineSkirtW       from './a-line-skirt-w.js';
import shirtDressW       from './shirt-dress-w.js';
import wrapDressW        from './wrap-dress-w.js';
import apron             from './apron.js';
import bowTie            from './bow-tie.js';
import tankTop           from './tank-top.js';
import circleSkirtW      from './circle-skirt-w.js';
import pencilSkirtW      from './pencil-skirt-w.js';
import leggings          from './leggings.js';
import athleticFormalTrousers from './athletic-formal-trousers.js';
import tshirtDressW          from './tshirt-dress-w.js';
import slipDressW            from './slip-dress-w.js';
import aLineDressW           from './a-line-dress-w.js';
import sundressW             from './sundress-w.js';
import toteBag             from './tote-bag.js';

const GARMENTS = {
  'cargo-shorts':         cargoShorts,
  'gym-shorts':           gymShorts,
  'swim-trunks':          swimTrunks,
  'pleated-shorts':       pleatedShorts,
  'straight-jeans':       straightJeans,
  'baggy-jeans':          baggyJeans,
  'baggy-shorts':         baggyShorts,
  'chinos':               chinos,
  '874-work-pants':       workPants874,
  'pleated-trousers':     pleatedTrousers,
  'sweatpants':           sweatpants,
  'tee':                  tee,
  'camp-shirt':           campShirt,
  'button-up':            buttonUp,
  'crewneck':             crewneck,
  'hoodie':               hoodie,
  'crop-jacket':          cropJacket,
  'athletic-formal-jacket': athleticFormalJacket,
  'denim-jacket':         denimJacket,
  'cargo-work-pants':   cargoWorkPants,
  'wide-leg-trouser-w':   wideLegTrouserW,
  'straight-trouser-w':   straightTrouserW,
  'easy-pant-w':          easyPantW,
  'button-up-w':          buttonUpW,
  'shell-blouse-w':       shellBlouseW,
  'fitted-tee-w':         fittedTeeW,
  'slip-skirt-w':         slipSkirtW,
  'a-line-skirt-w':       aLineSkirtW,
  'shirt-dress-w':        shirtDressW,
  'wrap-dress-w':         wrapDressW,
  'apron':                apron,
  'bow-tie':              bowTie,
  'tank-top':             tankTop,
  'circle-skirt-w':       circleSkirtW,
  'pencil-skirt-w':       pencilSkirtW,
  'leggings':             leggings,
  'athletic-formal-trousers': athleticFormalTrousers,
  'tshirt-dress-w':           tshirtDressW,
  'slip-dress-w':             slipDressW,
  'a-line-dress-w':           aLineDressW,
  'sundress-w':               sundressW,
  'tote-bag':               toteBag,
};

// ── Expand style variants into standalone registry entries ────────────────────
// A module with `variants: [{ id, name, defaults, fabrics }]` gets expanded so
// each variant is accessible by its own ID. Downstream code (pricing, routing,
// checkout, database) treats variant IDs as regular garment IDs.
for (const garment of Object.values({ ...GARMENTS })) {
  if (!garment.variants) continue;
  for (const v of garment.variants) {
    GARMENTS[v.id] = {
      ...garment,
      id: v.id,
      name: v.name,
      _baseId: garment.id,
      _variantDefaults: v.defaults,
      _variantFabrics: v.fabrics,
      variants: undefined,
    };
  }
}

export default GARMENTS;
