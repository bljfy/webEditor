import type { PageConfig } from "../schema/pageConfig";

type RendererProps = {
  config: PageConfig;
};

function joinTags(tags?: string[]) {
  return tags?.length ? tags.join(" / ") : "";
}

function MediaCard({
  src,
  title,
  tags,
  placeholder
}: {
  src?: string;
  title?: string;
  tags?: string[];
  placeholder?: boolean;
}) {
  const hasImage = src && src.trim().length > 0;

  return (
    <article className="media-card">
      {placeholder || !hasImage ? (
        <div className="media-placeholder">PLACEHOLDER</div>
      ) : (
        <img src={src} alt={title || "image"} loading="lazy" />
      )}
      <div className="media-body">
        <h4>{title || "未命名"}</h4>
        {tags?.length ? <p>{joinTags(tags)}</p> : null}
      </div>
    </article>
  );
}

function renderSection(section: PageConfig["sections"][number]) {
  if (section.kind === "narrative") {
    return (
      <div className="section-grid section-grid-narrative">
        {section.content.cards.map((card, index) => (
          <article key={`${section.id}-card-${index}`} className="narrative-card">
            <h4>{card.title}</h4>
            <p>{card.text}</p>
          </article>
        ))}
      </div>
    );
  }

  if (section.kind === "strip-gallery") {
    return (
      <div className="section-grid section-grid-strip">
        {section.content.items.map((item, index) => (
          <MediaCard
            key={`${section.id}-item-${index}`}
            src={item.image.src}
            title={item.image.title}
            tags={item.tags}
          />
        ))}
      </div>
    );
  }

  if (section.kind === "model-stage") {
    return (
      <div className="section-grid section-grid-model">
        <MediaCard
          src={section.content.main.image.src}
          title={section.content.main.image.title}
          tags={section.content.main.tags}
        />
        <div className="model-secondary-grid">
          {section.content.secondary?.map((item, index) => (
            <MediaCard
              key={`${section.id}-secondary-${index}`}
              src={item.image.src}
              title={item.image.title}
              tags={item.tags}
            />
          ))}
        </div>
      </div>
    );
  }

  if (section.kind === "atlas-grid") {
    return (
      <div className="section-grid section-grid-atlas">
        {section.content.items.map((item, index) => (
          <MediaCard
            key={`${section.id}-atlas-${index}`}
            src={item.image?.src}
            title={item.image?.title}
            tags={item.tags}
            placeholder={item.placeholder}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="section-grid section-grid-masonry">
      {section.content.items.map((item, index) => (
        <MediaCard
          key={`${section.id}-masonry-${index}`}
          src={item.image.src}
          title={item.image.title}
          tags={item.tags}
        />
      ))}
    </div>
  );
}

export function Renderer({ config }: RendererProps) {
  return (
    <div className="render-root" data-theme={config.theme.background}>
      <header className="render-topbar">
        <strong>{config.nav.brand}</strong>
        <nav>
          {config.nav.items.map((item) => (
            <a key={item.id} href={`#${item.id}`}>
              {item.label}
            </a>
          ))}
        </nav>
      </header>

      <section className="render-hero">
        <div>
          {config.hero.eyebrow ? <div className="hero-eyebrow">{config.hero.eyebrow}</div> : null}
          <h2>{config.hero.title}</h2>
          <p>{config.hero.lead}</p>
          <div className="hero-stats">
            {config.hero.stats?.map((stat, index) => (
              <article key={`hero-stat-${index}`}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </article>
            ))}
          </div>
        </div>
        <div className="hero-gallery">
          {config.hero.gallery.map((item, index) => (
            <div key={`hero-gallery-${index}`} className={item.role === "main" ? "hero-main" : "hero-sub"}>
              <img src={item.image.src} alt={item.image.title || "hero-image"} />
            </div>
          ))}
        </div>
      </section>

      {config.sections.map((section) => (
        <section id={section.id} key={section.id} className="render-section">
          <header>
            <h3>{section.title}</h3>
            {section.subtitle ? <p>{section.subtitle}</p> : null}
          </header>
          {renderSection(section)}
        </section>
      ))}
    </div>
  );
}
