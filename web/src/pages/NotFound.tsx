import { TopBar } from "../components/TopBar";
import { Link } from "../router";

export function NotFound() {
  return (
    <div className="min-h-full">
      <TopBar />
      <main className="mx-auto flex max-w-2xl flex-col items-center px-6 py-32 text-center">
        <div className="num text-xs uppercase tracking-widest text-bay-ink-3">404 · no clip here</div>
        <h1 className="mt-3 text-2xl font-semibold text-bay-ink">This route has no footage</h1>
        <p className="mt-2 text-bay-ink-2">
          The page you asked for doesn't exist. Start by uploading a clip.
        </p>
        <Link to="/upload" className="btn btn-signal mt-6">
          Upload a clip
        </Link>
      </main>
    </div>
  );
}
