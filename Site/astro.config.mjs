import { defineConfig } from 'astro/config';
import remarkGithubAlert from 'remark-github-blockquote-alert';
import remarkWorkshopLinks from './plugins/remark-workshop-links.mjs';

const BASE = '/Global-AI-Construct-2026/';
const GITHUB_BASE = 'https://github.com/Pune-Tech-Community/Global-AI-Construct-2026/';

export default defineConfig({
  site: 'https://pune-tech-community.github.io',
  base: BASE,
  trailingSlash: 'always',
  markdown: {
    remarkPlugins: [
      [remarkWorkshopLinks, { base: BASE, githubBase: GITHUB_BASE }],
      remarkGithubAlert,
    ],
    shikiConfig: {
      theme: 'github-light',
      langAlias: { mermaid: 'text' },
    },
  },
});
