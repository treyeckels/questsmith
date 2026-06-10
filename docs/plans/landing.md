Plan (before changes)
Files to create
Path Purpose
src/features/landing/LandingPage.tsx
Main landing page with all sections
src/features/landing/LandingPage.css
Fantasy-themed responsive styles
src/features/landing/landingConfig.ts
Static copy, screenshots, features
src/features/landing/components/LandingSection.tsx
Reusable section wrapper
src/features/landing/components/LandingCard.tsx
"How It Works" cards
src/features/landing/components/GameplayPreview.tsx
Combat/inventory UI previews
src/shared/components/LandingRoute.tsx
Public route with auth redirect
src/shared/hooks/usePlayNow.ts
Play Now navigation + analytics
public/assets/landing/\*.png
Character creation & campaign screenshots
Files to modify
src/app/routes.tsx — wire / to LandingRoute instead of RootRedirect
src/features/analytics/analyticsService.ts — add landing_page_viewed and play_now_clicked
Routing
/ — Public landing page for visitors; authenticated users redirect via getPostAuthPath() (game, character creation, etc.)
Play Now — /login for guests; authenticated users go straight into the game
Sign In — /login
View Screenshots — smooth scroll to #gameplay-screenshots
Analytics
landing_page_viewed — fired once on LandingPage mount via useEffect
play_now_clicked — fired from usePlayNow() before navigation (hero + CTA buttons)
Implementation
The Public Website epic is implemented.

Landing page sections
Hero — QuestSmith branding, tagline, description, Play Now / View Screenshots CTAs
How It Works — three cards (Create a Hero, Embark on an Adventure, Shape Your Story)
Gameplay Screenshots — real PNGs for Character Creation and Campaign Generation; styled HTML previews for Combat and Inventory (no PNG assets exist yet in the repo)
Features — six highlights with icons
CTA — "Ready to Begin Your Adventure?" with Play Now and Sign In
Visual design
Green gradient background (matches auth)
Cinzel typography, gold borders, FantasyButton components
mm_heading.png decorative header
Mobile-first responsive grids
Assets
Copied to public/assets/landing/:

character-creation.png (from docs/mockups/)
campaign-generation.png (from docs/screenshots/campaign.png)
Combat and inventory use GameplayPreview components styled like the real game UI. When you capture those screenshots, add them to public/assets/landing/ and set imageSrc in landingConfig.ts.

Routing behavior

routes.tsx
Lines 58-60
<Route exact path="/">
<LandingRoute />
</Route>
LandingRoute mirrors the old RootRedirect logic for signed-in users, but shows the landing page to guests instead of sending them to /login.
