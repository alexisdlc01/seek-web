import React, { useEffect, useRef, useState } from "react";
import { Menubar } from "primereact/menubar";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import { useNavbarTheme } from "../context/NavBarThemeContext.jsx";

export default function NavbarMobile({ user, logout, logo }) {
	const navigate = useNavigate();
	const loggedIn = !!user;
	const { theme, setTheme } = useNavbarTheme();

	const [loginOpen, setLoginOpen] = useState(false);
	const loginWrapRef = useRef(null);

	const didInit = useRef(false);

	useEffect(() => {
		if (!didInit.current) {
			didInit.current = true;
			setTheme("dark");
		}
	}, [setTheme]);

	useEffect(() => {
		const onDocClick = e => {
			if (
				loginWrapRef.current &&
				!loginWrapRef.current.contains(e.target)
			) {
				setLoginOpen(false);
			}
		};
		document.addEventListener("click", onDocClick);
		return () => document.removeEventListener("click", onDocClick);
	}, []);

	const backgroundTheme = theme === "dark" ? "#0F0F23" : "white";
	const textColor = theme === "dark" ? "white" : "#0F0F23";

	const items = loggedIn
		? [
				{ label: "Dashboard", command: () => navigate("/dashboard") },
				{ label: "Listings", command: () => navigate("/listings") },
				{ label: "Messages", command: () => navigate("/messages") },
				{ label: "Settings", command: () => navigate("/settings") },
				{ label: "Logout", command: async () => await logout() }
			]
		: [
				{ label: "Home", command: () => navigate("/") },
				{ label: "About", command: () => navigate("/about") },
				{ label: "Help", command: () => navigate("/contact") }
			];

	return (
		<Menubar
			start={<div className="p-1 flex items-center w-32">
				{logo}
			</div>}
			end={
				!loggedIn ? (
					<div ref={loginWrapRef} className="relative">
						<Button
							label="Login"
							icon="pi pi-chevron-down"
							iconPos="right"
							text
							className={`font-semibold ${theme === "dark" ? "!text-white" : "!text-[#0F0F23]"}`}
							onClick={() => setLoginOpen(v => !v)}
						/>
						{loginOpen && (
							<div className="absolute right-0 top-[calc(100%+8px)] z-50 login-menu">
								<button
									type="button"
									className="block w-full rounded-lg px-4 py-2.5 text-left font-semibold text-[#0F0F23] hover:bg-slate-100"
									onClick={() => {
										setLoginOpen(false);
										navigate("/signin/student");
									}}
								>
									As Student
								</button>
								<button
									type="button"
									className="block w-full rounded-lg px-4 py-2.5 text-left font-semibold text-[#0F0F23] hover:bg-slate-100"
									onClick={() => {
										setLoginOpen(false);
										navigate("/signin/landlord");
									}}
								>
									As Landlord
								</button>
							</div>
						)}
					</div>
				) : null
			}
			model={items}
			style={{
				background: backgroundTheme,
				border: "none",
				boxShadow: "none"
			}}
			pt={{
				root: {
					className: `flex justify-between items-center !border-none !shadow-none py-3 transition-colors duration-500 ease-in-out ${theme === "dark" ? "bg-black text-white" : "bg-white text-black"}`
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
