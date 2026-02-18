import type { PageConfig } from "../schema/pageConfig";
import { Renderer } from "../renderer/Renderer";

type PreviewProps = {
  config: PageConfig;
};

export function Preview({ config }: PreviewProps) {
  return (
    <section className="preview-shell">
      <div className="panel-title-row">
        <h2>Preview</h2>
      </div>
      <Renderer config={config} />
    </section>
  );
}
