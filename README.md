Eye Drop Tracker

A simple, shared web app for tracking Nandi Jukar's post-operative eye drop schedule for both eyes independently (each eye has its own surgery date and its own post-op day count), with reminders and a "Synced with family" status so multiple family members always see the same up-to-date ticks.

What's inside
eye-drop-tracker/
├── index.html        ← the entire app (UI, styling, logic) — one static page
├── api/
│   └── doses.js       ← serverless function: shared storage (Vercel KV)
├── package.json        ← lists the one dependency the API needs (@vercel/kv)
└── README.md            ← this file

There is no build step. index.html is plain HTML/CSS/JavaScript and can be opened directly in a browser. api/doses.js only runs once deployed to Vercel (it needs a serverless environment).

Features
Two independent eyes. Right eye: Day 1 = 27 Aug 2026. Left eye: Day 1 = 31 Aug 2026. Every medication's schedule, taper, and duration is calculated separately per eye from its own surgery date. Ticking a dose for one eye never affects the other.
Four medications, exactly as prescribed: MAXMOIST (2×/day, 30 days), PRED FORTE (tapering 4→3→2→1×/day over 28 days), VIGAT HS (2×/day, 14 days), MICRONAC PF (4×/day, 45 days).
Right Eye / Left Eye tabs on the Today screen — pick an eye, see only its doses.
Next Dose banner showing the very next incomplete dose across both eyes, with medicine, eye, and time.
Given/Give buttons — tap to mark a dose given (records the exact time it was given); tap again to undo.
History with an All / Right Eye / Left Eye filter, one card per day.
Reminders — a chime + on-screen banner + (if permission is granted) a real system notification naming the exact eye, medicine, and dose number, when a scheduled time arrives. Only fires while the page/tab is open (see "Notification limits" below).
Shared syncing — doses and dose-time settings are saved to a small server-side store (Vercel KV) so every family member's phone sees the same data within seconds. If the server is unreachable, the app keeps working from the phone's own local copy and re-syncs once back online.
English / मराठी toggle, light / dark theme toggle, and a navy‑cream‑electric‑blue/violet visual design tuned for large touch targets on a phone.
Notification limits (please read)
Notifications only work while this page is open in a browser tab (kept in the foreground or background) — they cannot wake a fully closed browser or a phone that's locked/killed the app.
Android (Chrome): works well even with the tab in the background.
iPhone (Safari): Apple only allows notifications for a site that has been added to the Home Screen (Share → Add to Home Screen) — a normal Safari tab cannot send notifications on iOS at all.

If true "wakes the phone from anywhere" alarms become important later, that requires a push-notification server or a native app — this is a bigger project than the current site, but it's possible to add.

Multi-device syncing — how it works

index.html keeps a local copy of all data in the browser's storage (localStorage) so it still works instantly and offline. Every time a dose is ticked or a dose-time is edited, it also sends the full data to /api/doses (a POST request). Every phone also polls /api/doses (a GET request) every 12 seconds, and immediately whenever you switch back to the tab, to pick up changes made by anyone else. api/doses.js stores this data in Vercel KV, a small Redis-based key–value store that Vercel provides for free on hobby projects.

Without KV connected, the API calls will fail gracefully — the little badge under the title will say "Offline — saved on this phone only" and the app keeps working locally, just without sharing between phones.

Deploying — GitHub + Vercel (recommended for ongoing updates)

Using GitHub means every time you (or I) update the code, you git push and Vercel redeploys automatically — no manual re-uploading.

1. Create a GitHub account and repository
Go to github.com and sign up if you don't have an account.
Click the + icon (top right) → New repository.
Name it something like nandi-eye-drop-tracker. Keep it Private if you'd like (patient name is in the app). Don't add a README/gitignore here — you already have one.
Click Create repository. GitHub will show you a page with commands — keep that tab open.
2. Push this project to GitHub

Open a terminal on your computer, cd into the unzipped eye-drop-tracker folder, then run:

bash
git init
git add .
git commit -m "Initial eye drop tracker"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/nandi-eye-drop-tracker.git
git push -u origin main

(Replace YOUR_USERNAME and the repo name with your actual GitHub username and the repository name you chose. GitHub's own repo page shows you this exact snippet with your details already filled in — you can copy it from there instead of typing it out.)

If git isn't installed, install it first: on Mac it prompts automatically the first time you run a git command; on Windows, get it from git-scm.com.

3. Import the repo into Vercel
Go to vercel.com and sign up/log in — choosing "Continue with GitHub" is easiest, since it links the two accounts.
On the Vercel dashboard, click Add New → Project.
Find nandi-eye-drop-tracker in the list (you may need to click Configure GitHub App and grant access to the repo) and click Import.
Leave all the build settings as default (Vercel auto-detects this as a static site + serverless functions — no framework preset needed) and click Deploy.
In a minute or two you'll get a live link like nandi-eye-drop-tracker.vercel.app.
4. Add the shared database (Vercel KV)
In your new project's dashboard, open the Storage tab.
Click Create Database → choose KV.
Click Connect Project, select this project, and confirm.
Go to Deployments, click the ⋯ menu on the latest deployment, and choose Redeploy (this lets the app pick up the new database connection).
5. Test it

Open the live link on two different phones. Tick a dose on one — within about 12 seconds (or immediately on refresh) it should show as given on the other, and the badge under the title should read "Synced with family."

6. Add it to each phone's Home Screen
iPhone: open the link in Safari → Share → Add to Home Screen.
Android: open the link in Chrome → menu (⋮) → Add to Home screen.
Making future updates

Once this is on GitHub and connected to Vercel, any update is just:

bash
git add .
git commit -m "describe what changed"
git push

Vercel automatically rebuilds and redeploys within a minute — nothing else to do.

Alternative: deploy without GitHub (Vercel CLI)

If you'd rather skip GitHub entirely:

bash
npm install -g vercel
cd eye-drop-tracker
vercel          # first deploy, answer the prompts (accept defaults)
vercel --prod   # promotes it to your permanent production URL

Then still do the Storage → Create Database → KV → Connect Project step above, followed by one more vercel --prod to pick up the new connection. The tradeoff: future code changes need vercel --prod run manually again each time, rather than happening automatically on git push.
