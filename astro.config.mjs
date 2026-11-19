// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// 대표 주소. 돌삐.com은 등록기관에서 이 주소로 넘어가게 연결합니다.
export default defineConfig({
  site: 'https://dolppi.com',
  integrations: [sitemap()],
  trailingSlash: 'ignore',
});
