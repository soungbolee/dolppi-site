---
title: "BDC에서 밖으로 데이터를 보낼 때 — 리전, 경로, 비용 순서로 보기"
subtitle: "공유·복제·내장 세 갈래 길과, 같은 데이터도 설정 하나로 열 배 넘게 달라지는 비용"
description: "SAP BDC 데이터를 Snowflake·Databricks·BigQuery·Fabric 같은 외부 플랫폼으로 보낼 때 무엇을 먼저 봐야 하는지. 한국 리전, 공유·복제·내장 세 경로, 외부에서 쓸 수 있는 객체, 비용이 나가는 네 곳을 정리했습니다."
date: 2026-11-29T09:00:00+09:00
category: data-integration
tags: ["SAP", "BDC", "BDC Connect", "Datasphere", "Delta Sharing", "Replication Flow", "Premium Outbound Integration", "데이터 연계"]
draft: true
---
[지난 글](/posts/sap-odp-rfc-block-2026/)에서 SAP 데이터를 꺼내는 뒷문(ODP-RFC)이 연말에 닫히고, SAP가 권장하는 정문은 **BDC(Business Data Cloud)** 라고 적었습니다. 그 글을 보고 가장 많이 돌아온 질문이 이것입니다. "그럼 BDC에 올린 데이터를 우리 Snowflake(또는 Fabric, BigQuery)로는 어떻게 보내나요? 돈은 얼마나 드나요?"

정문으로 들어왔다고 끝이 아닙니다. BDC에서 **다시 밖으로 나가는 길**도 몇 갈래가 있고, 길마다 복사 여부·출시 상태·비용이 다릅니다. 이 글은 그 길을 **리전 → 경로 → 비용** 순서로 정리했습니다. 순서가 중요합니다. 앞 단계가 뒤 단계의 선택지를 좁히기 때문입니다.

> **2026년 11월 27일 현재 기준**의 정보입니다. 비용 숫자는 SAP의 사이징 가이드(SDG v10-2026, 2026-10)에 실린 **요율 예시로 계산한 것**이고, 실제 청구는 주문서·계약이 우선합니다. 플랫폼별 출시 일정은 자주 바뀌니 결정 전에는 SAP의 최신 문서나 서면 답변으로 확인하세요.

## 한 줄 요약

**BDC에서 밖으로 나가는 길은 공유(복사 없음)·복제(사본 생성)·내장(BDC 안에서 처리) 세 가지입니다.** 대부분의 플랫폼은 공유로 충분하고, 복제는 비용이 전송량에 비례해 커지니 꼭 필요할 때만 씁니다. 그리고 그 전에 **리전**부터 정해야 합니다.

## 1단계 — 리전부터: 한국 BDC는 AWS 서울 하나

SAP의 데이터센터 가용성 문서(2026-11-27 조회)를 보면, 국내에서 BDC를 쓸 수 있는 리전은 **AP12(AWS 서울)** 하나입니다. Datasphere, BDC Connect, SAP Databricks, SAP Snowflake 모두 AP12에서 제공됩니다. Azure와 Google Cloud에는 한국 리전 BDC가 없습니다.

| 하이퍼스케일러 | 아시아·태평양 BDC 리전 | 한국 |
|---|---|---|
| AWS | 시드니 · 싱가포르 · **서울(AP12)** · 도쿄 | 있음 |
| Azure | 시드니 · 싱가포르 · 도쿄 | 없음 |
| Google Cloud | 시드니 · 오사카 · 도쿄 · 뭄바이 | 없음 |

그래서 대상 플랫폼이 어디에 있느냐에 따라 상황이 갈립니다.

| BDC가 AWS 서울일 때 대상 위치 | 데이터 소재 | 전송 구간 | 판단 |
|---|---|---|---|
| 같은 클라우드 · 같은 리전 | 국내 | 리전 내 | 가장 단순. 법률 판단은 별도 |
| 다른 클라우드 · 국내 리전 | 국내 | 교차 클라우드 | 가능. 접근·위탁 구조는 법률 검토 |
| 같은 클라우드 · 국외 리전 | 국외 | 리전 간 | 국외 이전 검토가 먼저 |
| 다른 클라우드 · 국외 리전 | 국외 | 교차 + 국외 | 권하지 않음. 비용과 심의 부담이 함께 큼 |

알아 둘 점 세 가지입니다.

