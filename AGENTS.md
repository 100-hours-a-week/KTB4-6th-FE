<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## 협업 및 답변 방식

- 사용자의 질문에는 한국어로 핵심부터 간결하게 답한다. 설명만 요청한 경우 코드를 수정하지 않는다.
- 코드 변경 내용을 설명할 때는 이번 요청에서 실제로 변경한 파일만 `#### 파일 경로` 제목과 짧은 글머리 기호로 요약한다.
- 검증 결과는 통과한 항목과 실행하지 못했거나 실패한 항목을 구분해 알린다.
- 커밋·푸시·PR 생성은 사용자가 각각 명시적으로 요청했을 때만 수행한다.
