import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
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
import ResetPasswordPassword from "./pages/ConfirmResetPassword.jsx";
import ApplicationRequirements from "./components/addPropertySteps/ApplicationRequirementsStep.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import LandlordLayout from "./layouts/LandlordLayout.jsx";
import StudentLayout from "./layouts/StudentLayout.jsx";
import RoleLayout from "./layouts/RoleLayout.jsx";
import Rent from "./pages/Rent.jsx";
import Contracts from "./pages/Contracts.jsx";
import Inbox from "./pages/Inbox.jsx";
import Connectors from "./pages/Connectors.jsx";
import StudentFind from "./pages/StudentFind.jsx";
import StudentJoin from "./pages/StudentJoin.jsx";
import StudentHome from "./pages/StudentHome.jsx";
import StudentInbox from "./pages/StudentInbox.jsx";
import StudentProfile from "./pages/StudentProfile.jsx";
import StudentConnectors from "./pages/StudentConnectors.jsx";
import StudentRentPlan from "./pages/StudentRentPlan.jsx";
import StudentDeposit from "./pages/StudentDeposit.jsx";
import StudentBills from "./pages/StudentBills.jsx";

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

function PublicSite() {
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
						<ScrollToTop />
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
								path="/resetpassword"
								element={<ResetPassword />}
							/>
							<Route
								path="/confirmResetPassword"
								element={<ResetPasswordPassword />}
							/>
							<Route
								path="/activationSent"
								element={<ActivationSent />}
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
							<Route
								path="/application-requirements"
								element={<ApplicationRequirements />}
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

const LANDLORD = ["LANDLORD_AGENCY"];

function App() {
	return (
		<Routes>
			{/* Landlord app: sidebar layout */}
			<Route
				element={
					<ProtectedRoute allowedRoles={LANDLORD}>
						<LandlordLayout />
					</ProtectedRoute>
				}
			>
				<Route path="/dashboard" element={<Dashboard />} />
				<Route path="/applicants/:listingId?" element={<Applicants />} />
				<Route path="/application" element={<Application />} />
				<Route path="/listings" element={<Listings />} />
				<Route path="/add-listing/:id" element={<AddListing />} />
				<Route path="/view-listing/:id" element={<ViewListing />} />
				<Route path="/rent" element={<Rent />} />
				<Route path="/contracts" element={<Contracts />} />
				<Route path="/inbox" element={<Inbox />} />
				<Route path="/connectors" element={<Connectors />} />
				<Route path="/chat" element={<Chat />} />
			</Route>

			{/* Student app: sidebar layout */}
			<Route
				path="/student"
				element={
					<ProtectedRoute allowedRoles={["STUDENT"]}>
						<StudentLayout />
					</ProtectedRoute>
				}
			>
				<Route index element={<Navigate to="find" replace />} />
				<Route path="find" element={<StudentFind />} />
				<Route path="home" element={<StudentHome />} />
				<Route path="home/rent" element={<StudentRentPlan />} />
				<Route path="home/deposit" element={<StudentDeposit />} />
				<Route path="home/bills" element={<StudentBills />} />
				<Route path="inbox" element={<StudentInbox />} />
				<Route path="profile" element={<StudentProfile />} />
				<Route path="connectors" element={<StudentConnectors />} />
				<Route path="join/:id" element={<StudentJoin />} />
			</Route>

			{/* Shared by both roles */}
			<Route
				element={
					<ProtectedRoute allowedRoles={["STUDENT", "LANDLORD_AGENCY"]}>
						<RoleLayout />
					</ProtectedRoute>
				}
			>
				<Route path="/edit-profile" element={<EditProfile />} />
			</Route>

			{/* Public site, sign-in and everything else */}
			<Route path="*" element={<PublicSite />} />
		</Routes>
	);
}

export default App;
