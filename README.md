# DEEDOX AI Dev Workspace 🚀
> **Autonomous Multi-Agent Desktop Platform & Server Orchestrator**  
> Engineered by **DEEDOX Studio** ([deedoxstudio.com](https://deedoxstudio.com))

DEEDOX AI Dev Workspace is an advanced desktop platform built for developers, AI engineers, and teams running local servers, multi-agent frameworks, microservices, and web portals. Designed with an **Apple Liquid Glass (macOS Glassmorphism)** aesthetic, DEEDOX combines an **App Drawer / Launcher**, **Multi-Agent Roundtable**, **Web to Mini-App Launcher (persistent session isolated containers)**, **Recursive Local Drive Scanner**, **OpenRouter AI Error Diagnostics & AST Self-Healing**, and an **Integrated Terminal with ANSI color streaming and xterm.js**.

---

## 🎥 Official Submission Demo Video

Watch the complete live walkthrough and feature demonstration of **DEEDOX AI Dev Workspace**:



[![DEEDOX AI Dev Workspace — Official Demo Walkthrough](https://img.youtube.com/vi/SsyNbw1Czk0/maxresdefault.jpg)](https://youtu.be/SsyNbw1Czk0)

▶️ **[Click to Watch Full Video on YouTube: https://youtu.be/SsyNbw1Czk0](https://youtu.be/SsyNbw1Czk0)**

> **Key Capabilities Demonstrated in the Video:**
> - **Sovereign Desktop UI & Launcher:** Apple Liquid Glass design, instant app launching, and dock integration.
> - **Pulse Background Process Watchdog:** Real-time port monitoring (`:5173`, `:3000`) and automatic collision termination.
> - **Multi-Agent Roundtable Studio:** 7 collaborative 3D animated agent personas debating architecture and code generation.
> - **1-Click AST Autonomous Error Fixer:** Live stack trace parsing, root cause analysis, and self-healing atomic patches.
> - **Recursive Drive Scanner:** Scans entire drives in seconds to discover and batch-import 200+ projects.
> - **Web to Mini-App Isolation:** Converting web portals into desktop mini-apps with persistent session containers.

---

## ✨ Key Features & Capabilities

### 1. Mobile App Launcher & Redesigned App Icons
- **Mobile App Drawer UI**: Designed like a premium mobile launcher / macOS Launchpad with squircle app icons (`rounded-[22px]`), glass gloss reflections, and drop shadows.
- **Auto-Generated & Framework Icons**: Rich framework icons for React, Vite, Next.js, Python, FastAPI, Flask, Django, Node.js, Rust, Go, and Docker. Dynamic HSL gradient monograms for custom projects.
- **Real-Time Status Badges**:
  - Running: Glowing emerald ring with pulsing status dot and detected server port.
  - Starting: Spinning amber indicator with elapsed start timer.
  - Error: Crimson alert badge with 1-click **AI Fix** shortcut.
- **Full Developer Controls**: Every app icon card clearly provides:
  - **Run / Stop** (instant background server toggle)
  - **Terminal** (opens integrated xterm.js tab)
  - **Open Folder** (reveals project path in File Explorer)
  - **VS Code** (opens project in Visual Studio Code)
  - **Open In-App Tab** (opens server in internal webview)

### 2. Auto-Scan Local Drives for Projects (Recursive Scanner)
- **Drive Discovery**: Automatically discovers available drives (`C:\`, `D:\`, `E:\`) and allows picking any custom master directory.
- **Smart Recursive Detection**: Scans for `.git`, `package.json`, `requirements.txt`, `pyproject.toml`, `Cargo.toml`, or `go.mod`.
- **Intelligent Pruning**: Skips bloated directories (`node_modules`, `.next`, `dist`, `AppData`, `Windows`, `venv`) and avoids duplicate sub-folders.
- **Batch Import**: Review discovered repositories in a checkbox list with framework tags and import them into the launcher in one click.

### 3. Web to Mini-App Launcher (Persistent Isolated Containers)
- **Convert Any URL into a Desktop Mini-App**: Turn GitHub, Notion, ChatGPT, Claude, Slack, X/Twitter, or local intranet portals into standalone launcher icons.
- **Automated Metadata Scraping**: Automatically fetches site titles and high-resolution favicons/Apple Touch icons via Cheerio and Google Favicon service.
- **Categorical Filtering**: Organize mini-apps into *All*, *Social*, *Productivity*, *AI Tools*, *Dev Tools*, and *Utility*.
- **Persistent Sessions & Logins**: Uses Electron's `partition="persist:devworkspace_webapps"`. Cookies, cache, localStorage, and logins for services like Gmail, GitHub, and Notion remain permanently saved across app restarts.
- **Manage Mini-Apps**: Edit or delete any mini-app with 1 click.

### 4. Settings Page & Dynamic OpenRouter AI Engine
- **Dynamic Key Management**: Add, view, or update your OpenRouter API Key at any time.
- **Live Connection Test**: 1-click **Test API Key** button verifies key validity and displays usage directly against the OpenRouter API.
- **Model Selection**: Switch between DeepSeek R1, Claude 3.5 Sonnet, Llama 3.3 70B, Gemini 2.0 Flash, and GPT-4o.
- **Instant Persistence**: Key is saved securely in `devworkspace_store.json`. The AI Error Diagnostics engine reads this key dynamically on demand.

### 5. One-Click Launch & Automated In-App Routing
- **One-Click Run**: Automatically spawns dev servers in the background with cross-platform shell execution.
- **Automated URL Detection**: Parses terminal stdout/stderr stream for `http://localhost:<port>` or `http://127.0.0.1:<port>`.
- **In-App Webview Opening**: Automatically routes detected URLs to an in-app browser tab powered by Electron `<webview>` tag (no external browser clutter).

### 6. Advanced Tab & Multi-Window Management
- **Browser-Like Tabs**: Switch between App Drawer, Web Mini-Apps, GitHub Trending, Tech News, and active running projects.
- **Multi-Server Multi-Tasking**: Run 4-5 projects simultaneously, each with its own isolated webview and terminal instance.
- **Detachable Tabs**: Drag or pop out any tab into a separate independent Electron window for multi-monitor setups.
- **Split-Screen Mode**: Snap the in-app browser and integrated terminal side-by-side.

### 7. Custom Built-in Terminal & AI Error Solver
- **Integrated xterm.js Terminal**: ANSI color streaming, real-time stdout/stderr, manual stdin command input, restart, copy, and clear controls.
- **Real-Time Error Detection**: Flags build failures (`ModuleNotFoundError`, `Cannot find module`, `EADDRINUSE`, etc.).
- **OpenRouter AI Diagnostics**: Analyzes error stack traces using your dynamic OpenRouter key and delivers a root-cause explanation, resolution checklist, and a 1-click **"Run in Terminal"** fix command.

### 8. GitHub Trending & Repository Explorer
- **GitHub API Integration**: Real-time trending feeds with support for personal tokens for up to 5,000 requests/hour.
- **Timeframe Sorting**: Daily (Today), Weekly, and Monthly trending repositories.
- **Filters & 1-Click Clone**: Filter by languages/topics and clone directly to local workspace.

### 9. Tech & AI News Portal (Parallel Mirroring)
- **Parallel Scraping/Mirroring**: Simultaneously scrapes feeds from top tech & AI sources (**Hacker News**, **TechCrunch AI**, and **The Verge**) without paid APIs.
- **Categories & In-App Reader**: Categorized into *AI & Agents*, *Product Launch*, *Company*, and *Viral*.

### 10. Official Website, Documentation & Live Sandbox (`qoder-website/`)
- Includes complete static documentation, interactive sandbox demo, day/night mode switcher, and admin control panel in `qoder-website/`.

---

## 🛠 Tech Stack

- **Desktop Framework**: Electron.js
- **Frontend**: React 18 (TypeScript), Tailwind CSS, Framer Motion, Lucide Icons
- **Terminal**: xterm.js + xterm-addon-fit
- **Parallel Scraper**: Cheerio + Native Fetch in Node.js
- **AI Engine**: OpenRouter API (Dynamic API key management)
- **Bundler & Tooling**: Vite, esbuild

---

## 🚀 How to Run

### 1. Development Mode (Desktop App)
```powershell
npm install
npm run dev
```

### 2. Production Build (Windows Installer & Portable)
```powershell
npm run build
npm run electron:dev
# To package into Windows installer:
npm run dist
```

### 3. Website & Live Interactive Demo
```powershell
cd qoder-website
node server.cjs
# Open http://localhost:3009/
```

---

## 📄 License & Attribution
Designed & Engineered by **DEEDOX Studio** ([deedoxstudio.com](https://deedoxstudio.com)).  
All rights reserved.