- **BDC Connect 앱 리전은 BDC 본체와 맞춰야 합니다.** Google Cloud의 BigQuery 연동 문서가 이렇게 안내합니다. 다른 플랫폼도 같은지는 각 문서로 확인해야 합니다.
- **교차 클라우드 캐싱은 기본으로 꺼져 있습니다.** 켜면 대상 리전에 원격 파일이 임시로 저장될 수 있으니, 저장 위치·보유 기간·접근 주체를 확인합니다.
- **국내 리전이라고 국외 이전 검토가 자동으로 면제되지는 않습니다.** 클라우드가 다르다는 사실만으로 이전이라고 단정할 수도 없습니다. 누가 어디서 접근하고 어디서 처리되는지를 보고 개인정보보호법 요건을 따로 검토합니다.

BDC 리전은 구독할 때 정해지고 나중에 바꾸기 어렵습니다. 대상 플랫폼의 리전까지 함께 정한 뒤에 다음 단계로 갑니다.

## 2단계 — 경로: 공유, 복제, 내장

**A. 공유 — BDC Connect.** Delta Sharing 기반의 **읽기 전용** 길입니다. 데이터를 복사하지 않고, 대상 플랫폼에서는 BDC의 데이터 프로덕트가 카탈로그처럼 보입니다. 다만 메타데이터 동기화 주기(0초 또는 300초 이상)만큼 변경 반영이 늦을 수 있습니다.

**B. 복제 — Replication Flow.** Datasphere가 오브젝트 스토리지(S3, ADLS Gen2 등)에 데이터를 실제로 적재하고, 대상 플랫폼이 그것을 읽습니다. 사본이 생기고 데이터가 실제로 나가므로 **POI(Premium Outbound Integration)** 과금이 붙습니다.

**C. 내장 — SAP Databricks · SAP Snowflake.** BDC 구독 안에서 처리하는 길입니다. 밖으로 나가는 전송은 줄지만 컴퓨트는 과금되고, 비SAP 데이터를 얼마나 함께 다룰 수 있는지는 서비스·계약별로 다릅니다. 예를 들어 SAP Databricks는 외부 데이터를 끌어오는 ETL 기능 상당 부분이 꺼져 있어서, 그게 필요하면 일반 Databricks를 써야 한다는 설명이 있었습니다.

플랫폼별로 보면 이렇습니다.

| 대상 플랫폼 | 공유(BDC Connect) 상태 | 공유가 안 될 때 대안 | 한국 관점 |
|---|---|---|---|
| Snowflake | 정식 제공 | — | SAP Snowflake도 AP12 제공 |
| Databricks | 정식 제공 | — | SAP Databricks도 AP12 제공 |
| Google BigQuery | 정식 제공 (2026-07) | — | BDC가 AWS라 교차 클라우드 |
| Microsoft Fabric | 정식 제공 지연 — 2027년 1분기 말로 미뤄졌다는 SAP 답변 있음 | Replication Flow → ADLS Gen2 → Fabric 미러링 | Azure 한국 리전 BDC가 없어 교차 불가피 |
| AWS (Redshift 등) | 계획, 일정 미정 | 3자 추출 도구 | 같은 클라우드·리전 구성 가능 |

Fabric은 특히 주의가 필요합니다. 2025년 11월 발표 때는 2026년 3분기 정식 제공 예정이었고, 2026년 5월 SAP 발표에서도 "하반기"로 적혀 있었지만, 10월 SAP Community 답변에서는 2027년 1분기 말로 미뤄졌다고 했습니다(공식 로드맵에는 아직 반영되지 않음). 그 사이 쓸 수 있는 Fabric의 "SAP 미러링(Datasphere 경유)"은 아직 프리뷰이고, 내부적으로 Replication Flow로 ADLS Gen2에 적재하는 방식이라 **POI가 전제**됩니다. 즉 Fabric은 지금 당장은 '공유'가 아니라 '복제' 비용 구조로 계산해야 합니다.

## 외부에서 쓸 수 있는 객체가 경로마다 다르다

길만 정한다고 끝나지 않습니다. Datasphere 안의 어떤 객체를 밖에서 쓸 수 있는지가 경로마다 다릅니다.

