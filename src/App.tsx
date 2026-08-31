import { lazy, Suspense, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ErrorBoundary } from "@/components/error-boundary";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Home } from "@/pages/home";
import { Route, Switch, useLocation, Router as WouterRouter } from "wouter";

// Lazy-loaded: none of this (admin auth/forms/dialogs, the whole shadcn
// form stack) belongs in the initial bundle a public-page visitor pays for
// — it's only reachable via /admin, which isn't linked from the homepage.
const NotFound = lazy(() => import("@/pages/not-found"));
const AdminLogin = lazy(() => import("@/pages/admin-login"));
const AdminDashboard = lazy(() => import("@/pages/admin-dashboard"));

const queryClient = new QueryClient();

function Router() {
	return (
		// Keep a shared shell (sidebar, navbar) outside the boundary so it
		// survives a page crash.
		<RoutedErrorBoundary>
			<Suspense fallback={null}>
				<Switch>
					<Route path="/" component={Home} />
					<Route path="/admin" component={AdminLogin} />
					<Route path="/admin/dashboard" component={AdminDashboard} />
					<Route component={NotFound} />
				</Switch>
			</Suspense>
		</RoutedErrorBoundary>
	);
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
	const [location] = useLocation();
	return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<TooltipProvider>
				<WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
					<Router />
				</WouterRouter>
				<Toaster />
			</TooltipProvider>
		</QueryClientProvider>
	);
}

export default App;
