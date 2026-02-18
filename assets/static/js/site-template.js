(function () {
  function byId(id) {
    return document.getElementById(id);
  }

  function create(tag, className, text) {
    var el = document.createElement(tag);
    if (className) el.className = className;
    if (typeof text === "string") el.textContent = text;
    return el;
  }

  function getConfig() {
    var node = byId("page-config");
    if (!node) throw new Error("缺少 #page-config 配置节点");
    return JSON.parse(node.textContent || "{}");
  }

  function renderNav(config) {
    byId("brand").textContent = (config.nav && config.nav.brand) || "模板站点";
    var nav = byId("nav");
    nav.innerHTML = "";
    ((config.nav && config.nav.items) || []).forEach(function (item) {
      var a = create("a");
      a.href = "#" + item.id;
      a.textContent = item.label;
      nav.appendChild(a);
    });
  }

  function renderHero(config) {
    var hero = byId("hero");
    var h = config.hero || {};
    var stats = h.stats || [];
    var gallery = h.gallery || [];
    var main = gallery.find(function (g) { return g.role === "main"; }) || gallery[0] || null;
    var secondary = gallery.filter(function (g) { return g !== main; }).slice(0, 2);

    var copy = create("div", "hero-copy");
    copy.appendChild(create("div", "eyebrow", h.eyebrow || "PAGE TEMPLATE"));
    copy.appendChild(create("h1", "", h.title || "未设置标题"));
    copy.appendChild(create("p", "", h.lead || "未设置引导文案"));

    var statWrap = create("div", "stats");
    stats.forEach(function (s) {
      var card = create("div", "stat");
      var b = create("b", "", s.value || "-");
      card.appendChild(b);
      card.appendChild(document.createTextNode(s.label || ""));
      statWrap.appendChild(card);
    });
    copy.appendChild(statWrap);

    var galleryWrap = create("div", "hero-gallery");
    [main].concat(secondary).filter(Boolean).forEach(function (item, idx) {
      var cell = create("div", "cell" + (idx === 0 ? " big" : ""));
      var img = create("img");
      img.src = item.image && item.image.src ? item.image.src : "";
      img.alt = (item.image && item.image.title) || "hero-image";
      cell.appendChild(img);
      galleryWrap.appendChild(cell);
    });

    hero.innerHTML = "";
    hero.appendChild(copy);
    hero.appendChild(galleryWrap);
  }

  function buildCard(item) {
    var card = create("article", "card");
    var media;
    if (item.placeholder || !(item.image && item.image.src)) {
      media = create("div", "placeholder", "PLACEHOLDER");
    } else {
      media = create("img");
      media.src = item.image.src;
      media.alt = (item.image && item.image.title) || "image";
      media.loading = "lazy";
    }

    var body = create("div", "body");
    body.appendChild(create("h3", "", (item.image && item.image.title) || "未命名"));
    if (Array.isArray(item.tags) && item.tags.length) {
      var tags = create("div", "tags");
      item.tags.forEach(function (t) { tags.appendChild(create("span", "tag", t)); });
      body.appendChild(tags);
    }

    card.appendChild(media);
    card.appendChild(body);
    return card;
  }

  function renderSection(section) {
    var wrap = create("section", "section");
    wrap.id = section.id;

    var head = create("div", "section-head");
    head.appendChild(create("h2", "", section.title || "未命名区块"));
    if (section.subtitle) head.appendChild(create("p", "", section.subtitle));
    wrap.appendChild(head);

    var content = section.content || {};
    if (section.kind === "narrative") {
      var grid = create("div", "narrative-grid");
      (content.cards || []).forEach(function (c) {
        var card = create("article", "narrative-card");
        card.appendChild(create("h3", "", c.title || "未命名"));
        card.appendChild(create("p", "", c.text || ""));
        grid.appendChild(card);
      });
      wrap.appendChild(grid);
      return wrap;
    }

    if (section.kind === "strip-gallery") {
      var strip = create("div", "strip");
      (content.items || []).forEach(function (i) { strip.appendChild(buildCard(i)); });
      wrap.appendChild(strip);
      return wrap;
    }

    if (section.kind === "model-stage") {
      var stage = create("div", "model-stage");
      var main = create("div", "");
      if (content.main) main.appendChild(buildCard(content.main));
      var mini = create("div", "mini-grid");
      (content.secondary || []).forEach(function (i) { mini.appendChild(buildCard(i)); });
      stage.appendChild(main);
      stage.appendChild(mini);
      wrap.appendChild(stage);
      return wrap;
    }

    if (section.kind === "atlas-grid") {
      var atlas = create("div", "atlas-grid");
      (content.items || []).forEach(function (i) { atlas.appendChild(buildCard(i)); });
      wrap.appendChild(atlas);
      return wrap;
    }

    var masonry = create("div", "masonry");
    (content.items || []).forEach(function (i) { masonry.appendChild(buildCard(i)); });
    wrap.appendChild(masonry);
    return wrap;
  }

  function renderSections(config) {
    var holder = byId("sections");
    holder.innerHTML = "";
    (config.sections || []).forEach(function (section) {
      holder.appendChild(renderSection(section));
    });
  }

  function applyMeta(config) {
    if (config.meta && config.meta.title) document.title = config.meta.title;
    var lang = (config.meta && config.meta.language) || "zh-CN";
    document.documentElement.lang = lang;
  }

  function applyTheme(config) {
    var theme = config.theme || {};
    var root = document.documentElement;
    if (theme.accentColor) root.style.setProperty("--accent", theme.accentColor);
    if (theme.radius === "sm") root.style.setProperty("--radius", "10px");
    if (theme.radius === "lg") root.style.setProperty("--radius", "18px");
    if (theme.background === "dark") {
      root.style.setProperty("--bg", "#06111e");
      root.style.setProperty("--panel", "#0d1b2d");
      root.style.setProperty("--line", "#1f3553");
      root.style.setProperty("--ink", "#e7f0ff");
      root.style.setProperty("--muted", "#93a8c9");
      document.body.style.background = "radial-gradient(circle at 10% 0%, #0f213a, #071424 45%, #040c16 100%)";
    }
  }

  function main() {
    var config = getConfig();
    applyMeta(config);
    applyTheme(config);
    renderNav(config);
    renderHero(config);
    renderSections(config);
  }

  main();
})();