| Datasphere 객체 | 외부 도구(BI·AI·DW)에서 | 비고 |
|---|---|---|
| Analytic Model | **OData만** (ODBC/JDBC 불가) | 계산 측정값·변수까지 쓰려면 OData. 3-legged OAuth 도구에 한정, 사용자당 분당 약 300회 호출 |
| Perspective | 확인 필요 | SAP 문서 안에서도 설명이 엇갈림. 테넌트에서 직접 시험해 보고 설계 |
| View (Expose for Consumption) | OData + ODBC/JDBC | 외부 조회의 가장 단순한 길 |
| Local · Remote Table | 직접 조회 불가 | View로 감싸서 노출 |
| Analytical Dataset (구형) | 폐기 | Analytic Model로 전환 권고 |

여기서 두 가지를 짚어 둡니다.

- **SQL(ODBC/JDBC)로 읽으면 Analytic Model의 계산·의미가 그대로 오지 않을 수 있습니다.** 계층·변수·텍스트 지원을 객체별로 확인하고, 필요하면 View에 계산을 명시적으로 넣습니다.
- **OData는 분석 소비용이지 추출용이 아닙니다.** SAP BDC 약관 부속서(Supplement v7)는 OData API로 데이터를 추출하는 것을 금지합니다. 지난 글의 ODP-RFC와 같은 맥락입니다. 대량으로 꺼낼 거라면 공유나 복제로 갑니다.

데이터 프로덕트로 공유하는 경우에도, HANA의 관계형 View를 그대로 Delta Sharing할 수 있는지는 제품·객체별 제약이 있습니다. 물리화나 Transformation Flow가 필요한 구성이라면 그만큼 사본·저장·처리 비용이 늘어납니다.

## 3단계 — 비용: 돈이 나가는 네 곳

단가를 찾기 전에 **어디서 돈이 나가는지**부터 나눠야 계산이 됩니다.

1. **BDC 쪽 — POI·Connect 요율.** 복제로 내보내면 POI, 공유로 리전을 넘으면 Connect 전송 요율이 붙습니다. 구독 CU(Capacity Unit)에서 차감됩니다.
2. **전송 구간 — 클라우드 egress.** 누가 부담하는지는 계정 소유·서비스 구성·계약에 따라 다릅니다. POI와 중복 청구되는지 SAP 견적으로 확인합니다.
3. **대상 플랫폼 — 용량·크레딧.** Snowflake 크레딧, Databricks DBU, BigQuery 스캔량·슬롯, Fabric 용량.
4. **운영 — 숨은 비용.** 캐시 저장, 실패 재전송·재적재, 두 클라우드를 운영하는 인력.

SDG 예시 요율로 월 전송량별 BDC 쪽 비용(CU)을 계산해 보면 차이가 큽니다.

| 방식 | 과금 기준 (SDG 예시) | 월 20GB | 월 160GB | 월 1,000GB |
|---|---|---|---|---|
| 복제 (POI) | 20GB 블록 누적 구간 | 500 | 4,000 | 15,250 |
| 공유 (BDC Connect, 리전 간) | 0.185 CU/GB + 요청 0.055 CU/2,500건 | 3.7 | 29.6 | 185 |
| OpenSQL (ODBC/JDBC) | HANA 메모리 1GB당 월 1GB 전송 포함 | 0 | 0* | 0* |
| OData | 약관상 추출 금지 | — | — | — |
| 내장 (SAP Databricks 등) | 반출 없음, 처리량만 CU 차감 | 0 | 0 | 0 |

*OpenSQL의 0은 과금 항목이 없다는 뜻이 아니라 한도 안이라는 뜻입니다. 32GB 메모리 테넌트라면 월 32GB를 넘는 전송에 추가 요금이 붙을 수 있습니다. 공유는 같은 리전이면 요청분만 나오고, 일반 Snowflake 계정이면 공유 수수료가 따로 붙습니다.

월 1,000GB 기준으로 복제는 15,250 CU, 공유는 185 CU입니다. **같은 양을 옮겨도 길에 따라 80배 넘게 차이가 납니다.** 복제를 정기 전송 수단으로 쓰는 것을 권하지 않는 이유입니다.

## 설정 하나로 14배 — 비용이 새는 세 가지 패턴

**전건 반복 적재.** Replication Flow를 Initial만 걸고 Delta를 구성하지 않으면 매번 전체가 나갑니다. 30GB를 매일 내보내면 월 900GB, 45블록, **14,250 CU**입니다. Delta로 바꿔 하루 변경분이 1GB라면 월 30GB, 2블록, **1,000 CU**입니다. 설정 하나로 14배가 차이 납니다.

