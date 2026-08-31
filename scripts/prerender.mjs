// Post-build step: SSR-renders the static "/" page markup and injects it
// into dist/index.html's #root, so crawlers/AI agents that don't execute
// JS (or that render but the fetch to the backend fails/is slow) still see
// the real hero/plans/FAQ/etc. text instead of an empty shell. React's
// client-side render() then takes over #root normally on hydration — this
// is a plain (non-hydrating) prerender, not SSR hydration, so no mismatch
// warnings are expected.
import { build } from "vite";
import { readFile, writeFile, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const ssrOutDir = path.join(root, "dist", ".ssr");
const indexPath = path.join(root, "dist", "index.html");

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

	const indexHtml = await readFile(indexPath, "utf8");
	const marker = '<div id="root"></div>';
	if (!indexHtml.includes(marker)) {
		throw new Error(
			`prerender: expected to find ${marker} in dist/index.html — did the shell markup change?`,
		);
	}
	const patched = indexHtml.replace(marker, `<div id="root">${html}</div>`);
	await writeFile(indexPath, patched, "utf8");

	await rm(ssrOutDir, { recursive: true, force: true });

	console.log("prerender: injected static markup into dist/index.html");
	// The rendered component fires a fetch() to the backend (useAssets) that
	// we don't wait on — exit explicitly so that pending request doesn't
	// keep the process alive.
	process.exit(0);
}

main().catch((error) => {
	console.error("prerender failed:", error);
	process.exit(1);
});
