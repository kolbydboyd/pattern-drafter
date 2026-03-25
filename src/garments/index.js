/**
 * Garment registry.
 * Import and register each garment module here.
 * The UI reads this to populate the garment selector.
 */

// Lower body
// import cargoShorts from './cargo-shorts.js';
// import gymShorts from './gym-shorts.js';
// import swimTrunks from './swim-trunks.js';
// import pleatedShorts from './pleated-shorts.js';
// import straightJeans from './straight-jeans.js';
// import chinos from './chinos.js';
// import pleatedTrousers from './pleated-trousers.js';
// import sweatpants from './sweatpants.js';

// Upper body
// import tee from './tee.js';
// import campShirt from './camp-shirt.js';
// import crewneck from './crewneck.js';
// import hoodie from './hoodie.js';
// import cropJacket from './crop-jacket.js';

// Skirts & dresses
// import aLineSkirt from './a-line-skirt.js';
// import pencilSkirt from './pencil-skirt.js';
// import pleatedSkirt from './pleated-skirt.js';
// import shiftDress from './shift-dress.js';

const GARMENTS = {
  // Uncomment as modules are built:
  // 'cargo-shorts': cargoShorts,
  // 'gym-shorts': gymShorts,
  // ...
};

export default GARMENTS;

/**
 * Get garments grouped by category for the UI
 */
export function getGarmentsByCategory() {
  const categories = {
    'Shorts': [],
    'Pants': [],
    'Skirts': [],
    'Tops': [],
    'Outerwear': [],
    'Dresses': [],
  };

  for (const garment of Object.values(GARMENTS)) {
    const cat = {
      lower: garment.id.includes('short') || garment.id.includes('trunk') ? 'Shorts' : 'Pants',
      upper: garment.id.includes('jacket') ? 'Outerwear' : 'Tops',
      skirt: 'Skirts',
      dress: 'Dresses',
    }[garment.category] || 'Other';

    categories[cat].push(garment);
  }

  return categories;
}
