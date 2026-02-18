import { Panel } from "./panel/Panel";
import { Preview } from "./preview/Preview";
import { usePageStore } from "./store/pageStore";
import { exportPageAsHtmlFile } from "./export/exportPage";

export function App() {
  const pageConfig = usePageStore((state) => state.pageConfig);
  const setPageConfig = usePageStore((state) => state.setPageConfig);

  return (
    <main className="workspace">
      <Panel
        pageConfig={pageConfig}
        setPageConfig={setPageConfig}
        onExportHtml={() => {
          exportPageAsHtmlFile(pageConfig);
        }}
      />
      <Preview config={pageConfig} />
    </main>
  );
}
