import React, { useEffect, useState } from "react";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { SelectButton } from "primereact/selectbutton";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "primereact/button";
import "primeicons/primeicons.css";
import { Calendar } from "primereact/calendar";
import axios from "axios";
import { Tooltip } from "primereact/tooltip";

const BASE_URL = import.meta.env.VITE_BASE_URL;

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
	registerOfTitle,
	setRegisterOfTitle,
	registerOfTitleRef,
	registerOfTitleKeyFromBackend,
	setRegisterOfTitleKeyFromBackend,
	numOfPeople,
	setNumOfPeople,
	registrationNumber,
	setRegistrationNumber,
	next
}) => {
	const [registerInputMode, setRegisterInputMode] = useState("number");
	// "number" | "document"

	useEffect(() => {
		window.scrollTo({ top: 0, behavior: "smooth" });
	}, []);

	useEffect(() => {
		if (registerInputMode === "number") {
			// Clear document-related state
			setRegisterOfTitle(null);
			setRegisterOfTitleKeyFromBackend(null);
		} else {
			// Clear registration number
			setRegistrationNumber("");
		}
	}, [registerInputMode]);

	const registerInputOptions = [
		{
			label: "Registration Number",
			value: "number",
			icon: "pi pi-hashtag"
		},
		{
			label: "Upload Document",
			value: "document",
			icon: "pi pi-file-pdf"
		}
	];

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
					className={`grid grid-cols-1 ${
						propertyType === "Other (please specify)"
							? "md:grid-cols-2"
							: ""
					} gap-4`}
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
				<div className="flex flex-col">
					<label htmlFor="street" className="font-medium mb-2">
						Number of people
					</label>
					<InputText
						id="street"
						value={numOfPeople}
						type={"number"}
						onChange={e => setNumOfPeople(e.target.value)}
					/>
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
							data-pr-tooltip="Half bathrooms (0.5) mean toilets without a shower or bath."
							data-pr-position="bottom"
						/>
						<Tooltip target="#bathrooms" />
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
							onChange={e => {
								console.log("new data", e.value);
								setAvailabilityDate(e.value);
							}}
							showIcon
						/>
					</div>
					<div className="flex flex-col">
						<label
							htmlFor="availabilityDate"
							className="font-medium mb-2"
						>
							Available Until (Optional)
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

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
				<div className="flex flex-col gap-2 mb-4">
					<label className="font-medium">
						Proof of Ownership (Only select one)
					</label>

					<SelectButton
						pt={{ button: { style: { marginRight: "10px" } } }}
						value={registerInputMode}
						options={registerInputOptions}
						onChange={e => {
							if (e.value === null) return;
							setRegisterInputMode(e.value);
						}}
						optionLabel="label"
						optionValue="value"
						optionDisabled={false}
						className="bg-[#141432] rounded-lg w-fit"
					/>
				</div>

				{registerInputMode === "number" && (
					<div className="flex flex-col">
						<label
							htmlFor="registrationNumber"
							className="font-medium mb-2"
						>
							Registration Number
						</label>
						<InputText
							id="registrationNumber"
							value={registrationNumber}
							onChange={e =>
								setRegistrationNumber(e.target.value)
							}
							placeholder="e.g. AB123456"
							disabled={registerInputMode !== "number"}
						/>
					</div>
				)}

				{/* Register of Title */}
				{registerInputMode === "document" && (
					<div className="flex flex-col">
						<label className="font-medium mb-2">
							Register of Title (PDF only)
						</label>

						<Button
							type="button"
							label={
								registerOfTitle
									? registerOfTitle.name
									: "Choose File"
							}
							icon="pi pi-upload"
							outlined
							onClick={() => registerOfTitleRef.current?.click()}
							className="w-max"
						/>

						<input
							type="file"
							ref={registerOfTitleRef}
							accept=".pdf"
							className="hidden"
							disabled={registerInputMode !== "document"}
							onChange={async e => {
								const file = e.target.files[0];
								if (file && file.type !== "application/pdf") {
									alert("Please upload a PDF file");
									return;
								}

								const res = await axios.get(
									`${BASE_URL}/upload/presign`,
									{
										params: {
											filename: file.name,
											fileType: file.type,
											folder: "private"
										},
										withCredentials: true
									}
								);

								const { uploadUrl, key } = res.data;

								await axios.put(uploadUrl, file, {
									headers: { "Content-Type": file.type }
								});

								setRegisterOfTitleKeyFromBackend(key);
								setRegisterOfTitle(file);
							}}
						/>

						{registerOfTitle && (
							<div className="mt-2 text-sm text-[#1ba4ae] flex items-center">
								<span
									className="cursor-pointer underline"
									onClick={async () => {
										const res = await axios.get(
											`${BASE_URL}/upload/access`,
											{
												params: {
													key: registerOfTitleKeyFromBackend
												},
												withCredentials: true
											}
										);
										window.open(res.data, "_blank");
									}}
								>
									{registerOfTitle.name}
								</span>

								<Button
									icon="pi pi-times"
									text
									rounded
									size="small"
									className="ml-2"
									onClick={() => setRegisterOfTitle(null)}
								/>
							</div>
						)}
					</div>
				)}
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
