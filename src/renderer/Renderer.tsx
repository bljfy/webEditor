import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PageConfig } from "../schema/pageConfig";

type RendererProps = {
  config: PageConfig;
};

type ViewerImage = {
  src: string;
  title: string;
};

function collectViewerImages(config: PageConfig): ViewerImage[] {
  const list: ViewerImage[] = [];
  const push = (src?: string, title?: string) => {
    if (!src || !src.trim()) return;
    list.push({ src, title: title?.trim() || "未命名图片" });
  };

  config.hero.gallery.forEach((item) => push(item.image.src, item.image.title));

  config.sections.forEach((section) => {
    if (section.kind === "narrative") return;

    if (section.kind === "strip-gallery") {
      section.content.items.forEach((item) => push(item.image.src, item.image.title));
      return;
    }

    if (section.kind === "model-stage") {
      push(section.content.main.image.src, section.content.main.image.title);
      section.content.secondary?.forEach((item) => push(item.image.src, item.image.title));
      return;
    }

    if (section.kind === "atlas-grid") {
      section.content.items.forEach((item) => {
        if (!item.placeholder) push(item.image?.src, item.image?.title);
      });
      return;
    }

    section.content.items.forEach((item) => push(item.image.src, item.image.title));
  });

  return list;
}

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
  if (!isClient) return "";
  return visibleMap[id] ? "visible" : "";
}

export function Renderer({ config }: RendererProps) {
  const isClient = typeof window !== "undefined";
  const firstSectionId = useMemo(() => config.sections[0]?.id ?? "", [config.sections]);
  const viewerImages = useMemo(() => collectViewerImages(config), [config]);
  const [activeSectionId, setActiveSectionId] = useState(firstSectionId);
  const [visibleSections, setVisibleSections] = useState<Record<string, boolean>>({});
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const activeImage = activeImageIndex === null ? null : viewerImages[activeImageIndex] ?? null;

  useEffect(() => {
    setActiveSectionId(config.sections[0]?.id ?? "");
    setVisibleSections({});
    setActiveImageIndex(null);
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
    if (!rootRef.current || !isClient) return;

    const rootElement = rootRef.current;
    const sections = Array.from(rootElement.querySelectorAll<HTMLElement>(".render-section"));
    if (!sections.length) return;

    if (typeof IntersectionObserver === "undefined") {
      setVisibleSections(() => Object.fromEntries(sections.map((section) => [section.id, true])));
      return;
    }

    const scrollContainer = rootElement.closest(".preview-shell") as HTMLElement | null;

    const observer = new IntersectionObserver(
      (entries) => {
        setVisibleSections((prev) => {
          const next = { ...prev };
          for (const entry of entries) {
            if (entry.isIntersecting) {
              next[(entry.target as HTMLElement).id] = true;
            }
          }
          return next;
        });
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

  useEffect(() => {
    if (!rootRef.current || !isClient) return;

    const rootElement = rootRef.current;
    const sections = Array.from(rootElement.querySelectorAll<HTMLElement>(".render-section"));
    if (!sections.length) return;

    const scrollContainer = rootElement.closest(".preview-shell") as HTMLElement | null;
    let rafId = 0;

    const updateActiveByScroll = () => {
      const topOffset = scrollContainer
        ? scrollContainer.getBoundingClientRect().top + 96
        : 96;

      let candidateId = sections[0].id;

      for (const section of sections) {
        const top = section.getBoundingClientRect().top;
        if (top - topOffset <= 0) {
          candidateId = section.id;
        } else {
          break;
        }
      }

      setActiveSectionId(candidateId);
    };

    const onScroll = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateActiveByScroll);
    };

    updateActiveByScroll();
    const listenerTarget: HTMLElement | Window = scrollContainer ?? window;
    listenerTarget.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      listenerTarget.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [config.sections, isClient]);

  function openImage(image: ViewerImage) {
    const index = viewerImages.findIndex((item) => item.src === image.src && item.title === image.title);
    setActiveImageIndex(index >= 0 ? index : 0);
  }

  const closeImage = useCallback(() => {
    setActiveImageIndex(null);
  }, []);

  const shiftImage = useCallback((step: number) => {
    if (!viewerImages.length) return;
    setActiveImageIndex((prev) => {
      const current = prev ?? 0;
      return (current + step + viewerImages.length) % viewerImages.length;
    });
  }, [viewerImages.length]);

  useEffect(() => {
    if (activeImageIndex === null) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeImage();
      if (event.key === "ArrowRight") shiftImage(1);
      if (event.key === "ArrowLeft") shiftImage(-1);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeImageIndex, closeImage, shiftImage]);

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
                onClick={() => openImage({ src: item.image.src, title: item.image.title || "未命名图片" })}
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
          {renderSection(section, openImage)}
        </section>
      ))}

      {activeImage ? (
        <div className="image-modal" onClick={closeImage}>
          <div className="image-modal-content" onClick={(event) => event.stopPropagation()}>
            <img src={activeImage.src} alt={activeImage.title} />
            <div className="image-modal-bar">
              <div className="image-modal-nav">
                <button type="button" onClick={() => shiftImage(-1)} aria-label="上一张">
                  上一张
                </button>
                <button type="button" onClick={() => shiftImage(1)} aria-label="下一张">
                  下一张
                </button>
              </div>
              <span>{activeImage.title}</span>
              <button type="button" onClick={closeImage}>
                关闭
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
