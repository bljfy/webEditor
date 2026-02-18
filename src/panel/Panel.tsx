import { useEffect, useMemo, useState } from "react";
import {
  type PageConfig,
  type SectionKind,
  createDefaultSection,
  parsePageConfig
} from "../schema/pageConfig";

type PanelProps = {
  pageConfig: PageConfig;
  setPageConfig: (nextConfig: PageConfig) => void;
  onUnsavedChange?: (hasUnsavedChanges: boolean) => void;
  onExportHtml: () => void;
};

const SECTION_KIND_LABELS: Record<SectionKind, string> = {
  narrative: "图文叙述",
  "strip-gallery": "横向画廊",
  "model-stage": "模型阶段",
  "atlas-grid": "场地网格",
  "masonry-gallery": "瀑布画廊"
};

function splitTags(raw: string): string[] | undefined {
  const tags = raw
    .split(/[，,]/)
    .map((item) => item.trim())
    .filter(Boolean);

  return tags.length ? tags : undefined;
}

function joinTags(tags?: string[]) {
  return tags?.join(", ") ?? "";
}

function isSameConfig(a: PageConfig, b: PageConfig) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function moveArrayItem<T>(list: T[], fromIndex: number, toIndex: number) {
  if (fromIndex === toIndex) return list;
  const next = [...list];
  const [removed] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, removed);
  return next;
}

function syncNavFromSections(config: PageConfig): PageConfig {
  const normalizeSectionTitle = (title: string, navLabel: string | undefined, index: number) => {
    const source = navLabel?.trim() ? navLabel : title;
    const clean = source.replace(/^\s*\d+\s*[.、-]?\s*/, "").trim();
    const base = clean || `区块 ${index + 1}`;
    return `${String(index + 1).padStart(2, "0")} ${base}`;
  };

  const next = structuredClone(config);
  next.sections = next.sections.map((section, index) => ({
    ...section,
    id: section.id?.trim() || `section-${index + 1}`
  }));

  next.nav.items = next.sections
    .filter((section) => section.includeInNav !== false)
    .map((section, index) => ({
      id: section.id || `section-${index + 1}`,
      label: normalizeSectionTitle(section.title ?? "", section.navLabel, index)
    }));
  return next;
}

