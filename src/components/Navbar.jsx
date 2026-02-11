import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import UserContext from "../context/UserContext.jsx";
import NavbarMobile from "./NavBarMobile.jsx";
import NavbarDesktop from "./NavBarDesktop";
import { useNavbarTheme } from "../context/NavBarThemeContext.jsx";

export default function Navbar() {
	const navigate = useNavigate();
	const { user, logout } = useContext(UserContext);
	const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
	const { theme } = useNavbarTheme();

	useEffect(() => {
		const handleResize = () => setIsMobile(window.innerWidth < 768);
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	const logoSrc =
		theme === "dark" ? "/textLogos/seek_white_text.svg" : "/textLogos/seek_blue_text.svg";

	const logo = (
		<motion.img
			src={logoSrc}
			alt="Logo"
			whileHover={{ scale: 1.05 }}
			className="w-20 h-auto object-cover ml-2 cursor-pointer"
			onClick={() => navigate("/")}
		/>
	);

	return (
		<motion.div
			initial={{ opacity: 0, y: -10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4 }}
			className="fixed top-0 left-0 w-full z-50 bg-white shadow"
		>
			{isMobile ? (
				<NavbarMobile user={user} logout={logout} logo={logo} />
			) : (
				<NavbarDesktop user={user} logout={logout} logo={logo} />
			)}
		</motion.div>
	);
}
