import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import SignUpLandlord from "./pages/SignupLandlord";
import SignInLandlord from "./pages/SigninLandlord";
import SignInStudent from "./pages/SigninStudent";
import SignUpStudent from "./pages/SignupStudent";
import AddListing from "./pages/AddListing.jsx";
import ContactPage from "./pages/Contact";
import ResetPassword from "./pages/ResetPassword";
import Listings from "./pages/Listings";
import Applicants from "./pages/Applicants";
import Chat from "./pages/Chat";
import Application from "./pages/Application";
import ActivationSent from "./pages/ActivationSent";
import VerifyingEmail from "./pages/VerifyingEmail.jsx";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import { Button } from "primereact/button";
import Dashboard from "./pages/Dashboard.jsx";
import { AnimatePresence, motion } from "framer-motion";
import Download from "./pages/Download.jsx";
import ProtectedRoute from "./pages/ProtectedRoute.jsx";
import { useContext } from "react";
import UserContext from "./context/UserContext.jsx";
import { ProgressSpinner } from "primereact/progressspinner";
import EditProfile from "./pages/EditProfile.jsx";
import SigninSuperuser from "./pages/SigninSuperuser.jsx";
import SuperUserDashboard from "./pages/SuperUserDashboard.jsx";
import ViewListing from "./components/ViewListing.jsx";

const NotFound = () => {
	const navigate = useNavigate();
	const { loading } = useContext(UserContext);

	if (loading) {
		// full-page spinner before any route renders
		return (
			<div className="flex items-center justify-center h-screen">
				<ProgressSpinner
					style={{ width: "50px", height: "50px" }}
					strokeWidth="8"
					fill="var(--surface-ground)"
					animationDuration=".5s"
				/>
			</div>
		);
	}

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
			<div className="pt-[60px]">
				<AnimatePresence mode="wait">
					<motion.div
						key={location.pathname}
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 5 }}
						transition={{ duration: 0.2 }}
					>
						<Routes location={location}>
							<Route path="/" element={<Home />} />
							<Route path="/download" element={<Download />} />
							<Route path="/terms" element={<Terms />} />
							<Route path="/privacy" element={<Privacy />} />
							<Route path="/contact" element={<ContactPage />} />
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

							<Route
								path="/listings"
								element={
									<ProtectedRoute
										allowedRoles={["LANDLORD_AGENCY"]}
									>
										<Listings />
									</ProtectedRoute>
								}
							/>
							<Route
								path="/applicants"
								element={
									<ProtectedRoute
										allowedRoles={["LANDLORD_AGENCY"]}
									>
										<Applicants />
									</ProtectedRoute>
								}
							/>
							<Route
								path="/add-listing/:id"
								element={
									<ProtectedRoute
										allowedRoles={["LANDLORD_AGENCY"]}
									>
										<AddListing />
									</ProtectedRoute>
								}
							/>
							<Route
								path="/view-listing/:id"
								element={
									<ProtectedRoute
										allowedRoles={["LANDLORD_AGENCY"]}
									>
										<ViewListing />
									</ProtectedRoute>
								}
							/>
							<Route
								path="/application"
								element={
									<ProtectedRoute
										allowedRoles={["LANDLORD_AGENCY"]}
									>
										<Application />
									</ProtectedRoute>
								}
							/>
							<Route
								path="/chat"
								element={
									<ProtectedRoute
										allowedRoles={["LANDLORD_AGENCY"]}
									>
										<Chat />
									</ProtectedRoute>
								}
							/>
							<Route
								path="/resetpassword"
								element={<ResetPassword />}
							/>
							<Route
								path="/activationSent"
								element={<ActivationSent />}
							/>
							<Route
								path="/edit-profile"
								element={
									<ProtectedRoute
										allowedRoles={[
											"STUDENT",
											"LANDLORD_AGENCY"
										]}
									>
										<EditProfile />
									</ProtectedRoute>
								}
							/>
							<Route
								path="/dashboard"
								element={
									<ProtectedRoute
										allowedRoles={["LANDLORD_AGENCY"]}
									>
										<Dashboard />
									</ProtectedRoute>
								}
							/>
							<Route
								path="/verify-email"
								element={<VerifyingEmail />}
							/>
							<Route
								path="/superuser"
								element={
									<ProtectedRoute
										allowedRoles={["SUPERUSER"]}
									>
										<SuperUserDashboard />
									</ProtectedRoute>
								}
							/>
							<Route
								path="/superuser/login"
								element={<SigninSuperuser />}
							/>
							<Route path="*" element={<NotFound />} />
						</Routes>
					</motion.div>
				</AnimatePresence>
			</div>
			<Footer />
		</>
	);
}

export default App;
