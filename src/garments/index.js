// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * Garment registry — import and export all available garments.
 */

import cargoShorts  from './cargo-shorts.js';
import gymShorts    from './gym-shorts.js';
import swimTrunks   from './swim-trunks.js';
import pleatedShorts from './pleated-shorts.js';
import straightJeans from './straight-jeans.js';
import chinos        from './chinos.js';
import pleatedTrousers from './pleated-trousers.js';
import sweatpants    from './sweatpants.js';
import tee           from './tee.js';
import campShirt     from './camp-shirt.js';
import crewneck      from './crewneck.js';
import hoodie        from './hoodie.js';
import cropJacket    from './crop-jacket.js';
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

const GARMENTS = {
  'cargo-shorts':         cargoShorts,
  'gym-shorts':           gymShorts,
  'swim-trunks':          swimTrunks,
  'pleated-shorts':       pleatedShorts,
  'straight-jeans':       straightJeans,
  'chinos':               chinos,
  'pleated-trousers':     pleatedTrousers,
  'sweatpants':           sweatpants,
  'tee':                  tee,
  'camp-shirt':           campShirt,
  'crewneck':             crewneck,
  'hoodie':               hoodie,
  'crop-jacket':          cropJacket,
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
};

export default GARMENTS;
