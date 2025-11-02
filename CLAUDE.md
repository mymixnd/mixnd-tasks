# CLAUDE.md - mixnd-tasks

**Project Type:** Template Validation App
**Purpose:** Build real TODO SaaS app to identify template/CLI gaps
**Template Source:** lego-svelte (SvelteKit + Supabase + Stripe)
**Created:** 2025-11-02 via `mixnd app new mixnd-tasks --template lego-svelte`

---

**App Info:**
- Domain: https://mixnd-tasks.mixnd.com
- GitHub: https://github.com/mymixnd/mixnd-tasks
- Supabase Project: dbcmtxtvqyjxettkqgzt
- Doppler Project: mixnd-tasks (prd config)
- Coolify App UUID: os440okk0kko4808o84k8c80
- Stripe - placeholder to begin
---

## Purpose & Approach

**Goal:** Build working TODO app to expose all template and CLI issues before automating fixes.

**Workflow:**
1. Fix issues manually in this app (mixnd-tasks)
2. Document every step in validation diary
3. Identify pain points, missing features, wrong assumptions
4. Later: Apply learnings to fix lego-svelte template and mixnd-cli

**DO NOT:** Fix template or CLI during this phase. Only fix this app and document issues.

---

## Documentation

**Validation Diary:** `../context/spaces/mixnd-cli/validation-diary.md`
- Real-time log of every issue, fix, command tried
- No fluff - just facts and actions
- **Read tail only** - Use offset parameter to read last ~50 lines (more efficient)
- Only read full file at session start to understand context

**Related Projects:**
- **lego-svelte** - The template (don't touch yet)
- **mixnd-cli** - The CLI tool (don't touch yet)
- **mixnd-tasks** (this repo) - Working validation app

---

## Context Repo Access

**If accessible locally:**
- Path: `../context/`
- Space: - `../context/spaces/mixnd-cli/
- Status: `../context/spaces/mixnd-cli/status/mixnd-cli.md`
- Diary: `../context/spaces/mixnd-cli/validation-diary.md`
- Goals: `../context/spaces/mixnd-cli/current_goals.md`
- Logs: `../context/spaces/mixnd-cli/logs/YYYY-MM-DD.md`

**Efficient Reading:**
- Read diary tail with offset (last 50 lines): `Read(offset=<line-number>)`
- Only read full file at session start
- Append new entries to end with Edit tool

---

## Working Guidelines

**CRITICAL: Document EVERY step in validation-diary.md BEFORE and AFTER each action**

**Documentation Format:**
```
**HH:MM** - Brief description
- What was found/discovered
- What command/action was taken
- What the result was
```

**Rules:**
1. **Document BEFORE doing** - Write what you're about to try
2. **Document AFTER doing** - Write what happened
3. **Every command counts** - Even failed attempts
4. **No assumptions** - If you think something, document why
5. **1-2 lines max** - Concise, factual, no fluff
6. **Fix this app only** - Don't modify template or CLI yet
7. **Manual fixes first** - Understand problems before automating

---