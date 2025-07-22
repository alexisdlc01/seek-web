import React, { useContext, useEffect, useState } from "react";
import { Menubar } from "primereact/menubar";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import UserContext from "../context/UserContext.jsx";

export default function Navbar() {
	const navigate = useNavigate();
	const { user, loading, logout } = useContext(UserContext);
	const loggedIn = !!user;

	const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
	useEffect(() => {
		const handleResize = () => setIsMobile(window.innerWidth < 768);
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	const items = loggedIn
		? isMobile
			? [
					{
						label: "Dashboard",
						command: () => navigate("/dashboard")
					},
					{
						label: "Properties",
						command: () => navigate("/properties")
					},
					{ label: "Messages", command: () => navigate("/messages") },
					{ label: "Settings", command: () => navigate("/settings") },
					{ label: "Logout", command: async () => await logout() }
			  ]
			: [
					{
						label: "Dashboard",
						command: () => navigate("/dashboard")
					},
					{
						label: "Properties",
						command: () => navigate("/properties")
					},
					{ label: "Messages", command: () => navigate("/messages") },
					{
						label: user.name,
						items: [
							{
								label: "Settings",
								command: () => navigate("/settings")
							},
							{
								label: "Logout",
								command: async () => await logout()
							}
						],
						template: item => (
							<motion.div whileHover={{ scale: 1.05 }}>
								<Button className="pl-3 pr-4 py-2 bg-blue-900 text-blue-400 hover:bg-blue-00 flex items-center gap-2">
									<span>{item.label}</span>
									<i className="pi pi-chevron-down text-xs" />
								</Button>
							</motion.div>
						)
					}
			  ]
		: isMobile
		? [
				{ label: "Home", command: () => navigate("/") },
				{ label: "About", command: () => navigate("/about") },
				{ label: "For Landlords", command: () => navigate("/help") },
				{ label: "Help", command: () => navigate("/help") },
				{
					label: "Login As Student",
					command: () => navigate("/signin/student")
				},
				{
					label: "Login As Landlord",
					command: () => navigate("/signin/landlord")
				}
		  ]
		: [
				{ label: "Home", command: () => navigate("/") },
				{ label: "About", command: () => navigate("/about") },
				{ label: "For Landlords" },
				{ label: "Help", command: () => navigate("/help") },
				{ separator: true, className: "ml-4" },
				{
					label: "Login",
					items: [
						{
							label: "As Student",
							command: () => navigate("/signin/student")
						},
						{
							label: "As Landlord",
							command: () => navigate("/signin/landlord")
						}
					],
					template: item => (
						<motion.div whileHover={{ scale: 1.05 }}>
							<Button
								label={item.label}
								className="pl-3 relative"
							/>
						</motion.div>
					)
				}
		  ];

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
			initial={{ opacity: 0, y: -20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4 }}
			className="relative w-full mt-4 mb-4 md:mt-0 md:mb-0 bg-white"
		>
			<Menubar
				model={items}
				start={logo}
				end={<div className="mr-2" />}
				style={{
					backgroundColor: "#ffffff",
					border: "none",
					boxShadow: "none"
				}}
				pt={{
					root: {
						className:
							"flex justify-between items-center !border-none !shadow-none relative md:px-0 py-3 bg-white"
					},
					menu: { className: "flex justify-center w-full gap-3" },
					button: {
						className:
							"absolute right-4 top-1/2 -translate-y-1/2 md:static md:left-auto md:translate-y-0 md:ml-0 !border-none !shadow-none !bg-transparent !outline-none hover:!bg-transparent focus:!ring-0 focus:!shadow-none"
					}
				}}
			/>
		</motion.div>
	);
}
