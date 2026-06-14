SPOT THE SIGNS PROJECT BOARD

## TO DO

Build basic page layout
Create avatar area
Create question area
Create answer buttons
Create JSON activity file
Load JSON into JavaScript
Display first question
Check answers
Display feedback
Next question button
Restart activity

## CONTENT

Write 5 Myth vs Fact questions
Write 5 Scenario questions
Collect PTK artwork
Add resource links

## POLISH

Mobile testing
Accessibility review
QR code testing
GitHub Pages deployment

## SDD UPDATES PENDING

- Add testing-approach paragraph (unit/integration/validation) to Test plan and Use Cases section, before UC-001
- Add new use case for Safe or Sus activity (based on UC-004, reworded for scenarios + Safe/Sus buttons)
- Update UC-009 (View Resource Information) to note resource links/phone numbers are tappable (tel: / opens browser)
- Add version log entry for Safe or Sus module + tappable resource links
- Document shared shuffle pattern (Fisher-Yates shuffle, MAX_QUESTIONS=10 cap) in Software Architecture — applies to all activity modules, not just Myth vs Fact / Safe or Sus
- Add note on content.json editability: content authors can add/edit/remove questions, scenarios, and resources directly in content.json with no code changes; question_order sets the base order, which is then shuffled and capped at 10 per playthrough

## DONE

VS Code setup
Live Server installed
Prettier installed
ESLint installed
Git repository created
GitHub repository created
Project structure created
