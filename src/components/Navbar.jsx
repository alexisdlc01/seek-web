import React from "react";
import { Menubar } from "primereact/menubar";
import { Button } from "primereact/button";

export default function Navbar() {
	const itemRenderer = item =>
		item.label === "Login" ? (
			<Button className={"mx-2 relative"} rounded>
				<span className="mx-2">Login</span>
			</Button>
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

	const start = (
		<img
			alt="logo"
			src="https://primefaces.org/cdn/primereact/images/logo.png"
			height="40"
			className="mx-3 max-h-15"
		></img>
	);

	return (
		<div className="card">
			<Menubar
				start={start}
				end={
					<Menubar
						model={items}
						pt={{
							root: {
								className: "border-none"
							}
						}}
					/>
				}
			/>
		</div>
	);
}
