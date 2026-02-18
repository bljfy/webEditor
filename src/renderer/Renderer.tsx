import { useEffect, useMemo, useRef, useState } from "react";
import type { PageConfig } from "../schema/pageConfig";

type RendererProps = {
  config: PageConfig;
};

type ViewerImage = {
  src: string;
  title: string;
};

function joinTags(tags?: string[]) {
  return tags?.length ? tags.join(" / ") : "";
}

function MediaCard({
  src,
  title,
  tags,
  placeholder,
  onOpen
}: {
  src?: string;
  title?: string;
  tags?: string[];
  placeholder?: boolean;
  onOpen: (image: ViewerImage) => void;
}) {
  const hasImage = src && src.trim().length > 0;
  const canOpen = hasImage && !placeholder;

  return (
    <article className="media-card">
      {placeholder || !hasImage ? (
        <div className="media-placeholder">PLACEHOLDER</div>
      ) : (
        <button
          type="button"
          className="media-open-trigger"
          onClick={() => onOpen({ src: src ?? "", title: title || "未命名图片" })}
          aria-label={`查看图片：${title || "未命名图片"}`}
        >
          <img src={src} alt={title || "image"} loading="lazy" />
        </button>
      )}
      <div className="media-body">
        <h4>{title || "未命名"}</h4>
        {tags?.length ? <p>{joinTags(tags)}</p> : null}
      </div>
      {canOpen ? <span className="zoom-hint">点击放大</span> : null}
    </article>
  );
}

function renderSection(section: PageConfig["sections"][number], onOpenImage: (image: ViewerImage) => void) {
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
            onOpen={onOpenImage}
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
          onOpen={onOpenImage}
        />
        <div className="model-secondary-grid">
          {section.content.secondary?.map((item, index) => (
            <MediaCard
              key={`${section.id}-secondary-${index}`}
              src={item.image.src}
              title={item.image.title}
              tags={item.tags}
              onOpen={onOpenImage}
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
            onOpen={onOpenImage}
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
          onOpen={onOpenImage}
        />
      ))}
    </div>
  );
}

function sectionVisibleClass(isClient: boolean, visibleMap: Record<string, boolean>, id: string) {
  if (!isClient) return "visible";
  return visibleMap[id] ? "visible" : "";
}

export function Renderer({ config }: RendererProps) {
  const isClient = typeof window !== "undefined";
  const firstSectionId = useMemo(() => config.sections[0]?.id ?? "", [config.sections]);
  const [activeSectionId, setActiveSectionId] = useState(firstSectionId);
  const [visibleSections, setVisibleSections] = useState<Record<string, boolean>>({});
  const [activeImage, setActiveImage] = useState<ViewerImage | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setActiveSectionId(config.sections[0]?.id ?? "");
    setVisibleSections({});
  }, [config.sections]);

  useEffect(() => {
    if (!rootRef.current || !isClient) return;

    const rootElement = rootRef.current;
    const scrollContainer = rootElement.closest(".preview-shell") as HTMLElement | null;

    const updateParallax = () => {
      const scrollTop = scrollContainer?.scrollTop ?? window.scrollY;
      rootElement.style.setProperty("--scroll-y", `${scrollTop}px`);
    };

    updateParallax();
    const listenerTarget: HTMLElement | Window = scrollContainer ?? window;
    listenerTarget.addEventListener("scroll", updateParallax, { passive: true });

    return () => {
      listenerTarget.removeEventListener("scroll", updateParallax);
    };
  }, [isClient]);

  useEffect(() => {
    if (!rootRef.current || !isClient || typeof IntersectionObserver === "undefined") {
      return;
    }

    const rootElement = rootRef.current;
    const sections = Array.from(rootElement.querySelectorAll<HTMLElement>(".render-section"));
    if (!sections.length) return;

    const scrollContainer = rootElement.closest(".preview-shell") as HTMLElement | null;

    const observer = new IntersectionObserver(
      (entries) => {
        let nextActiveId: string | null = null;
        let maxRatio = 0;

        setVisibleSections((prev) => {
          const next = { ...prev };
          for (const entry of entries) {
            if (entry.isIntersecting) {
              next[(entry.target as HTMLElement).id] = true;
            }

            if (entry.isIntersecting && entry.intersectionRatio >= maxRatio) {
              maxRatio = entry.intersectionRatio;
              nextActiveId = (entry.target as HTMLElement).id;
            }
          }
          return next;
        });

        if (nextActiveId) {
          setActiveSectionId(nextActiveId);
        }
      },
      {
        root: scrollContainer,
        rootMargin: "0px 0px -6% 0px",
        threshold: [0.05, 0.2, 0.35, 0.55, 0.75]
      }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [config.sections, isClient]);

  return (
    <div ref={rootRef} className="render-root" data-theme={config.theme.background}>
      <div className="render-noise" aria-hidden="true" />
      <header className="render-topbar">
        <strong>{config.nav.brand}</strong>
        <nav>
          {config.nav.items.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`render-nav-link ${activeSectionId === item.id ? "active" : ""}`}
              onClick={(event) => {
                event.preventDefault();
                const target = rootRef.current?.querySelector<HTMLElement>(`#${item.id}`);
                if (target) {
                  target.scrollIntoView({ behavior: "smooth", block: "start" });
                  setActiveSectionId(item.id);
                }
              }}
            >
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
              <button
                type="button"
                className="media-open-trigger"
                onClick={() =>
                  setActiveImage({
                    src: item.image.src,
                    title: item.image.title || "未命名图片"
                  })
                }
                aria-label={`查看图片：${item.image.title || "未命名图片"}`}
              >
                <img src={item.image.src} alt={item.image.title || "hero-image"} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {config.sections.map((section) => (
        <section
          id={section.id}
          key={section.id}
          className={`render-section section-anim ${sectionVisibleClass(isClient, visibleSections, section.id)}`}
        >
          <header>
            <h3>{section.title}</h3>
            {section.subtitle ? <p>{section.subtitle}</p> : null}
          </header>
          {renderSection(section, setActiveImage)}
        </section>
      ))}

      {activeImage ? (
        <div className="image-modal" onClick={() => setActiveImage(null)}>
          <div className="image-modal-content" onClick={(event) => event.stopPropagation()}>
            <img src={activeImage.src} alt={activeImage.title} />
            <div className="image-modal-bar">
              <span>{activeImage.title}</span>
              <button type="button" onClick={() => setActiveImage(null)}>
                关闭
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
