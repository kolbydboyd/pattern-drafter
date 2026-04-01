// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Blog / learn articles — hub that re-exports all section files.

import { ARTICLES_GETTING_STARTED } from './articles-getting-started.js';
import { ARTICLES_FIT }             from './articles-fit.js';
import { ARTICLES_FABRIC }          from './articles-fabric.js';
import { ARTICLES_GARMENTS }        from './articles-garments.js';
import { ARTICLES_COMMUNITY }       from './articles-community.js';
import { ARTICLES_VS }              from './articles-vs.js';

export const ARTICLES = [
  ...ARTICLES_GETTING_STARTED,
  ...ARTICLES_FIT,
  ...ARTICLES_FABRIC,
  ...ARTICLES_GARMENTS,
  ...ARTICLES_COMMUNITY,
  ...ARTICLES_VS,
];

export default ARTICLES;
