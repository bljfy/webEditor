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

export function Panel({ pageConfig, setPageConfig }: PanelProps) {
  const [errorMessage, setErrorMessage] = useState("");
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
        <h2>编辑面板</h2>
      </div>

      <p className="panel-hint">面向零代码用户：以下设置都可直接点选或输入，无需写任何 JSON。</p>
      {errorMessage ? <p className="panel-error">{errorMessage}</p> : null}

      <fieldset>
        <legend>站点信息</legend>
        <label>
          页面标题
          <input
            value={pageConfig.meta.title}
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
            value={pageConfig.meta.description ?? ""}
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
            value={pageConfig.meta.language}
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
      </fieldset>

      <fieldset>
        <legend>外观样式</legend>
        <label>
          背景风格
          <select
            value={pageConfig.theme.background}
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
            value={pageConfig.theme.accentColor ?? ""}
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
            value={pageConfig.theme.radius ?? "md"}
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
      </fieldset>

      <fieldset>
        <legend>顶部导航</legend>
        <label>
          品牌名
          <input
            value={pageConfig.nav.brand}
            onChange={(event) =>
              update((draft) => {
                draft.nav.brand = event.target.value;
              })
            }
          />
        </label>
        {pageConfig.nav.items.map((item, index) => (
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
      </fieldset>

      <fieldset>
        <legend>首屏（Hero）</legend>
        <label>
          小标题（可选）
          <input
            value={pageConfig.hero.eyebrow ?? ""}
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
            value={pageConfig.hero.title}
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
            value={pageConfig.hero.lead}
            onChange={(event) =>
              update((draft) => {
                draft.hero.lead = event.target.value;
              })
            }
          />
        </label>

        <p className="block-label">数据卡片</p>
        {(pageConfig.hero.stats ?? []).map((stat, index) => (
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
        {pageConfig.hero.gallery.map((item, index) => (
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
      </fieldset>

      <fieldset>
        <legend>内容区块</legend>
        {pageConfig.sections.map((section, index) => (
          <article key={section.id} className="section-editor">
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
          </article>
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
      </fieldset>

      <p className="panel-hint">提示：若输入后出现红色报错，请检查该字段是否为空或格式是否正确。</p>
    </section>
  );
}
