import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'posts'>;

// 운영 빌드에서는 draft: true 글과 공개 시각(date)이 아직 오지 않은 글을 숨깁니다.
// 개발 서버(npm run dev)에서는 모두 보여 줍니다.
// 예약 공개: date 에 공개 시각을 적어 두면(예: 2026-11-21T09:00:00+09:00),
// 매주 토요일 09:00(KST) 자동 재배포 때 그 시각이 지난 글이 올라갑니다.
export async function getPosts(): Promise<Post[]> {
  const now = new Date();
  const all = await getCollection('posts', ({ data }) => import.meta.env.DEV || (!data.draft && data.date <= now));
  return all.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

// 빌드 서버는 UTC 이므로 한국 시간 기준으로 날짜를 표시합니다.
export const fmtDate = (d: Date) => {
  const k = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  return `${k.getUTCFullYear()}. ${k.getUTCMonth() + 1}. ${k.getUTCDate()}.`;
};

// 한국어 기준 대략 분당 500자
export const readingMinutes = (body = '') => Math.max(1, Math.round(body.replace(/\s+/g, '').length / 500));
