import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { PrimeReactProvider } from "primereact/api";
import { UserProvider } from "./context/UserContext.jsx";
import { NavbarThemeProvider } from "./context/NavBarThemeContext.jsx";
import { ProgressSpinner } from "primereact/progressspinner";
import { ListingsProvider } from "./context/ListingsContext.jsx";

const LoadingScreen = () => (
	<div className="min-h-screen flex items-center justify-center bg-white">
		<ProgressSpinner />
	</div>
);

ReactDOM.createRoot(document.getElementById("root")).render(
	<PrimeReactProvider value={{ ripple: true }}>
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
	</PrimeReactProvider>
);
