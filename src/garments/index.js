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

const GARMENTS = {
  'cargo-shorts':     cargoShorts,
  'gym-shorts':       gymShorts,
  'swim-trunks':      swimTrunks,
  'pleated-shorts':   pleatedShorts,
  'straight-jeans':   straightJeans,
  'chinos':           chinos,
  'pleated-trousers': pleatedTrousers,
  'sweatpants':       sweatpants,
  'tee':              tee,
};

export default GARMENTS;
