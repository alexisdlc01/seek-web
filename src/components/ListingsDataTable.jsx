import React, { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { Dialog } from "primereact/dialog";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const ListingsDataTable = () => {
	const [listings, setListings] = useState([]);
	const [selectedListing, setSelectedListing] = useState(null);
	const [visible, setVisible] = useState(false);
	const [landlord, setLandlord] = useState(null);

	useEffect(() => {
		(async () => {
			const res = await axios.get(`${BASE_URL}/listings/allUnverified`, {
				withCredentials: true
			});
			console.log(res.data);
			setListings(res.data);
		})();
	}, []);

	const imageBodyTemplate = listing => {
		if (listing.photos && listing.photos.length > 0) {
			return (
				<div
					style={{
						width: "80px",
						height: "60px",
						overflow: "hidden",
						borderRadius: "6px"
					}}
				>
					<img
						src={listing.photos[0]}
						alt={listing.propertyTitle}
						style={{
							width: "100%",
							height: "100%",
							objectFit: "cover"
						}}
					/>
				</div>
			);
		}
		return <span>No photo</span>;
	};

	const statusBodyTemplate = listing => (
		<Tag
			value={listing.isVerified ? "Verified" : "Unverified"}
			severity={listing.isVerified ? "success" : "warning"}
		/>
	);

	const rentBodyTemplate = listing =>
		`£${listing.monthlyRent?.toLocaleString()}`;

	const actionBodyTemplate = listing => (
		<div className="flex gap-2">
			<Button
				icon="pi pi-eye"
				rounded
				text
				onClick={async () => {
					setSelectedListing(listing);
					setVisible(true);
					try {
						const res = await axios.get(
							`${BASE_URL}/users/${listing.landlord}`,
							{
								withCredentials: true
							}
						);
						setLandlord(res.data);
					} catch (err) {
						console.error("Failed to fetch landlord:", err);
						setLandlord(null);
					}
				}}
			/>

			<Button
				icon="pi pi-check"
				severity="success"
				rounded
				text
				onClick={async () => {
					await axios.patch(
						`${BASE_URL}/listings/verify/${listing._id}`,
						{},
						{ withCredentials: true }
					);
					setListings(prevState =>
						prevState.filter(l => l._id !== listing._id)
					);
				}}
			/>
		</div>
	);

	return (
		<div className="card">
			<DataTable
				value={listings}
				paginator
				rows={5}
				tableStyle={{ minWidth: "70rem" }}
			>
				<Column header="Image" body={imageBodyTemplate}></Column>
				<Column field="propertyTitle" header="Title"></Column>
				<Column field="streetAddress" header="Address"></Column>
				<Column field="cityTown" header="City"></Column>
				<Column header="Rent" body={rentBodyTemplate}></Column>
				<Column header="Status" body={statusBodyTemplate}></Column>
				<Column header="Actions" body={actionBodyTemplate}></Column>
			</DataTable>

			<Dialog
				header={selectedListing?.propertyTitle}
				visible={visible}
				style={{ width: "50vw" }}
				draggable={false}
				onHide={() => setVisible(false)}
			>
				{landlord && (
					<div className="flex items-center gap-3 mt-4 p-3 border rounded-lg">
						<img
							src={landlord.profilePic}
							alt={landlord.name}
							style={{
								width: "50px",
								height: "50px",
								borderRadius: "50%",
								objectFit: "cover"
							}}
						/>
						<div>
							<p>
								<b>Landlord:</b> {landlord.name}
							</p>
							<p>
								<b>Email:</b> {landlord.email}
							</p>
						</div>
					</div>
				)}

				{selectedListing && (
					<div className="space-y-3">
						<p>
							<b>Address:</b> {selectedListing.streetAddress},{" "}
							{selectedListing.cityTown},{" "}
							{selectedListing.postcodeZIP}
						</p>
						<p>
							<b>Country:</b> {selectedListing.country}
						</p>
						<p>
							<b>Bedrooms:</b> {selectedListing.bedroomsCount}{" "}
							(Ensuite: {selectedListing.enSuiteBedroomCount})
						</p>
						<p>
							<b>Bathrooms:</b> {selectedListing.bathrooms}
						</p>
						<p>
							<b>Rent:</b> £{selectedListing.monthlyRent}
						</p>
						<p>
							<b>Deposit:</b> £{selectedListing.securityDeposit}
						</p>
						<p>
							<b>Size:</b> {selectedListing.sizeSqMeters} m²
						</p>
						<p>
							<b>Furnishing:</b>{" "}
							{selectedListing.furnishingStatus}
						</p>
						<p>
							<b>Available:</b>{" "}
							{new Date(
								selectedListing.availableFrom
							).toLocaleDateString()}{" "}
							-{" "}
							{new Date(
								selectedListing.availableUntil
							).toLocaleDateString()}
						</p>
						<p>
							<b>Description:</b> {selectedListing.propertyDesc}
						</p>

						{/* Register of Title */}
						{selectedListing.registerOfTitleKey && (
							<p>
								<b>Register of Title:</b>{" "}
								<Button
									label={selectedListing.registerOfTitleKey
										.split("/")
										.pop()
										.split("-")
										.slice(1)
										.join("-")}
									link
									className="text-blue-400 underline"
									onClick={async () => {
										try {
											const res = await axios.get(
												`${BASE_URL}/upload/access`,
												{
													params: {
														key: selectedListing.registerOfTitleKey
													},
													withCredentials: true
												}
											);
											// open the presigned URL
											window.open(res.data, "_blank");
										} catch (err) {
											console.error(
												"Failed to get presigned URL:",
												err
											);
										}
									}}
								/>
							</p>
						)}

						{selectedListing.amenities &&
							selectedListing.amenities.length > 0 && (
								<div>
									<b>Amenities:</b>
									<ul className="list-disc pl-5 mt-1">
										{selectedListing.amenities.map(
											(a, idx) => (
												<li key={idx}>{a}</li>
											)
										)}
									</ul>
								</div>
							)}

						{/* Photos */}
						<div className="flex flex-wrap gap-2 mt-2">
							{selectedListing.photos.map((photo, idx) => (
								<img
									key={idx}
									src={photo}
									alt="Property"
									style={{
										width: "120px",
										height: "90px",
										objectFit: "cover",
										borderRadius: "6px"
									}}
								/>
							))}
						</div>
					</div>
				)}
			</Dialog>
		</div>
	);
};

export default ListingsDataTable;
