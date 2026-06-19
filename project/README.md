# EcoWarrior – Carbon Footprint Tracker 🌍

[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite)](https://vitejs.dev/)
[![Tests](https://img.shields.io/badge/Tests-Vitest-6E9F18?logo=vitest)](https://vitest.dev/)
[![License](https://img.shields.io/badge/License-MIT-green)](./LICENSE)

> **EcoWarrior** is a production-ready carbon footprint tracking web application that helps users monitor, reduce, and compete over their environmental impact. Track transport, food, energy, and waste emissions — then join team challenges to make sustainability a team sport.

---

## ✨ Features

| Category | Features |
|---|---|
| 🌱 **Carbon Tracking** | Log transport, food, energy & waste activities with real emission coefficients |
| 📊 **Eco Score** | Dynamic 0–100 score vs. the global weekly average (112 kg CO₂) |
| 💡 **AI Recommendations** | Rule-based personalised sustainability tips by category |
| 🎯 **Daily Challenges** | 5 daily green challenges with points and carbon savings |
| 🏆 **Achievement Badges** | 8 unlockable badges (First Step, Eco Champion, Planet Hero, …) |
| ⚔️ **Challenge Rooms** | Create or join competitive rooms with live leaderboards |
| 🌐 **GreenWar Teams** | Team-based competitions for largest carbon savings |
| 📈 **Analytics** | 7-day trend line chart, category bar chart, weekly progress bar |
| 🔒 **Auth** | Email/password sign-up with validation; persistent session via localStorage |

---

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript 5.5
- **Build**: Vite 5, PostCSS, Tailwind CSS 3
- **State**: Zustand 5 (with persist middleware)
- **Charts**: Recharts 3
- **Testing**: Vitest + React Testing Library + jsdom
- **Icons**: Lucide React

---

## 🚀 Quick Start

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9

### Installation

```bash
git clone https://github.com/your-org/ecowarrior.git
cd ecowarrior/project
npm install
```

### Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

See [.env.example](./.env.example) for all required variables.

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

**Demo credentials** (pre-seeded):
- Email: `demo@ecowarrior.com`
- Password: `Demo@123`

### Production Build

```bash
npm run build
npm run preview
```

---

## 🧪 Testing

```bash
# Run all tests in watch mode
npm run test

# Run all tests once
npm run test:run

# Run with coverage report (target ≥ 80%)
npm run test:coverage

# Interactive UI
npm run test:ui
```

Test files are in `src/test/` and cover:

| File | What's tested |
|---|---|
| `calculations.test.ts` | Carbon coefficients, validation, formatting |
| `ecoScore.test.ts` | Eco Score, Carbon Saved, AI Recommendations, Challenges, Badges |
| `mockAuthStore.test.ts` | Email/password validation |
| `mockData.test.ts` | Activity submission, room creation/joining, leaderboard |
| `AuthPortal.test.tsx` | Form rendering, validation, accessibility |
| `Dashboard.test.tsx` | Metrics, charts, recent activity |
| `ActivityLogger.test.tsx` | Category selection, preview, submission |
| `ChallengeRoom.test.tsx` | Join/Create forms, leaderboard |
| `Navigation.test.tsx` | Nav items, active state, view switching |
| `Profile.test.tsx` | Stats, achievements, sign-out flow |
| `LogoutModal.test.tsx` | Dialog accessibility, actions |

---

## ♿ Accessibility

EcoWarrior targets **WCAG 2.1 Level AA**:

- All form inputs have linked `<label>` elements
- Buttons have descriptive `aria-label` attributes
- Errors use `role="alert"` and `aria-live="assertive"`
- Charts have `role="img"` with descriptive `aria-label`
- Modal uses `role="dialog"` + `aria-modal="true"`
- Navigation uses `aria-current="page"` for the active tab
- Keyboard navigation supported everywhere with visible focus rings
- Skip-to-content link at the top of the page
- Colour contrast meets 4.5:1 minimum ratio

---

## 📁 Project Structure

```
project/
├── src/
│   ├── components/       # UI components
│   │   ├── AuthPortal.tsx
│   │   ├── Dashboard.tsx
│   │   ├── ActivityLogger.tsx
│   │   ├── ChallengeRoom.tsx
│   │   ├── DailyChallenges.tsx   # NEW
│   │   ├── EcoScoreCard.tsx      # NEW
│   │   ├── GreenWarJoinTeam.tsx
│   │   ├── LogoutModal.tsx
│   │   ├── Navigation.tsx
│   │   └── Profile.tsx
│   ├── lib/              # State, utilities, stores
│   │   ├── calculations.ts       # Carbon emission coefficients & validation
│   │   ├── ecoScore.ts           # NEW: Eco Score, AI recs, challenges, badges
│   │   ├── mockAuthStore.ts      # Auth state (Zustand + persist)
│   │   ├── mockData.ts           # Activity logs & challenge rooms
│   │   ├── mockGreenWarStore.ts  # Team battle state
│   │   ├── store.ts              # Supabase-connected store (for production)
│   │   └── supabase.ts           # Supabase client
│   ├── test/             # Vitest test files
│   └── main.tsx
├── public/
├── .env.example
├── CHANGELOG.md
├── CONTRIBUTING.md
├── LICENSE
└── package.json
```

---

## 🔐 Security

- Secrets are stored only in environment variables (`.env`, never committed)
- All user inputs are validated both client-side and at the store layer
- Authenticated routes are guarded — unauthenticated users see only the AuthPortal
- Passwords are never stored in state; only user metadata is persisted

---

## 🌍 Carbon Coefficients

| Activity | Coefficient |
|---|---|
| Car | 0.18 kg CO₂/km |
| Bus | 0.08 kg CO₂/km |
| Train | 0.041 kg CO₂/km |
| Airplane | 0.255 kg CO₂/km |
| Meat-heavy meal | 3.3 kg CO₂/meal |
| Vegan meal | 0.5 kg CO₂/meal |
| Electricity | 0.85 kg CO₂/kWh |
| Natural gas | 2.0 kg CO₂/kWh |

Sources: [Our World in Data](https://ourworldindata.org/travel-carbon-footprint), [BBC Carbon Calculator](https://www.bbc.co.uk/news/science-environment-56837908)

---

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development setup, PR guidelines, and coding standards.

---

## 📄 License

[MIT](./LICENSE) © 2024 EcoWarrior Team
