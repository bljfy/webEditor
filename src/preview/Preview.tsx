import type { PageConfig } from "../schema/pageConfig";
import { Renderer } from "../renderer/Renderer";
import { RENDERER_SHARED_CSS } from "../renderer/rendererSharedStyles";

type PreviewProps = {
  config: PageConfig;
};

export function Preview({ config }: PreviewProps) {
  return (
    <section className="preview-shell">
      <style>{RENDERER_SHARED_CSS}</style>
      <div className="panel-title-row">
        <h2>Preview</h2>
      </div>
      <Renderer config={config} />
    </section>
  );
}
