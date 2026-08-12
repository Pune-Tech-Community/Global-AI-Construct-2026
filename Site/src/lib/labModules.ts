import { getCollection, render, type CollectionEntry } from 'astro:content';

type ModuleCollection = 'lab01Modules' | 'lab02Modules';

export async function getSortedModules(collection: ModuleCollection) {
  const entries = await getCollection(collection);
  entries.sort((a, b) => a.id.localeCompare(b.id));
  return entries;
}

export async function getModulePage(entry: CollectionEntry<ModuleCollection>) {
  const { Content, headings } = await render(entry);
  const h1 = headings.find((h) => h.depth === 1);
  const title = h1?.text ?? entry.id;
  return { Content, title };
}

export function slugFor(entry: CollectionEntry<ModuleCollection>) {
  return entry.id.replace(/\.md$/, '');
}

export interface RailModule {
  slug: string;
  num: string;
  title: string;
}

export async function getModulesWithTitles(collection: ModuleCollection): Promise<RailModule[]> {
  const entries = await getSortedModules(collection);
  return Promise.all(
    entries.map(async (entry) => {
      const { title } = await getModulePage(entry);
      const slug = slugFor(entry);
      return { slug, num: slug.slice(0, 2), title };
    }),
  );
}
