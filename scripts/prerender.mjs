// Post-build step, two jobs:
//
// 1. SSR-renders the static "/" page markup and injects it into
//    dist/index.html's #root, so crawlers/AI agents that don't execute JS
//    (or that render but the fetch to the backend fails/is slow) still see
//    the real hero/plans/FAQ/etc. text instead of an empty shell. React's
//    client-side render() then takes over #root normally on load — this is
//    a plain (non-hydrating) prerender, not SSR hydration, so no mismatch
//    warnings are expected.
//
// 2. Writes a *separate* dist/admin/index.html for the /admin routes, with
//    <meta name="robots" content="noindex, nofollow"> baked into the raw
//    HTML and the public-page-only tags (canonical/OG/Twitter/JSON-LD)
//    stripped out. vercel.json rewrites /admin and /admin/* to this file
//    instead of the public dist/index.html, so the *initial* server
//    response for any /admin path is already noindex for crawlers that
//    don't run JS — useNoIndex() (src/hooks/use-no-index.ts) still handles
//    client-side navigation between admin sub-routes on top of this, but
//    can no longer be the only noindex signal.
import { build } from "vite";
import { readFile, writeFile, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const ssrOutDir = path.join(root, "dist", ".ssr");
const indexPath = path.join(root, "dist", "index.html");
const adminDir = path.join(root, "dist", "admin");
const adminPath = path.join(adminDir, "index.html");

function buildAdminHtml(rawHtml) {
	let html = rawHtml.replace(
		'<meta name="robots" content="index, follow" />',
		'<meta name="robots" content="noindex, nofollow" />',
	);
	if (!html.includes('content="noindex, nofollow"')) {
		throw new Error(
			"prerender: couldn't find the robots meta tag to rewrite for dist/admin/index.html — did index.html's markup change?",
		);
	}

	html = html.replace(/<title>.*?<\/title>/s, "<title>SHABAAN Admin</title>");

	// Strip public-page-only tags that don't apply to /admin: meta
	// description, canonical link, OG/Twitter block, and the JSON-LD graph.
	// Note: canonical/robots/OG block, in that order in index.html, with the
	// robots meta (already rewritten above) sitting *between* canonical and
	// the OG tags — so these two removals must stay separate rather than
	// spanning canonical..twitter:image in one pass, or the noindex tag
	// gets swept out along with them.
	html = html.replace(/\s*<meta name="description"[^>]*>\r?\n/, "\n");
	html = html.replace(/\s*<link rel="canonical"[^>]*>\r?\n/, "\n");
	html = html.replace(
		/\s*<meta property="og:title"[^>]*>\r?\n[\s\S]*?<meta name="twitter:image"[^>]*>\r?\n/,
		"\n",
	);
	html = html.replace(
		/\s*<script type="application\/ld\+json">[\s\S]*?<\/script>\r?\n/,
		"\n",
	);
	if (html.includes("application/ld+json") || html.includes("og:title")) {
		throw new Error(
			"prerender: failed to strip OG/JSON-LD tags from dist/admin/index.html — check the regexes still match index.html's structure.",
		);
	}
	if (!html.includes('<meta name="robots" content="noindex, nofollow" />')) {
		throw new Error(
			"prerender: dist/admin/index.html lost its noindex robots meta tag while stripping other tags.",
		);
	}

	return html;
}

async function main() {
	await build({
		root,
		build: {
			ssr: "src/entry-prerender.tsx",
			outDir: path.relative(root, ssrOutDir),
			emptyOutDir: true,
			minify: false,
			rollupOptions: { output: { entryFileNames: "entry-prerender.js" } },
		},
		logLevel: "warn",
	});

	const entryUrl = pathToFileURL(
		path.join(ssrOutDir, "entry-prerender.js"),
	).href;
	const { renderHome } = await import(entryUrl);
	const html = renderHome();

	const rawHtml = await readFile(indexPath, "utf8");

	await mkdir(adminDir, { recursive: true });
	await writeFile(adminPath, buildAdminHtml(rawHtml), "utf8");

	const marker = '<div id="root"></div>';
	if (!rawHtml.includes(marker)) {
		throw new Error(
			`prerender: expected to find ${marker} in dist/index.html — did the shell markup change?`,
		);
	}
	const patched = rawHtml.replace(marker, `<div id="root">${html}</div>`);
	await writeFile(indexPath, patched, "utf8");

	await rm(ssrOutDir, { recursive: true, force: true });

	console.log(
		"prerender: injected static markup into dist/index.html and wrote noindex dist/admin/index.html",
	);
	// The rendered component fires a fetch() to the backend (useAssets) that
	// we don't wait on — exit explicitly so that pending request doesn't
	// keep the process alive.
	process.exit(0);
}

main().catch((error) => {
	console.error("prerender failed:", error);
	process.exit(1);
});
