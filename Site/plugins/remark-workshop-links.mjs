import { visit } from 'unist-util-visit';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const REPO_ROOT = path.resolve(fileURLToPath(import.meta.url), '../../..');
const LABS = ['lab01-single-agent', 'lab02-multi-agent'];

function isExternal(url) {
  return /^(https?:|mailto:|tel:|#)/.test(url);
}

function labDirFor(absPath) {
  return LABS.find((l) => absPath.startsWith(path.join(REPO_ROOT, l) + path.sep)) ?? null;
}

export default function remarkWorkshopLinks({ base, githubBase }) {
  return (tree, file) => {
    const currentPath = file.path ?? file.history?.[0];
    if (!currentPath) return;
    const currentDir = path.dirname(currentPath);

    visit(tree, ['link', 'image'], (node) => {
      const [rawPath, anchor] = node.url.split('#');
      if (isExternal(node.url) || rawPath === '') return;

      const absTarget = path.resolve(currentDir, rawPath);
      const hash = anchor ? `#${anchor}` : '';

      const labDir = labDirFor(absTarget);
      const labSlug = labDir?.slice(0, 5); // "lab01" | "lab02"
      const relFromLab = labDir ? path.relative(path.join(REPO_ROOT, labDir), absTarget) : null;

      // Lab root README → lab overview page.
      if (relFromLab === 'README.md') {
        node.url = `${base}${labSlug}/`;
        return;
      }

      // Lab docs README (superseded module index) → lab overview page.
      if (relFromLab === path.join('docs', 'README.md')) {
        node.url = `${base}${labSlug}/`;
        return;
      }

      // A numbered module doc → its rendered route.
      const moduleMatch = relFromLab?.match(/^docs[/\\]([0-9]{2}-[^/\\]+)\.md$/);
      if (moduleMatch) {
        node.url = `${base}${labSlug}/${moduleMatch[1]}/${hash}`;
        return;
      }

      // An image under a lab's docs/images/ folder → the symlinked public path.
      const imageMatch = relFromLab?.match(/^docs[/\\]images[/\\](.+)$/);
      if (imageMatch && node.type === 'image') {
        node.url = `${base}${labSlug}-images/${imageMatch[1]}`;
        return;
      }

      // "Workshop Home" — several docs link to a root README that doesn't exist in the repo
      // (and the relative path depth is inconsistent across files), so treat any dangling
      // relative link to a README.md as the home-page alias rather than resolving it on disk.
      if (path.basename(absTarget) === 'README.md' && !fs.existsSync(absTarget)) {
        node.url = base;
        return;
      }

      // Anything else that resolves to a real file/dir in the repo → link out to GitHub.
      if (fs.existsSync(absTarget)) {
        const relFromRoot = path.relative(REPO_ROOT, absTarget).split(path.sep).join('/');
        const kind = fs.statSync(absTarget).isDirectory() ? 'tree' : 'blob';
        node.url = `${githubBase}${kind}/master/${relFromRoot}`;
        node.data = {
          ...node.data,
          hProperties: { ...node.data?.hProperties, target: '_blank', rel: 'noopener noreferrer' },
        };
      }
    });
  };
}
