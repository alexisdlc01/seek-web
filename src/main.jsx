import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { PrimeReactProvider } from "primereact/api";
import { UserProvider } from "./context/UserContext.jsx";
import { ProgressSpinner } from "primereact/progressspinner";

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
					<App />
				</UserProvider>
			</BrowserRouter>
		</Suspense>
	</PrimeReactProvider>
);
