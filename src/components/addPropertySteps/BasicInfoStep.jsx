import React, { useMemo, useState } from "react";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { Checkbox } from "primereact/checkbox";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "primereact/button";
import "primeicons/primeicons.css";

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
	// --- custom amenities state ---
	const [customAmenities, setCustomAmenities] = useState([]);
	const [customInput, setCustomInput] = useState("");
	const [editing, setEditing] = useState(null);
	const [editValue, setEditValue] = useState("");

	const allAmenities = useMemo(
		() => [...amenitiesList, ...customAmenities],
		[amenitiesList, customAmenities]
	);

	const normalize = s => s.trim().replace(/\s+/g, " ");

	const addCustomAmenity = () => {
		const val = normalize(customInput);
		if (!val) return;
		const exists = allAmenities.some(
			a => a.toLowerCase() === val.toLowerCase()
		);
		if (exists) {
			setCustomInput("");
			// if it already exists but not checked, check it
			if (!amenities.includes(val)) {
				onAmenityChange({ value: val, checked: true });
			}
			return;
		}
		setCustomAmenities(prev => [...prev, val]);
		// auto-check newly added amenity
		onAmenityChange({ value: val, checked: true });
		setCustomInput("");
	};

	const removeCustomAmenity = name => {
		setCustomAmenities(prev => prev.filter(a => a !== name));
		if (amenities.includes(name)) {
			onAmenityChange({ value: name, checked: false });
		}
		if (editing === name) {
			setEditing(null);
			setEditValue("");
		}
	};

	const startEdit = name => {
		setEditing(name);
		setEditValue(name);
	};

	const saveEdit = () => {
		const oldName = editing;
		const newName = normalize(editValue);
		if (!oldName) return;

		// empty -> cancel
		if (!newName) {
			setEditing(null);
			setEditValue("");
			return;
		}
		// no-change
		if (newName === oldName) {
			setEditing(null);
			setEditValue("");
			return;
		}
		// prevent duplicates
		const exists = allAmenities
			.filter(a => a !== oldName)
			.some(a => a.toLowerCase() === newName.toLowerCase());
		if (exists) {
			setEditing(null);
			setEditValue("");
			return;
		}

		// update list
		setCustomAmenities(prev =>
			prev.map(a => (a === oldName ? newName : a))
		);

		// keep selection: uncheck old, check new (if old was selected)
		if (amenities.includes(oldName)) {
			onAmenityChange({ value: oldName, checked: false });
			onAmenityChange({ value: newName, checked: true });
		}

		setEditing(null);
		setEditValue("");
	};

	const handleEditKey = e => {
		if (e.key === "Enter") saveEdit();
		if (e.key === "Escape") {
			setEditing(null);
			setEditValue("");
		}
	};

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

				{/* amenities */}
				<div>
					<label className="font-medium">Amenities</label>

					{/* add custom amenity */}
					<div className="mt-3 flex gap-2">
						<InputText
							value={customInput}
							onChange={e => setCustomInput(e.target.value)}
							onKeyDown={e =>
								e.key === "Enter" && addCustomAmenity()
							}
							placeholder="Type a custom amenity"
							className="flex-1"
						/>
						<Button
							label="Add"
							icon="pi pi-plus"
							onClick={addCustomAmenity}
						/>
					</div>

					{/* list */}
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-3">
						{allAmenities.map(name => {
							const isCustom = customAmenities.includes(name);
							const isEditing = editing === name;

							return (
								<div key={name} className="flex items-center">
									<Checkbox
										inputId={name}
										value={name}
										onChange={onAmenityChange}
										checked={amenities.includes(name)}
									/>
									<label
										htmlFor={name}
										className="ml-2 mr-2 flex-1"
									>
										{isEditing ? (
											<InputText
												value={editValue}
												onChange={e =>
													setEditValue(e.target.value)
												}
												onBlur={saveEdit}
												onKeyDown={handleEditKey}
												autoFocus
												className="w-full"
											/>
										) : (
											name
										)}
									</label>

									{/* edit/remove only for customs */}
									{isCustom && !isEditing && (
										<div className="flex items-center gap-2">
											<Button
												icon="pi pi-pencil"
												rounded
												text
												severity="secondary"
												onClick={() => startEdit(name)}
												aria-label="Edit amenity"
											/>
											<Button
												icon="pi pi-trash"
												rounded
												text
												severity="danger"
												onClick={() =>
													removeCustomAmenity(name)
												}
												aria-label="Remove amenity"
											/>
										</div>
									)}
								</div>
							);
						})}
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
