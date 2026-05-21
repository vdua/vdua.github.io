module.exports = function(eleventyConfig) {
  // Syntax highlight plugin
  const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
  eleventyConfig.addPlugin(syntaxHighlight);

  // Passthrough copy for CSS and images
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/images");

  // Custom filters
  // Date formatting: yyyy-MM-dd
  const { DateTime } = require("luxon");
  eleventyConfig.addFilter("postDate", (dateObj) => {
    return DateTime.fromJSDate(dateObj, {zone: 'utc'}).toFormat("yyyy-MM-dd");
  });

  // Reading time helper
  eleventyConfig.addFilter("readingTime", (content) => {
    const wordsPerMinute = 200;
    const cleanContent = content.replace(/<\/?[^>]+(>|$)/g, ""); // strip HTML tags
    const numberOfWords = cleanContent.trim().split(/\s+/).length;
    const minutes = Math.ceil(numberOfWords / wordsPerMinute);
    return `${minutes.toString().padStart(2, '0')}m_read`;
  });

  // File name helper from url/slug
  eleventyConfig.addFilter("catFileName", (url) => {
    if (!url) return "index.md";
    let parts = url.split("/").filter(Boolean);
    let slug = parts.pop();
    if (slug === "handling-dynamic-tables") {
      return "dynamic-tables-in-adaptive-forms.md";
    }
    if (slug === "prefill-services-setup") {
      return "prefill-services-setup.md";
    }
    if (slug === "evaluating-rag-quality") {
      return "evaluating-rag-quality.md";
    }
    if (slug === "costs-of-oversolving") {
      return "costs-of-oversolving-retrospective.md";
    }
    return `${slug}.md`;
  });

  // Custom collection: posts grouped by series
  eleventyConfig.addCollection("series", function(collectionApi) {
    const posts = collectionApi.getFilteredByTag("posts");
    const seriesMap = {};

    posts.forEach(post => {
      const seriesName = post.data.series;
      if (seriesName) {
        if (!seriesMap[seriesName]) {
          seriesMap[seriesName] = [];
        }
        seriesMap[seriesName].push(post);
      }
    });

    // Sort each series by seriesPart ascending
    for (const name in seriesMap) {
      seriesMap[name].sort((a, b) => {
        return (a.data.seriesPart || 0) - (b.data.seriesPart || 0);
      });
    }

    return seriesMap;
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes"
    }
  };
};
