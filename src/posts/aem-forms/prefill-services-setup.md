---
title: "Prefill Services Setup and XML Bindings"
description: "A deep dive into prefilling repeating row XML structures in Adobe Experience Manager (AEM) Adaptive Forms, ensuring flawless backend data binding."
date: 2026-05-15
category: "aem-forms"
tags: ["posts", "aem-forms"]
series: "AEM Forms Masterclass"
seriesPart: 2
layout: layouts/post.njk
templateEngineOverride: md
---

Following up on our exploration of dynamic table repeats, the next crucial hurdle is **prepopulating** those repeaters with prefilled data when a user loads a saved draft or an external system session.

If the backend prefill service does not format repeating XML blocks properly or omits structural namespaces, AEM's parser will fail silently, rendering only a single empty row and losing the user's previously captured records. Let's look at how to structure your OSGi prefill services to prevent this.

## XML Structure for Repeaters

AEM's adaptive forms engine maps repeating structures based on XML element names and schema paths. For our table row model, the incoming XML must follow a sequential list of matching parent nodes under the bound element.

Here is the correct payload schema structure for a prefill service response containing two bound rows:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<afData>
  <afBoundData>
    <data xmlns:x="http://ns.adobe.com/reva/1.0">
      <items>
        <item>
          <rowId>1</rowId>
          <productName>AEM Forms License</productName>
          <quantity>5</quantity>
        </item>
        <item>
          <rowId>2</rowId>
          <productName>AEM Sites Core</productName>
          <quantity>2</quantity>
        </item>
      </items>
    </data>
  </afBoundData>
</afData>
```

## Creating the OSGi Prefill Service

To feed this XML directly into the Adaptive Form request lifecycle, we implement the `DataProvider` interface in a custom OSGi component. This service intercepts the load request and dynamically queries your database or API:

```java
package com.vdua.blog.core.services;

import com.adobe.forms.common.service.DataProvider;
import com.adobe.forms.common.service.ContentType;
import com.adobe.forms.common.service.FormSubmitInfo;
import com.adobe.forms.common.service.PrefillData;
import org.osgi.service.component.annotations.Component;
import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

@Component(
    service = DataProvider.class,
    immediate = true
)
public class AEMFormsPrefillService implements DataProvider {

    @Override
    public String getServiceName() {
        return "vdua-forms-prefill-service";
    }

    @Override
    public String getServiceDescription() {
        return "Custom prefill service for dynamic schema tables.";
    }

    @Override
    public PrefillData getPrefillData(FormSubmitInfo formSubmitInfo) {
        // 1. Extract query params (e.g. draft ID)
        String draftId = (String) formSubmitInfo.getQueryParams().get("draftId");

        // 2. Fetch dataset and compile target prefill XML
        String prefillXml = compilePrefillXml(draftId);

        // 3. Return InputStream encapsulated in PrefillData
        InputStream xmlStream = new ByteArrayInputStream(prefillXml.getBytes(StandardCharsets.UTF_8));
        return new PrefillData(xmlStream, ContentType.XML);
    }

    private String compilePrefillXml(String draftId) {
        // Simplified representation of DB fetch and XML formatting
        return "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" +
               "<afData><afBoundData><data>" +
               "<items>" +
               "  <item><rowId>1</rowId><productName>Adaptive Table Demo</productName><quantity>10</quantity></item>" +
               "</items>" +
               "</data></afBoundData></afData>";
    }
}
```

## Form Setup in the AEM Console

Once your service is bundled and active in the OSGi container, navigate to the properties panel of your Adaptive Form in the AEM authoring interface. Under the **Form Model** configuration:

1. Select **XML Schema** as the input model.
2. Under **Prefill Service**, choose `vdua-forms-prefill-service` from the dropdown list.
3. Save and preview. AEM will automatically query the service, extract the elements, replicate rows inside your dynamic tables, and securely inject data coordinates!
