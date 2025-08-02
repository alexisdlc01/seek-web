import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import UserContext from "../context/UserContext.jsx";
import NavbarMobile from "./NavbarMobile";
import NavbarDesktop from "./NavbarDesktop";

export default function Navbar() {
	const navigate = useNavigate();
	const { user, logout } = useContext(UserContext);
	const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
	const loggedIn = !!user;

	useEffect(() => {
		const handleResize = () => setIsMobile(window.innerWidth < 768);
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	const logo = (
		<motion.img
			src="/whitelogo-notext.svg"
			alt="Logo"
			whileHover={{ scale: 1.05 }}
			className="h-9 w-auto object-contain ml-2 cursor-pointer"
			onClick={() => navigate("/")}
		/>
	);

	return (
		<motion.div
			initial={{ opacity: 0, y: -10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4 }}
			className="relative w-full mt-4 mb-4 md:mt-0 md:mb-0 bg-white"
		>
			{isMobile ? (
				<NavbarMobile user={user} logout={logout} logo={logo} />
			) : (
				<NavbarDesktop user={user} logout={logout} logo={logo} />
			)}
		</motion.div>
	);
}
