---
name: fe-workflow
description: Manage this repository's issue-to-PR workflow when asked to split commits, implement a planned unit, summarize changed files, or prepare a commit or PR. Do not use for a standalone code explanation.
---

# FE 작업 흐름

요청된 단계만 수행한다. 이슈·브랜치·커밋·PR의 범위는 `CONTRIBUTING.md`를 기준으로 판단한다.

1. 작업 전 현재 브랜치, Git 상태, 관련 diff와 사용자 제공 이슈 범위를 확인한다. 다른 작업의 변경 파일을 섞지 않는다.
2. 커밋 단위를 물으면 독립적으로 설명·검증·되돌리기 가능한 최소 단위와 구현 순서를 제안한다. 파일 종류만으로 UI와 로직을 억지로 분리하지 않는다.
3. 상위 이슈·서브 이슈 내용을 제안할 때는 `## 목적`, `## 작업 내용` 두 섹션으로만 작성한다. 목적은 해당 이슈가 달성하려는 바를 한두 문장으로 쓰고, 작업 내용은 글머리 기호를 사용해 간단히 나열한다.
4. 구현은 사용자가 요청한 단위만 진행한다. 커밋·푸시·PR 생성은 각각 별도 요청이 있을 때만 실행한다.
5. 코드 변경 후 관련 검사를 실행하고 결과를 구분해 보고한다. 이 저장소의 기본 검사는 `pnpm typecheck`, `pnpm lint`, 포맷 검사이며, 빌드는 실행 가능한 환경에서 확인한다.
6. 이번 요청에서 실제 변경한 파일별로 `#### 파일 경로` 제목 아래 핵심 작업을 짧은 글머리 기호로 요약한다. 이전 작업이나 미변경 파일을 이번 변경으로 소개하지 않는다.
7. 요청받으면 변경 의도를 나타내는 커밋 메시지와 `dev` 대상 PR 제목·본문을 간단히 제안한다. 미완료 작업은 완료된 것처럼 쓰지 않는다.
