import { Routes, Route } from "react-router-dom";
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
import Landlord from "./pages/Landlord";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";

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
	return (
		<>
			<Navbar />
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/terms" element={<Terms />} />
				<Route path="/privacy" element={<Privacy />} />
				<Route path="/help" element={<Help />} />
				<Route path="/about" element={<About />} />
				<Route path="/signup/landlord" element={<SignUpLandlord />} />
				<Route path="/signup/student" element={<SignUpStudent />} />
				<Route path="/signin/landlord" element={<SignInLandlord />} />
				<Route path="/signin/student" element={<SignInStudent />} />
				<Route path="/landlord" element={<Landlord />} />
				<Route path="/addproperty" element={<AddProperty />} />
				<Route path="/resetpassword" element={<ResetPassword />} />
				<Route path="/security" element={<Security />} />
				<Route path="*" element={<NotFound />} />
			</Routes>
			<Footer />
		</>
	);
}

export default App;
