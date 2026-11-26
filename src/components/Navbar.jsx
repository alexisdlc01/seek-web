import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import UserContext from "../context/UserContext.jsx";
import NavbarMobile from "./NavBarMobile.jsx";
import NavbarDesktop from "./NavBarDesktop";
import SeekLogo from "./SeekLogo.jsx";
import { APP_HOME } from "../lib/appHome.js";
import { useNavbarTheme } from "../context/NavBarThemeContext.jsx";

export default function Navbar() {
	const { user, logout } = useContext(UserContext);
	const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
	const { theme } = useNavbarTheme();

	useEffect(() => {
		const handleResize = () => setIsMobile(window.innerWidth < 768);
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	const logo = (
		<motion.div whileHover={{ scale: 1.05 }} className="ml-2 inline-block">
			<Link to={(user && APP_HOME[user.role]) || "/"} aria-label="Seek home" className="no-underline">
				<SeekLogo dark={theme === "dark"} className="text-[26px]" />
			</Link>
		</motion.div>
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
