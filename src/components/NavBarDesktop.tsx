import React, { useRef, useEffect, useState } from "react";
import { Menubar } from "primereact/menubar";
import { Button } from "primereact/button";
import { Menu } from "primereact/menu";
import { useNavigate } from "react-router-dom";
import { useNavbarTheme } from "../context/NavBarThemeContext.jsx";
import { Avatar } from "primereact/avatar";
import { MenuItem } from "primereact/menuitem";
import { useAuthControllerLogout } from "../api/auth/auth.js";

type NavbarDesktopProps = {
	user?: any
}

export default function NavbarDesktop({ user, logo }) {
	const { mutate: logout } = useAuthControllerLogout();

	console.log("USER", user);
	const navigate = useNavigate();
	const loggedIn = !!user;
	const { theme, setTheme } = useNavbarTheme();
	const didInit = useRef(false);
	const [loginOpen, setLoginOpen] = useState(false);
	const [userMenuOpen, setUserMenuOpen] = useState(false);
	const userWrapRef = useRef(null);

	const loginWrapRef = useRef(null);

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
			)
				setLoginOpen(false);
			if (userWrapRef.current && !userWrapRef.current.contains(e.target))
				setUserMenuOpen(false);
		};
		document.addEventListener("click", onDocClick);
		return () => document.removeEventListener("click", onDocClick);
	}, []);

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
	const oppositeBackgroundTheme = theme !== "dark" ? "#0F0F23" : "white";
	const iconColorClass = theme === "dark" ? "!text-white" : "!text-[#0F0F23]";

	const loginItems = [
		{
			label: "As Student",
			command: () => {
				setLoginOpen(false);
				navigate("/signin/student");
			}
		},
		{
			label: "As Landlord",
			command: () => {
				setLoginOpen(false);
				navigate("/signin/landlord");
			}
		}
	];

	const baseStyle =
		"navbar-buttons text-base font-semibold text-blue-900 relative hover:bg-transparent focus:ring-0 focus:outline-none active:bg-transparent after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:h-0.5 after:w-0 after:bg-blue-900 after:transition-all after:duration-300 hover:after:w-full";

	const start = <div className="ml-4">{logo}</div>;

	const end = (
		<div className="flex items-center gap-5 mr-6">
			{loggedIn ? (
				<>
					{/* Role-based main buttons */}
					{user.role === "LANDLORD_AGENCY" ? (
						<>
							<Button
								//@ts-ignore
								label={<span style={{ color: oppositeBackgroundTheme }}>Dashboard</span>}
								text
								className={`${baseStyle} ${theme === "dark" ? "after:bg-white" : ""}`}
								onClick={() => navigate("/dashboard")}
							/>
							<Button
								//@ts-ignore
								label={<span style={{ color: oppositeBackgroundTheme }}>Listings</span>}
								text
								className={`${baseStyle} ${theme === "dark" ? "after:bg-white" : ""}`}
								onClick={() => navigate("/listings")}
							/>
							<Button
								//@ts-ignore
								label={<span style={{ color: oppositeBackgroundTheme }}>Chat</span>}
								text
								className={`${baseStyle} ${theme === "dark" ? "after:bg-white" : ""}`}
								onClick={() => navigate("/chat")}
							/>
						</>
					) : (
						<>
							<Button
								//@ts-ignore
								label={<span style={{ color: oppositeBackgroundTheme }}>Home</span>}
								text
								className={`${baseStyle} ${theme === "dark" ? "after:bg-white" : ""}`}
								onClick={() => navigate("/")}
							/>
							<Button
								//@ts-ignore
								label={<span style={{ color: oppositeBackgroundTheme }}>About</span>}
								text
								className={`${baseStyle} ${theme === "dark" ? "after:bg-white" : ""}`}
								onClick={() => navigate("/about")}
							/>
							<Button
								//@ts-ignore
								label={<span style={{ color: oppositeBackgroundTheme }}>Help</span>}
								text
								className={`${baseStyle} ${theme === "dark" ? "after:bg-white" : ""}`}
								onClick={() => navigate("/contact")}
							/>
						</>
					)}

					{/* Account dropdown (always shown when logged in) */}
					<div ref={userWrapRef} className="relative">
						<div
							className="flex items-center gap-2 bg-[#186273] rounded-lg px-3 py-1.5 cursor-pointer hover:bg-[#186273] transition"
							onClick={() => setUserMenuOpen(v => !v)}
						>
							{user.profilePicUrl ? (
								<Avatar
									image={user.profilePicUrl}
									className="bg-[#3182ce] text-white font-bold"
									shape="circle"
								/>
							) : (
								<>
									{user && (
										<Avatar
											label={user.name
												?.split(" ")
												.map(n => n[0])
												.join("")
												.toUpperCase()}
											className="bg-[#3182ce] text-white font-bold"
											shape="circle"
											style={{
												backgroundColor: "#3182ce"
											}}
										/>
									)}
								</>
							)}
							<span className="text-white font-medium">{user.name}</span>
							<i className="pi pi-chevron-down text-white text-sm" />
						</div>

						{userMenuOpen && (
							<div className="absolute right-0 top-[calc(100%+8px)] z-50 w-full rounded-xl shadow-lg border bg-white p-1 overflow-hidden">
								<button
									onClick={() => navigate("/edit-profile")}
									className="cursor-pointer w-full text-left px-3 py-2 text-[#3182c] font-semibold hover:bg-black/5 rounded-lg"
								>
									<i className="pi pi-user-edit px-0.5"></i> Edit Profile
								</button>
								<button
									onClick={() => {
										setUserMenuOpen(false);
										logout();
									}}
									className="cursor-pointer w-full text-left px-3 py-2 text-[#3182c] font-semibold hover:bg-black/5 rounded-lg"
								>
									<i className="pi pi-sign-out px-0.5"></i> Logout
								</button>
							</div>
						)}
					</div>
				</>
			) : (
				// not logged in (keep your login dropdown as before)
				<>
					<Button
						text
						className={`${baseStyle} ${theme === "dark" ? "after:bg-white" : ""}`}
						onClick={() => navigate("/")}
					>
						<span style={{ color: oppositeBackgroundTheme }}>Home</span>
					</Button>
					<Button
						text
						className={`${baseStyle} ${theme === "dark" ? "after:bg-white" : ""}`}
						onClick={() => navigate("/about")}
					>
						<span style={{ color: oppositeBackgroundTheme }}>About</span>
					</Button>
					<Button
						text
						className={`${baseStyle} ${theme === "dark" ? "after:bg-white" : ""}`}
						onClick={() => navigate("/contact")}
					>
						<span style={{ color: oppositeBackgroundTheme }}>Help</span>
					</Button>

					{/* Existing login dropdown */}
					<div ref={loginWrapRef} className="relative">
						<Button
							text
							className={`${baseStyle} ${theme === "dark" ? "text-white after:bg-white" : "text-black"}`}
							onClick={() => setLoginOpen(v => !v)}
							pt={{ icon: { className: iconColorClass } }}
						>
							<div className="space-x-2">
								<span style={{ color: oppositeBackgroundTheme }}>Login</span>
								<i style={{ color: oppositeBackgroundTheme }} className="pi pi-chevron-down" />
							</div>
						</Button>
						{loginOpen && (
							<div
								className="absolute right-0 top-[calc(100%+8px)] z-50"
								style={{ width: "30%", right: "155%" }}
							>
								<Menu
									model={loginItems.map(item => {
										const result: MenuItem = {
											label: item.label,
											command: item.command,
											template: (menuItem, options) => (
												<Button
													text
													className={`${baseStyle} w-full text-left !py-2 !px-3`}
													onClick={options.onClick}>
													<span style={{ color: "#0F0F23" }} className="text-center w-full">{menuItem.label}</span>
												</Button>
											)
										}
										return result;
									})}
									className="rounded-xl shadow-lg border bg-white p-1 min-w-0"
								/>
							</div>
						)}
					</div>
				</>
			)}
		</div>
	);

	return (
		<div className="sticky top-0 z-50">
			<Menubar
				start={start}
				end={end}
				pt={{
					root: {
						className:
							"flex justify-between items-center !border-none !shadow-none py-4"
					},
					menu: { className: "hidden" },
					button: { className: "hidden" }
				}}
				style={{ background: backgroundTheme }}
				className={`transition-colors duration-500 ease-in-out ${theme === "dark"
					? "bg-black text-white"
					: "bg-white text-black"
					}`}
			/>
		</div>
	);
}
