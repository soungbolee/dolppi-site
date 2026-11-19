import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'posts'>;

// 운영 빌드에서는 draft: true 글을 숨기고, 개발 서버(npm run dev)에서는 보여 줍니다.
export async function getPosts(): Promise<Post[]> {
  const all = await getCollection('posts', ({ data }) => import.meta.env.DEV || !data.draft);
  return all.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export const fmtDate = (d: Date) =>
  `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}.`;

// 한국어 기준 대략 분당 500자
export const readingMinutes = (body = '') => Math.max(1, Math.round(body.replace(/\s+/g, '').length / 500));
