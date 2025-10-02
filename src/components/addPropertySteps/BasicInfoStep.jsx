import React, { useEffect, useMemo, useState } from "react";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { Checkbox } from "primereact/checkbox";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "primereact/button";
import "primeicons/primeicons.css";
import { Calendar } from "primereact/calendar";

// street={street}
// setStreet={setStreet}
// city={city}
// setCity={setCity}
// postcode={postcode}
// setPostcode={setPostcode}
// country={country}
// setCountry={setCountry}

const BasicInfoStep = ({
	title,
	setTitle,
	sizeSqM,
	setSizeSqM,
	street,
	setStreet,
	city,
	setCity,
	postcode,
	setPostcode,
	country,
	setCountry,
	propertyType,
	setPropertyType,
	propertyTypes,
	otherType,
	setOtherType,
	regularBedrooms,
	setRegularBedrooms,
	ensuiteBedrooms,
	setEnsuiteBedrooms,
	bedroomOptions,
	bathrooms,
	setBathrooms,
	bathroomOptions,
	description,
	setDescription,
	rent,
	setRent,
	deposit,
	setDeposit,
	availabilityDate,
	endAvailabilityDate,
	setEndAvailabilityDate,
	setAvailabilityDate,
	next
}) => {
	useEffect(() => {
		window.scrollTo({ top: 0, behavior: "smooth" });
	}, []);

	return (
		<div style={{ background: "#0f0f23", color: "white" }}>
			<div className="space-y-4">
				<div className="flex flex-col"></div>

				{/* title + size */}
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div className="flex flex-col">
						<label htmlFor="title" className="font-medium mb-2">
							Property Title
						</label>
						<InputText
							id="title"
							value={title}
							onChange={e => setTitle(e.target.value)}
						/>
					</div>
					<div className="flex flex-col">
						<label htmlFor="sizeSqM" className="font-medium mb-2">
							Size (square meters)
						</label>
						<InputNumber
							id="sizeSqM"
							value={sizeSqM}
							onValueChange={e => setSizeSqM(e.value)}
						/>
					</div>
				</div>

				{/* property type */}
				<div
					className={`grid grid-cols-1 ${propertyType === "Other (please specify)" ? "md:grid-cols-2" : ""} gap-4`}
				>
					<div className="flex flex-col">
						<label
							htmlFor="propertyType"
							className="font-medium mb-2"
						>
							Property Type
						</label>
						<Dropdown
							id="propertyType"
							value={propertyType}
							options={propertyTypes}
							onChange={e => setPropertyType(e.value)}
							placeholder="Select a Type"
						/>
					</div>
					{propertyType === "Other (please specify)" && (
						<div className="flex flex-col">
							<label
								htmlFor="otherType"
								className="font-medium mb-2"
							>
								Please Specify Type
							</label>
							<InputText
								id="otherType"
								value={otherType}
								onChange={e => setOtherType(e.target.value)}
							/>
						</div>
					)}
				</div>

				{/* Location stuff */}
				<div className="flex flex-col">
					<label htmlFor="street" className="font-medium mb-2">
						Street Address
					</label>
					<InputText
						id="street"
						value={street}
						onChange={e => setStreet(e.target.value)}
					/>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div className="flex flex-col">
						<label htmlFor="city" className="font-medium mb-2">
							City / Town
						</label>
						<InputText
							id="city"
							value={city}
							onChange={e => setCity(e.target.value)}
						/>
					</div>
					<div className="flex flex-col">
						<label htmlFor="postcode" className="font-medium mb-2">
							Postcode / ZIP
						</label>
						<InputText
							id="postcode"
							value={postcode}
							onChange={e => setPostcode(e.target.value)}
						/>
					</div>
					<div className="flex flex-col">
						<label htmlFor="country" className="font-medium mb-2">
							Country
						</label>
						<InputText
							id="country"
							value={country}
							onChange={e => setCountry(e.target.value)}
						/>
					</div>
				</div>

				{/* beds/baths */}
				<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
					<div className="flex flex-col">
						<label
							htmlFor="regularBedrooms"
							className="font-medium mb-2"
						>
							Bedrooms
						</label>
						<Dropdown
							id="regularBedrooms"
							value={regularBedrooms}
							options={bedroomOptions}
							onChange={e => setRegularBedrooms(e.value)}
							placeholder="Select"
						/>
					</div>
					<div className="flex flex-col">
						<label
							htmlFor="ensuiteBedrooms"
							className="font-medium mb-2"
						>
							En-suite Bedrooms
						</label>
						<Dropdown
							id="ensuiteBedrooms"
							value={ensuiteBedrooms}
							options={bedroomOptions}
							onChange={e => setEnsuiteBedrooms(e.value)}
							placeholder="Select"
						/>
					</div>
					<div className="flex flex-col">
						<label htmlFor="bathrooms" className="font-medium mb-2">
							Bathrooms (Not including en-suites)
						</label>
						<Dropdown
							id="bathrooms"
							value={bathrooms}
							options={bathroomOptions}
							onChange={e => setBathrooms(e.value)}
							placeholder="Select"
						/>
					</div>
				</div>

				{/* description */}
				<div className="flex flex-col">
					<label htmlFor="description" className="font-medium mb-2">
						Description of Property
					</label>
					<InputTextarea
						id="description"
						value={description}
						onChange={e => setDescription(e.target.value)}
						rows={5}
						autoResize
					/>
				</div>
			</div>

			<div className="space-y-4 mt-3">
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div className="flex flex-col">
						<label htmlFor="rent" className="font-medium mb-2">
							Monthly Rent (£)
						</label>
						<InputNumber
							id="rent"
							value={rent}
							onValueChange={e => setRent(e.value)}
							mode="currency"
							currency="GBP"
							locale="en-GB"
						/>
					</div>
					<div className="flex flex-col">
						<label htmlFor="deposit" className="font-medium mb-2">
							Security Deposit (£)
						</label>
						<InputNumber
							id="deposit"
							value={deposit}
							onValueChange={e => setDeposit(e.value)}
							mode="currency"
							currency="GBP"
							locale="en-GB"
						/>
					</div>
				</div>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div className="flex flex-col">
						<label
							htmlFor="availabilityDate"
							className="font-medium mb-2"
						>
							Available From
						</label>
						<Calendar
							id="availabilityDate"
							value={availabilityDate}
							onChange={e => setAvailabilityDate(e.value)}
							showIcon
						/>
					</div>
					<div className="flex flex-col">
						<label
							htmlFor="availabilityDate"
							className="font-medium mb-2"
						>
							Available Untill
						</label>
						<Calendar
							id="availabilityDate"
							value={endAvailabilityDate}
							onChange={e => setEndAvailabilityDate(e.value)}
							showIcon
						/>
					</div>
				</div>
			</div>

			<div className="flex pt-8 justify-end">
				<Button
					label="Next"
					icon="pi pi-arrow-right"
					iconPos="right"
					onClick={next}
				/>
			</div>
		</div>
	);
};

export default BasicInfoStep;
