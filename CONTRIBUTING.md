# Contributing

## 코드 컨벤션

### TypeScript

- `strict` 모드를 활성화하고 관련 옵션을 전체 적용한다.
- `any` 타입은 불가피한 경우에만 사용한다.
- `@typescript-eslint/no-explicit-any`는 `warn`으로 설정한다.

### 컴포넌트

- 컴포넌트 선언은 화살표 함수와 `const` 방식으로 통일한다.
- Props 타입은 `interface`로 선언한다.

### 부수효과(`useEffect`) 분리 원칙

- `useEffect`가 포함된 로직은 기본적으로 커스텀 훅으로 분리한다.
- 훅 이름을 명확하게 정의하기 어렵고 컴포넌트 로직과 강하게 결합된 경우에는 분리하지
  않는다.
- `useEffect`가 없는 단순 이벤트 핸들러는 컴포넌트 내부에 작성할 수 있다.

### 네이밍

| 대상               | 규칙                                                  |
| ------------------ | ----------------------------------------------------- |
| 컴포넌트           | `PascalCase`                                          |
| 훅                 | `use` + `camelCase`                                   |
| 변수, 함수         | `camelCase`                                           |
| 상수               | 전역/설정값은 `UPPER_SNAKE_CASE`, 그 외는 `camelCase` |
| boolean            | `is` / `has` / `can` / `should` 접두사 사용           |
| 내부 이벤트 핸들러 | `handleX`                                             |
| Props 이벤트 콜백  | `onX`                                                 |
| 배열               | 복수형                                                |

### 파일 및 폴더명

- 컴포넌트 파일은 `PascalCase`를 사용한다.
- 컴포넌트 파일명은 컴포넌트명과 동일하게 작성한다.
- 슬라이스 및 세그먼트 폴더명은 `kebab-case`를 사용한다.

## Lint 및 포맷팅 규칙

### Prettier

| 옵션             | 값       |
| ---------------- | -------- |
| `semi`           | `true`   |
| `singleQuote`    | `true`   |
| `printWidth`     | `100`    |
| `tabWidth`       | `2`      |
| `bracketSpacing` | `true`   |
| `arrowParens`    | `always` |

### ESLint

- 기본 설정은 `eslint-config-next/core-web-vitals`를 사용한다.
- TypeScript 설정은 `eslint-config-next/typescript`를 사용한다.
- `@typescript-eslint/no-explicit-any`는 `warn`으로 설정한다.
- import 순서는 `import/order` 규칙으로 자동 정렬한다.
- 레이어 간 import 규칙은 `eslint-plugin-boundaries`로 검증한다.

### 검사 명령어

```bash
pnpm format
pnpm format:check
pnpm lint
pnpm typecheck
```

### pre-commit

- `git commit` 시 Husky가 `lint-staged`를 실행한다.
- 스테이징된 TypeScript 및 JavaScript 파일은 ESLint 자동 수정 후 Prettier를 실행한다.
- 스테이징된 JSON, CSS, Markdown 파일은 Prettier를 실행한다.
- 전체 typecheck, 테스트, build는 pre-commit에서 실행하지 않는다.

## Git 브랜치 전략

### 기본 브랜치

| 브랜치 | 설명                                                     |
| ------ | -------------------------------------------------------- |
| `main` | 배포 가능한 안정 버전만 유지                             |
| `dev`  | 작업 브랜치가 모이는 통합 브랜치이며 배포 전에 통합 확인 |

### 작업 브랜치 네이밍

| 브랜치 타입 | 네이밍 패턴         |
| ----------- | ------------------- |
| `feature`   | `feature/이슈번호`  |
| `fix`       | `fix/이슈번호`      |
| `refactor`  | `refactor/이슈번호` |

## 커밋 메시지

커밋 메시지는 `type: 작업 내용` 형식으로 작성한다.

```text
feat: 로그인 화면 구현
```

| 커밋 유형  | 설명                               | 대응 이슈 라벨       |
| ---------- | ---------------------------------- | -------------------- |
| `feat`     | 새로운 기능 추가                   | 기능구현             |
| `fix`      | 버그 수정                          | 버그수정             |
| `docs`     | 문서 작업                          | 문서화               |
| `style`    | 마크업, CSS 등 스타일 수정         | 스타일               |
| `refactor` | 동작 변화 없이 코드 구조 개선      | 리팩토링             |
| `test`     | 테스트 코드 작성 및 수정           | 테스트               |
| `chore`    | 환경설정, 의존성 관리 등 기타 작업 | 환경설정, 의존성관리 |
| `perf`     | 성능 개선                          | 성능개선             |

## Pull Request

- 작업 브랜치는 `dev` 브랜치를 대상으로 Pull Request를 생성한다.
- 관련 이슈를 연결한다.
- 변경 내용을 간단하게 요약한다.
- 실행한 테스트와 검사 결과를 작성한다.
- UI가 변경된 경우 캡처를 첨부한다.
- 환경변수가 변경된 경우 변경 여부와 필요한 변수 이름을 작성한다.
