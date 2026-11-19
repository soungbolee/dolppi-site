import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { CATEGORIES } from './data/site';

const slugs = CATEGORIES.map((c) => c.slug) as [string, ...string[]];

// 돌삐 글 — src/content/posts/*.md
const posts = defineCollection({
  loader: glob({ base: './src/content/posts', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    description: z.string().max(160),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    category: z.enum(slugs),
    tags: z.array(z.string()).default([]),
    series: z.string().optional(),
    seriesOrder: z.number().optional(),
    cover: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

// 회사 블로그 연재 요약 — 원문 링크만 겁니다 (중복 콘텐츠 방지)
const company = defineCollection({
  loader: glob({ base: './src/content/company', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    layer: z.string(),
    summary: z.string(),
    url: z.string().url(),
    category: z.enum(slugs),
    order: z.number(),
  }),
});

export const collections = { posts, company };
