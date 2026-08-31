import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Home } from "@/pages/home";

// Used only by scripts/prerender.mjs at build time (via a Vite SSR build of
// this file) to produce static HTML for the "/" route's initial payload.
// Runs with an empty QueryClient, so useAssets() has no data yet and every
// slot renders its bundled static fallback — same as a client whose first
// paint beats the /api/assets response.
export function renderHome(): string {
	const queryClient = new QueryClient();
	return renderToStaticMarkup(
		<QueryClientProvider client={queryClient}>
			<Home />
		</QueryClientProvider>,
	);
}
