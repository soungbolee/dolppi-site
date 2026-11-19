# 돌삐 (dolppi.com)

데이터와 AI, 현장의 기록 — Astro 정적 사이트, GitHub Pages 배포.

## 글 쓰기
`src/content/posts/` 에 마크다운 파일을 추가합니다. 파일 이름이 주소가 됩니다
(`claude-sap-data-analysis-1.md` → `dolppi.com/posts/claude-sap-data-analysis-1/`).

```yaml
---
title: "글 제목"
subtitle: "부제"
description: "검색 결과에 보일 설명 (160자 이내)"
date: 2026-11-20
category: ai-agent   # snowflake | data-integration | ai-agent | knowledge-graph | platform-bi | governance | work-trends
tags: ["클로드", "SAP"]
series: "시리즈 이름"   # 선택
seriesOrder: 1          # 선택
cover: /img/표지.png    # 선택 (링크 미리보기 이미지)
draft: true             # true면 사이트에 올라가지 않음
---
```
이미지는 `public/img/` 에 넣고 본문에서 `![설명](/img/파일.png)` 으로 씁니다.

## 회사 연재 요약
`src/content/company/` — 제목·요약·원문 링크만 둡니다 (본문은 옮기지 않음).

## 사이트 설정
문구, 링크드인·이메일, 네이버·구글 소유 확인 코드: `src/data/site.ts`

## 로컬에서 보기
```
npm install
npm run dev      # http://localhost:4321 (초안 포함)
npm run build    # dist/ 에 결과물 (초안 제외)
```

## 배포
1. GitHub 저장소 soungbolee/dolppi-site (main 브랜치)
2. 저장소 Settings › Pages › Source: **GitHub Actions**
3. Settings › Pages › Custom domain: `dolppi.com` (public/CNAME 파일이 이미 있음), Enforce HTTPS 켜기
4. 도메인 등록기관 DNS: `dolppi.com` A 레코드 4개(185.199.108.153 / .109.153 / .110.153 / .111.153), `www` CNAME → `<GitHub 아이디>.github.io`
5. 돌삐.com 은 등록기관의 URL 포워딩으로 https://dolppi.com 에 연결
