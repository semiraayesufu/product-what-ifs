# MedTracker

### What if checking a drug interaction didn't mean waiting on hold for a pharmacist?

Patients and caregivers juggling multiple medications, allergies, and conditions often have no quick way to check whether something new is safe to take alongside what they're already on. MedTracker is a lightweight tracker built around one core idea: make that check fast, standalone, and genuinely understandable, without needing a saved medical profile first.

I designed it around a few constraints. It had to work as a quick, solo lookup (check any drug or pair of drugs on the spot, no setup required) as much as a full profile tracker. Every result had to explain itself in plain language, not just a clinical severity label, since the audience is patients and caregivers, not clinicians. And every destructive action needed a real confirmation step, since this is health data people are trusting the app with.

## Features

- **Track** medications, allergies, and medical conditions in one place
- **Check** any drug, or several at once, against your saved profile and against each other, live against [openFDA](https://open.fda.gov/)'s drug label database
- **Understand** results in plain language: what a severity actually means and what to do about it, not just a badge
- **Act** on a result: add a checked drug to your profile, contact emergency services, copy or print the result, or delete it, each with a real confirm step before anything is removed
- **Review** a full history of past checks and decisions

## Try it

- [Live demo](https://semiraayesufu.github.io/product-what-ifs/medtracker/dist/)
- Or run it locally:
  ```
  npm install
  npm run dev
  ```

## Built with

React, TypeScript, Vite, Tailwind CSS. No backend: all data lives in memory for the session. Drug safety data comes live from openFDA, with a small bundled fallback for common medications when the live API is unreachable.

## A note on scope

MedTracker shares information only. It is not a replacement for professional medical advice, and it does not diagnose, prescribe, or replace guidance from a licensed provider.
