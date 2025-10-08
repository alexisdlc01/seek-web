import React, { useEffect } from "react";
import { Button } from "primereact/button";

function formatDate(date) {
	const d = new Date(date);
	const day = d.getDate();
	const month = d.toLocaleString("default", { month: "long" });
	const year = d.getFullYear();

	const suffix =
		day % 10 === 1 && day !== 11
			? "st"
			: day % 10 === 2 && day !== 12
				? "nd"
				: day % 10 === 3 && day !== 13
					? "rd"
					: "th";

	return `${day}${suffix} ${month} ${year}`;
}

const ReviewPublishStep = ({
	title,
	back,
	sizeSqM,
	propertyType,
	street,
	city,
	postcode,
	country,
	regularBedrooms,
	ensuiteBedrooms,
	bathrooms,
	description,
	rent,
	deposit,
	availabilityDate,
	endAvailabilityDate,
	registerOfTitle,
	furnishingStatus,
	epcRating,
	amenities,
	photos,
	videoLink,
	floorPlan,
	publish
}) => {
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

			<Section title="Basics  ">
				<p>
					<strong>Property Title:</strong>
					<br /> {title}
				</p>
				<p>
					<strong>Size (square meters):</strong>
					<br /> {sizeSqM}
				</p>
				<p>
					<strong>Property Type:</strong>
					<br /> {propertyType}
				</p>
				<p>
					<strong>Street Address:</strong>
					<br /> {street}
				</p>
				<p>
					<strong>City/Town:</strong>
					<br /> {city}
				</p>
				<p>
					<strong>Postcode/ZIP:</strong>
					<br /> {postcode}
				</p>
				<p>
					<strong>Country:</strong>
					<br /> {country}
				</p>
				<p>
					<strong>Bedrooms:</strong>
					<br /> {regularBedrooms}
				</p>
				<p>
					<strong>En-suite Bedrooms:</strong>
					<br /> {ensuiteBedrooms}
				</p>
				<p>
					<strong>Bathrooms:</strong>
					<br /> {bathrooms}
				</p>
				<p>
					<strong>Property Description:</strong>
					<br /> {description}
				</p>
				<p>
					<strong>Monthly Rent:</strong>
					<br /> {rent}
				</p>
				<p>
					<strong>Security Deposit:</strong>
					<br /> {deposit}
				</p>
				<p>
					<strong>Available From:</strong>
					<br /> {formatDate(availabilityDate)}
				</p>
				<p>
					<strong>Available Until:</strong>
					<br /> {formatDate(endAvailabilityDate)}
				</p>
				<p>
					<strong>Register of Title</strong>
					<br /> {registerOfTitle ? "Included" : "Not included"}
				</p>
			</Section>

			<Section title="Features">
				<p>
					<strong>Furnishing Status:</strong>
					<br /> {furnishingStatus}
				</p>
				{epcRating && (
					<p>
						<strong>EPC Rating:</strong>
						<br /> {epcRating}
					</p>
				)}
				<p>
					<strong>Amenities:</strong>
					<br />{" "}
					{amenities && amenities.length > 0
						? amenities.join(", ")
						: "None"}
				</p>
			</Section>
			<Section title="Media">
				<p>
					<strong>Photos</strong>
					<br /> {photos.length} photos included
				</p>
				{videoLink && (
					<p>
						<strong>Video Link</strong>
						<br /> {videoLink}
					</p>
				)}
				{floorPlan && (
					<p>
						<strong>Floor Plan</strong>
						<br /> Included
					</p>
				)}
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
