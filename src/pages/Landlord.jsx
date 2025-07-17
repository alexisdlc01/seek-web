import React from "react";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import properties from "../dummyData/dummyLandlordProperties";
import houseImage from "../assets/house.jpg";

export default function Landlord() {
	return (
		<div className="min-h-screen bg-white px-6 py-10">
			<h1 className="text-3xl font-bold text-[var(--text-color)] mb-8">
				My Listings
			</h1>

			<div className="space-y-6">
				{properties.map(prop => (
					<div
						key={prop.id}
						className="flex items-center justify-between bg-white border border-[var(--surface-border)] rounded-xl px-6 py-5 shadow-sm"
					>
						<div className="w-20 h-20 flex-shrink-0 rounded-md overflow-hidden mr-4">
							<img
								src={houseImage}
								alt="Property"
								className="w-full h-full object-cover"
							/>
						</div>

						<div className="flex-1">
							<h2 className="font-semibold text-[var(--text-color)] text-base">
								{prop.address}
							</h2>
							<p className="text-sm text-gray-500">{prop.city}</p>
							<Tag
								value="2 Applicants"
								className="mt-2"
								style={{
									backgroundColor: "var(--primary-color)",
									color: "white"
								}}
							/>
						</div>

						<div className="flex gap-2 ml-6">
							<Button label="Edit" />
							<Button label="View" />
							<Button icon="pi pi-ellipsis-h" />
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
