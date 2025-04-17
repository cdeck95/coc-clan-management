# 🧠 `copilot-instructions.md` – Clash of Clans Clan Management App

## 🧩 Overview

This app is a **Clash of Clans clan management dashboard**. It enables member tracking, war monitoring, performance analytics, and general clan coordination.

## 🔧 Tech Stack

- **Language**: TypeScript
- **Framework**: Next.js (App Router)
- **UI**: ShadCN (in `@/public/components`)
- **Styling**: Tailwind CSS
- **API Interaction**: Server Actions for all data fetching and long queries
- **Storage**: AWS S3 for file storage (no database currently)

## 🗃️ File Structure & Key Files

- `clan-api.ts`: Core API routes for fetching clan and war-related data
- `api.ts`: Generic Clash of Clans API wrapper using fetch
- `utils.ts`: Helper functions for tag cleaning and formatting
- `mock-data.ts`: Example mock responses (for dev/testing)
- `clash.ts`: Types and constants used across the app (e.g., clan info, enums)

## ✍️ Copilot Instructions

### 🧠 General Development Behavior

- **Use TypeScript types** from `clash.ts` for data modeling.
- **Use server actions** to perform API calls or trigger long-running tasks.
- Always import components from `@/public/components`.
- Follow **Tailwind CSS** utility-first approach for all styling.
- When building UIs, default to **ShadCN components** and override only where needed.
- Assume **no database**; persist to S3 or client memory where required.
- Optimize UX for **real-time updates**, especially on war events or player check-ins.

### ⚔️ Clan Data Logic

- Clan data is pulled using server actions calling `getClan`, `getWars`, and other methods from `clan-api.ts`.
- API responses are standardized via `api.ts`.
- Use `cleanTag(tag: string)` from `utils.ts` to sanitize tags before using them in API calls.

### 🧪 Testing / Mocking

- Use `mock-data.ts` when testing new views or components.
- Mocked data aligns with the real API shape defined in `clash.ts`.

### 🧑‍💻 UI Generation

- Use `@/public/components/card`, `table`, `tooltip`, etc., from ShadCN.
- Use `useState` + `useEffect` only in client components. Default to server components otherwise.
- Use loading skeletons when fetching API data via server actions.
- Prefer `useOptimistic()` or `startTransition()` for updates if client interaction is required.

### 📁 S3 Uploads

- Images or attachments are uploaded via form data to a server action.
- Server actions then upload to S3 and return a public URL.
- These URLs should be stored in local state or displayed immediately in the UI.

## ✅ Code Snippet Conventions

\`\`\`tsx
// Fetching clan info inside a server component
const clanInfo = await getClan({ tag: '#CLANTAG' });

// Calling cleanTag to sanitize user input
const safeTag = cleanTag(userInput);

// Rendering a member table with ShadCN + Tailwind
<Table>
  <TableHeader>...</TableHeader>
  <TableBody>
    {members.map((m) => (
      <TableRow key={m.tag}>
        <TableCell>{m.name}</TableCell>
        <TableCell>{m.role}</TableCell>
        <TableCell>{m.expLevel}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
\`\`\`

## 🧭 Naming Guidelines

| Thing           | Naming Convention         | Example             |
|----------------|---------------------------|---------------------|
| API Functions   | camelCase, action-based   | `getClan`, `getWarLog` |
| Type Aliases    | PascalCase                | `ClanMember`, `WarSummary` |
| Components      | PascalCase                | `MemberCard`, `WarStatsGrid` |
| File Names      | kebab-case                | `clan-api.ts`, `clash.ts` |