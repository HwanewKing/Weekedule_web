📅 Weekedule (위케줄)
Weekedule은 개인의 주간 일정을 관리하고, 친구나 그룹(방) 단위로 일정을 공유하여 겹치는 시간을 쉽게 확인할 수 있는 웹 서비스입니다.

🔗 서비스 바로가기: www.weekedule.com

✨ 주요 기능
1. 주간 일정 관리 (Weekly Timetable)
드래그 앤 드롭 일정 추가:
주간 그리드 상에서 직관적으로 일정을 추가하고 관리할 수 있습니다.

카테고리 설정:
일정별로 색상과 카테고리를 지정하여 가독성을 높입니다.

실시간 상태 관리:
Zustand를 사용하여 페이지 전환 없이 부드러운 일정 편집 경험을 제공합니다.

2. 그룹 공유 및 방(Room) 기능
방 생성 및 초대:
친구들을 초대하여 전용 방을 만들고 일정을 공유할 수 있습니다.

일정 중첩 분석 (Schedule Overlap):
방 멤버들 간의 일정을 비교하여 모두가 비어 있는 시간이나 겹치는 시간을 시각적으로 분석해 줍니다.

참여 확인:
방 멤버들의 일정 확정 상태를 관리할 수 있습니다.

3. 소셜 기능
친구 시스템:
사용자를 검색하고 친구 요청을 보내 일정을 공유할 대상 관리가 가능합니다.

알림 서비스:
초대, 친구 요청 등의 주요 이벤트를 실시간 알림으로 확인합니다.

4. 사용자 편의성
다크 모드 지원:
사용자 설정에 맞는 테마(Light/Dark)를 제공합니다.

반응형 디자인:
다양한 디바이스 환경에 최적화된 레이아웃을 제공합니다.

🛠 기술 스택
Frontend
Framework: Next.js 15 (App Router)

Library: React 19

Language: TypeScript

Styling: Tailwind CSS v4

State Management: Zustand

Backend & Database
ORM: Prisma

Database: PostgreSQL

Auth: JWT (Jose) 기반 자체 인증 시스템

Infrastructure
Container: Docker

Deployment: Railway (Nixpacks)

graph LR
    %% 사용자 및 도메인
    User((사용자))
    Squarespace{Squarespace<br/>DNS/Domain}

    %% 클라이언트 사이드
    subgraph Client ["Client (Frontend)"]
        UI["Next.js UI<br/>(React 19 / Tailwind v4)"]
        Zustand["Client State<br/>(Zustand)"]
    end

    %% 어플리케이션 서버 (Railway)
    subgraph Railway ["Application Server (Railway Hosting)"]
        NextServer["Next.js App Router<br/>(Node.js Runtime)"]
        Auth["Auth Service<br/>(Jose JWT)"]
        Prisma["Data Access Layer<br/>(Prisma ORM)"]
    end

    %% 데이터베이스 (Supabase)
    subgraph Supabase ["Database (Supabase)"]
        Postgres[(PostgreSQL)]
        Schema["Data Tables<br/>(User, Room, Event)"]
    end

    %% 데이터 흐름 연결
    User -- "www.weekedule.com" --> Squarespace
    Squarespace -- "Traffic Proxy" --> UI
    UI <--> Zustand
    UI -- "API Requests" --> NextServer
    NextServer -- "Token Verification" --> Auth
    NextServer -- "ORM Query" --> Prisma
    Prisma -- "TCP/SSL Connection" --> Postgres
    Postgres --- Schema

    %% 스타일링
    style User fill:#fff,stroke:#333
    style Squarespace fill:#f8f9fa,stroke:#333,stroke-dasharray: 5 5
    style Client fill:#e7f3ff,stroke:#007bff,stroke-width:2px
    style Railway fill:#fff0f0,stroke:#e91e63,stroke-width:2px
    style Supabase fill:#f0fff4,stroke:#3ecf8e,stroke-width:2px