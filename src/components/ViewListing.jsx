import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Tag } from "primereact/tag";
import { Button } from "primereact/button";
import axios from "axios";
import { Carousel } from "primereact/carousel";

import { API_BASE } from "../lib/landlord.js";

const ViewListing = () => {
	const { id } = useParams();
	const [listing, setListing] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		(async () => {
			try {
				const res = await axios.get(`${API_BASE}/listings/mine/${id}`, {
					withCredentials: true
				});
				setListing(res.data);
			} catch (err) {
				console.error("Error fetching listing:", err);
			} finally {
				setLoading(false);
			}
		})();
	}, [id]);

	const photoTemplate = photo => {
		return (
			<div className="p-2">
				<div className="h-[300px] md:h-[400px] w-full rounded-lg overflow-hidden shadow-lg">
					<img
						src={photo}
						alt="Property"
						className="w-full h-full object-cover"
					/>
				</div>
			</div>
		);
	};

	if (loading) {
		return <div className="text-center text-sk-text p-6">Loading...</div>;
	}

	if (!listing) {
		return (
			<div className="text-center text-sk-text p-6">Listing not found.</div>
		);
	}

	return (
		<div className="min-h-screen bg-sk-bg text-sk-text px-4 py-6">
			{/* Header */}
			<div className="max-w-6xl mx-auto">
				<h1 className="text-3xl font-bold">{listing.propertyTitle}</h1>
				<p className="text-sk-text2 text-lg">
					{listing.streetAddress}, {listing.cityTown},{" "}
					{listing.postcodeZIP}, {listing.country}
				</p>
				<div className="flex flex-wrap gap-2 mt-2">
					{listing.isVerified ? (
						<Tag value="Live" severity="success" />
					) : listing.moderationStatus === "NEEDS_CHANGES" ? (
						<Tag value="Needs changes" severity="danger" />
					) : (
						<Tag value="Being checked" severity="warning" />
					)}
					{listing.isDraft && <Tag value="Draft" severity="danger" />}
				</div>
			</div>

			{/* Carousel */}
			{listing?.photos?.length > 0 && (
				<div className="max-w-6xl mx-auto mt-6">
					<Carousel
						value={listing.photos}
						numVisible={1}
						numScroll={1}
						circular
						autoplayInterval={5000}
						itemTemplate={photoTemplate}
					/>
				</div>
			)}

			{/* Details */}
			<div className="max-w-6xl mx-auto mt-8 grid md:grid-cols-3 gap-6">
				{/* Left column */}
				<div className="md:col-span-2 space-y-4">
					<h2 className="text-2xl font-semibold">
						About this property
					</h2>
					<p className="text-sk-text2">{listing.propertyDesc}</p>

					<h3 className="text-xl font-semibold mt-4">Details</h3>
					<ul className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sk-text text-sm">
						<li>
							<b>Size:</b> {listing.sizeSqMeters} m²
						</li>
						<li>
							<b>Bedrooms:</b> {listing.bedroomsCount}
						</li>
						<li>
							<b>Ensuite Bedrooms:</b>{" "}
							{listing.enSuiteBedroomCount}
						</li>
						<li>
							<b>Bathrooms:</b> {listing.bathrooms}
						</li>
						<li>
							<b>Furnishing:</b> {listing.furnishingStatus}
						</li>
						<li>
							<b>EPC Rating:</b> {listing.epcRating || "N/A"}
						</li>
					</ul>

					{listing.amenities?.length > 0 && (
						<>
							<h3 className="text-xl font-semibold mt-4">
								Amenities
							</h3>
							<div className="flex flex-wrap gap-2">
								{listing.amenities.map((a, idx) => (
									<Tag key={idx} value={a} severity="info" />
								))}
							</div>
						</>
					)}

					{listing.floorPlanImage && (
						<>
							<h3 className="text-xl font-semibold mt-4">
								Floor Plan
							</h3>
							<img
								src={listing.floorPlanImage}
								alt="Floor Plan"
								className="w-full max-w-md rounded-lg border border-sk-border"
							/>
						</>
					)}

					{listing.registerOfTitleKey && (
						<div className="mt-4">
							<h3 className="text-xl font-semibold">
								Register of Title
							</h3>
							<Button
								label="View Document"
								icon="pi pi-file-pdf"
								className="p-button-text text-sk-link underline"
								onClick={async () => {
									try {
										const res = await axios.get(
											`${API_BASE}/upload/access`,
											{
												params: {
													key: listing.registerOfTitleKey
												},
												withCredentials: true
											}
										);
										window.open(res.data, "_blank");
									} catch (err) {
										console.error(
											"Failed to fetch presigned URL",
											err
										);
									}
								}}
							/>
						</div>
					)}
				</div>

				{/* Right column */}
				<div className="bg-sk-card p-5 rounded-lg shadow-lg space-y-4">
					<h2 className="text-2xl font-bold">
						£{listing.monthlyRent}/month
					</h2>
					<p className="text-sk-text2">
						Deposit: £{listing.securityDeposit}
					</p>
					<p className="text-sk-text2">
						Available:{" "}
						{new Date(listing.availableFrom).toLocaleDateString()} –{" "}
						{new Date(listing.availableUntil).toLocaleDateString()}
					</p>
				</div>
			</div>
		</div>
	);
};

export default ViewListing;
