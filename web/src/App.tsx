import { matchPath, useLocation } from "./router";
import { Landing } from "./pages/Landing";
import { Upload } from "./pages/Upload";
import { Processing } from "./pages/Processing";
import { Results } from "./pages/Results";
import { NotFound } from "./pages/NotFound";

export function App() {
  const path = useLocation();

  if (path === "/" || path === "") return <Landing />;
  if (path === "/upload") return <Upload />;

  const proc = matchPath("/processing/:runId", path);
  if (proc) return <Processing runId={proc.runId} />;

  const res = matchPath("/results/:runId", path);
  if (res) return <Results runId={res.runId} />;

  return <NotFound />;
}
