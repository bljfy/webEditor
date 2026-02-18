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
  const [uiTheme, setUiTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!hasUnsavedChanges) return;
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [hasUnsavedChanges]);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("editor_ui_theme");
    if (savedTheme === "light" || savedTheme === "dark") {
      setUiTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("editor_ui_theme", uiTheme);
    document.body.dataset.appTheme = uiTheme;
  }, [uiTheme]);

  return (
    <main className={`workspace workspace-theme-${uiTheme}`}>
      <header className="workspace-header">
        <div className="workspace-header-brand">
          <strong>WebEditor</strong>
          <span>零代码可视化建站编辑器</span>
        </div>
        <div className="workspace-header-actions">
          <span>统一主题</span>
          <button type="button" onClick={() => setUiTheme("light")} aria-pressed={uiTheme === "light"}>
            亮色
          </button>
          <button type="button" onClick={() => setUiTheme("dark")} aria-pressed={uiTheme === "dark"}>
            暗色
          </button>
        </div>
      </header>
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
      <footer className="workspace-footer">
        <span>WebEditor · 面向零代码用户的可视化建站编辑器</span>
        <span>当前模式：{mobileView === "editor" ? "编辑" : "预览"}</span>
      </footer>
    </main>
  );
}
