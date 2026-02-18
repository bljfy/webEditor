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

const narrativeSectionSchema = z.object({
  id: z.string().min(1),
  kind: z.literal("narrative"),
  title: z.string().min(1),
  subtitle: z.string().optional(),
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
  sections: [
    {
      id: "narrative",
      kind: "narrative",
      title: "01 项目叙述",
      subtitle: "模板目标和阅读路径",
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

export function parsePageConfig(input: unknown): PageConfig {
  const result = pageConfigSchema.safeParse(input);

  if (!result.success) {
    const message = result.error.issues
      .map((issue) => `${issue.path.join(".") || "root"}: ${issue.message}`)
      .join("; ");
    throw new Error(`PageConfig 校验失败: ${message}`);
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
        content: {
          items: [{ image: { src: "", title: "图片" }, tags: ["标签"] }]
        }
      };
  }
}