**교차 클라우드 반복 조회.** 캐싱은 기본으로 꺼져 있어서, 대시보드가 자주 새로고침되면 매번 리전을 넘어 데이터를 읽습니다. 캐시를 켜면 줄일 수 있지만 초기 적재·캐시 미스·변경분 전송은 남고, 대상 쪽 저장 비용과 보유 기간도 생깁니다.

**대상에서 거르는 필터.** 공용 공간에서 특정 법인 행만 필요한데 전체를 내보낸 뒤 대상 플랫폼에서 거르면, 쓰지도 않을 데이터의 전송료까지 냅니다.

줄이는 방법은 단순합니다.

1. Delta 적재를 기본으로, 전체 재적재는 예외로 둡니다.
2. 필요한 법인·기간만 원천(BDC)에서 걸러 보냅니다.
3. 반복 조회는 캐시 효과와 저장·보유 조건을 함께 봅니다.
4. 배치 주기와 대시보드 새로고침 빈도를 업무에 맞게 줄입니다.

## 정리 — 플랫폼별 판정

| 플랫폼 | 한국 리전 | 경로 | 판정 (2026-11-27 기준) |
|---|---|---|---|
| Snowflake | AP12 동일 가능 | 공유 정식 제공 | 양호 |
| Databricks | AP12 동일 가능 | 공유 정식 제공 | 양호 |
| BigQuery | 국내 리전 선택 가능 | 공유 정식 제공 | 양호 (교차 클라우드) |
| Fabric | Korea Central 선택 가능 | 프리뷰·복제, 공유는 2027 1분기 말로 연기 | 조건부 |
| AWS (Redshift 등) | AP12 동일 가능 | 공유 일정 미정 | 대기 |

출시 일정이나 가격은 확정된 사실처럼 전제하지 마세요. 이 표도 조회일 기준 스냅샷입니다.

## 검토 체크리스트

- [ ] BDC 리전과 대상 플랫폼 리전을 함께 정했는가
- [ ] 데이터 접근 주체·저장 위치를 기준으로 국외 이전 여부를 법률 검토했는가
- [ ] 대상 플랫폼의 BDC Connect 정식 제공 여부를 SAP 최신 문서나 서면으로 확인했는가
- [ ] 외부에서 쓸 객체가 그 경로로 소비 가능한지(OData만 되는 Analytic Model 등) 확인했는가
- [ ] OData를 추출 용도로 쓰고 있지 않은가
- [ ] 복제가 필요하다면 초기 적재량과 하루 변경량을 나눠 추정했는가
- [ ] Replication Flow에 Delta가 구성되어 있는가
- [ ] POI·Connect 요율, 클라우드 egress, 대상 플랫폼 비용을 따로 산정했는가
- [ ] 구독 CU 배정 한도와 초과 시 비용을 계약서로 확인했는가

---

**참고**

- SAP Help, Data Center Availability in SAP Business Data Cloud (2026-11-27 조회)
- Google Cloud, Set up cross-cloud connection for SAP Business Data Cloud (2026-11-19 갱신)
- Google Cloud, [SAP and Google Cloud launch BDC Connect for BigQuery](https://cloud.google.com/blog/products/sap-google-cloud/sap-and-google-cloud-launch-bdc-connect-for-bigquery/) (2026-07-27)
- SAP News, [SAP BDC and the Autonomous Enterprise](https://news.sap.com/2026/05/sap-bdc-accelerate-autonomous-enterprise/) (2026-05-13)
- SAP Help, [Premium Outbound Integration (SAP Datasphere)](https://help.sap.com/docs/SAP_DATASPHERE/c8a54ee704e94e15926551293243fd1d/4e9c6acb5d6a43fa9a6471837399e71c.html)
- SAP Business Data Cloud Sizing & Deployment Guide (SDG) v10-2026 (2026-10)
- SAP Business Data Cloud Supplement v7
- Microsoft Learn, Mirroring SAP (Preview)
- 함께 읽기: [SAP 데이터를 꺼내던 뒷문이 연말에 닫힙니다](/posts/sap-odp-rfc-block-2026/), [SAP BDC 데이터 프로덕트, 관리형으로 충분할까 직접 만들어야 할까?](https://blog.aspn.co.kr/bdc-data-products-managed-vs-custom)

---

*글쓴이 돌삐 — 데이터와 AI, 현장의 기록. 이 블로그의 글은 개인 의견이며 소속 회사의 공식 입장이 아닙니다.*
