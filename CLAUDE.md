# CLAUDE.md

## Project Overview

This is the **deployment repository** for a Hexo-generated static blog, served via GitHub Pages at `hdhyy.github.io`. The site is titled **"Hardy Augustus"** with the tagline *"Simple is better than complex."*

**This repository contains only pre-built static output** — not the Hexo source files. The source Markdown posts, Hexo configuration (`_config.yml`), theme templates, and `package.json` live in a separate source repository. Changes to content or site configuration should be made there, then regenerated with `hexo generate` and deployed here.

## Technology Stack

- **Static site generator:** Hexo 3.8.0
- **Frontend:** jQuery 2.0.3 (CDN), Fancybox 2.x (bundled), FontAwesome 4.0.3 (bundled)
- **Fonts:** Source Code Pro (Google Fonts CDN)
- **Hosting:** GitHub Pages

## Repository Structure

```
/
├── index.html              # Homepage (post listing + sidebar)
├── 2019/                   # Blog posts organized by /YYYY/MM/DD/slug/
│   └── 05/18/hello-world/
│       └── index.html
├── archives/               # Archive pages (by year and month)
│   ├── index.html
│   └── 2019/05/index.html
├── css/
│   ├── style.css           # Main stylesheet (~1,374 lines)
│   ├── fonts/              # FontAwesome font files
│   └── images/
│       └── banner.jpg      # Header banner image
├── js/
│   └── script.js           # Site JavaScript (~136 lines)
├── fancybox/               # jQuery Fancybox lightbox library + helpers
└── CLAUDE.md               # This file
```

## Key Conventions

### URL Structure
- Posts: `/YYYY/MM/DD/post-slug/index.html`
- Archives: `/archives/`, `/archives/YYYY/`, `/archives/YYYY/MM/`

### HTML Structure
Each page uses this layout hierarchy:
- `#container` > `#wrap` > `<header>` + `<main>` + `<aside>` + `<footer>`
- Header: 300px banner, site title/subtitle, navigation (Home, Archives), search, RSS
- Sidebar: Archives widget, Recent Posts widget
- Footer: Copyright, "Powered by Hexo"
- Responsive breakpoints at 480px and 768px

### Metadata
- All pages include Open Graph and Twitter Card meta tags
- RSS feed available at `/atom.xml`
- Google Custom Search integration for site search

## Build and Deployment

There are **no build commands, test suites, or CI/CD pipelines** in this repository. The workflow is:

1. Edit source content in the separate Hexo source repository
2. Run `hexo generate` to produce static files
3. Copy/push generated output to this repository
4. GitHub Pages serves the content automatically

## What AI Assistants Should Know

- **Do not look for `_config.yml`, `package.json`, or Markdown source files** — they are not in this repo.
- **All HTML files are generated output.** Manual edits here will be overwritten on the next `hexo generate` + deploy cycle. If persistent changes are needed, they must be made in the Hexo source repo.
- **No linting, testing, or build steps** exist in this repository.
- **Direct edits to static files** (CSS, JS, HTML) are possible for quick fixes but are not the intended workflow.
- The site currently has minimal content (one default "Hello World" post from 2019-05-18).
