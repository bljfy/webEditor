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

export function Panel({ pageConfig, setPageConfig, onExportHtml }: PanelProps) {
  const [errorMessage, setErrorMessage] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [newSectionKind, setNewSectionKind] = useState<SectionKind>("narrative");
  const [draftConfig, setDraftConfig] = useState<PageConfig>(() => structuredClone(pageConfig));
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const sectionKinds = useMemo<SectionKind[]>(
    () => ["narrative", "strip-gallery", "model-stage", "atlas-grid", "masonry-gallery"],
    []
  );

  useEffect(() => {
    setDraftConfig(structuredClone(pageConfig));
    setHasUnsavedChanges(false);
  }, [pageConfig]);

  function saveDraft() {
    try {
      const parsed = parsePageConfig(draftConfig);
      setPageConfig(parsed);
      setDraftConfig(structuredClone(parsed));
      setHasUnsavedChanges(false);
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
      return next;
    });
    setHasUnsavedChanges(true);
    setSaveMessage("");
    if (errorMessage) {
      setErrorMessage("");
    }
  }

  return (
    <section className="editor-shell">
      <div className="panel-title-row">
        <h2>编辑面板</h2>
        <div className="save-actions">
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
        <summary>顶部导航</summary>
        <div className="panel-group-body">
        <label>
          品牌名
          <input
            value={draftConfig.nav.brand}
            onChange={(event) =>
              update((draft) => {
                draft.nav.brand = event.target.value;
              })
            }
          />
        </label>
        {draftConfig.nav.items.map((item, index) => (
          <div key={`nav-${index}`} className="array-row">
            <input
              value={item.id}
              aria-label={`nav-id-${index}`}
              placeholder="锚点 ID"
              onChange={(event) =>
                update((draft) => {
                  draft.nav.items[index].id = event.target.value;
                })
              }
            />
            <input
              value={item.label}
              aria-label={`nav-label-${index}`}
              placeholder="显示名称"
              onChange={(event) =>
                update((draft) => {
                  draft.nav.items[index].label = event.target.value;
                })
              }
            />
            <button
              type="button"
              onClick={() =>
                update((draft) => {
                  draft.nav.items.splice(index, 1);
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
              draft.nav.items.push({
                id: `section-${draft.nav.items.length + 1}`,
                label: `导航 ${draft.nav.items.length + 1}`
              });
            })
          }
        >
          新增导航项
        </button>
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
          <details key={section.id} className="section-editor">
            <summary>{`${section.title || "未命名区块"} · ${SECTION_KIND_LABELS[section.kind]}`}</summary>
            <div className="section-editor-body">
            <div className="array-row">
              <input
                value={section.id}
                placeholder="区块 ID"
                onChange={(event) =>
                  update((draft) => {
                    draft.sections[index].id = event.target.value;
                  })
                }
              />
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
