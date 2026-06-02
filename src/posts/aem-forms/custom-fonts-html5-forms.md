---
title: "Using Custom Fonts in Adobe HTML5 Forms"
description: "An optimized, highly scannable version of the custom typography guide for AEM Forms, featuring JCR directory blueprints, key gotchas, and production tips."
date: 2021-03-05
category: "aem-forms"
tags: ["posts", "aem-forms"]
layout: layouts/tutorial.njk
difficulty: "Intermediate"
time: "12 mins"
prereqs: ["AEM Forms local setup", "CRXDE Lite access"]
hero: "/images/custom-fonts-hero.png"
displayHero: true
templateEngineOverride: md
---

## Introduction

Adobe Experience Manager (AEM) HTML5 Forms serve dynamic, web-responsive versions of your template documents. However, unlike standard PDF Forms where fonts can be embedded directly within the binary payload, HTML5 Forms assume that the required typography is pre-installed on the client machine.

To deliver a consistent brand experience without relying on client-side font availability, modern web fonts (`.woff2` / `.woff`) can be dynamically served through custom rendering profiles and AEM client libraries. 

This guide details the exact step-by-step JCR node structure and configuration required to successfully serve custom typography in AEM HTML5 Forms.

---

## Step-by-Step Implementation

### Phase 1: Custom Profile Setup [JCR content]

