---
title: "SAP 데이터를 꺼내던 뒷문이 연말에 닫힙니다 — ODP-RFC 차단과 AI 시대의 데이터 통로"
subtitle: "무엇이 막히고 무엇은 괜찮은지, 우리 회사는 어느 길로 가야 하는지"
description: "SAP가 외부 도구의 ODP-RFC 사용을 막고 임시 허용도 2026년 말에 끝납니다. 무엇이 막히는지, 데이터를 옮기는 네 가지 길, 플랫폼별 경로, ERP 버전별 선택과 AI 연동 시 API Policy까지 쉽게 정리했습니다."
date: 2026-11-22T09:00:00+09:00
category: data-integration
tags: ["SAP", "ODP", "ODP-RFC", "SAP Note 3255746", "SAP API Policy", "BDC", "데이터 추출", "AI 데이터 분석"]
cover: /img/o01-1_sap_data_four_paths.png
draft: false
---
"90일 넘은 매출채권이 많은 거래처가 어디지?" 이런 질문을 AI에게 하든, 대시보드로 보든 먼저 해야 할 일이 있습니다. SAP 안에 있는 데이터를 분석·AI 플랫폼으로 **옮기는 것**입니다.

그런데 그 옮기는 길 가운데 많은 회사가 써 온 길 하나가 올해 말 닫힙니다. 최근 제조·화학·식품 유통 쪽 몇 곳의 SAP 데이터를 AI와 분석에 쓰는 방안을 정리하면서, 같은 질문을 여러 번 받았습니다. "우리 추출 도구도 막히나요?" "그럼 어디로 가야 하나요?" 이 글은 그 답을 비전문가도 읽을 수 있게 정리한 것입니다.

> **2026년 11월 21일 현재 기준**의 정보입니다. 인용한 문서의 버전은 SAP API Policy v.4.2026a, SAP Note 3255746 v12·3731818 v4, KBA 3089374 v8입니다. 이후 문서가 개정되거나 일정이 바뀌면 내용이 달라질 수 있으니, 적용 전에는 최신 버전을 확인하세요.

## 한 줄 요약

**문제는 'ODP'가 아니라 '외부에서 RFC로 ODP를 부르는 것'입니다.** 같은 ODP라도 SAP BDC(Datasphere)나 ODP OData 같은 공식 창구로 쓰면 괜찮습니다. 막히는 길은 하나이고, 대신 쓸 수 있는 길은 여럿입니다.

## ODP-RFC가 뭐길래

두 단어로 나누면 쉽습니다.

- **ODP** — SAP 안에서 회계·영업 같은 업무 데이터를 묶어 내보내고, *지난번 이후 바뀐 것만* 기억해 주는 반출 창구입니다. 원래 SAP 제품끼리 쓰려고 만든 내부 창구입니다.
- **RFC** — SAP 시스템끼리 서로의 기능을 직접 불러 쓰는 통신 방식입니다. SAP 전용 내선 전화라고 생각하면 됩니다.

**ODP-RFC**는 이 내선 전화로 반출 창구를 직접 부르는 방식입니다. 바뀐 것만 받을 수 있어 편리하다 보니, Microsoft ADF·Fabric의 SAP CDC 커넥터, Qlik, Informatica, Talend, Fivetran 같은 여러 추출 도구의 ODP 기능이 이 길로 데이터를 가져와 왔습니다. (제품·버전마다 쓰는 방식이 다르니 정확한 것은 공급사에 확인해야 합니다.)

비유하면 이렇습니다. 도서관의 **사서 전용 반출 시스템**을 외부 업체들이 **사서 내선 번호**로 이용해 왔는데, 도서관(SAP)이 "외부는 쓰지 말라"며 그 번호를 막기 시작한 것입니다.

## 왜 하필 ODP-RFC만 막히나

1. **원래 내부용이었습니다.** SAP는 Note 3255746에서 "ODP-RFC는 SAP 애플리케이션 사이의 데이터 전송 전용이며, 고객·3자 애플리케이션의 사용은 금지"라고 못 박았습니다. 온프레미스·Private Cloud의 ECC, S/4HANA, BW가 사실상 모두 해당됩니다.
2. **보안 패치로 실제로 막힙니다.** 2026년 6월 Patch Day에 나온 보안 노트 3748819를 넣으면, 허용된 구독자 유형이 아닌 호출은 거부됩니다. 미리 내 시스템을 점검하는 도구(Note 3439624)도 나와 있습니다.
3. **임시 허용은 연말까지입니다.** 패치 후 갑자기 멈추는 것을 막으려고 SAP가 한시 예외(Note 3731818, 리포트 `RODPS_REPL_SECUREACCESS_OPTOUT`)를 줬지만, **2026년 말에 만료**됩니다. 그 뒤에는 예외 없이 적용하는 노트가 나온다고 예고되어 있습니다.

이 예외는 시간을 버는 수단이지, ODP-RFC를 써도 된다는 허락이 아닙니다. 지금 ODP-RFC로 데이터를 받고 있다면 **2027년부터 쓸 길을 이번 달에 정해야** 합니다.

