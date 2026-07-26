import React, { useEffect, useMemo, useState } from "react";
import { StepperPanel } from "primereact/stepperpanel";
import { RadioButton } from "primereact/radiobutton";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Checkbox } from "primereact/checkbox";

const FeaturesStep = ({
	furnishingStatus,
	setFurnishingStatus,
	furnishingOptions,
	epcRating,
	setEpcRating,
	epcOptions,
	amenities,
	onAmenityChange,
	amenitiesList,
	back,
	next
}) => {
	// --- custom amenities state ---
	const [customAmenities, setCustomAmenities] = useState([]);
	const [customInput, setCustomInput] = useState("");
	const [editing, setEditing] = useState(null);
	const [editValue, setEditValue] = useState("");

	useEffect(() => {
		window.scrollTo({ top: 0, behavior: "smooth" });
	}, []);

	useEffect(() => {
		console.log("new amenities", amenities);
	}, [amenities]);

	const allAmenities = useMemo(() => {
		return [
			...new Set([...amenitiesList, ...customAmenities, ...amenities])
		];
	}, [amenitiesList, customAmenities, amenities]);

	const normalize = s => s.trim().replace(/\s+/g, " ");

	const addCustomAmenity = () => {
		const val = normalize(customInput);
		if (!val) return;
		setCustomAmenities(prev => [...prev, val]);
		setCustomInput("");
	};

	const removeCustomAmenity = name => {
		setCustomAmenities(prev => prev.filter(a => a !== name));
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
		<div className="listing-flow-surface"
			style={{
				background: "#0f0f23",
				color: "white"
			}}
		>
			<div className="space-y-6">
				<div>
					<label className="font-medium mb-4 block">
						Furnishing Status
					</label>
					<div className="flex flex-col gap-3">
						{furnishingOptions.map(option => (
							<div
								key={option.value}
								className="flex items-center"
							>
								<RadioButton
									inputId={option.value}
									name="furnishing"
									value={option.value}
									onChange={e => setFurnishingStatus(e.value)}
									checked={furnishingStatus === option.value}
								/>
								<label htmlFor={option.value} className="ml-2">
									{option.label}
								</label>
							</div>
						))}
					</div>
				</div>
				<div className="flex flex-col w-full md:w-1/2">
					<label htmlFor="epcRating" className="font-medium mb-2">
						EPC Rating
					</label>
					<Dropdown
						id="epcRating"
						value={epcRating}
						options={epcOptions}
						onChange={e => setEpcRating(e.value)}
						placeholder="Select rating"
						className="listing-flow-dropdown"
						panelClassName="listing-flow-panel"
					/>
				</div>
			</div>

			{/* amenities */}
			<div className="mt-3">
				<label className="font-medium">Amenities</label>

				{/* add custom amenity */}
				<div className="mt-3 flex gap-2">
					<InputText
						value={customInput}
						onChange={e => setCustomInput(e.target.value)}
						onKeyDown={e => e.key === "Enter" && addCustomAmenity()}
						placeholder="Type a custom amenity"
						className="flex-1"
					/>
					<Button
						label="Add"
						icon="pi pi-plus"
						className="listing-flow-action-button px-4 py-2.5"
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
									onChange={e =>
										onAmenityChange({
											value: name,
											checked: e.checked
										})
									}
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
			<div className="flex pt-8 justify-between">
				<Button
					label="Back"
					severity="secondary"
					icon="pi pi-arrow-left"
					className="listing-flow-action-button listing-flow-action-button--secondary px-4 py-2.5"
					onClick={back}
				/>
				<Button
					label="Next"
					icon="pi pi-arrow-right"
					iconPos="right"
					className="listing-flow-action-button px-4 py-2.5"
					onClick={next}
				/>
			</div>
		</div>
	);
};

export default FeaturesStep;
