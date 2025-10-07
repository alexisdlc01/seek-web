import React, { useEffect } from "react";
import { Button } from "primereact/button";

const ReviewPublishStep = ({ back, publish }) => {
	useEffect(() => {
		window.scrollTo({ top: 0, behavior: "smooth" });
	}, []);

	const Section = ({ title, children }) => (
		<div className="bg-[#626262] rounded-xl p-6 mb-6">
			<h2 className="text-xl font-semibold mb-4 text-white">{title}</h2>
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-200">
				{children}
			</div>
		</div>
	);

	return (
		<div className="text-white">
			<div className="text-white p-3 bg-[#21b8c4] rounded-lg mb-6 font-medium">
				<i className="pi pi-check mr-2"></i>
				Please review your listing details carefully before publishing.
			</div>

			<Section title="Property Details Summary">
				<p>
					<strong>Property Title:</strong>
					<br /> Spacious 2-bed flat with garden
				</p>
				<p>
					<strong>Property Type:</strong>
					<br /> Flat/Apartment
				</p>
				<p>
					<strong>Bedrooms:</strong>
					<br /> 2 Regular, 1 Ensuite
				</p>
				<p>
					<strong>Bathrooms:</strong>
					<br /> 2
				</p>
				<p>
					<strong>Property Size:</strong>
					<br /> 850 sq ft / 79 m²
				</p>
				<p>
					<strong>Furnishing:</strong>
					<br /> Fully Furnished
				</p>
			</Section>

			<Section title="Location & Pricing">
				<p>
					<strong>Full Address:</strong>
					<br /> 123 North Street, St Andrews, KY16 9AL
				</p>
				<p>
					<strong>Monthly Rent:</strong>
					<br /> £3,000 pcm
				</p>
				<p>
					<strong>Deposit:</strong>
					<br /> £1,200
				</p>
				<p>
					<strong>Available From:</strong>
					<br /> 1st September 2024
				</p>
				<p>
					<strong>Lease Duration:</strong>
					<br /> 12 Months
				</p>
				<p>
					<strong>EPC Rating:</strong>
					<br /> B
				</p>
			</Section>

			<Section title="Amenities">
				<p>
					Wi-Fi, Washing Machine, Dryer, Dishwasher, Garden, Parking
				</p>
			</Section>
			<br />
			<hr className="p-1" />
			<div className="flex pt-8 justify-between items-center">
				<Button
					label="Back"
					severity="secondary"
					icon="pi pi-arrow-left"
					onClick={back}
				/>
				<div className="flex gap-3">
					<Button
						label="Save Draft"
						icon="pi pi-save"
						className="p-button-secondary"
					/>
					<Button
						label="Publish Listing"
						icon="pi pi-check"
						onClick={publish}
					/>
				</div>
			</div>
		</div>
	);
};

export default ReviewPublishStep;
