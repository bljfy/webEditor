import type { PageConfig } from "../schema/pageConfig";
import { Renderer } from "../renderer/Renderer";
import { RENDERER_SHARED_CSS } from "../renderer/rendererSharedStyles";

type PreviewProps = {
  config: PageConfig;
  hasUnsavedChanges?: boolean;
  lastSavedAt?: string;
};

export function Preview({ config, hasUnsavedChanges, lastSavedAt }: PreviewProps) {
  const savedText = lastSavedAt ? `上次保存：${new Date(lastSavedAt).toLocaleTimeString("zh-CN", { hour12: false })}` : "尚未保存";
  return (
    <section className="preview-shell">
      <style>{RENDERER_SHARED_CSS}</style>
      <div className="preview-title-row">
        <h2>Preview</h2>
        <div className="preview-status">
          <span>{savedText}</span>
          {hasUnsavedChanges ? <strong>预览为上次保存结果</strong> : null}
        </div>
      </div>
      <Renderer config={config} />
    </section>
  );
}
