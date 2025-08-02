import React from "react";
import { Menubar } from "primereact/menubar";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function NavbarDesktop({ user, logout, logo }) {
	const navigate = useNavigate();
	const loggedIn = !!user;

	const items = loggedIn
		? [
				{ label: "Dashboard", command: () => navigate("/dashboard") },
				{ label: "Properties", command: () => navigate("/properties") },
				{ label: "Messages", command: () => navigate("/messages") },
				{
					label: user.name,
					items: [
						{ label: "Settings", command: () => navigate("/settings") },
						{ label: "Logout", command: async () => await logout() }
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
		: [
				{ label: "Home", command: () => navigate("/") },
				{ label: "About", command: () => navigate("/about") },
				{ label: "Help", command: () => navigate("/help") },
				{ separator: true, className: "ml-4" },
				{
					label: "Login",
					items: [
						{ label: "As Student", command: () => navigate("/signin/student") },
						{ label: "As Landlord", command: () => navigate("/signin/landlord") }
					],
					template: item => (
						<motion.div whileHover={{ scale: 1.05 }}>
							<Button label={item.label} className="pl-3 relative" />
						</motion.div>
					)
				}
		  ];

	return (
		<Menubar
			model={items}
			start={logo}
			end={<div className="mr-2" />}
			style={{ backgroundColor: "#ffffff", border: "none", boxShadow: "none" }}
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
	);
}