## 다른 방법은 괜찮을까

| 방법 | 쉽게 말하면 | 유의점 |
|---|---|---|
| DB 직접 복제 | 창고 바닥을 통째로 복사 | 런타임 DB 라이선스라면 계약상 제한 |
| 테이블 직접 읽기 (RFC_READ_TABLE 등) | 선반을 직접 뒤짐 | SAP가 3자 사용 미지원·보안 위험을 명시 (KBA 3089374) |
| BAPI·IDoc | 건별 전표 연동 | 거래 연계용, 대량 추출에는 맞지 않음 |
| 엑셀 다운로드 | 화면에서 내려받기 | 소량·수작업용 |

이 방법들도 뒤에서 볼 API Policy의 제한을 받습니다. 다만 **패치 한 번에 실제로 멈추는 길은 ODP-RFC뿐**입니다.

## 데이터를 옮기는 네 가지 길

![SAP 데이터를 분석·AI 플랫폼으로 옮기는 네 가지 길](/img/o01-1_sap_data_four_paths.png)
*SAP 데이터를 분석·AI 플랫폼으로 옮기는 네 가지 길*

SAP ERP를 **창고**, 분석 플랫폼을 **사무실**로 보면 이렇습니다.

- **① 뒷문 — ODP-RFC 커넥터.** 지금 가장 많이 쓰지만 SAP가 잠그는 중입니다.
- **② 정문 — SAP BDC(Datasphere) 경유.** SAP가 권장하는 길입니다. 계층·통화 같은 업무 의미를 살려 넘기고, S/4HANA로 바꾼 뒤에도 그대로 씁니다. 대신 구독 비용이 듭니다.
- **③ 허가 창구 — ODP OData API.** SAP가 대안으로 이름을 적은 길이고, 지금으로선 막을 계획이 없다고 밝혔습니다. 다만 SAP_BW 7.50 이상이 필요해서 **ECC EhP7 이하는 업그레이드가 먼저**입니다. S/4HANA는 조건을 충족합니다.
- **④ 직접 낸 출입구 — 자체 개발 ABAP 인터페이스.** SAP 금지 대상이 아니고 추가 라이선스도 없습니다. 대신 개발·운영 책임이 우리에게 있고, SAP 권고대로 **용도별로 테이블과 조건을 고정한 조회**로 만들어야 합니다. 아무 테이블이나 읽는 범용 도구를 만들면 테이블 직접 읽기와 같은 문제가 됩니다.

## 플랫폼별로 보면 — 플랫폼보다 통로

"우리는 Fabric인데요", "Snowflake인데요"라는 질문을 많이 받는데, 리스크를 가르는 것은 플랫폼이 아니라 **통로**입니다. ODP-RFC 커넥터, 테이블 읽기 커넥터는 어느 플랫폼에서 쓰든 같은 규정이 적용됩니다.

| 플랫폼 | 공유 — BDC Connect (데이터 복사 없음) | 플랫폼이 당겨가기 | SAP가 밀어주기 |
|---|---|---|---|
| Microsoft Fabric | 발표됨, 정식 제공 공지 대기 (2025-11 발표 당시 2026년 3분기 예정) | Datasphere 경유 미러링 | ABAP SDK for Azure |
| Snowflake | 정식 제공 | 3자 도구 활용 | — |
| Databricks | 정식 제공 (SAP Databricks는 BDC에 내장) | 3자 도구 활용 | — |
| Google BigQuery | 정식 제공 (2026-07) | BigQuery Connector for SAP (SLT 기반) | ABAP SDK for Google Cloud |
| AWS | 계획, 일정 미정 | AppFlow SAP OData 커넥터 (ECC는 SAP_BW 7.50·Gateway 필요) | AWS SDK for SAP ABAP |

공유 방식은 SAP가 가장 밀어주는 방향이지만 **BDC 구독이 전제**입니다. ECC 데이터는 Datasphere에서 커스텀 데이터 프로덕트로 만든 뒤 공유합니다.

## 우리 회사는 어느 길로 — 상황별 1순위

| 상황 | 1순위 | 함께 볼 것 |
|---|---|---|
| S/4HANA (온프레미스·RISE) | ODP OData·공개 API (비용 최소) 또는 BDC (SAP 관리형 데이터 프로덕트·AI) | 실시간 테이블 복제가 필요하면 SLT |
| ECC EhP8 (BW 7.50 이상) | ODP OData | 중장기 기반은 BDC |
| ECC EhP7 이하 | BDC 또는 자체 개발 | Data Services(BODS)가 있으면 ODP를 정식으로 쓸 수 있음 |
| 예산 최소·빠른 PoC | 자체 개발 (배치) | 업무 영역을 좁게 시작 |
| S/4HANA 전환 예정 | BDC | 전환 후에도 모델 재사용 |

## AI를 붙일 때 — API Policy가 진짜 쟁점

