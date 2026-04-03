// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Shared constants for blog articles — keeps garment count, year, etc. dynamic.

import GARMENTS from '../garments/index.js';

export const GARMENT_COUNT = Object.keys(GARMENTS).length;
export const CURRENT_YEAR  = new Date().getFullYear();
export const LAUNCH_DATE   = 'March 20, 2026';
export const LAUNCH_YEAR   = 2026;
