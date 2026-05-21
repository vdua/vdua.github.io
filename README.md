# Cozy CLI Tech Blog 🌲🖥️

Welcome to my personal developer workbench and blog. This static site is powered by **Eleventy (11ty)** and customized with a unique **"Playfulness-Restrained CLI"** visual aesthetic. It showcases deep-dives and engineering retrospectives into **Artificial Intelligence (AI)**, **Adobe Experience Manager (AEM) Forms**, and **System Architecture**.

---

## 🎨 Aesthetic & Design Philosophy

The site employs an organic, warm-palette development terminal theme that bridges natural earthy elements with flat structural design:
*   **Color Palette (Warm Forest & Earth tones)**:
    *   `#354F52` (Canopy — primary headers and dominant accents)
    *   `#84A98C` (Sage — interactive hover states and terminal nodes)
    *   `#52796F` (Moss — body text, terminal logs, metadata inline splits)
    *   `#2F3E46` (Loam — deep terminal shadow tones and dark text details)
    *   `#FAFBF9` (Loess / Off-White — warm soft paper background that reduces eye strain)
*   **Typography**:
    *   Headers: **Inter** (modern, legible sans-serif for sharp, borderless structures)
    *   Code/Terminal: **JetBrains Mono** (optimized for coding readability and ASCII art structures)
*   **Unix CLI Accents**:
    *   Custom borderless terminal prompts (`$ cat`, `$ tree`) rather than heavy containers.
    *   A dynamic terminal-style pagination layout styled as `-- More (Page 1 of 2) --`.
    *   Dynamic multi-part post connection widgets using ASCII directory tree characters (`├──`, `└──`).

---

## 🚀 Getting Started

### Prerequisites
Make sure you have **Node.js** (v18+) and **npm** installed.

### Setup
Clone the repository and install the dependencies:
```bash
npm install
```

### Development
Launch the local live-reload development server:
```bash
npm run start
```
Your local blog will be served at `http://localhost:8080/`.

### Production Build & Search Indexing
Compile the optimized static HTML assets and build the Pagefind secure Client-Side Search indices:
```bash
npm run build
```

---

## 📁 Repository Structure

```text
├── .github/workflows/deploy.yml   # Automated GitHub Pages CI/CD pipeline
├── .eleventy.js                   # Eleventy configuration, collections, & custom filters
├── package.json                   # Project scripts and dependencies
├── src/
│   ├── css/
│   │   └── style.css              # Central design system (tokens, CLI components, layout)
│   ├── images/
│   │   ├── landing-hero.png       # Selected Custom Moody Studio Hero graphic (Web Design)
│   │   └── web_design_*.png       # Visual theme variants and source graphics
│   ├── _includes/
│   │   └── layouts/
│   │       ├── base.njk           # Master base skeleton structure
│   │       ├── post.njk           # Article layout with borderless tree Series Widget
│   │       └── page.njk           # Generic page layout (about page, listings)
│   ├── index.njk                  # Paginated main article catalog dashboard
│   ├── about.njk                  # borderless biographical matrix page
│   ├── tag.njk                    # Dynamic category listing and tag collection router
│   └── posts/                     # Markdown blog posts categorized by topic
│       ├── aem-forms/
│       ├── ai/
│       └── architecture/
```

---

## 📚 Writing New Articles & Connecting Series

To write a post, add a new markdown file (`.md`) inside `src/posts/`.

### Standard Frontmatter
```yaml
---
title: "Evaluating RAG Quality: Synthetic Evaluation Metrics"
description: "A deep dive into measuring retrieval-augmented generation pipelines."
date: 2026-05-21
tags: ["ai"]
layout: layouts/post.njk
---
```

### Creating an Article Series
To cluster multiple articles together (e.g., AEM Forms masterclasses) into a terminal-style directory tree navigation block, include `series` and `seriesPart` in your frontmatter:
```yaml
series: "AEM Forms Masterclass"
seriesPart: 2
```
The Nunjucks templating engine will automatically resolve the sister posts, order them, and render an elegant, borderless console directory map showing the user where they are in the curriculum!

---

## 🛡️ CI/CD Automated Deployment

Every push to the `main` branch triggers an automated GitHub Actions build:
1. Installs Node.js packages and dependencies.
2. Compiles static HTML outputs via `@11ty/eleventy`.
3. Runs the post-processing script to generate the client-side search database indices using `pagefind`.
4. Securely deploys the static files to **GitHub Pages**!
