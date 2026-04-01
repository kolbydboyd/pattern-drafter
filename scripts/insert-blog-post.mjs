#!/usr/bin/env node
// Reads an Anthropic API response JSON file and appends the blog post to articles.js.
// Usage: node scripts/insert-blog-post.mjs <response.json>

import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const ARTICLES_PATH = resolve(import.meta.dirname, '..', 'src', 'content', 'articles.js');

function extractArticle(apiResponse) {
  // The Anthropic API response has content[0].text containing the JSON article object
  const text = apiResponse.content?.[0]?.text;
  if (!text) throw new Error('No text content found in API response');

  // The model returns a JSON block (possibly wrapped in ```json fences)
  const cleaned = text.replace(/^```json\s*/m, '').replace(/\s*```$/m, '').trim();
  const article = JSON.parse(cleaned);

  // Validate required fields
  const required = ['slug', 'title', 'description', 'category', 'body'];
  for (const field of required) {
    if (!article[field]) throw new Error(`Missing required field: ${field}`);
  }

  return {
    slug:          article.slug,
    title:         article.title,
    description:   article.description,
    category:      article.category,
    youtubeId:     article.youtubeId ?? null,
    datePublished: article.datePublished ?? new Date().toISOString().slice(0, 10),
    body:          article.body,
  };
}

function escapeForTemplate(str) {
  // Escape backticks and ${} inside template literals
  return str.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
}

function buildArticleSource(article) {
  const lines = [
    '  {',
    `    slug:        '${article.slug.replace(/'/g, "\\'")}',`,
    `    title:       '${article.title.replace(/'/g, "\\'")}',`,
    `    description: '${article.description.replace(/'/g, "\\'")}',`,
    `    category:    '${article.category.replace(/'/g, "\\'")}',`,
    `    youtubeId:   ${article.youtubeId ? `'${article.youtubeId}'` : 'null'},`,
    `    datePublished: '${article.datePublished}',`,
    `    body: \``,
    escapeForTemplate(article.body),
    '`,',
    '  },',
  ];
  return lines.join('\n');
}

function insertArticle(articleSource) {
  const src = readFileSync(ARTICLES_PATH, 'utf-8');

  // Find the closing ]; of the ARTICLES array
  const closingIndex = src.lastIndexOf('];');
  if (closingIndex === -1) throw new Error('Could not find closing ]; in articles.js');

  const before = src.slice(0, closingIndex);
  const after  = src.slice(closingIndex);

  const updated = before + '\n' + articleSource + '\n' + after;
  writeFileSync(ARTICLES_PATH, updated, 'utf-8');
}

// --- main ---
const responseFile = process.argv[2];
if (!responseFile) {
  console.error('Usage: node scripts/insert-blog-post.mjs <response.json>');
  process.exit(1);
}

try {
  const raw = readFileSync(resolve(responseFile), 'utf-8');
  const apiResponse = JSON.parse(raw);
  const article = extractArticle(apiResponse);
  const source = buildArticleSource(article);
  insertArticle(source);
  console.log(`Inserted article: ${article.slug}`);
} catch (err) {
  console.error('Failed to insert blog post:', err.message);
  process.exit(1);
}