ODP-RFC는 "데이터를 어떻게 꺼내느냐"의 문제입니다. AI까지 생각하면 더 큰 쟁점이 하나 있습니다. SAP가 2026년 4월 개정한 **API Policy**의 2.2.2항입니다.

> SAP가 명시적으로 승인한 아키텍처·데이터 서비스·경로를 통하지 않으면, (a) API 호출을 스스로 계획·선택·실행하는 (반)자율·생성형 AI 시스템과의 연동, (b) 스크래핑이나 체계적·대규모 추출·복제를 위한 API 사용을 금지한다. (요약 번역)

AI 에이전트가 SAP API를 직접 이리저리 부르는 구성은 이 조항에 걸릴 수 있다는 뜻입니다. 3항은 프록시·게이트웨이·커스텀 코드 같은 **우회도 금지**합니다. 다만 "SAP가 승인한 경로"가 정확히 어디까지인지는 아직 문서로 다 정리되지 않았습니다. 지금까지 SAP가 예로 든 것은 Joule 같은 SAP 에이전트, SAP Integration Suite를 거치는 MCP, 추출용 BDC 정도입니다. 고객 계약과 무엇이 우선하는지도 정책에 적혀 있지 않습니다.

그래서 현장에서 제가 권하는 원칙은 **"배치로 내보내고, AI는 사본을 보게 하라"**입니다. AI가 운영 ERP를 직접 두드리지 않고, 승인된 길로 옮겨 둔 분석용 사본을 조회하게 하면 규정 리스크도, 운영 시스템 부하도 함께 줄어듭니다.

## 막히지 않게 쓰는 5원칙

1. **통로는 SAP 제품·공개 API·자체 ABAP만** 씁니다.
2. **배치로 내보내고 AI는 사본을** 조회하게 합니다.
3. **대량 복제는 SAP가 승인한 경로**(BDC·SLT)로 합니다.
4. **자체 개발은 용도별 고정 조회로** 만듭니다. 범용 테이블 읽기는 만들지 않습니다.
5. **계약·라이선스는 SAP에 서면으로** 확인합니다.

## 이번 달에 할 일 체크리스트

- [ ] 우리 회사 추출 도구·커넥터가 ODP-RFC를 쓰는지 공급사에 확인했는가
- [ ] Note 3439624 점검 도구로 실제 ODP-RFC 호출을 찾아봤는가
- [ ] 보안 노트 3748819를 넣었는지, 임시 예외 리포트를 돌렸는지 확인했는가
- [ ] 2027년 1월부터 쓸 대안 경로(BDC·ODP OData·자체 개발 등)를 정했는가
- [ ] AI 연동 구성이 API Policy 2.2.2에 걸리지 않는지 SAP 담당자에게 서면으로 물었는가

이 블로그에서는 다음 주부터 **클로드로 SAP 데이터를 분석하는 연재**를 시작합니다. 테스트 환경에서 직접 붙여 본 기록이고, 운영 환경에 적용할 때는 이 글의 API Policy 이야기를 함께 고려해야 합니다.

---

**참고**

- SAP, [SAP API Policy (latest)](https://help.sap.com/doc/sap-api-policy/latest/en-US/API_Policy_latest.pdf) (v.4.2026a, 2026-11-21 확인)
- SAP Note 3255746 v12 (2026-06-09) · 3731818 v4 (2026-07-27) · 3748819 · 3439624, KBA 3089374 v8 (2025-07-09) — SAP for Me에서 확인 (로그인 필요)
- ASUG, [SAP API Policy Overview: API Availability, Agentic AI Architectures, and Impacts on Existing Integrations](https://www.asug.com/insights/sap-api-policy-overview-api-availability-agentic-ai-architectures-and-impacts-on-existing-integrations) (2026-07-05)
- SAPinsider, [SAP Note 3255746: The June 2026 ODP-RFC Deadline Explained](https://sapinsider.org/blogs/sap-note-3255746-odp-rfc-deadline-2026/) (2026-07-02)
- Google Cloud, [SAP and Google Cloud launch BDC Connect for BigQuery](https://cloud.google.com/blog/products/sap-google-cloud/sap-and-google-cloud-launch-bdc-connect-for-bigquery/) (2026-07-27)
- SAP News, [SAP Business Data Cloud Connect for Microsoft Fabric](https://news.sap.com/2025/11/sap-bdc-connect-for-microsoft-fabric-business-insights-ai-innovation/) (2025-11)
- 함께 읽기: [SAP 데이터를 Snowflake와 연결하는 방법들](https://blog.aspn.co.kr/sap-snowflake-integration), [SAP BDC 데이터 프로덕트, 관리형으로 충분할까 직접 만들어야 할까?](https://blog.aspn.co.kr/bdc-data-products-managed-vs-custom)

---

*글쓴이 돌삐 — 데이터와 AI, 현장의 기록. 이 블로그의 글은 개인 의견이며 소속 회사의 공식 입장이 아닙니다.*
