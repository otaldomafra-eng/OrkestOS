# Telegram KRONOS Integration Design

## Goal

Add a KRONOS-inspired Telegram assistant to OrkestOS so a user can receive daily briefings and run lightweight productivity commands without opening the web app.

## First Delivery Scope

The first delivery focuses on a backend foundation:

- Store a secure Telegram link between a OrkestOS user and a Telegram chat.
- Generate one-time link codes from an authenticated OrkestOS session.
- Accept Telegram webhook updates.
- Support basic commands: `/start`, `/help`, `/link CODE`, `/hoje`, `/tarefas`, `/habitos`, `/briefing`, and `/add tarefa TITLE`.
- Format concise Portuguese responses for personal productivity use.
- Trigger daily briefings through a protected cron endpoint.

Schedulers, proactive reminders, Apple/CalDAV integrations, Telegram inline buttons, and frontend settings are intentionally deferred until the command layer is reliable.

## Architecture

The OrkestOS backend remains the source of truth. Telegram is an external command surface, not a separate data store.

New backend units:

- `models/telegramLinkModel.js`: stores link codes and Telegram chat bindings.
- `services/telegramCommandService.js`: parses commands, resolves users, reads/writes existing OrkestOS models, and formats replies.
- `controllers/telegramController.js`: exposes authenticated code generation and Telegram webhook handling.
- `routes/telegramRoute.js`: mounts `/api/telegram/*` routes.

Telegram webhook requests are protected by `TELEGRAM_WEBHOOK_SECRET`. Daily briefing cron requests use `TELEGRAM_CRON_SECRET`, falling back to `TELEGRAM_WEBHOOK_SECRET` if a separate cron secret is not configured. Bot replies use `TELEGRAM_BOT_TOKEN` only on the server.

## Data Flow

1. User requests a link code through `POST /api/telegram/link-code` with the normal OrkestOS JWT header.
2. Backend creates a short random code with an expiry.
3. User sends `/link CODE` to the Telegram bot.
4. Webhook validates the secret, parses the message, and binds the Telegram chat id to that OrkestOS user.
5. Later Telegram commands find the user by chat id and read or update OrkestOS data.

## Command Behavior

- `/hoje` returns today's daily plan and completion count.
- `/tarefas` returns the top pending tasks, prioritizing important tasks and near deadlines.
- `/habitos` returns today's habits and streaks.
- `/briefing` combines daily plan, pending important tasks, and habits.
- `/add tarefa TITLE` creates a OrkestOS task with `createdFrom: "telegram"`.

## Scheduled Briefings

`POST /api/telegram/briefings/daily` sends `/briefing` output to every linked Telegram chat. The route expects the cron secret in `x-telegram-cron-secret` or `?secret=...`.

Commands that require a linked account return a short instruction to link the bot first.

## Error Handling

Webhook validation failures return HTTP 401 and do not process the update. Unknown commands return the help text. Missing Telegram token avoids outbound send attempts and returns a structured dry-run response for local testing.

## Testing

Backend tests cover command parsing, link code generation, account linking, briefing formatting, task creation through Telegram, and scheduled daily briefing delivery. Tests use stubs for Mongoose models and Telegram sending so they do not require MongoDB or a real bot token.
