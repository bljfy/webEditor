import { create } from "zustand";
import {
  type PageConfig,
  createDefaultPageConfig,
  parsePageConfig
} from "../schema/pageConfig";

type PageStore = {
  pageConfig: PageConfig;
  setPageConfig: (nextConfig: PageConfig) => void;
  replaceFromInput: (input: unknown) => { ok: true } | { ok: false; message: string };
};

export const usePageStore = create<PageStore>((set) => ({
  pageConfig: createDefaultPageConfig(),
  setPageConfig: (nextConfig) => {
    set({ pageConfig: nextConfig });
  },
  replaceFromInput: (input) => {
    try {
      const parsed = parsePageConfig(input);
      set({ pageConfig: parsed });
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        message: error instanceof Error ? error.message : "配置校验失败"
      };
    }
  }
}));
