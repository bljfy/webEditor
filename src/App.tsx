import { useEffect, useState } from "react";
import { Panel } from "./panel/Panel";
import { Preview } from "./preview/Preview";
import { usePageStore } from "./store/pageStore";
import { exportPageAsHtmlFile } from "./export/exportPage";

export function App() {
  const pageConfig = usePageStore((state) => state.pageConfig);
  const setPageConfig = usePageStore((state) => state.setPageConfig);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

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
      <Panel
        pageConfig={pageConfig}
        setPageConfig={setPageConfig}
        onUnsavedChange={setHasUnsavedChanges}
        onExportHtml={() => {
          exportPageAsHtmlFile(pageConfig);
        }}
      />
      <Preview config={pageConfig} />
    </main>
  );
}
