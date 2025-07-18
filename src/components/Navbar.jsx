import React from "react";
import { Menubar } from "primereact/menubar";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";

export default function Navbar({ loggedIn }) {
	loggedIn = true;
	const navigate = useNavigate();
	const items = loggedIn
		? [
				{ label: "Dashboard", path: "/dashboard" },
				{ label: "Properties", path: "/properties" },
				{ label: "Messages", path: "/messages" },
				{
					label: "Graham Heathcote",
					items: [
						{
							label: "Settings"
						},
						{
							label: "Logout"
						}
					],
					template: (item, options) => (
						<Button
							onClick={options.onClick}
							className="pl-3 pr-4 py-2 bg-blue-900 text-blue-400 hover:bg-blue-00 flex items-center gap-2"
						>
							<span>{item.label}</span>
							<i className="pi pi-chevron-down text-xs" />
						</Button>
					)
				}
		  ]
		: [
				{ label: "Home", path: "/" },
				{ label: "About", path: "/about" },
				{ label: "For Landlords" },
				{ label: "Help", path: "/help" },
				{ separator: true, className: "ml-4" },

				{
					label: "Login",
					items: [
						{
							label: "As Student"
						},
						{
							label: "As Landlord"
						}
					],
					template: (item, options) => (
						<Button
							label={item.label}
							onClick={options.onClick}
							className="pl-3 relative"
						/>
					)
				}
		  ];

	const menuItems = items.map(({ label, path, items, template }) => ({
		label,
		...(path && { command: () => navigate(path) }),
		...(items && { items }),
		...(template && { template }),
		...(!items &&
			!path && {
				template: () => (
					<a className="p-menuitem-link relative">
						<span className="mx-2">{label}</span>
					</a>
				)
			})
	}));

	const logo = (
		<img
			src="/whitelogo-notext.svg"
			alt="Logo"
			className="h-9 w-auto object-contain ml-auto"
		/>
	);

	return (
		<div className="relative w-full mt-4 mb-4 md:mt-0 md:mb-0 bg-white">
			<Menubar
				model={items}
				start={logo}
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
					menu: {
						className: "flex justify-center w-full gap-3"
					},
					button: {
						className:
							"absolute left-4 top-1/2 -translate-y-1/2 md:static md:translate-y-0 md:ml-0 !border-none !shadow-none !bg-transparent !outline-none hover:!bg-transparent focus:!ring-0 focus:!shadow-none"
					}
				}}
			/>
		</div>
	);
}
