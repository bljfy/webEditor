import { useMemo, useState } from "react";
import {
  type PageConfig,
  type SectionKind,
  createDefaultSection,
  parsePageConfig
} from "../schema/pageConfig";

type PanelProps = {
  pageConfig: PageConfig;
  setPageConfig: (nextConfig: PageConfig) => void;
};

export function Panel({ pageConfig, setPageConfig }: PanelProps) {
  const [errorMessage, setErrorMessage] = useState("");
  const [sectionDrafts, setSectionDrafts] = useState<Record<string, string>>({});
  const [newSectionKind, setNewSectionKind] = useState<SectionKind>("narrative");

  const sectionKinds = useMemo<SectionKind[]>(
    () => ["narrative", "strip-gallery", "model-stage", "atlas-grid", "masonry-gallery"],
    []
  );

  function apply(nextConfig: unknown) {
    try {
      const parsed = parsePageConfig(nextConfig);
      setPageConfig(parsed);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "配置校验失败");
    }
  }

  function update(mutator: (draft: PageConfig) => void) {
    const nextConfig = structuredClone(pageConfig);
    mutator(nextConfig);
    apply(nextConfig);
  }

  return (
    <section className="editor-shell">
      <div className="panel-title-row">
        <h2>Panel</h2>
      </div>

      {errorMessage ? <p className="panel-error">{errorMessage}</p> : null}

      <fieldset>
        <legend>Meta</legend>
        <label>
          标题
          <input
            value={pageConfig.meta.title}
            onChange={(event) => update((draft) => {
              draft.meta.title = event.target.value;
            })}
          />
        </label>
        <label>
          描述
          <textarea
            value={pageConfig.meta.description ?? ""}
            onChange={(event) => update((draft) => {
              draft.meta.description = event.target.value;
            })}
          />
        </label>
        <label>
          语言
          <select
            value={pageConfig.meta.language}
            onChange={(event) => update((draft) => {
              draft.meta.language = event.target.value as "zh-CN" | "en";
            })}
          >
            <option value="zh-CN">中文（简体）</option>
            <option value="en">English</option>
          </select>
        </label>
      </fieldset>

      <fieldset>
        <legend>Theme</legend>
        <label>
          背景
          <select
            value={pageConfig.theme.background}
            onChange={(event) => update((draft) => {
              draft.theme.background = event.target.value as "light" | "dark";
            })}
          >
            <option value="light">light</option>
            <option value="dark">dark</option>
          </select>
        </label>
        <label>
          强调色
          <input
            value={pageConfig.theme.accentColor ?? ""}
            onChange={(event) => update((draft) => {
              draft.theme.accentColor = event.target.value;
            })}
          />
        </label>
        <label>
          圆角
          <select
            value={pageConfig.theme.radius ?? "md"}
            onChange={(event) => update((draft) => {
              draft.theme.radius = event.target.value as "sm" | "md" | "lg";
            })}
          >
            <option value="sm">sm</option>
            <option value="md">md</option>
            <option value="lg">lg</option>
          </select>
        </label>
      </fieldset>

      <fieldset>
        <legend>Nav</legend>
        <label>
          品牌
          <input
            value={pageConfig.nav.brand}
            onChange={(event) => update((draft) => {
              draft.nav.brand = event.target.value;
            })}
          />
        </label>
        {pageConfig.nav.items.map((item, index) => (
          <div key={`nav-${index}`} className="array-row">
            <input
              value={item.id}
              aria-label={`nav-id-${index}`}
              onChange={(event) => update((draft) => {
                draft.nav.items[index].id = event.target.value;
              })}
            />
            <input
              value={item.label}
              aria-label={`nav-label-${index}`}
              onChange={(event) => update((draft) => {
                draft.nav.items[index].label = event.target.value;
              })}
            />
            <button
              type="button"
              onClick={() => update((draft) => {
                draft.nav.items.splice(index, 1);
              })}
            >
              删除
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => update((draft) => {
            draft.nav.items.push({ id: `section-${draft.nav.items.length + 1}`, label: "新导航" });
          })}
        >
          新增导航
        </button>
      </fieldset>

      <fieldset>
        <legend>Hero</legend>
        <label>
          Eyebrow
          <input
            value={pageConfig.hero.eyebrow ?? ""}
            onChange={(event) => update((draft) => {
              draft.hero.eyebrow = event.target.value;
            })}
          />
        </label>
        <label>
          标题
          <input
            value={pageConfig.hero.title}
            onChange={(event) => update((draft) => {
              draft.hero.title = event.target.value;
            })}
          />
        </label>
        <label>
          导语
          <textarea
            value={pageConfig.hero.lead}
            onChange={(event) => update((draft) => {
              draft.hero.lead = event.target.value;
            })}
          />
        </label>

        <p className="block-label">统计</p>
        {(pageConfig.hero.stats ?? []).map((stat, index) => (
          <div key={`stat-${index}`} className="array-row">
            <input
              value={stat.value}
              onChange={(event) => update((draft) => {
                if (!draft.hero.stats) draft.hero.stats = [];
                draft.hero.stats[index].value = event.target.value;
              })}
            />
            <input
              value={stat.label}
              onChange={(event) => update((draft) => {
                if (!draft.hero.stats) draft.hero.stats = [];
                draft.hero.stats[index].label = event.target.value;
              })}
            />
            <button
              type="button"
              onClick={() => update((draft) => {
                if (!draft.hero.stats) return;
                draft.hero.stats.splice(index, 1);
              })}
            >
              删除
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => update((draft) => {
            if (!draft.hero.stats) draft.hero.stats = [];
            draft.hero.stats.push({ value: "0", label: "新指标" });
          })}
        >
          新增统计
        </button>

        <p className="block-label">画廊</p>
        {pageConfig.hero.gallery.map((item, index) => (
          <div key={`gallery-${index}`} className="gallery-row">
            <select
              value={item.role}
              onChange={(event) => update((draft) => {
                draft.hero.gallery[index].role = event.target.value as "main" | "secondary";
              })}
            >
              <option value="main">main</option>
              <option value="secondary">secondary</option>
            </select>
            <input
              value={item.image.src}
              placeholder="图片地址"
              onChange={(event) => update((draft) => {
                draft.hero.gallery[index].image.src = event.target.value;
              })}
            />
            <input
              value={item.image.title ?? ""}
              placeholder="图片标题"
              onChange={(event) => update((draft) => {
                draft.hero.gallery[index].image.title = event.target.value;
              })}
            />
            <button
              type="button"
              onClick={() => update((draft) => {
                draft.hero.gallery.splice(index, 1);
              })}
            >
              删除
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => update((draft) => {
            draft.hero.gallery.push({ role: "secondary", image: { src: "", title: "" } });
          })}
        >
          新增画廊项
        </button>
      </fieldset>

      <fieldset>
        <legend>Sections</legend>
        {pageConfig.sections.map((section, index) => (
          <article key={section.id} className="section-editor">
            <div className="array-row">
              <input
                value={section.id}
                onChange={(event) => update((draft) => {
                  draft.sections[index].id = event.target.value;
                })}
              />
              <select
                value={section.kind}
                onChange={(event) => update((draft) => {
                  const nextKind = event.target.value as SectionKind;
                  draft.sections[index] = createDefaultSection(nextKind, index);
                })}
              >
                {sectionKinds.map((kind) => (
                  <option key={kind} value={kind}>
                    {kind}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => update((draft) => {
                  draft.sections.splice(index, 1);
                })}
              >
                删除
              </button>
            </div>
            <label>
              标题
              <input
                value={section.title}
                onChange={(event) => update((draft) => {
                  draft.sections[index].title = event.target.value;
                })}
              />
            </label>
            <label>
              副标题
              <input
                value={section.subtitle ?? ""}
                onChange={(event) => update((draft) => {
                  draft.sections[index].subtitle = event.target.value;
                })}
              />
            </label>
            <label>
              内容 JSON
              <textarea
                value={sectionDrafts[section.id] ?? JSON.stringify(section.content, null, 2)}
                onChange={(event) => {
                  setSectionDrafts((prev) => ({
                    ...prev,
                    [section.id]: event.target.value
                  }));
                }}
              />
            </label>
            <button
              type="button"
              onClick={() => {
                const draftContent = sectionDrafts[section.id];
                if (!draftContent) return;
                try {
                  const parsedContent = JSON.parse(draftContent) as PageConfig["sections"][number]["content"];
                  update((draft) => {
                    draft.sections[index].content = parsedContent;
                  });
                  setSectionDrafts((prev) => {
                    const next = { ...prev };
                    delete next[section.id];
                    return next;
                  });
                } catch {
                  setErrorMessage(`Section ${section.id} 内容 JSON 解析失败`);
                }
              }}
            >
              应用内容 JSON
            </button>
          </article>
        ))}

        <div className="array-row">
          <select value={newSectionKind} onChange={(event) => setNewSectionKind(event.target.value as SectionKind)}>
            {sectionKinds.map((kind) => (
              <option key={`new-${kind}`} value={kind}>
                {kind}
              </option>
            ))}
          </select>
            <button
              type="button"
              onClick={() => {
                update((draft) => {
                  draft.sections.push(createDefaultSection(newSectionKind, draft.sections.length));
                });
              }}
            >
            新增区块
          </button>
        </div>
      </fieldset>

      <fieldset>
        <legend>JSON 导入</legend>
        <label>
          粘贴完整 PageConfig JSON
          <textarea
            placeholder={"{\n  \"meta\": ...\n}"}
            onBlur={(event) => {
              const raw = event.target.value.trim();
              if (!raw) return;

              try {
                const input = JSON.parse(raw) as unknown;
                apply(input);
              } catch {
                setErrorMessage("JSON 解析失败，请检查格式");
              }
            }}
          />
        </label>
      </fieldset>

      <p className="panel-hint">说明：所有编辑操作最终都归约为 setPageConfig(newConfig)。</p>
    </section>
  );
}
