---
date:
  "{ date:YYYY-MM-DD }":
project: myproject01
tags:
  - daily
shipped: false
---

# {{date:dddd, D MMMM YYYY}}

## Focus

<!-- One sentence. What does today need to move? Written before you start. -->

## Log

- {{time}} —

## Changes

<!-- What actually changed in the codebase today. Files, features, fixes.
     Written at end of day, not as you go.

     git log --oneline --since=midnight
     git diff --stat @{yesterday} -->

- **Added** —
- **Changed** —
- **Fixed** —

## Decisions

<!-- Anything you chose that constrains future work. If it needs the reasoning
     written down, promote it to an ADR and link it: [[adr-000-title]] -->

## Blockers

<!-- What stopped you, and what you tried. Delete the section if nothing did. -->

## Tomorrow

- [ ]

---

## Links

<!-- Notes, ADRs, or issues touched today. Backlinks make these findable later. -->