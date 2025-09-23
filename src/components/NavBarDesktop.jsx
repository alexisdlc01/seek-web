import React, { useRef, useEffect, useState } from "react";
import { Menubar } from "primereact/menubar";
import { Button } from "primereact/button";
import { Menu } from "primereact/menu";
import { useNavigate } from "react-router-dom";
import { useNavbarTheme } from "../context/NavBarThemeContext.jsx";
import { Avatar } from "primereact/avatar";

export default function NavbarDesktop({ user, logout, logo }) {
	const navigate = useNavigate();
	const loggedIn = !!user;
	const { theme, setTheme } = useNavbarTheme();
	const didInit = useRef(false);
	const [loginOpen, setLoginOpen] = useState(false);
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

	const menuRef = useRef(null);
	const avatarWrapRef = useRef(null);

	const loginItems = [
		{
			label: <span style={{ color: "#0F0F23" }}>As Student</span>,
			command: () => {
				setLoginOpen(false);
				navigate("/signin/student");
			}
		},
		{
			label: <span style={{ color: "#0F0F23" }}>As Landlord</span>,
			command: () => {
				setLoginOpen(false);
				navigate("/signin/landlord");
			}
		}
	];

	const baseStyle =
		"navbar-buttons text-base font-semibold text-blue-900 relative hover:bg-transparent focus:ring-0 focus:outline-none active:bg-transparent after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:h-0.5 after:w-0 after:bg-blue-900 after:transition-all after:duration-300 hover:after:w-full";
	const logoutStyle =
		"navbar-buttons text-base font-semibold text-red-600 relative hover:bg-transparent focus:ring-0 focus:outline-none active:bg-transparent after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:h-0.5 after:w-0 after:bg-red-600 after:transition-all after:duration-300 hover:after:w-full";

	const start = <div className="ml-4">{logo}</div>;

	const userMenuItems = [
		{
			label: "Logout",
			command: async () => await logout(),
			template: (item, options) => (
				<Button
					label={
						<span style={{ color: "#0F0F23" }}>{item.label}</span>
					}
					text
					className={`${logoutStyle} w-full text-left !py-2 !px-3`}
					onClick={options.onClick}
				/>
			)
		}
	];

	const end = (
		<div className="flex items-center gap-5 mr-6">
			{loggedIn ? (
				<>
					<Button
						label={
							<span style={{ color: oppositeBackgroundTheme }}>
								Dashboard
							</span>
						}
						text
						className={`${baseStyle} ${theme === "dark" ? "after:bg-white" : ""}`}
						onClick={() => navigate("/dashboard")}
					/>
					<Button
						label={
							<span style={{ color: oppositeBackgroundTheme }}>
								Listings
							</span>
						}
						text
						className={`${baseStyle} ${theme === "dark" ? "after:bg-white" : ""}`}
						onClick={() => navigate("/listings")}
					/>
					<Button
						label={
							<span style={{ color: oppositeBackgroundTheme }}>
								Messages
							</span>
						}
						text
						className={`${baseStyle} ${theme === "dark" ? "after:bg-white" : ""}`}
						onClick={() => navigate("/messages")}
					/>

					{/* Avatar trigger stays the same */}
					<div ref={avatarWrapRef} className="relative">
						<div
							className="flex items-center gap-2 bg-[#186273] rounded-lg px-3 py-1.5 cursor-pointer hover:bg-[#186273] transition"
							onClick={(e) => menuRef.current.toggle(e)}
						>
							<Avatar
								label={user.name.split(" ").map(n => n[0]).join("").toUpperCase()}
								className="bg-[#3182ce] text-white font-bold"
								style={{ backgroundColor: "#3182ce" }}
								shape="circle"
							/>
							<span className="text-white font-medium">{user.name}</span>
							<i className="pi pi-chevron-down text-white text-sm" />
						</div>

						<Menu
							model={userMenuItems}
							popup
							ref={menuRef}
							appendTo={avatarWrapRef.current}
							className="rounded-xl shadow-lg border bg-white p-1 min-w-0"
						/>
					</div>


					{/* Old Menu component as popup */}
					<Menu
						model={userMenuItems}
						popup
						ref={menuRef}
						className="rounded-xl shadow-lg border bg-white p-1 min-w-0"
					/>
				</>
			) : (
				<>
					<Button
						label={
							<span style={{ color: oppositeBackgroundTheme }}>
								Home
							</span>
						}
						text
						className={`${baseStyle} ${theme === "dark" ? "after:bg-white" : ""}`}
						onClick={() => navigate("/")}
					/>
					<Button
						label={
							<span style={{ color: oppositeBackgroundTheme }}>
								About
							</span>
						}
						text
						className={`${baseStyle} ${theme === "dark" ? "after:bg-white" : ""}`}
						onClick={() => navigate("/about")}
					/>
					<Button
						label={
							<span style={{ color: oppositeBackgroundTheme }}>
								Help
							</span>
						}
						text
						className={`${baseStyle} ${theme === "dark" ? "after:bg-white" : ""}`}
						onClick={() => navigate("/help")}
					/>
					<div ref={loginWrapRef} className="relative">
						<Button
							label={
								<span
									style={{ color: oppositeBackgroundTheme }}
								>
									Login
								</span>
							}
							icon="pi pi-chevron-down"
							iconPos="right"
							text
							className={`${baseStyle} ${theme === "dark" ? "text-white after:bg-white" : "text-black"}`}
							onClick={() => setLoginOpen(v => !v)}
							pt={{ icon: { className: iconColorClass } }}
						/>
						{loginOpen && (
							<div
								className="absolute right-0 top-[calc(100%+8px)] z-50"
								style={{ width: "30%", right: "155%" }}
							>
								<Menu
									model={loginItems.map(item => ({
										...item,
										template: (menuItem, options) => (
											<Button
												label={menuItem.label}
												text
												className={`${baseStyle} w-full text-left !py-2 !px-3`}
												onClick={options.onClick}
											/>
										)
									}))}
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
				className={`transition-colors duration-500 ease-in-out ${
					theme === "dark"
						? "bg-black text-white"
						: "bg-white text-black"
				}`}
			/>
		</div>
	);
}
