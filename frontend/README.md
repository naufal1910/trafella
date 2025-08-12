# Trafella Frontend (Vue 3 + Vite)

Staging (Vercel): https://trafella.vercel.app/

Backend API (staging): https://trafella-api-staging.fly.dev

To point the app at a custom API origin (e.g., staging), set:

```
VITE_API_BASE_URL="https://trafella-api-staging.fly.dev"
```

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

## Planner (Phase 2) — Feature Flag

The experimental Planner (M1: draggable day list) is gated behind an env flag.

1) Enable locally in `.env`:

```
VITE_PLANNER_ENABLED="true"
```

2) Start dev server and visit `/planner`.

On staging, enable the flag in Vercel project settings before QA.

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
