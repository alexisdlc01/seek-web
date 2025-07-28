import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Help from "./pages/Help";
import Privacy from "./pages/Privacy";
import Security from "./pages/Security";
import Terms from "./pages/Terms";
import SignUpLandlord from "./pages/SignupLandlord";
import SignInLandlord from "./pages/SigninLandlord";
import SignInStudent from "./pages/SigninStudent";
import SignUpStudent from "./pages/SignupStudent";
import AddProperty from "./pages/AddProperty";
import ResetPassword from "./pages/ResetPassword";
import Listings from "./pages/Listings";
import ActivationSent from "./pages/ActivationSent";
import VerifyingEmail from "./pages/VerifyingEmail.jsx";		
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import { Button } from "primereact/button";
import { AnimatePresence, motion } from "framer-motion";

const NotFound = () => {
	const navigate = useNavigate();

	return (
		<div className="flex flex-col items-center justify-center h-screen text-center">
			<h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
			<p className="text-lg mb-4">
				Oops! The page you're looking for doesn't exist.
			</p>
			<Button
				label="Go home"
				className="bg-[var(--primary-color-text)] font-bold px-4 py-2"
				onClick={() => navigate("/")}
			/>
		</div>
	);
};

function App() {
	const location = useLocation();

	return (
		<>
			<Navbar />
			<AnimatePresence mode="wait">
				<motion.div
					key={location.pathname}
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: 5 }}
					transition={{ duration: .2 }}
				>
					<Routes location={location}>
						<Route path="/" element={<Home />} />
						<Route path="/terms" element={<Terms />} />
						<Route path="/privacy" element={<Privacy />} />
						<Route path="/help" element={<Help />} />
						<Route path="/about" element={<About />} />
						<Route
							path="/signup/landlord"
							element={<SignUpLandlord />}
						/>
						<Route
							path="/signup/student"
							element={<SignUpStudent />}
						/>
						<Route
							path="/signin/landlord"
							element={<SignInLandlord />}
						/>
						<Route
							path="/signin/student"
							element={<SignInStudent />}
						/>

						<Route path="/listings" element={<Listings />} />
						<Route path="/addproperty" element={<AddProperty />} />
						<Route
							path="/resetpassword"
							element={<ResetPassword />}
						/>
						<Route
							path="/activationsent"
							element={<ActivationSent />}
						/>
						<Route
							path="/verifyingemail"
							element={<VerifyingEmail />}
						/>
						<Route path="/security" element={<Security />} />
						<Route path="*" element={<NotFound />} />
					</Routes>
				</motion.div>
			</AnimatePresence>
			<Footer />
		</>
	);
}

export default App;
