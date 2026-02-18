import { z } from "zod";

const languageSchema = z.enum(["zh-CN", "en"]);
const themeBackgroundSchema = z.enum(["dark", "light"]);
const themeRadiusSchema = z.enum(["sm", "md", "lg"]);
export type SectionKind =
  | "narrative"
  | "strip-gallery"
  | "model-stage"
  | "atlas-grid"
  | "masonry-gallery";

const imageAssetSchema = z.object({
  src: z.string().min(1),
  title: z.string().optional(),
  note: z.string().optional()
});

const navItemSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1)
});

const heroStatSchema = z.object({
  value: z.string().min(1),
  label: z.string().min(1)
});

const heroGalleryItemSchema = z.object({
  role: z.enum(["main", "secondary"]),
  image: imageAssetSchema
});

const footerLinkSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1)
});

const narrativeSectionSchema = z.object({
  id: z.string().min(1),
  kind: z.literal("narrative"),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  includeInNav: z.boolean().optional(),
  content: z.object({
    cards: z.array(
      z.object({
        title: z.string().min(1),
        text: z.string().min(1)
      })
    )
  })
});

const stripGallerySectionSchema = z.object({
  id: z.string().min(1),
  kind: z.literal("strip-gallery"),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  includeInNav: z.boolean().optional(),
  content: z.object({
    items: z.array(
      z.object({
        image: imageAssetSchema,
        tags: z.array(z.string()).optional()
      })
    )
  })
});

const modelStageSectionSchema = z.object({
  id: z.string().min(1),
  kind: z.literal("model-stage"),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  includeInNav: z.boolean().optional(),
  content: z.object({
    main: z.object({
      image: imageAssetSchema,
      tags: z.array(z.string()).optional()
    }),
    secondary: z
      .array(
        z.object({
          image: imageAssetSchema,
          tags: z.array(z.string()).optional()
        })
      )
      .optional()
  })
});

const atlasGridSectionSchema = z.object({
  id: z.string().min(1),
  kind: z.literal("atlas-grid"),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  includeInNav: z.boolean().optional(),
  content: z.object({
    items: z.array(
      z.object({
        image: imageAssetSchema.optional(),
        placeholder: z.boolean().optional(),
        tags: z.array(z.string()).optional()
      })
    )
  })
});

const masonryGallerySectionSchema = z.object({
  id: z.string().min(1),
  kind: z.literal("masonry-gallery"),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  includeInNav: z.boolean().optional(),
  content: z.object({
    items: z.array(
      z.object({
        image: imageAssetSchema,
        tags: z.array(z.string()).optional()
      })
    )
  })
});

const sectionSchema = z.discriminatedUnion("kind", [
  narrativeSectionSchema,
  stripGallerySectionSchema,
  modelStageSectionSchema,
  atlasGridSectionSchema,
  masonryGallerySectionSchema
]);

export const pageConfigSchema = z.object({
  meta: z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    language: languageSchema.default("zh-CN")
  }),
  theme: z.object({
    background: themeBackgroundSchema,
    accentColor: z.string().optional(),
    radius: themeRadiusSchema.optional()
  }),
  nav: z.object({
    brand: z.string().min(1),
    items: z.array(navItemSchema)
  }),
  hero: z.object({
    eyebrow: z.string().optional(),
    title: z.string().min(1),
    lead: z.string().min(1),
    stats: z.array(heroStatSchema).optional(),
    gallery: z.array(heroGalleryItemSchema).min(1)
  }),
  footer: z.object({
    slogan: z.string().min(1),
    links: z.array(footerLinkSchema),
    copyright: z.string().optional()
  }),
  sections: z.array(sectionSchema)
});

export type PageConfig = z.infer<typeof pageConfigSchema>;