export function Panel({ pageConfig, setPageConfig, onUnsavedChange, onExportHtml }: PanelProps) {
  const [errorMessage, setErrorMessage] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [newSectionKind, setNewSectionKind] = useState<SectionKind>("narrative");
  const [draftConfig, setDraftConfig] = useState<PageConfig>(() => structuredClone(pageConfig));
  const [historyPast, setHistoryPast] = useState<PageConfig[]>([]);
  const [historyFuture, setHistoryFuture] = useState<PageConfig[]>([]);
  const [draggingSectionIndex, setDraggingSectionIndex] = useState<number | null>(null);
  const [dragOverSectionIndex, setDragOverSectionIndex] = useState<number | null>(null);

  const sectionKinds = useMemo<SectionKind[]>(
    () => ["narrative", "strip-gallery", "model-stage", "atlas-grid", "masonry-gallery"],
    []
  );

  const hasUnsavedChanges = useMemo(() => !isSameConfig(draftConfig, pageConfig), [draftConfig, pageConfig]);

  useEffect(() => {
    setDraftConfig(syncNavFromSections(pageConfig));
    setHistoryPast([]);
    setHistoryFuture([]);
  }, [pageConfig]);

  useEffect(() => {
    onUnsavedChange?.(hasUnsavedChanges);
  }, [hasUnsavedChanges, onUnsavedChange]);

  function saveDraft() {
    try {
      const parsed = parsePageConfig(syncNavFromSections(draftConfig));
      setPageConfig(parsed);
      setDraftConfig(structuredClone(parsed));
      setHistoryPast([]);
      setHistoryFuture([]);
      setErrorMessage("");
      setSaveMessage("已保存，预览已更新。");
    } catch (error) {
      setSaveMessage("");
      setErrorMessage(error instanceof Error ? error.message : "配置校验失败");
    }
  }

  function update(mutator: (draft: PageConfig) => void) {
    setDraftConfig((prev) => {
      const next = structuredClone(prev);
      mutator(next);
      const synced = syncNavFromSections(next);
      setHistoryPast((past) => [...past.slice(-49), prev]);
      setHistoryFuture([]);
      return synced;
    });
    setSaveMessage("");
    if (errorMessage) {
      setErrorMessage("");
    }
  }

  function undoDraft() {
    if (!historyPast.length) return;
    const previous = historyPast[historyPast.length - 1];
    setHistoryPast((past) => past.slice(0, -1));
    setHistoryFuture((future) => [structuredClone(draftConfig), ...future.slice(0, 49)]);
    setDraftConfig(structuredClone(previous));
    setSaveMessage("");
    setErrorMessage("");
  }

  function redoDraft() {
    if (!historyFuture.length) return;
    const [next, ...rest] = historyFuture;
    setHistoryFuture(rest);
    setHistoryPast((past) => [...past.slice(-49), structuredClone(draftConfig)]);
    setDraftConfig(structuredClone(next));
    setSaveMessage("");
    setErrorMessage("");
  }

  function reorderSection(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex) return;
    update((draft) => {
      draft.sections = moveArrayItem(draft.sections, fromIndex, toIndex);
    });
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey)) return;
      const target = event.target as HTMLElement | null;
      const tagName = target?.tagName.toLowerCase();
      if (target?.isContentEditable || tagName === "input" || tagName === "textarea") return;

      if (event.key.toLowerCase() === "z" && !event.shiftKey) {
        event.preventDefault();
        undoDraft();
        return;
      }

      if (event.key.toLowerCase() === "y" || (event.key.toLowerCase() === "z" && event.shiftKey)) {
        event.preventDefault();
        redoDraft();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  return (
    <section className="editor-shell">
      <div className="panel-title-row">
        <h2>编辑面板</h2>
        <div className="save-actions">
          <button type="button" onClick={undoDraft} disabled={!historyPast.length}>
            撤销
          </button>
          <button type="button" onClick={redoDraft} disabled={!historyFuture.length}>
            重做
          </button>
          <button type="button" onClick={saveDraft} disabled={!hasUnsavedChanges}>
            保存更改
          </button>
          <button type="button" onClick={onExportHtml}>
            导出 HTML
          </button>
        </div>
      </div>

      <p className="panel-hint">
        面向零代码用户：可先自由编辑，再点击“保存更改”统一校验并更新预览。
      </p>
      <p className="panel-hint">导航栏由内容区块自动生成，可按区块勾选是否加入，并可单独设置导航显示文字。</p>
      <p className="panel-hint">支持撤销/重做（Ctrl/Cmd + Z、Ctrl/Cmd + Y），区块支持拖拽排序。</p>
      {errorMessage ? <p className="panel-error">{errorMessage}</p> : null}
      {saveMessage ? <p className="panel-success">{saveMessage}</p> : null}

      <details className="panel-group" open>
        <summary>站点信息</summary>
        <div className="panel-group-body">
        <label>
          页面标题
          <input
            value={draftConfig.meta.title}
            onChange={(event) =>
              update((draft) => {
                draft.meta.title = event.target.value;
              })
            }
          />
        </label>
        <label>
          页面描述
          <textarea
            value={draftConfig.meta.description ?? ""}
            onChange={(event) =>
              update((draft) => {
                draft.meta.description = event.target.value;
              })
            }
          />
        </label>
        <label>
          页面语言
          <select
            value={draftConfig.meta.language}
            onChange={(event) =>
              update((draft) => {
                draft.meta.language = event.target.value as "zh-CN" | "en";
              })
            }
          >
            <option value="zh-CN">中文（简体）</option>
            <option value="en">English</option>
          </select>
        </label>
        </div>
      </details>

      <details className="panel-group">
        <summary>外观样式</summary>
        <div className="panel-group-body">
        <label>
          背景风格
          <select
            value={draftConfig.theme.background}
            onChange={(event) =>
              update((draft) => {
                draft.theme.background = event.target.value as "light" | "dark";
              })
            }
          >
            <option value="light">浅色</option>
            <option value="dark">深色</option>
          </select>
        </label>
        <label>
          主题色（可填 #1f6feb）
          <input
            value={draftConfig.theme.accentColor ?? ""}
            onChange={(event) =>
              update((draft) => {
                draft.theme.accentColor = event.target.value;
              })
            }
          />
        </label>
        <label>
          圆角大小
          <select
            value={draftConfig.theme.radius ?? "md"}
            onChange={(event) =>
              update((draft) => {
                draft.theme.radius = event.target.value as "sm" | "md" | "lg";
              })
            }
          >
            <option value="sm">小</option>
            <option value="md">中</option>
            <option value="lg">大</option>
          </select>
        </label>
        </div>
      </details>

      <details className="panel-group">
        <summary>页脚设置</summary>
        <div className="panel-group-body">
          <label>
            页脚标语
            <input
              value={draftConfig.footer.slogan}
              onChange={(event) =>
                update((draft) => {
                  draft.footer.slogan = event.target.value;
                })
              }
            />
          </label>
          <label>
            版权文案（可选）
            <input
              value={draftConfig.footer.copyright ?? ""}
              onChange={(event) =>
                update((draft) => {
                  draft.footer.copyright = event.target.value;
                })
              }
            />
          </label>
          {(draftConfig.footer.links ?? []).map((link, index) => (
            <div key={`footer-link-${index}`} className="array-row">
              <input
                value={link.label}
                aria-label={`footer-label-${index}`}
                placeholder="链接名称"
                onChange={(event) =>
                  update((draft) => {
                    draft.footer.links[index].label = event.target.value;
                  })
                }
              />
              <input
                value={link.href}
                aria-label={`footer-href-${index}`}
                placeholder="链接地址（如 #narrative / https://...）"
                onChange={(event) =>
                  update((draft) => {
                    draft.footer.links[index].href = event.target.value;
                  })
                }
              />
              <button
                type="button"
                onClick={() =>
                  update((draft) => {
                    draft.footer.links.splice(index, 1);
                  })
                }
              >
                删除
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              update((draft) => {
                draft.footer.links.push({
                  label: `页脚链接 ${draft.footer.links.length + 1}`,
                  href: "#"
                });
              })
            }
          >
            新增页脚链接
          </button>
        </div>
      </details>

      <details className="panel-group">
        <summary>首屏（Hero）</summary>
        <div className="panel-group-body">
        <label>
          小标题（可选）
          <input
            value={draftConfig.hero.eyebrow ?? ""}
            onChange={(event) =>
              update((draft) => {
                draft.hero.eyebrow = event.target.value;
              })
            }
          />
        </label>
        <label>
          主标题
          <input
            value={draftConfig.hero.title}
            onChange={(event) =>
              update((draft) => {
                draft.hero.title = event.target.value;
              })
            }
          />
        </label>
        <label>
          导语
          <textarea
            value={draftConfig.hero.lead}
            onChange={(event) =>
              update((draft) => {
                draft.hero.lead = event.target.value;
              })
            }
          />
        </label>

        <p className="block-label">数据卡片</p>
        {(draftConfig.hero.stats ?? []).map((stat, index) => (
          <div key={`stat-${index}`} className="array-row">
            <input
              value={stat.value}
              placeholder="数值"
              onChange={(event) =>
                update((draft) => {
                  if (!draft.hero.stats) draft.hero.stats = [];
                  draft.hero.stats[index].value = event.target.value;
                })
              }
            />
            <input
              value={stat.label}
              placeholder="说明"
              onChange={(event) =>
                update((draft) => {
                  if (!draft.hero.stats) draft.hero.stats = [];
                  draft.hero.stats[index].label = event.target.value;
                })
              }
            />
            <button
              type="button"
              onClick={() =>
                update((draft) => {
                  if (!draft.hero.stats) return;
                  draft.hero.stats.splice(index, 1);
                })
              }
            >
              删除
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            update((draft) => {
              if (!draft.hero.stats) draft.hero.stats = [];
              draft.hero.stats.push({ value: "0", label: "新指标" });
            })
          }
        >
          新增数据卡片
        </button>

        <p className="block-label">首屏图片</p>
        {draftConfig.hero.gallery.map((item, index) => (
          <div key={`gallery-${index}`} className="gallery-row">
            <select
              value={item.role}
              onChange={(event) =>
                update((draft) => {
                  draft.hero.gallery[index].role = event.target.value as "main" | "secondary";
                })
              }
            >
              <option value="main">主图</option>
              <option value="secondary">副图</option>
            </select>
            <input
              value={item.image.src}
              placeholder="图片地址"
              onChange={(event) =>
                update((draft) => {
                  draft.hero.gallery[index].image.src = event.target.value;
                })
              }
            />
            <input
              value={item.image.title ?? ""}
              placeholder="图片标题"
              onChange={(event) =>
                update((draft) => {
                  draft.hero.gallery[index].image.title = event.target.value;
                })
              }
            />
            <button
              type="button"
              onClick={() =>
                update((draft) => {
                  draft.hero.gallery.splice(index, 1);
                })
              }
            >
              删除
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            update((draft) => {
              draft.hero.gallery.push({ role: "secondary", image: { src: "", title: "" } });
            })
          }
        >
          新增图片
        </button>
        </div>
      </details>

      <details className="panel-group" open>
        <summary>内容区块</summary>
        <div className="panel-group-body">
        {draftConfig.sections.map((section, index) => (
          <details
            key={section.id}
            className={`section-editor ${dragOverSectionIndex === index ? "drag-over" : ""}`}
            onDragOver={(event) => {
              event.preventDefault();
              if (dragOverSectionIndex !== index) {
                setDragOverSectionIndex(index);
              }
            }}
            onDrop={(event) => {
              event.preventDefault();
              if (draggingSectionIndex !== null) {
                reorderSection(draggingSectionIndex, index);
              }
              setDraggingSectionIndex(null);
              setDragOverSectionIndex(null);
            }}
            onDragLeave={(event) => {
              if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
              setDragOverSectionIndex((prev) => (prev === index ? null : prev));
            }}
          >
            <summary>
              <span className="section-title">{`${section.title || "未命名区块"} · ${SECTION_KIND_LABELS[section.kind]}`}</span>
              <button
                type="button"
                className="drag-handle"
                draggable
                onClick={(event) => event.preventDefault()}
                onDragStart={() => {
                  setDraggingSectionIndex(index);
                  setDragOverSectionIndex(index);
                }}
                onDragEnd={() => {
                  setDraggingSectionIndex(null);
                  setDragOverSectionIndex(null);
                }}
                aria-label={`拖拽排序区块：${section.title || `第 ${index + 1} 个区块`}`}
                title="拖拽排序"
              >
                拖拽排序
              </button>
            </summary>
            <div className="section-editor-body">
            <div className="array-row">
              <select
                value={section.kind}
                onChange={(event) =>
                  update((draft) => {
                    const nextKind = event.target.value as SectionKind;
                    draft.sections[index] = createDefaultSection(nextKind, index);
                  })
                }
              >
                {sectionKinds.map((kind) => (
                  <option key={kind} value={kind}>
                    {SECTION_KIND_LABELS[kind]}
                  </option>
                ))}
              </select>
              <div className="inline-hint">区块锚点 ID 由系统自动维护，普通模式无需设置。</div>
              <button
                type="button"
                onClick={() =>
                  update((draft) => {
                    draft.sections.splice(index, 1);
                  })
                }
              >
                删除区块
              </button>
            </div>

            <label>
              区块标题
              <input
                value={section.title}
                onChange={(event) =>
                  update((draft) => {
                    draft.sections[index].title = event.target.value;
                  })
                }
              />
            </label>

            <label>
              导航显示文字（可选）
              <input
                value={section.navLabel ?? ""}
                placeholder="不填则使用区块标题"
                onChange={(event) =>
                  update((draft) => {
                    draft.sections[index].navLabel = event.target.value;
                  })
                }
              />
            </label>

            <label>
              区块副标题（可选）
              <input
                value={section.subtitle ?? ""}
                onChange={(event) =>
                  update((draft) => {
                    draft.sections[index].subtitle = event.target.value;
                  })
                }
              />
            </label>

            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={section.includeInNav !== false}
                onChange={(event) =>
                  update((draft) => {
                    draft.sections[index].includeInNav = event.target.checked;
                  })
                }
              />
              加入导航栏
            </label>

            {section.kind === "narrative" ? (
              <>
                <p className="block-label">叙述卡片</p>
                {section.content.cards.map((card, cardIndex) => (
                  <div key={`${section.id}-card-${cardIndex}`} className="array-row">
                    <input
                      value={card.title}
                      placeholder="卡片标题"
                      onChange={(event) =>
                        update((draft) => {
                          if (draft.sections[index].kind !== "narrative") return;
                          draft.sections[index].content.cards[cardIndex].title = event.target.value;
                        })
                      }
                    />
                    <input
                      value={card.text}
                      placeholder="卡片说明"
                      onChange={(event) =>
                        update((draft) => {
                          if (draft.sections[index].kind !== "narrative") return;
                          draft.sections[index].content.cards[cardIndex].text = event.target.value;
                        })
                      }
                    />
                    <button
                      type="button"
                      onClick={() =>
                        update((draft) => {
                          if (draft.sections[index].kind !== "narrative") return;
                          draft.sections[index].content.cards.splice(cardIndex, 1);
                        })
                      }
                    >
                      删除
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    update((draft) => {
                      if (draft.sections[index].kind !== "narrative") return;
                      draft.sections[index].content.cards.push({ title: "新卡片", text: "请输入说明" });
                    })
                  }
                >
                  新增叙述卡片
                </button>
              </>
            ) : null}

            {section.kind === "strip-gallery" ? (
              <>
                <p className="block-label">横向图片</p>
                {section.content.items.map((item, itemIndex) => (
                  <div key={`${section.id}-strip-${itemIndex}`} className="gallery-row">
                    <input
                      value={item.image.src}
                      placeholder="图片地址"
                      onChange={(event) =>
                        update((draft) => {
                          if (draft.sections[index].kind !== "strip-gallery") return;
                          draft.sections[index].content.items[itemIndex].image.src = event.target.value;
                        })
                      }
                    />
                    <input
                      value={item.image.title ?? ""}
                      placeholder="图片标题"
                      onChange={(event) =>
                        update((draft) => {
                          if (draft.sections[index].kind !== "strip-gallery") return;
                          draft.sections[index].content.items[itemIndex].image.title = event.target.value;
                        })
                      }
                    />
                    <input
                      value={joinTags(item.tags)}
                      placeholder="标签，用逗号分隔"
                      onChange={(event) =>
                        update((draft) => {
                          if (draft.sections[index].kind !== "strip-gallery") return;
                          draft.sections[index].content.items[itemIndex].tags = splitTags(event.target.value);
                        })
                      }
                    />
                    <button
                      type="button"
                      onClick={() =>
                        update((draft) => {
                          if (draft.sections[index].kind !== "strip-gallery") return;
                          draft.sections[index].content.items.splice(itemIndex, 1);
                        })
                      }
                    >
                      删除
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    update((draft) => {
                      if (draft.sections[index].kind !== "strip-gallery") return;
                      draft.sections[index].content.items.push({ image: { src: "", title: "" }, tags: ["新标签"] });
                    })
                  }
                >
                  新增图片
                </button>
              </>
            ) : null}

            {section.kind === "model-stage" ? (
              <>
                <p className="block-label">主模型</p>
                <label>
                  主图地址
                  <input
                    value={section.content.main.image.src}
                    onChange={(event) =>
                      update((draft) => {
                        if (draft.sections[index].kind !== "model-stage") return;
                        draft.sections[index].content.main.image.src = event.target.value;
                      })
                    }
                  />
                </label>
                <label>
                  主图标题
                  <input
                    value={section.content.main.image.title ?? ""}
                    onChange={(event) =>
                      update((draft) => {
                        if (draft.sections[index].kind !== "model-stage") return;
                        draft.sections[index].content.main.image.title = event.target.value;
                      })
                    }
                  />
                </label>
                <label>
                  主图标签
                  <input
                    value={joinTags(section.content.main.tags)}
                    placeholder="标签，用逗号分隔"
                    onChange={(event) =>
                      update((draft) => {
                        if (draft.sections[index].kind !== "model-stage") return;
                        draft.sections[index].content.main.tags = splitTags(event.target.value);
                      })
                    }
                  />
                </label>

                <p className="block-label">次级模型</p>
                {(section.content.secondary ?? []).map((item, itemIndex) => (
                  <div key={`${section.id}-model-${itemIndex}`} className="gallery-row">
                    <input
                      value={item.image.src}
                      placeholder="图片地址"
                      onChange={(event) =>
                        update((draft) => {
                          if (draft.sections[index].kind !== "model-stage") return;
                          if (!draft.sections[index].content.secondary) draft.sections[index].content.secondary = [];
                          draft.sections[index].content.secondary[itemIndex].image.src = event.target.value;
                        })
                      }
                    />
                    <input
                      value={item.image.title ?? ""}
                      placeholder="图片标题"
                      onChange={(event) =>
                        update((draft) => {
                          if (draft.sections[index].kind !== "model-stage") return;
                          if (!draft.sections[index].content.secondary) draft.sections[index].content.secondary = [];
                          draft.sections[index].content.secondary[itemIndex].image.title = event.target.value;
                        })
                      }
                    />
                    <input
                      value={joinTags(item.tags)}
                      placeholder="标签，用逗号分隔"
                      onChange={(event) =>
                        update((draft) => {
                          if (draft.sections[index].kind !== "model-stage") return;
                          if (!draft.sections[index].content.secondary) draft.sections[index].content.secondary = [];
                          draft.sections[index].content.secondary[itemIndex].tags = splitTags(event.target.value);
                        })
                      }
                    />
                    <button
                      type="button"
                      onClick={() =>
                        update((draft) => {
                          if (draft.sections[index].kind !== "model-stage") return;
                          if (!draft.sections[index].content.secondary) return;
                          draft.sections[index].content.secondary.splice(itemIndex, 1);
                        })
                      }
                    >
                      删除
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    update((draft) => {
                      if (draft.sections[index].kind !== "model-stage") return;
                      if (!draft.sections[index].content.secondary) draft.sections[index].content.secondary = [];
                      draft.sections[index].content.secondary.push({
                        image: { src: "", title: "" },
                        tags: ["次级"]
                      });
                    })
                  }
                >
                  新增次级模型
                </button>
              </>
            ) : null}

            {section.kind === "atlas-grid" ? (
              <>
                <p className="block-label">网格项</p>
                {section.content.items.map((item, itemIndex) => (
                  <div key={`${section.id}-atlas-${itemIndex}`} className="atlas-row">
                    <label className="checkbox-row">
                      <input
                        type="checkbox"
                        checked={Boolean(item.placeholder)}
                        onChange={(event) =>
                          update((draft) => {
                            if (draft.sections[index].kind !== "atlas-grid") return;
                            draft.sections[index].content.items[itemIndex].placeholder = event.target.checked;
                            if (event.target.checked) {
                              draft.sections[index].content.items[itemIndex].image = undefined;
                            }
                          })
                        }
                      />
                      占位卡片
                    </label>
                    <input
                      value={item.image?.src ?? ""}
                      placeholder="图片地址"
                      onChange={(event) =>
                        update((draft) => {
                          if (draft.sections[index].kind !== "atlas-grid") return;
                          if (!draft.sections[index].content.items[itemIndex].image) {
                            draft.sections[index].content.items[itemIndex].image = { src: "", title: "" };
                          }
                          draft.sections[index].content.items[itemIndex].image!.src = event.target.value;
                          draft.sections[index].content.items[itemIndex].placeholder = false;
                        })
                      }
                    />
                    <input
                      value={item.image?.title ?? ""}
                      placeholder="图片标题"
                      onChange={(event) =>
                        update((draft) => {
                          if (draft.sections[index].kind !== "atlas-grid") return;
                          if (!draft.sections[index].content.items[itemIndex].image) {
                            draft.sections[index].content.items[itemIndex].image = { src: "", title: "" };
                          }
                          draft.sections[index].content.items[itemIndex].image!.title = event.target.value;
                        })
                      }
                    />
                    <input
                      value={joinTags(item.tags)}
                      placeholder="标签，用逗号分隔"
                      onChange={(event) =>
                        update((draft) => {
                          if (draft.sections[index].kind !== "atlas-grid") return;
                          draft.sections[index].content.items[itemIndex].tags = splitTags(event.target.value);
                        })
                      }
                    />
                    <button
                      type="button"
                      onClick={() =>
                        update((draft) => {
                          if (draft.sections[index].kind !== "atlas-grid") return;
                          draft.sections[index].content.items.splice(itemIndex, 1);
                        })
                      }
                    >
                      删除
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    update((draft) => {
                      if (draft.sections[index].kind !== "atlas-grid") return;
                      draft.sections[index].content.items.push({ placeholder: true, tags: ["占位"] });
                    })
                  }
                >
                  新增网格项
                </button>
              </>
            ) : null}

            {section.kind === "masonry-gallery" ? (
              <>
                <p className="block-label">瀑布图片</p>
                {section.content.items.map((item, itemIndex) => (
                  <div key={`${section.id}-masonry-${itemIndex}`} className="gallery-row">
                    <input
                      value={item.image.src}
                      placeholder="图片地址"
                      onChange={(event) =>
                        update((draft) => {
                          if (draft.sections[index].kind !== "masonry-gallery") return;
                          draft.sections[index].content.items[itemIndex].image.src = event.target.value;
                        })
                      }
                    />
                    <input
                      value={item.image.title ?? ""}
                      placeholder="图片标题"
                      onChange={(event) =>
                        update((draft) => {
                          if (draft.sections[index].kind !== "masonry-gallery") return;
                          draft.sections[index].content.items[itemIndex].image.title = event.target.value;
                        })
                      }
                    />
                    <input
                      value={joinTags(item.tags)}
                      placeholder="标签，用逗号分隔"
                      onChange={(event) =>
                        update((draft) => {
                          if (draft.sections[index].kind !== "masonry-gallery") return;
                          draft.sections[index].content.items[itemIndex].tags = splitTags(event.target.value);
                        })
                      }
                    />
                    <button
                      type="button"
                      onClick={() =>
                        update((draft) => {
                          if (draft.sections[index].kind !== "masonry-gallery") return;
                          draft.sections[index].content.items.splice(itemIndex, 1);
                        })
                      }
                    >
                      删除
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    update((draft) => {
                      if (draft.sections[index].kind !== "masonry-gallery") return;
                      draft.sections[index].content.items.push({ image: { src: "", title: "" }, tags: ["新标签"] });
                    })
                  }
                >
                  新增图片
                </button>
              </>
            ) : null}
            </div>
          </details>
        ))}

        <div className="array-row">
          <select value={newSectionKind} onChange={(event) => setNewSectionKind(event.target.value as SectionKind)}>
            {sectionKinds.map((kind) => (
              <option key={`new-${kind}`} value={kind}>
                {SECTION_KIND_LABELS[kind]}
              </option>
            ))}
          </select>
          <div className="inline-hint">选择区块类型后点击右侧按钮添加。</div>
          <button
            type="button"
            onClick={() =>
              update((draft) => {
                draft.sections.push(createDefaultSection(newSectionKind, draft.sections.length));
              })
            }
          >
            新增区块
          </button>
        </div>
        </div>
      </details>

      <p className="panel-hint">提示：若输入后出现红色报错，请检查该字段是否为空或格式是否正确。</p>
    </section>
  );
}
