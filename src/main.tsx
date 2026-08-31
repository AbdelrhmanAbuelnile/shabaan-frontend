import { createRoot } from "react-dom/client";

import App from "./App";
import { ErrorBoundary } from "@/components/error-boundary";
import { PostHogProvider } from "@posthog/react";
import "./index.css";
const options = {
	api_host: import.meta.env.VITE_POSTHOG_HOST,
	defaults: "2026-05-30",
} as const;
createRoot(document.getElementById("root")!, {
	// Keeps caught errors off reportError(), which would raise the dev overlay.
	onCaughtError: (error, errorInfo) => {
		console.error(error, errorInfo.componentStack);
	},
}).render(
	<ErrorBoundary>
		<PostHogProvider
			apiKey={import.meta.env.VITE_POSTHOG_PROJECT_TOKEN}
			options={options}
		>
			<App />
		</PostHogProvider>
	</ErrorBoundary>,
);