export const defaultPageConfig: PageConfig = {
  meta: {
    title: "建筑展示模板",
    description: "以配置驱动的单页展示模板",
    language: "zh-CN"
  },
  theme: {
    background: "light",
    accentColor: "#1f6feb",
    radius: "md"
  },
  nav: {
    brand: "ARCH TEMPLATE",
    items: [
      { id: "narrative", label: "项目叙述" },
      { id: "strip", label: "图纸条带" },
      { id: "models", label: "模型阶段" },
      { id: "atlas", label: "场地网格" },
      { id: "masonry", label: "渲染墙" }
    ]
  },
  hero: {
    eyebrow: "CONFIG DRIVEN",
    title: "Schema 驱动页面生成",
    lead: "Panel 仅负责编辑配置，Preview 只读展示 Renderer 输出。",
    stats: [
      { value: "5", label: "SectionKinds" },
      { value: "1", label: "单一状态源" },
      { value: "100%", label: "配置驱动" }
    ],
    gallery: [
      {
        role: "main",
        image: { src: "https://picsum.photos/seed/template-main/1280/860", title: "主图" }
      },
      {
        role: "secondary",
        image: { src: "https://picsum.photos/seed/template-sub1/960/640", title: "副图一" }
      },
      {
        role: "secondary",
        image: { src: "https://picsum.photos/seed/template-sub2/960/640", title: "副图二" }
      }
    ]
  },
  footer: {
    slogan: "让每个人都能快速搭建好看的页面",
    links: [
      { label: "回到顶部", href: "#narrative" },
      { label: "GitHub", href: "https://github.com" },
      { label: "联系我们", href: "mailto:hello@example.com" }
    ],
    copyright: "保留所有权利"
  },
  sections: [
    {
      id: "narrative",
      kind: "narrative",
      title: "01 项目叙述",
      subtitle: "模板目标和阅读路径",
      includeInNav: true,
      content: {
        cards: [
          { title: "背景", text: "面向静态部署场景，快速完成单页展示。" },
          { title: "策略", text: "结构化配置驱动内容渲染，避免重复手写页面。" },
          { title: "收益", text: "统一风格，便于协作和长期维护。" }
        ]
      }
    },
    {
      id: "strip",
      kind: "strip-gallery",
      title: "02 图纸条带",
      subtitle: "横向滚动展示图纸/素材",
      includeInNav: true,
      content: {
        items: [
          { image: { src: "https://picsum.photos/seed/strip1/900/640", title: "图纸 A" }, tags: ["总图"] },
          { image: { src: "https://picsum.photos/seed/strip2/900/640", title: "图纸 B" }, tags: ["平面"] }
        ]
      }
    },
    {
      id: "models",
      kind: "model-stage",
      title: "03 模型阶段",
      subtitle: "主模型 + 次模型",
      includeInNav: true,
      content: {
        main: { image: { src: "https://picsum.photos/seed/modelmain/1200/900", title: "主模型" }, tags: ["主视角"] },
        secondary: [
          { image: { src: "https://picsum.photos/seed/model2/900/640", title: "节点模型" }, tags: ["节点"] }
        ]
      }
    },
    {
      id: "atlas",
      kind: "atlas-grid",
      title: "04 场地网格",
      subtitle: "图像与占位混排",
      includeInNav: true,
      content: {
        items: [
          { image: { src: "https://picsum.photos/seed/atlas1/1200/900", title: "主场地" }, tags: ["场地"] },
          { placeholder: true, tags: ["区位图"] },
          { image: { src: "https://picsum.photos/seed/atlas3/900/640", title: "样本" }, tags: ["采样"] }
        ]
      }
    },
    {
      id: "masonry",
      kind: "masonry-gallery",
      title: "05 渲染墙",
      subtitle: "瀑布流收尾展示",
      includeInNav: true,
      content: {
        items: [
          { image: { src: "https://picsum.photos/seed/ms1/800/1200", title: "透视一" }, tags: ["入口"] },
          { image: { src: "https://picsum.photos/seed/ms2/800/620", title: "透视二" }, tags: ["中庭"] }
        ]
      }
    }
  ]
};

export function createDefaultPageConfig(): PageConfig {
  return structuredClone(defaultPageConfig);
}

