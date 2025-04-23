# LLM Tax Assistant Web App: Full UI/UX & Frontend Design Spec

## 🎨 Visual Identity
- **Font**: Onest (as per reference image)
- **Colors**: 
  - Dark Gray: `#18181b`
  - Mid Gray: `#36353f`
  - Accent Purple: `#5645ee`
  - White: `#ffffff`

## 📊 Layout Structure (Desktop)
- 3-panel layout: Left Sidebar | Main Chat Area | Right Sidebar

```
+------------------+------------------------------+------------------+
|   Left Sidebar   |        Main Chat Area        |  Right Sidebar   |
+------------------+------------------------------+------------------+
```

---

## 🤩 Section 1: Main Chat Area (Center)

### Default New Chat View
- **Heading**: "🇰🇪 Your Tax Assistant for Kenya"
- **Subtext**: "Ask any tax-related question, and get quick, helpful answers"
- **Suggested Questions** (3 buttons):
  - "What taxes do I pay as a freelancer in Kenya?"
  - "How do I file my income tax returns?"
  - "What expenses can I deduct?"

### Active Chat View
- **Message Bubbles**:
  - Markdown rendering
  - Differentiated styling: user vs assistant
  - Token usage per turn (tooltip or bottom-right subtle text)

- **Follow-Up Suggestions**:
  - Up to 4 clickable chips below each AI reply

- **Feedback Buttons**:
  - Thumbs Up / Down under AI message
  - Optional feedback textarea on thumbs down (modal or inline expand)

- **Chat Input**:
  - Sticky at bottom
  - Multiline textarea with send button

---

## 🤩 Section 2: Right Sidebar (Session Info + Settings)

### Always Visible
- **Header**: "Session Overview"
- **Token Usage**:
  - Total tokens used (query + response per turn)
  - Breakdown table or list
- **Cost Estimate**:
  - Per provider/token estimate (e.g., 0.002 USD)
- **LLM Selector**:
  - Dropdown to choose between ChatGPT, Claude, Gemini
  - Changes apply immediately or on next message
- **Theme Toggle**:
  - Switch between Light, Dark, or System (Auto-detects OS)
- **Future-Ready Placeholders**:
  - Sources (if citations included)
  - Citations (e.g., [1], [2])
  - Timeline navigator (scroll to past turns)
  - Export options (PDF, Markdown)

---

## 🤩 Section 3: Left Sidebar (Navigation)

- **User Profile Section**:
  - Avatar or initials
  - Name or email (if logged in)
  - Buttons: `Login`, `Logout`, `Register`

- **Chat History List**:
  - Timestamp + title or message snippet
  - Click to load
  - Hover to rename/delete

- **App Navigation**:
  - Settings
  - About

---

## 🧾 Login / Register Pages

### Login Page
- **Fields**: Email, Password
- **Extras**: Forgot password, CAPTCHA
- **CTA**: Login, Register link
- **Success**: Redirect to `/chat`

### Register Page
- **Fields**: Name, Email, Password, Confirm Password
- **CAPTCHA**: Yes
- **CTA**: Register, Login link
- **Success**: Redirect to `/chat`

---

## 👤 Profile Settings Page (`/settings`)
- **User Info Card**:
  - Display Name
  - Email
- **LLM Default Selection** (ChatGPT, Claude, Gemini)
- **Theme Toggle** (Light, Dark, System)
- **Language Selection** (future-ready)
- **Delete Account Button** (modal confirm)

---

## 📘 About Page (`/about`)
- Overview of the assistant and its capabilities
- Disclosure: "Powered by LLMs, not legal advice"
- Token & pricing explanation
- Team and tech stack intro

---

## 📱 Mobile Layout (Responsive)

- **Left/Right Sidebars become Drawers**
- **Chat Input** is sticky on mobile
- **Floating buttons** for feedback
- Use Tailwind responsive classes (`sm:`, `md:`, `lg:`)

---

## ✨ Component Overview

### Reusable
- `ChatInput`
- `MessageBubble`
- `LLMSelector`
- `SidebarLeft`
- `SidebarRight`
- `FollowUpSuggestions`
- `TokenCostStats`
- `ThemeToggle`
- `ProfileSettings`
- `FeedbackButton`
- `SuggestedQuestions`
- `Alert`, `Spinner`, `Dropdown`, `Modal`

---

## 🔐 Auth Logic
- **If guest**:
  - Store chat in localStorage
  - Show login/register
- **If logged in**:
  - Fetch chat from backend
  - Sync local → cloud on first login

---

## 🚧 Dev/Implementation Tips
- Use Tailwind dark mode (`dark:` prefix)
- Use `react-markdown` for messages
- SSR via Next.js App Router
- Use `zod` + `react-hook-form` for forms
- Use `zustand` or Redux Toolkit for global state
- Protect `/settings` and `/chat/[id]` for auth-only logic

---

> This document serves as the master frontend spec for all key screens and flows. Each component can now be implemented using this structure with full fidelity to the design goals.

