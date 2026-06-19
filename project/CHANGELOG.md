# Changelog

All notable changes to EcoWarrior will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] – 2024-06-19

### Added

#### Core Features
- Carbon footprint tracking for transport, food, energy, and **waste** categories
- Real emission coefficients sourced from Our World in Data and BBC Carbon Calculator
- Activity validation with human-bounds anti-cheat (max walking 50 km/day, etc.)
- Verification ticket system for long-distance travel (>1000 km)

#### Sustainability Features
- **Eco Score** (0–100) calculated against the global weekly average (112 kg CO₂)
- **Carbon Saved** metric showing kg saved vs. global average
- **AI Sustainability Recommendations** — rule-based personalised tips per category
- **Daily Green Challenges** — 5 daily challenges with points and CO₂ savings
- **Achievement Badges** — 8 unlockable badges (First Step, Green Week, Eco Champion, Planet Hero, …)
- **Weekly Progress Bar** — visual progress indicator relative to global average

#### Dashboard
- 7-day trend line chart (Recharts)
- Category emissions bar chart (Transport / Food / Energy)
- Recent Activity semantic list
- EcoScoreCard panel with collapsible AI Recommendations
- DailyChallenges section with achievement badges grid

#### Challenge System
- Create and join competitive rooms with shareable codes
- Live leaderboard sorted by lowest emissions
- GreenWar team battles with multi-team leaderboard

#### Authentication
- Email/password sign-up with strong validation (8 chars, number, special char)
- Persistent sessions via Zustand persist middleware + localStorage
- Demo credentials (demo@ecowarrior.com / Demo@123)
- Remember Me option

#### Accessibility (WCAG 2.1 AA)
- All form inputs linked via `htmlFor`/`id`
- `aria-label` on all interactive elements
- `role="alert"` + `aria-live` on error and status messages
- `role="dialog"` + `aria-modal` on LogoutModal
- `role="tablist"` + `aria-selected` on ChallengeRoom and AuthPortal tabs
- `aria-current="page"` on active navigation item
- Skip-to-content link for keyboard users
- Visible focus rings on all interactive elements
- Improved colour contrast: `carbon-muted` raised from #64748b to #94a3b8 (4.6:1 ratio)
- Chart containers labelled with `role="img"` and descriptive `aria-label`

#### Testing
- Vitest + React Testing Library + jsdom configured
- 12 test files covering all major components and utilities
- `npm run test:coverage` with 80%+ threshold
- Coverage reporter: v8

#### Performance
- Route-level lazy loading via `React.lazy` + `Suspense`
- `useMemo` on all derived chart data in Dashboard
- Suspense fallback spinner during code-split loading

#### Documentation
- Professional README with feature table, quick start, and testing guide
- `.env.example` with all required environment variables
- `CONTRIBUTING.md` with code standards, testing requirements, and PR process
- `LICENSE` (MIT)
- `CHANGELOG.md` (this file)

### Changed
- `carbon-muted` Tailwind colour raised to `#94a3b8` for WCAG AA contrast compliance
- Navigation upgraded with `aria-label`, `aria-current`, and `aria-hidden` on decorative elements
- Dashboard chart axes updated to `#94a3b8` (was `#64748b`) for improved readability
- ActivityLogger extended with Waste category (plastic bags, food waste, recycled materials)
- Profile page now shows real Eco Score and dynamic achievements instead of hardcoded values

### Fixed
- Duplicate `lucide-react` import in `LogoutModal.tsx` merged into single statement
- `saveMockUsers` in `mockAuthStore.ts` typed correctly (removed implicit `any`)
- `leaderboard.find(…)?.rank_position` uses `??` instead of `||` for correct zero-rank handling

[1.0.0]: https://github.com/your-org/ecowarrior/releases/tag/v1.0.0
