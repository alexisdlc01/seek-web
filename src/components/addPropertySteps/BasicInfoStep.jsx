import React from "react";
import { StepperPanel } from "primereact/stepperpanel";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { Checkbox } from "primereact/checkbox";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "primereact/button";

const BasicInfoStep = ({
	title,
	setTitle,
	sizeSqM,
	setSizeSqM,
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
	amenities,
	onAmenityChange,
	amenitiesList,
	next
}) => {
	return (
		<>
			<div className="space-y-4">
				<div className="flex flex-col"></div>
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
						<label
							htmlFor="bathrooms"
							className="font-medium mb-2"
						>
							Bathrooms
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
				<div className="flex flex-col">
					<label
						htmlFor="description"
						className="font-medium mb-2"
					>
						Description
					</label>
					<InputTextarea
						id="description"
						value={description}
						onChange={e => setDescription(e.target.value)}
						rows={5}
						autoResize
					/>
				</div>
				<div>
					<label className="font-medium">Amenities</label>
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-2">
						{amenitiesList.map(name => (
							<div
								key={name}
								className="flex items-center"
							>
								<Checkbox
									inputId={name}
									value={name}
									onChange={onAmenityChange}
									checked={amenities.includes(name)}
								/>
								<label htmlFor={name} className="ml-2">
									{name}
								</label>
							</div>
						))}
					</div>
				</div>
			</div>
			<div className="flex pt-4 justify-end">
				<Button
					label="Next"
					icon="pi pi-arrow-right"
					iconPos="right"
					onClick={next}
				/>
			</div>
		</>
	);
};

export default BasicInfoStep;
