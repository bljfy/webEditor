import {
  createDefaultPageConfig,
  parsePageConfig,
  pageConfigSchema
} from "../../src/schema/pageConfig";

describe("pageConfig schema", () => {
  it("accepts default config", () => {
    const config = createDefaultPageConfig();
    const result = pageConfigSchema.safeParse(config);

    expect(result.success).toBe(true);
  });

  it("rejects invalid language", () => {
    const config = createDefaultPageConfig();
    const input = {
      ...config,
      meta: {
        ...config.meta,
        language: "jp"
      }
    };

    expect(() => parsePageConfig(input)).toThrow(/配置校验失败/);
    expect(() => parsePageConfig(input)).toThrow(/站点信息 > 语言/);
  });
});
