# Freelancer Tax Assistant: Frontend Design Document

## Overview
A production-grade, responsive web app enabling freelancers to interact with an AI assistant to answer tax-related questions. Built with **Next.js (App Router)**, **React**, **TypeScript**, and **TailwindCSS**, with guest support, persistent history, and multi-turn LLM integration.

---

## Design Philosophy

### 1. **Guest-First UX**
- All features accessible without authentication.
- Seamless login upgrade: local history is merged with backend history post-login.
- LocalStorage/IndexedDB used for unauthenticated history.

### 2. **Atomic Component Architecture**
- Reusable, testable UI primitives
- Divided by domain (`chat/`, `auth/`, `layout/`, etc.)

### 3. **Accessibility by Default**
- WCAG 2.1 AA compliant
- Keyboard navigable, screen reader support, proper ARIA roles

### 4. **Dark Mode & Responsiveness**
- TailwindCSS with custom dark/light theme support
- Mobile-first design with flex/grid layouts

### 5. **Modern Data Flow**
- Global state via Redux Toolkit or Context API
- RTK Query or SWR for efficient data fetching/caching

---

## Pages & Flows

### 1. **Landing Page** (`/`)
- CTA: "Start Chatting" (guest)
- CTA: "Sign In" or "Register"
- Hero text, feature highlights
- Footer: Disclaimer, Privacy Policy, Terms

### 2. **Chat View** (`/chat/[[...conversationId]]`)
- Sidebar (collapsible)
- Suggested Questions (if new conversation)
- Conversation history (chat bubbles)
- Token usage info
- Follow-up suggestions
- Markdown-formatted replies
- Persistent disclaimer
- Input area (textarea + submit)
- Optional: CAPTCHA if bot abuse suspected

### 3. **Authentication Pages**
- `/login`, `/register`
- Email/password with validation
- CAPTCHA
- Redirect to `/chat` after login

### 4. **Settings Page** (`/settings`)
- Theme toggle
- LLM selector (ChatGPT, Claude, Gemini)
- Language selector (future)
- Profile management

### 5. **History View** (via Sidebar)
- Guest: localStorage history
- Authenticated: server history via API
- Rename, delete, resume conversation

---

## Wireframes (Text Descriptions)

### Chat Layout
```
+---------------------+-----------------------------+
|       Sidebar       |         Chat Panel         |
|---------------------|-----------------------------|
| Conversation List   | Header (Title + LLM + Avatar)
| + New Chat Btn      |                             |
| + Existing Threads  | Chat bubbles (AI/User)      |
|                     | Follow-up buttons           |
|                     | Sticky Disclaimer           |
+---------------------+ ChatInput (textarea, btn)   |
```

### Landing Page
```
[ Hero Section: Logo, Title ]
[ CTA: Start Chatting | Sign In ]
[ Features Grid: Privacy, Speed, Accuracy ]
[ Footer: Disclaimer | Terms | Privacy ]
```

### Settings
```
[ Profile Card ]
[ Theme Toggle ]
[ LLM Dropdown ]
[ Language Option ]
[ Delete Account (Auth only) ]
```

---

## Component-Level Specs

### `MessageBubble`
- Props: `message`, `sender`, `tokenUsage`, `timestamp`
- Markdown renderer
- Differentiates user vs AI styling

### `ChatInput`
- Props: `onSubmit`, `isLoading`, `captchaRequired`
- Handles Enter-to-send and Shift+Enter for newline
- Displays CAPTCHA when needed

### `FollowUpSuggestions`
- Props: `suggestions[]`, `onSelect()`
- 3 horizontal buttons

### `SuggestedQuestions`
- Props: `suggestions[]`, `onSelect()`
- Displayed at the beginning of new sessions

### `TypingIndicator`
- Props: `visible`
- Animated 3-dot indicator or shimmer

### `Disclaimer`
- Always visible on ChatView
- Styled as muted banner or sticky footer

### `Sidebar`
- Props: `conversations`, `onNewChat`, `onSelect`, `isAuthenticated`
- History list (click to load), new chat button

### `LLMSelector`
- Props: `selected`, `options`, `onChange`
- Dropdown (or radio group in Settings)

### `Alert`
- Props: `type`, `message`, `onClose`
- Error/info banner

### `Spinner`
- Circular loader or dots

### `Header`
- LLM name + theme toggle + user avatar or login link

---

## Styling & Responsiveness

- Utility-first with TailwindCSS
- `max-w-3xl` for chat content
- Mobile breakpoints: sidebar collapses, input sticks to bottom
- `dark:` classes used for dark mode styling

---

## Accessibility & Performance Best Practices

- All buttons and inputs have `aria-*` labels
- Keyboard navigable (tab order, focus ring)
- Async boundaries for fallback rendering
- Lazy-load conversation on demand
- Memoization of message components for large threads

---

## Final Notes

- Each screen and component supports SSR and hydration
- Graceful fallback for failed LLM requests
- Guest UX is first-class: no nags or pop-ups

> Next steps: wire into backend, implement `useLocalHistory` hook, and configure rate limiting/CAPTCHA logic for abuse prevention.

