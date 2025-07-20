import React from "react";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import properties from "../dummyData/dummyLandlordProperties";
import houseImage from "../assets/house.jpg";
import { useNavigate } from "react-router-dom";

export default function Landlord() {
	const navigate = useNavigate();
	return (
		<div className="min-h-screen bg-white px-6 py-10">
			{/* Header with Add New Property Button */}
			<div className="flex justify-between items-center mb-8">
				<h1 className="text-3xl font-bold text-[var(--text-color)]">
					My Listings
				</h1>
				<Button
					label="Add New Property"
					icon="pi pi-plus"
					severity="primary"
					className="px-4 py-2 text-sm"
					onClick={() => navigate("/addproperty")}
				/>
			</div>

			{/* Listings */}
			<div className="space-y-6">
				{properties.map(prop => (
					<div
						key={prop.id}
						className="flex items-center justify-between bg-white border border-[var(--surface-border)] rounded-xl px-6 py-5 shadow-sm"
					>
						{/* Image */}
						<div className="w-20 h-20 flex-shrink-0 rounded-md overflow-hidden mr-4">
							<img
								src={houseImage}
								alt="Property"
								className="w-full h-full object-cover"
							/>
						</div>

						{/* Info + Tags */}
						<div className="flex-1">
							<h2 className="font-semibold text-[var(--text-color)] text-base">
								{prop.address}
							</h2>
							<p className="text-sm text-gray-500">{prop.city}</p>
							<div className="flex flex-wrap gap-2 mt-2">
								<Tag
									value="2 New Applicants"
									severity="info"
									className="text-xs font-medium px-3 py-1 rounded-full"
								/>
								<Tag
									value="3 New Messages"
									severity="secondary"
									className="text-xs font-medium px-3 py-1 rounded-full"
								/>
							</div>
						</div>

						{/* Buttons */}
						<div className="flex gap-2 ml-6">
							<Button
								label="View Applicants"
								icon="pi pi-users"
								size="small"
								severity="primary"
								outlined
							/>
							<Button
								label="Edit Listing"
								icon="pi pi-pencil"
								size="small"
								severity="primary"
								outlined
							/>
							<Button
								icon="pi pi-ellipsis-h"
								size="small"
								severity="primary"
								outlined
								aria-label="More options"
							/>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
