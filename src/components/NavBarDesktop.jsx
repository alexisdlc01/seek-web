import React, { useRef } from "react";
import { Menubar } from "primereact/menubar";
import { Button } from "primereact/button";
import { Menu } from "primereact/menu";
import { useNavigate } from "react-router-dom";
import { useNavbarTheme } from "../context/NavBarThemeContext.jsx";

export default function NavbarDesktop({ user, logout, logo }) {
	const navigate = useNavigate();
	const loginMenuRef = useRef(null);
	const loggedIn = !!user;
	const { theme } = useNavbarTheme();
	const backgroundTheme = theme === "dark" ? "#0F0F23" : "white";
	const oppositeBackgroundTheme = theme !== "dark" ? "#0F0F23" : "white";

	const loginItems = [
		{
			label: (
				<span
					style={{
						color: "#0F0F23"
					}}
				>
					As Student
				</span>
			),
			command: () => navigate("/signin/student")
		},
		{
			label: (
				<span
					style={{
						color: "#0F0F23"
					}}
				>
					As Landlord
				</span>
			),
			command: () => navigate("/signin/landlord")
		}
	];

	// switched from font-medium → font-semibold
	const baseStyle =
		"navbar-buttons text-base font-semibold text-blue-900 relative hover:bg-transparent focus:ring-0 focus:outline-none active:bg-transparent after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:h-0.5 after:w-0 after:bg-blue-900 after:transition-all after:duration-300 hover:after:w-full";

	const logoutStyle =
		"navbar-buttons text-base font-semibold text-red-600 relative hover:bg-transparent focus:ring-0 focus:outline-none active:bg-transparent after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:h-0.5 after:w-0 after:bg-red-600 after:transition-all after:duration-300 hover:after:w-full";

	const start = <div className="ml-4">{logo}</div>;

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
								Properties
							</span>
						}
						text
						className={`${baseStyle} ${theme === "dark" ? "after:bg-white" : ""}`}
						onClick={() => navigate("/properties")}
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
					<Button
						label={
							<span style={{ color: oppositeBackgroundTheme }}>
								Settings
							</span>
						}
						text
						className={`${baseStyle} ${theme === "dark" ? "after:bg-white" : ""}`}
						onClick={() => navigate("/settings")}
					/>
					<Button
						label={
							<span style={{ color: oppositeBackgroundTheme }}>
								Logout
							</span>
						}
						text
						className={logoutStyle}
						onClick={async () => await logout()}
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
					<Button
						label={
							<span style={{ color: oppositeBackgroundTheme }}>
								Login
							</span>
						}
						icon="pi pi-chevron-down"
						iconPos="right"
						text
						className={`${baseStyle} ${theme === "dark" ? "text-white after:bg-white" : "text-black"}`}
						onClick={e => loginMenuRef.current.toggle(e)}
					/>
				</>
			)}
		</div>
	);

	return (
		<>
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
				style={{
					background: backgroundTheme
				}}
				className={`transition-colors duration-500 ease-in-out ${
					theme === "dark"
						? "navbar-dark bg-black text-white"
						: "navbar-light bg-white text-black"
				}`}
			/>
			<Menu
				model={loginItems.map(item => ({
					...item,
					template: (menuItem, options) => (
						<Button
							label={menuItem.label}
							text
							className={`${baseStyle} w-full text-left py-2`}
							onClick={options.onClick}
						/>
					)
				}))}
				popup
				ref={loginMenuRef}
				id="popup_menu_right"
				popupAlignment="right"
				style={{ width: "10rem", color: "#0F0F23" }}
			/>
		</>
	);
}
