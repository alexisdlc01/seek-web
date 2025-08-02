import React from "react";
import { Menubar } from "primereact/menubar";
import { useNavigate } from "react-router-dom";

export default function NavbarMobile({ user, logout, logo }) {
	const navigate = useNavigate();
	const loggedIn = !!user;

	const items = loggedIn
		? [
				{ label: "Dashboard", command: () => navigate("/dashboard") },
				{ label: "Properties", command: () => navigate("/properties") },
				{ label: "Messages", command: () => navigate("/messages") },
				{ label: "Settings", command: () => navigate("/settings") },
				{ label: "Logout", command: async () => await logout() }
		  ]
		: [
				{ label: "Home", command: () => navigate("/") },
				{ label: "About", command: () => navigate("/about") },
				{ label: "Help", command: () => navigate("/help") },
				{ label: "Login As Student", command: () => navigate("/signin/student") },
				{ label: "Login As Landlord", command: () => navigate("/signin/landlord") }
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