const PATH_LABELS: Record<string, string> = {
  meta: "站点信息",
  title: "标题",
  description: "描述",
  language: "语言",
  theme: "外观样式",
  background: "背景风格",
  accentColor: "主题色",
  radius: "圆角大小",
  nav: "顶部导航",
  brand: "品牌名",
  items: "条目",
  id: "ID",
  label: "标签",
  hero: "首屏",
  eyebrow: "小标题",
  lead: "导语",
  stats: "数据卡片",
  value: "数值",
  gallery: "图片区",
  footer: "页脚",
  slogan: "页脚标语",
  links: "页脚链接",
  href: "链接地址",
  copyright: "版权文案",
  role: "图片角色",
  image: "图片",
  src: "图片地址",
  note: "备注",
  sections: "内容区块",
  kind: "区块类型",
  subtitle: "副标题",
  includeInNav: "加入导航栏",
  content: "内容",
  cards: "叙述卡片",
  text: "正文",
  main: "主模型",
  secondary: "次级模型",
  placeholder: "占位开关",
  tags: "标签组"
};

function formatIssuePath(path: (string | number)[]): string {
  if (!path.length) return "配置根节点";

  return path
    .map((part) => {
      if (typeof part === "number") {
        return `第 ${part + 1} 项`;
      }
      return PATH_LABELS[part] ?? part;
    })
    .join(" > ");
}

function formatIssueMessage(issue: z.ZodIssue): string {
  if (issue.code === z.ZodIssueCode.invalid_type) {
    if (issue.received === "undefined") {
      return "该项为必填，请填写后再保存。";
    }
    return "输入类型不正确，请检查填写格式。";
  }

  if (issue.code === z.ZodIssueCode.too_small) {
    if (issue.type === "string") {
      return "该项不能为空，请填写内容。";
    }
    if (issue.type === "array") {
      return "至少需要填写一项。";
    }
  }

  if (issue.code === z.ZodIssueCode.invalid_enum_value) {
    const options = issue.options.map((item) => String(item)).join(" / ");
    return `选项无效，请从以下值选择：${options}。`;
  }

  if (issue.code === z.ZodIssueCode.invalid_literal) {
    return `固定值错误，应为：${String(issue.expected)}。`;
  }

  if (issue.code === z.ZodIssueCode.unrecognized_keys) {
    return `存在未识别字段：${issue.keys.join("、")}。`;
  }

  return "输入不符合规则，请检查后重试。";
}

export function parsePageConfig(input: unknown): PageConfig {
  const result = pageConfigSchema.safeParse(input);

  if (!result.success) {
    const message = result.error.issues
      .map((issue) => `${formatIssuePath(issue.path)}：${formatIssueMessage(issue)}`)
      .join("; ");
    throw new Error(`配置校验失败：${message}`);
  }

  return result.data;
}

export function createDefaultSection(kind: SectionKind, index: number) {
  const id = `section-${index + 1}`;

  switch (kind) {
    case "narrative":
      return {
        id,
        kind,
        title: `叙述区块 ${index + 1}`,
        subtitle: "",
        includeInNav: true,
        content: {
          cards: [{ title: "小标题", text: "请编辑文本内容" }]
        }
      };
    case "strip-gallery":
      return {
        id,
        kind,
        title: `条带画廊 ${index + 1}`,
        subtitle: "",
        includeInNav: true,
        content: {
          items: [{ image: { src: "", title: "图片" }, tags: ["标签"] }]
        }
      };
    case "model-stage":
      return {
        id,
        kind,
        title: `模型阶段 ${index + 1}`,
        subtitle: "",
        includeInNav: true,
        content: {
          main: { image: { src: "", title: "主模型" }, tags: ["主视角"] },
          secondary: []
        }
      };
    case "atlas-grid":
      return {
        id,
        kind,
        title: `场地网格 ${index + 1}`,
        subtitle: "",
        includeInNav: true,
        content: {
          items: [{ placeholder: true, tags: ["占位"] }]
        }
      };
    case "masonry-gallery":
      return {
        id,
        kind,
        title: `瀑布画廊 ${index + 1}`,
        subtitle: "",
        includeInNav: true,
        content: {
          items: [{ image: { src: "", title: "图片" }, tags: ["标签"] }]
        }
      };
  }
}
