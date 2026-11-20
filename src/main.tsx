import { Suspense } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "primereact/resources/themes/lara-light-blue/theme.css";
import "./index.css";
import { PrimeReactProvider } from "primereact/api";
import { UserProvider } from "./context/UserContext.jsx";
import { NavbarThemeProvider } from "./context/NavBarThemeContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { ProgressSpinner } from "primereact/progressspinner";
import { ListingsProvider } from "./context/ListingsContext.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { API_BASE, refreshSession } from "./lib/landlord.js";
import { client } from "./client/client.gen.ts";

client.setConfig({
	baseUrl: API_BASE,
	credentials: "include",
	// Same 401 -> refresh -> replay once as the axios interceptor in lib/landlord.js.
	fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
		const request = new Request(input, init);
		const replay = request.clone(); // the body can only be read once
		const response = await fetch(request);
		if (response.status !== 401 || request.url.includes("/auth/")) return response;
		try {
			await refreshSession();
		} catch {
			return response;
		}
		return fetch(replay);
	}
});

const LoadingScreen = () => (
	<div className="min-h-screen flex items-center justify-center bg-white">
		<ProgressSpinner />
	</div>
);

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 1000 * 60 * 5 // default 5 mins
		}
	}
});

const RootComponent = () => {
	return (
		<PrimeReactProvider value={{ ripple: true }}>
			<QueryClientProvider client={queryClient}>
				<Suspense fallback={<LoadingScreen />}>
					<BrowserRouter>
						<UserProvider>
							<ThemeProvider>
								<NavbarThemeProvider>
									<ListingsProvider>
										<App />
									</ListingsProvider>
								</NavbarThemeProvider>
							</ThemeProvider>
						</UserProvider>
					</BrowserRouter>
				</Suspense>
			</QueryClientProvider>
		</PrimeReactProvider>
	);
};

ReactDOM.createRoot(document.getElementById("root")).render(RootComponent());
