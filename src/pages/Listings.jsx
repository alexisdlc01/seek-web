import React, { useContext, useEffect } from "react";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import properties from "../dummyData/DummyListings";
import houseImage from "../assets/house.jpg";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Badge } from "primereact/badge";
import axios from "axios";
import ListingsContext from "../context/ListingsContext.jsx";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function Listings() {
	const navigate = useNavigate();
	const { listings, setCurrentListing } = useContext(ListingsContext);

	return (
		<div
			className="min-h-screen bg-white px-4 py-6 sm:px-6 lg:px-8"
			style={{ background: "#0f0f23", margin: "0 auto", width: "80%" }}
		>
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
				<div className="flex gap-3 ml-auto">
					<motion.div
						whileHover={{ scale: 1.01 }}
						className="relative inline-block"
					>
						<Button
							label="View Listings Pending Approval"
							icon="pi pi-eye"
							severity="primary"
							size="small"
							className="w-full sm:w-auto"
							style={{
								background: "#23b7c5"
							}}
						/>
						<Badge
							value="1"
							severity="danger"
							className="absolute -top-2 -right-2"
						/>
					</motion.div>
					<motion.div whileHover={{ scale: 1.01 }}>
						<Button
							label="Add New Listing"
							icon="pi pi-plus"
							size="small"
							severity="primary"
							className="w-full sm:w-auto"
							style={{
								background: "#23b7c5"
							}}
							onClick={async () => {
								navigate("/add-listing");
							}}
						/>
					</motion.div>
				</div>
			</motion.div>

			{/* Listings */}
			<div className="space-y-6">
				{listings.map((prop, i) => (
					<motion.div
						key={i}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.4, delay: i * 0.1 }}
						className="flex flex-col md:flex-row items-start md:items-center justify-between border border-[var(--surface-border)] rounded-xl px-4 py-5 shadow-sm gap-4"
						style={{
							background: "var(--gray-62)"
						}}
					>
						{/* Image */}
						<div className="w-full md:w-32 h-40 md:h-20 flex-shrink-0 rounded-md overflow-hidden">
							<img
								// TODO: replace dummy image with one from AWS s3
								src={houseImage}
								alt="Property"
								className="w-full h-full object-cover"
							/>
						</div>

						{/* Info + Tags */}
						<div className="flex-1 w-full">
							<h2 className="font-semibold text-[var(--text-color)] text-base mt-2 md:mt-0">
								{prop.streetAddress}
							</h2>
							<p className="text-sm text-white">
								{prop.cityTown}, {prop.postcodeZIP}
							</p>
							<div className="flex flex-wrap gap-2 mt-2">
								{prop.isDraft && (
									<Tag
										value="Draft"
										severity="warning"
										className="text-xs font-medium px-3 py-1 rounded-full"
									/>
								)}
								{!prop.isVerified && (
									<Tag
										value="Not verified"
										severity="danger"
										className="text-xs font-medium px-3 py-1 rounded-full"
									/>
								)}
								{/*<Tag*/}
								{/*	value="2 New Applicants"*/}
								{/*	severity="info"*/}
								{/*	className="text-xs font-medium px-3 py-1 rounded-full"*/}
								{/*	style={{*/}
								{/*		background: "#23b7c5"*/}
								{/*	}}*/}
								{/*/>*/}
								{/*<Tag*/}
								{/*	value="3 New Messages"*/}
								{/*	severity="info"*/}
								{/*	className="text-xs font-medium px-3 py-1 rounded-full"*/}
								{/*	style={{*/}
								{/*		background: "#23b7c5"*/}
								{/*	}}*/}
								{/*/>*/}
							</div>
						</div>

						{/* Buttons */}
						<div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
							{/* View Applicants */}
							{!prop.isDraft && (
								<motion.div whileHover={{ scale: 1.01 }}>
									<Button
										label="View Applicants"
										icon="pi pi-users"
										size="small"
										severity="primary"
										outlined
										className="w-full sm:w-auto "
										onClick={() => navigate("/applicants")}
										style={{
											color: "white"
										}}
									/>
								</motion.div>
							)}

							{/* Edit Listing */}
							{prop.isDraft && (
								<motion.div whileHover={{ scale: 1.01 }}>
									<Button
										label="Continue Editing"
										icon="pi pi-pencil"
										size="small"
										severity="primary"
										outlined
										className="w-full sm:w-auto"
										onClick={() => {
											setCurrentListing(prop);
											navigate("/add-listing");
										}}
										style={{
											color: "white"
										}}
									/>
								</motion.div>
							)}

							{/* More Options */}
							<motion.div whileHover={{ scale: 1.02 }}>
								<Button
									icon="pi pi-ellipsis-h"
									size="small"
									severity="primary"
									aria-label="More options"
									className="w-full sm:w-auto"
									style={{
										color: "white"
									}}
								/>
							</motion.div>
						</div>
					</motion.div>
				))}
			</div>
		</div>
	);
}
