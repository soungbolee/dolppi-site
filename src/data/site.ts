// 사이트 전체 설정 — 문구·연락처는 여기 한 곳에서 고칩니다.
export const SITE = {
  name: '돌삐',
  tagline: '데이터와 AI, 현장의 기록',
  url: 'https://dolppi.com',
  description:
    'SAP와 Snowflake로 데이터를 연결하고, 지식그래프로 관계를 잇고, 클로드·Joule 같은 AI 에이전트를 붙여 보며 직접 겪고 확인한 것을 기록합니다.',
  author: '돌삐',
  linkedin: '', // 예: https://www.linkedin.com/in/...
  email: '', // 개인 이메일
  // 네이버 서치어드바이저·구글 서치콘솔 소유 확인 코드 (발급받으면 입력)
  naverVerification: '',
  googleVerification: '',
};

export const CATEGORIES = [
  { slug: 'snowflake', name: 'Snowflake 실전', desc: 'Cortex AI, 비용 관리, 직접 써 본 기능들' },
  { slug: 'data-integration', name: '데이터 연결·통합', badge: '이슈 해결기', desc: 'SAP–Snowflake 연동, BDC·Datasphere, 연결에서 막힌 지점과 해결' },
  { slug: 'ai-agent', name: 'AI 에이전트·LLM 활용', desc: '클로드·제미나이·Joule, MCP로 업무 데이터에 AI 붙이기' },
  { slug: 'knowledge-graph', name: '지식그래프·온톨로지', desc: '관계로 묻고 답하기, 시맨틱 레이어 설계' },
  { slug: 'platform-bi', name: '데이터 플랫폼 · 분석·BI', desc: 'BDC·Databricks·Fabric 비교, SAC·Power BI·경영계획' },
  { slug: 'governance', name: '품질·보안·거버넌스', desc: '정합성 진단, 권한, 마스킹, 감사' },
  { slug: 'work-trends', name: 'AI로 일하는 법 · 트렌드', desc: '업무 자동화, 발표 해설, 회고' },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]['slug'];
export const categoryName = (slug: string) => CATEGORIES.find((c) => c.slug === slug)?.name ?? slug;
