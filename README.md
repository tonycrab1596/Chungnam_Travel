# 충남 촌캉스 랜덤 여행 배포 안내

이 프로젝트는 백엔드 없이 동작하는 Vite + React 정적 웹 앱입니다.
`public/data/chungnam_village_data_chungnam_only.csv` 파일이 빌드 결과물에 포함되므로, Vercel, Netlify, Cloudflare Pages 같은 정적 호스팅에 올리면 외부 링크로 공유할 수 있습니다.

## 배포 전에 확인할 것

- `.env` 파일은 저장소에 올리지 마세요. 현재 앱 화면은 CSV를 직접 읽기 때문에 배포용 API 키가 필요하지 않습니다.
- 데이터 출처와 이용 조건은 충남데이터포털 올담의 공공누리 조건에 맞춰 표기하는 것이 좋습니다.
- 전화번호, 주소, 홈페이지 링크는 공공데이터 기반이지만 운영 서비스로 공개하기 전 최신성 확인이 필요합니다.

## 로컬 빌드 확인

```bash
pnpm install
pnpm build
pnpm preview
```

## HTML 파일처럼 공유할 수 있나요?

`index.html` 파일 하나만 단독으로 보내는 방식은 권장하지 않습니다.
이 앱은 React 자바스크립트, CSS, Leaflet 지도 리소스, CSV 데이터 파일을 함께 읽기 때문에 `dist/index.html`만 따로 보내면 화면이 깨지거나 CSV 로딩이 막힐 수 있습니다.

대신 아래처럼 빌드된 `dist` 폴더 전체를 공유하거나 업로드하세요.

```bash
pnpm build
```

생성되는 구조는 대략 아래와 같습니다.

```text
dist/
  index.html
  assets/
  data/
```

공유 방법은 세 가지가 있습니다.

1. Netlify Drop에 `dist` 폴더를 끌어다 놓기
2. Vercel/Netlify/GitHub Pages에 `dist` 결과물을 배포하기
3. `dist` 폴더를 압축해서 전달하고, 받는 사람이 간단한 정적 서버로 열기

더블클릭으로 `index.html`을 여는 방식은 브라우저가 로컬 CSV 읽기를 막을 수 있어 안정적이지 않습니다.

같은 와이파이 안에서 잠깐 공유하려면 아래 명령을 사용할 수 있습니다.
다만 컴퓨터가 켜져 있어야 하고, 외부 인터넷 공유용은 아닙니다.

```bash
pnpm dev:lan
```

## Vercel 배포

1. GitHub에 이 폴더를 새 저장소로 올립니다.
2. Vercel에서 `Add New Project`를 누르고 해당 GitHub 저장소를 선택합니다.
3. Framework Preset은 `Vite`로 두면 됩니다.
4. Build Command는 `pnpm build`, Output Directory는 `dist`입니다.
5. Deploy를 누르면 공유 가능한 HTTPS URL이 생성됩니다.

이 저장소에는 `vercel.json`이 들어 있어서 새로고침 fallback과 CSV 캐시 설정이 자동 적용됩니다.

## Netlify 배포

1. GitHub에 이 폴더를 새 저장소로 올립니다.
2. Netlify에서 `Add new site`를 선택하고 저장소를 연결합니다.
3. Build command는 `pnpm build`, Publish directory는 `dist`입니다.
4. Deploy를 누르면 공유 가능한 HTTPS URL이 생성됩니다.

이 저장소에는 `netlify.toml`이 들어 있어서 새로고침 fallback과 CSV 캐시 설정이 자동 적용됩니다.

## 상용 서비스로 키울 때 추천 작업

- 도메인 연결: 예를 들어 `chonchance.kr` 같은 도메인을 Vercel/Netlify에 연결합니다.
- 출처 표기 강화: 하단 푸터에 데이터 출처, 기준일자, 문의처를 표시합니다.
- 운영 데이터 관리: CSV를 수동 교체하지 않고 주기적으로 갱신하는 자동화 작업을 둡니다.
- 사용성 개선: 방문 통계, 공유 카드, 모바일 홈 화면 추가, 추천 결과 공유 기능을 붙입니다.
- 법적/운영 확인: 공공데이터 이용 조건, 상표명, 문의 전화 노출 범위를 확인합니다.

## GitHub Pages로 배포하기

이 저장소에는 `.github/workflows/deploy-pages.yml` 파일이 포함되어 있습니다.
GitHub 저장소에 코드를 올리면 GitHub Actions가 `pnpm build`를 실행하고, 빌드된 `dist` 폴더를 GitHub Pages에 배포합니다.

배포 URL은 보통 아래 형태입니다.

```text
https://깃허브아이디.github.io/저장소이름/
```

GitHub 저장소 생성 후 `Settings > Pages`에서 `Build and deployment`의 Source가 `GitHub Actions`로 되어 있는지 확인하세요.
