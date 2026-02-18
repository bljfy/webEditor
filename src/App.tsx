import { useEffect, useState } from "react";
import { Panel } from "./panel/Panel";
import { Preview } from "./preview/Preview";
import { usePageStore } from "./store/pageStore";
import { exportPageAsHtmlFile } from "./export/exportPage";

export function App() {
  const pageConfig = usePageStore((state) => state.pageConfig);
  const setPageConfig = usePageStore((state) => state.setPageConfig);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string>("");
  const [mobileView, setMobileView] = useState<"editor" | "preview">("editor");

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!hasUnsavedChanges) return;
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [hasUnsavedChanges]);

  return (
    <main className="workspace">
      <div className="workspace-mobile-tabs">
        <button type="button" className={mobileView === "editor" ? "active" : ""} onClick={() => setMobileView("editor")}>
          编辑
        </button>
        <button type="button" className={mobileView === "preview" ? "active" : ""} onClick={() => setMobileView("preview")}>
          预览
        </button>
      </div>
      <section className={`workspace-pane ${mobileView === "editor" ? "active" : ""}`}>
        <Panel
          pageConfig={pageConfig}
          setPageConfig={setPageConfig}
          onUnsavedChange={setHasUnsavedChanges}
          onSaved={setLastSavedAt}
          onExportHtml={() => {
            exportPageAsHtmlFile(pageConfig);
          }}
        />
      </section>
      <section className={`workspace-pane ${mobileView === "preview" ? "active" : ""}`}>
        <Preview config={pageConfig} hasUnsavedChanges={hasUnsavedChanges} lastSavedAt={lastSavedAt} />
      </section>
    </main>
  );
}