A custom rendering profile controls the HTML page shell wrapper that serves your form. Detailed instructions to create profiles can be found in the [official custom profiles article](https://experienceleague.adobe.com/docs/experience-manager-65/forms/html5-forms/custom-profile.html?lang=en#create-the-profile-renderer-script).

1. **Access CRXDE Lite**: Open your local JCR browser (`http://localhost:4502/crx/de`).
2. **Create the Folder Hierarchy**:
   * Navigate to `/content`.
   * Construct the folder path `/content/somerandomstuff/html5`.
   
   <details>
   <summary>New to JCR folder creation? Click here to expand CRXDE steps.</summary>

   * Select `/content`.
   * Click **Create** -> **Create Folder** in the toolbar:
     * **Name**: `somerandomstuff`
   * Click **Save All**.
   * Select `/content/somerandomstuff`, click **Create Folder**:
     * **Name**: `html5`
   * Click **Save All**. Ensure the `jcr:primaryType` of both folders is `sling:Folder`.
   </details>

3. **Copy the Base Profile**:
   * Navigate to `/content/xfaforms/profiles/default`.
   * **Copy** this node, select your new `/content/somerandomstuff/html5` folder, and **Paste** it.
   * **Rename** the pasted node to `fontdemo`.
4. **Configure Profile Properties**:
   Select `/content/somerandomstuff/html5/fontdemo` and verify or set the following properties:

   | Property | Type | Value | Description |
   | :--- | :---: | :--- | :--- |
   | `jcr:title` | String | `Font Demonstration` | Descriptive name in forms console |
   | `jcr:description` | String | `Demo to showcase custom fonts rendition` | Profile purpose notes |
   | `sling:resourceType` | String | `somerandomstuff/html5/fontdemo` | Directs JCR search to your apps renderer |
   | `sling:resourceSuperType` | String | `xfaforms/profile` | Inherits baseline forms rendering behaviors |

5. **Create the App Renderer Folder**:
   * Navigate to `/apps`.
   * Construct the JCR path `/apps/somerandomstuff/html5/fontdemo` (ensure all parent folders are of type `sling:Folder`).
6. **Set up the Profile JSP Renderer**:
   * Create a file named `html.jsp` under `/apps/somerandomstuff/html5/fontdemo/`.
   * Copy the exact contents of the standard forms JSP from `/libs/xfaforms/profile/html.jsp` and paste them into your newly created `html.jsp` file. Click **Save All**.

> **Note**: Standard HTML5 Forms profiles use `html.jsp` by default. Since we are only injecting a custom stylesheet rather than changing the physical HTML structure, we do not need to modify the JSP body yet. We will configure it to inject our client library in Phase 3.

---

### Phase 2: Client Library & Font Serving [JCR apps]

To serve custom web fonts to browser form renderers, we register them as JCR binary assets inside an AEM client library (`cq:ClientLibraryFolder`). Learn more about AEM client libraries in the [official client libraries guide](https://experienceleague.adobe.com/docs/experience-manager-65/developing/introduction/clientlibs.html?lang=en#overriding-libraries-in-lib).

1. **Create the Client Library Folder**:
   * Select `/apps/somerandomstuff/html5/fontdemo`.
   * Create a child node named **`fontfile`** of type **`cq:ClientLibraryFolder`**. Follow the steps provided in the [official clientlibs creation docs](https://experienceleague.adobe.com/docs/experience-manager-65/developing/introduction/clientlibs.html?lang=en#create-a-client-library-folder).
   * Add the following JCR property:
     * **Name**: `categories`
     * **Type**: `String[]`
     * **Value**: `somerandomstuff.html5.fontdemo`
2. **Upload the Binary Font File**:
   * Under `/apps/somerandomstuff/html5/fontdemo/fontfile`, upload your web font binaries (`font.woff2` / `font.woff`).
   
   <details>
   <summary>Click here for instructions on uploading JCR binary files via CRXDE Lite.</summary>

   * Right-click `/apps/somerandomstuff/html5/fontdemo/fontfile` -> **Create** -> **Create File**:
     * **Name**: `font.woff2`
   * Select the newly created `/apps/somerandomstuff/html5/fontdemo/fontfile/font.woff2/jcr:content` node.
   * In the properties pane, change the type of `jcr:data` to **Binary**.
   * Click **Edit**, upload your local `.woff2` font file, and click **Save All**.
   </details>

3. **Define `@font-face` Rules**:
   * Create a file named `style.css` under `/apps/somerandomstuff/html5/fontdemo/fontfile`.
   * Paste the following CSS declaration:

```css
@font-face {
    font-family: "customBrandFont";
    src: url('/apps/somerandomstuff/html5/fontdemo/fontfile/font.woff2') format('woff2'),
         url('/apps/somerandomstuff/html5/fontdemo/fontfile/font.ttf') format('truetype');
    font-weight: normal;
    font-style: normal;
}
```

> **Critical Gotcha (Font-Family Matching)**: The string literal declared in the `font-family` property (e.g., `"customBrandFont"`) **must exactly match** the JCP/XDP font name specified inside Adobe LiveCycle Designer / AEM Forms Designer. If they differ by even a single character, casing mismatch, or spacing, the rendering engine will fail to resolve the binding and fall back to browser defaults. The actual properties and fonts should be defined as per the [HTML Web Font Specification](https://developer.mozilla.org/en-US/docs/Learn/CSS/Styling_text/Web_fonts) and [@font-face](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face) properties.

4. **Register the CSS File**:
   * Create a file named `css.txt` under `/apps/somerandomstuff/html5/fontdemo/fontfile`.
   * Add the filename inside it and click **Save All**:
   
```text
style.css
```

5. **Verify the Clientlib Output**:
   * In your browser, navigate to your publisher/author URL:
     `http://localhost:4502/apps/somerandomstuff/html5/fontdemo/fontfile.css`
   * Confirm that your `@font-face` CSS declarations render correctly without returning a JCR 404 status.

---

### Phase 3: Load the Font in Your Custom Profile

Now we link our registered client library into the custom profile JSP renderer so it downloads automatically on form render.

1. **Edit the Profile Renderer**:
   * Open `/apps/somerandomstuff/html5/fontdemo/html.jsp`.
2. **Inject the Clientlib**:
   * Locate the `<head>` tag inside the JSP.
   * Inject the AEM taglib and include clientlib tags at the top of the head block:

```html
<%@taglib prefix="ui" uri="http://www.adobe.com/taglibs/granite/ui/1.0" %>
<ui:includeClientLib categories="somerandomstuff.html5.fontdemo" />
```

3. **Deploy & Render**:
   * Save your JCR files.
   * Render your HTML5 Form using the custom profile:
     `http://localhost:4502/content/xfaforms/renderer.html?template=YOUR_FORM_TEMPLATE&profile=fontdemo`

---

## Production Pro-Tips

### A. Performance Optimization (WOFF2)
Always prefer compressed web font formats like `.woff` and `.woff2` for production forms. Standard TrueType (`.ttf`) files are uncompressed and significantly increase form loading latency on low-bandwidth mobile devices.

### B. Dispatcher Caching & CORS Configuration
In enterprise dispatcher architectures:
* Ensure dispatcher filters allow font binary request extensions (`.woff`, `.woff2`, `.ttf`).
* If your HTML5 Forms are embedded inside corporate portals running on a separate domain, ensure your JCR clientlib headers serve the correct Access-Control-Allow-Origin (CORS) headers to prevent browsers from blocking font rendering.

---

## JCR Verification Blueprint

Once you have completed all the phases, your local folder structure inside CRXDE Lite should match the directory tree below. Use this console map as a checklist to verify your paths, JCR node types, and files:

```bash
$ tree -I default /
/
├── content/
│   └── somerandomstuff/ [sling:Folder]
│       └── html5/ [sling:Folder]
│           └── fontdemo [nt:unstructured]
└── apps/
    └── somerandomstuff/ [sling:Folder]
        └── html5/ [sling:Folder]
            └── fontdemo/ [sling:Folder]
                ├── html.jsp [nt:file]
                └── fontfile/ [cq:ClientLibraryFolder]
                    ├── font.woff2 [nt:file]
                    ├── style.css [nt:file]
                    └── css.txt [nt:file]
```
