# KTB4-6th-FE

## Sentry

브라우저, Next.js 서버, Edge Runtime의 오류와 성능 트레이스를 Sentry로 전송한다. DSN이
설정되지 않은 환경에서는 SDK가 비활성화된다.

런타임 및 빌드 환경에 다음 값을 설정한다.

```dotenv
NEXT_PUBLIC_SENTRY_DSN=
NEXT_PUBLIC_SENTRY_ENVIRONMENT=development
NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE=0.1
```

배포 빌드에서 원본 TypeScript 기준 스택 트레이스를 확인하려면 소스맵 업로드용 값도
설정해야 한다. `SENTRY_AUTH_TOKEN`은 로컬 파일이나 Docker build argument로 전달하지 않고
CI의 secret으로만 관리하며 `org:ci` 권한을 부여한다.

```dotenv
SENTRY_ORG=
SENTRY_PROJECT=
SENTRY_AUTH_TOKEN=
```

GitHub의 `staging`, `production` Environment에 다음 항목을 등록한다.

- Secrets: `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_AUTH_TOKEN`
- Variables: `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_TRACES_SAMPLE_RATE`(선택, 기본값 `0.1`)
