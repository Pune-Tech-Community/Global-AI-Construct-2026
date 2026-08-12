import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

const lab01Modules = defineCollection({
  loader: glob({ pattern: '[0-9][0-9]-*.md', base: '../lab01-single-agent/docs' }),
});

const lab02Modules = defineCollection({
  loader: glob({ pattern: '[0-9][0-9]-*.md', base: '../lab02-multi-agent/docs' }),
});

const labOverviews = defineCollection({
  loader: glob({ pattern: '*/README.md', base: '..' }),
});

export const collections = { lab01Modules, lab02Modules, labOverviews };
