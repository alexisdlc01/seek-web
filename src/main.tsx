import { Suspense } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { PrimeReactProvider } from "primereact/api";
import { UserProvider } from "./context/UserContext.jsx";
import { NavbarThemeProvider } from "./context/NavBarThemeContext.jsx";
import { ProgressSpinner } from "primereact/progressspinner";
import { ListingsProvider } from "./context/ListingsContext.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { client } from "./client/client.gen.ts";

client.setConfig({
	baseUrl:
		// @ts-ignore
		import.meta.NODE_ENV === "development"
			? "http://localhost:3000/api"
			: "https://api.seekapp.uk"
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
							<NavbarThemeProvider>
								<ListingsProvider>
									<App />
								</ListingsProvider>
							</NavbarThemeProvider>
						</UserProvider>
					</BrowserRouter>
				</Suspense>
			</QueryClientProvider>
		</PrimeReactProvider>
	);
};

ReactDOM.createRoot(document.getElementById("root")).render(RootComponent());
