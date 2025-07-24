import React from "react";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import properties from "../dummyData/DummyListings";
import houseImage from "../assets/house.jpg";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Listings() {
	const navigate = useNavigate();

	return (
		<div className="min-h-screen bg-white px-4 py-6 sm:px-6 lg:px-8">
			{/* Header with Add New Property Button */}
			<motion.div
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4"
			>
				<h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-color)]">
					My Listings
				</h1>
				<motion.div whileHover={{ scale: 1.02 }}>
					<Button
						label="Add New Property"
						icon="pi pi-plus"
						severity="primary"
						className="w-full sm:w-auto"
						onClick={() => navigate("/addproperty")}
					/>
				</motion.div>
			</motion.div>

			{/* Listings */}
			<div className="space-y-6">
				{properties.map((prop, i) => (
					<motion.div
						key={prop.id}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.4, delay: i * 0.1 }}
						className="flex flex-col md:flex-row items-start md:items-center justify-between bg-white border border-[var(--surface-border)] rounded-xl px-4 py-5 shadow-sm gap-4"
					>
						{/* Image */}
						<div className="w-full md:w-32 h-40 md:h-20 flex-shrink-0 rounded-md overflow-hidden">
							<img
								src={houseImage}
								alt="Property"
								className="w-full h-full object-cover"
							/>
						</div>

						{/* Info + Tags */}
						<div className="flex-1 w-full">
							<h2 className="font-semibold text-[var(--text-color)] text-base mt-2 md:mt-0">
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
						<div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
							{["View Applicants", "Edit Listing", ""].map(
								(label, j) => (
									<motion.div
										key={j}
										whileHover={{ scale: 1.02 }}
									>
										<Button
											label={label || undefined}
											icon={
												j === 0
													? "pi pi-users"
													: j === 1
													? "pi pi-pencil"
													: "pi pi-ellipsis-h"
											}
											size="small"
											severity="primary"
											outlined
											aria-label={
												!label
													? "More options"
													: undefined
											}
											className="w-full sm:w-auto"
										/>
									</motion.div>
								)
							)}
						</div>
					</motion.div>
				))}
			</div>
		</div>
	);
}
