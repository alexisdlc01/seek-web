import React from "react";
import { Menubar } from "primereact/menubar";
import { Button } from "primereact/button";

export default function Navbar() {
	const itemRenderer = item =>
		item.label === "Login" ? (
			<Button className={"pl-3 relative"}>Login</Button>
		) : (
			<a className="p-menuitem-link relative">
				<span className="mx-2">{item.label}</span>
			</a>
		);
	const items = [
		{ label: "Home", template: itemRenderer },
		{ label: "About", template: itemRenderer },
		{ label: "For Landlords", template: itemRenderer },
		{ label: "Help", template: itemRenderer },
		{ label: "Login", template: itemRenderer }
	];

	return (
		<div className="relative w-full mt-4 mb-4 md:mt-0 md:mb-0">
			<Menubar
				model={items}
				style={{
					border: "none",
					boxShadow: "none"
				}}
				pt={{
					root: {
						className: `
							flex justify-center 
							!border-none !shadow-none 
							relative md:px-0 py-3
						`
					},
					menu: {
						className: "flex justify-center w-full"
					},
					button: {
						className: `
							absolute left-4 top-1/2 -translate-y-1/2 
							md:static md:translate-y-0 md:ml-0
							!border-none !shadow-none !bg-transparent !outline-none
							hover:!bg-transparent focus:!ring-0 focus:!shadow-none
						`
					}
				}}
			/>
		</div>
	);
}
