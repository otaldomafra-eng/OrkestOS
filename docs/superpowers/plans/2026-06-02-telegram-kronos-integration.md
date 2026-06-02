# Telegram KRONOS Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first OrkestOS Telegram assistant layer for account linking, briefings, task listing, habit listing, and task creation.

**Architecture:** Add a focused Telegram module inside the existing Express backend. The module stores Telegram bindings in MongoDB, reuses existing OrkestOS models for productivity data, and exposes one authenticated route plus one protected webhook route.

**Tech Stack:** Node.js ES modules, Express, Mongoose, Node built-in test runner, Telegram Bot HTTP API.

---

### Task 1: Backend Telegram Foundation

**Files:**
- Create: `backend/models/telegramLinkModel.js`
- Create: `backend/services/telegramCommandService.js`
- Create: `backend/controllers/telegramController.js`
- Create: `backend/routes/telegramRoute.js`
- Modify: `backend/server.js`
- Modify: `backend/package.json`
- Test: `backend/tests/telegram.test.js`

- [ ] Write failing tests for link-code creation, `/link`, `/briefing`, and `/add tarefa`.
- [ ] Implement the Telegram link model with code expiry and chat binding fields.
- [ ] Implement command parsing and Portuguese response formatting.
- [ ] Implement authenticated link-code generation and secret-protected webhook handling.
- [ ] Register `/api/telegram` routes in `server.js`.
- [ ] Add `node --test tests/*.test.js` coverage for the new Telegram service.

### Task 1.1: Daily Briefing Cron

**Files:**
- Modify: `backend/services/telegramCommandService.js`
- Modify: `backend/controllers/telegramController.js`
- Modify: `backend/routes/telegramRoute.js`
- Modify: `backend/.env.example`
- Test: `backend/tests/telegram.test.js`

- [ ] Write a failing test proving linked Telegram chats receive generated briefings.
- [ ] Add `sendDailyBriefings` to collect linked chats and send each chat a briefing.
- [ ] Add `POST /api/telegram/briefings/daily` protected by `TELEGRAM_CRON_SECRET`.
- [ ] Add `TELEGRAM_CRON_SECRET` to `backend/.env.example`.

### Task 2: Verification

**Files:**
- Modify only if test or lint failures expose concrete issues.

- [ ] Run `npm test` inside `backend`.
- [ ] Run `node --check` on new backend files.
- [ ] Inspect `git diff --stat` and confirm only Telegram-related files changed.
