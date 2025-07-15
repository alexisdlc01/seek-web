import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Navbar from "./components/Navbar.jsx";

function App() {
	return (
		<>
			<Navbar />
			<Routes>
				<Route />
				<Route path="/" element={<Home />} />
				<Route path="/about" element={<About />} />
			</Routes>
		</>
	);
}

export default App;
