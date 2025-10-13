import React, { useContext, useEffect, useRef } from "react";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import ListingsContext from "../context/ListingsContext.jsx";
import { confirmDialog, ConfirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function Listings() {
	const navigate = useNavigate();
	const { listings, setCurrentListing } =
		useContext(ListingsContext);
	const toast = useRef(null);

	const handleDelete = async id => {
		try {
			await axios.delete(`${BASE_URL}/listings/${id}`, {
				withCredentials: true
			});
			toast.current.show({
				severity: "success",
				summary: "Deleted",
				detail: "Listing successfully deleted",
				life: 3000
			});
		} catch (err) {
			console.error("Delete failed:", err);
			toast.current.show({
				severity: "error",
				summary: "Error",
				detail: "Failed to delete listing",
				life: 3000
			});
		}
	};

	const confirmDelete = prop => {
		confirmDialog({
			message: `Are you sure you want to delete?`,
			header: "Confirm Deletion",
			icon: "pi pi-exclamation-triangle",
			acceptLabel: "Yes, Delete",
			rejectLabel: "Cancel",
			acceptClassName: "p-button-danger",
			draggable: false,
			accept: () => handleDelete(prop._id)
		});
	};

	return (
		<div
			className="min-h-screen bg-white px-4 py-6 sm:px-6 lg:px-8"
			style={{ background: "#0f0f23", margin: "0 auto", width: "80%" }}
		>
			<Toast ref={toast} />
			<ConfirmDialog />
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
								const res = await axios.post(
									`${BASE_URL}/listings/draft`,
									{},
									{
										withCredentials: true
									}
								);
								const id = res.data;
								navigate(`/add-listing/${id}`);
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
						{prop.photos[0] ? (
							<div className="w-full md:w-32 h-40 md:h-20 flex-shrink-0 rounded-md overflow-hidden">
								{prop.photos[0] && (
									<img
										src={prop.photos[0]}
										alt="Property"
										className="w-full h-full object-cover"
									/>
								)}
							</div>
						) : <div className="w-full md:w-32 h-40 md:h-20 flex-shrink-0 rounded-md overflow-hidden">
								<img
									src="/placeholder.png"
									alt="Property"
									className="w-full h-full object-cover"
								/>
						</div>}

						{/* Info + Tags */}
						<div className="flex-1 w-full">
							<h2 className="font-semibold text-[var(--text-color)] text-base mt-2 md:mt-0">
								{prop.propertyTitle || <i>No listing title</i>}
							</h2>
							<h2 className="font-semibold text-[var(--text-color)] text-base mt-2 md:mt-0">
								{prop.streetAddress || <i>No Street Address</i>}
							</h2>
							<p className="text-sm text-white">
								{!prop.cityTown && !prop.postcodeZIP ? (
									<i>No Postcode</i>
								) : (
									`${prop.cityTown}, ${prop.postcodeZIP}`
								)}
							</p>
							<div className="flex flex-wrap gap-2 mt-2">
								{prop.isDraft && (
									<Tag
										value="Draft"
										severity="warning"
										className="text-xs font-medium px-3 py-1 rounded-full"
									/>
								)}
								{!prop.isVerified ? (
									<Tag
										value="Not verified"
										severity="danger"
										className="text-xs font-medium px-3 py-1 rounded-full"
									/>
								) : (
									<Tag
										value="Verified!"
										severity="success"
										className="text-xs font-medium px-3 py-1 rounded-full"
									/>
								)}
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
											color: "white",
											backgroundColor: "#21b8c4",
											border: "none"
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
											navigate(
												`/add-listing/${prop._id}`
											);
										}}
										style={{
											color: "white",
											backgroundColor: "#21b8c4",
											border: "none"
										}}
									/>
								</motion.div>
							)}

							{!prop.isDraft && (
								<motion.div whileHover={{ scale: 1.01 }}>
									<Button
										label="View Listing"
										icon="pi pi-pencil"
										size="small"
										severity="primary"
										outlined
										className="w-full sm:w-auto"
										onClick={() => {
											setCurrentListing(prop);
											navigate(
												`/view-listing/${prop._id}`
											);
										}}
										style={{
											color: "white",
											backgroundColor: "#21b8c4",
											border: "none"
										}}
									/>
								</motion.div>
							)}
							{prop.isDraft && (
								<motion.div whileHover={{ scale: 1.01 }}>
									<Button
										icon="pi pi-trash"
										size="small"
										severity="danger"
										className="w-full sm:w-auto"
										onClick={() => confirmDelete(prop)}
										style={{
											color: "white",
											backgroundColor: "#f44336",
											border: "none"
										}}
									/>
								</motion.div>
							)}
						</div>
					</motion.div>
				))}
			</div>
		</div>
	);
}
