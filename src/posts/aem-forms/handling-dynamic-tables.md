---
title: "Handling Dynamic Tables in Adaptive Forms"
description: "A practical guide to implementing XML/JSON schema bindings and dynamic row additions in complex enterprise forms, resolving common state-loss gotchas."
date: 2026-05-14
category: "aem-forms"
tags: ["posts", "aem-forms"]
series: "AEM Forms Masterclass"
seriesPart: 1
layout: layouts/post.njk
templateEngineOverride: md
---

Adaptive Forms in Adobe Experience Manager (AEM) are exceptionally powerful, but one area that consistently trips up developers is implementing **dynamically repeating rows** inside tables, especially when binding forms to backend XML or JSON schemas.

Without correct schema-binding and state-management scripting, users will frequently experience partial data loss or reset tables upon draft saving and reloading. In this note, we will walk through the exact scripting rules required to handle table row additions reliably.

## The Backend Binding Gotcha

When you map an adaptive form table to a schema model, AEM expects structural consistency. If your schema dictates a repeating element under `/data/items/item`, AEM's binding engine automatically handles row replication on initial render. However, manual UI addition triggers must be carefully bound to avoid broken bindings.

To safely add a row dynamically via a button click, we must instantiate a new instance of the repeating object using the form instance manager.

## The Scripting Solution

Here is the standard JavaScript expression used inside the click handler of your **"Add Row"** button. Make sure to choose JavaScript (not GuideScript) in your AEM Rule Editor:

```javascript
// 1. Locate the parent table row container
var rowInstance = this.parent.parent.tableRow;

// 2. Fetch the instance manager for the repeatable row element
var instanceManager = rowInstance.instanceManager;

// 3. Add a new bound instance to the XML/JSON model structure
if (instanceManager) {
    // Inserts a new row structure bound to the schema target
    instanceManager.addInstance(true);
    
    // Log for local diagnostics
    console.log("[AEM Forms] Dynamic row successfully bound and appended.");
}
```

## Ensuring XML Schema Conformity

Always ensure your XSD specifies the maximum and minimum occurs correctly. If AEM's minOccurs is set to 1, then the instance manager will automatically initiate one row. When you call `addInstance(true)`, passing `true` guarantees AEM will initialize default values matching the XSD's default constraints, preventing empty element validation failures when the user submits the form.

On our next retrospective, we'll dive into how AEM handles dynamic tables when executing prefill service requests.
