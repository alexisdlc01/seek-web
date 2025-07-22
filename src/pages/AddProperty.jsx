import React, { useState, useRef, useEffect } from "react";
import { Stepper } from "primereact/stepper";
import { StepperPanel } from "primereact/stepperpanel";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { RadioButton } from "primereact/radiobutton";
import { Checkbox } from "primereact/checkbox";
import { Calendar } from "primereact/calendar";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { classNames } from "primereact/utils";

const AddProperty = () => {
	const toast = useRef(null);
	const stepperRef = useRef(null);
	const fileInputRef = useRef(null);
	const floorPlanInputRef = useRef(null);
	const [step, setStep] = useState(0);

	// Step 1 state
	const [title, setTitle] = useState("");
	const [sizeSqFt, setSizeSqFt] = useState(null);
	const [sizeSqM, setSizeSqM] = useState(null);
	const propertyTypes = [
		"Flat/Apartment",
		"House",
		"Room in Shared House",
		"Studio",
		"Other (please specify)"
	];
	const [propertyType, setPropertyType] = useState(null);
	const [otherType, setOtherType] = useState("");
	const bedroomOptions = [...Array(10).keys()].map(i => ({
		label: i.toString(),
		value: i
	}));
	const [regularBedrooms, setRegularBedrooms] = useState(null);
	const [ensuiteBedrooms, setEnsuiteBedrooms] = useState(null);
	const bathroomOptions = [
		{ label: "1", value: 1 },
		{ label: "1.5", value: 1.5 },
		{ label: "2", value: 2 },
		{ label: "2.5", value: 2.5 }
	];
	const [bathrooms, setBathrooms] = useState(null);
	const [description, setDescription] = useState("");
	const amenitiesList = [
		"Wi-Fi",
		"Washing Machine",
		"Dryer",
		"Dishwasher",
		"Pets Allowed",
		"Bike Storage",
		"Parking",
		"Garden",
		"Smoke Alarm",
		"Fireplace",
		"Monoxide Alarm"
	];
	const [amenities, setAmenities] = useState([]);

	// Step 2 state
	const [street, setStreet] = useState("");
	const [city, setCity] = useState("");
	const [postcode, setPostcode] = useState("");
	const [country, setCountry] = useState("");
	const [rent, setRent] = useState(null);
	const [deposit, setDeposit] = useState(null);
	const [availabilityDate, setAvailabilityDate] = useState(null);
	const leaseOptions = [
		{ label: "12 Months", value: "12 Months" },
		{ label: "Academic Year (Approx 9-10 Months)", value: "Academic Year" },
		{ label: "Trimester", value: "Trimester" },
		{ label: "Quarter", value: "Quarter" },
		{ label: "Flexible", value: "Flexible" }
	];
	const [leaseDuration, setLeaseDuration] = useState(null);

	// Step 3 state
	const furnishingOptions = [
		{
			label: "Furnished (incl. beds, sofas, wardrobes, kitchen appliances)",
			value: "Furnished"
		},
		{ label: "Unfurnished", value: "Unfurnished" },
		{
			label: "Part-Furnished (some major appliances provided)",
			value: "Part-Furnished"
		}
	];
	const [furnishingStatus, setFurnishingStatus] = useState(null);
	const epcOptions = ["A", "B", "C", "D", "E", "F", "G"].map(r => ({
		label: r,
		value: r
	}));
	const [epcRating, setEpcRating] = useState(null);

	// Step 4 state
	const [photos, setPhotos] = useState([]);
	const [dragOverIndex, setDragOverIndex] = useState(null);
	const [videoLink, setVideoLink] = useState("");
	const [floorPlan, setFloorPlan] = useState(null);

	// Errors
	const [errors, setErrors] = useState({});

	useEffect(() => {
		if (propertyType === "Studio") {
			setRegularBedrooms(0);
			setEnsuiteBedrooms(1);
		}
	}, [propertyType]);

	const validateStep = () => {
		return true;
	};

	// const validateStep = () => {
	// 	let _errors = {};
	// 	switch (step) {
	// 		case 0:
	// 			if (!title.trim()) _errors.title = "Title is required.";
	// 			if (!sizeSqFt) _errors.sizeSqFt = "Required.";
	// 			if (!sizeSqM) _errors.sizeSqM = "Required.";
	// 			if (!propertyType) _errors.propertyType = "Select a type.";
	// 			if (
	// 				propertyType === "Other (please specify)" &&
	// 				!otherType.trim()
	// 			)
	// 				_errors.otherType = "Please specify.";
	// 			if (regularBedrooms === null)
	// 				_errors.regularBedrooms = "Required.";
	// 			if (ensuiteBedrooms === null)
	// 				_errors.ensuiteBedrooms = "Required.";
	// 			if (!bathrooms) _errors.bathrooms = "Required.";
	// 			if (!description.trim())
	// 				_errors.description = "Description is required.";
	// 			break;
	// 		case 1:
	// 			if (!street.trim()) _errors.street = "Required.";
	// 			if (!city.trim()) _errors.city = "Required.";
	// 			if (!postcode.trim()) _errors.postcode = "Required.";
	// 			if (!country.trim()) _errors.country = "Required.";
	// 			if (rent === null) _errors.rent = "Required.";
	// 			if (deposit === null) _errors.deposit = "Required.";
	// 			if (!availabilityDate) _errors.availabilityDate = "Required.";
	// 			if (!leaseDuration) _errors.leaseDuration = "Required.";
	// 			break;
	// 		case 2:
	// 			if (!furnishingStatus) _errors.furnishingStatus = "Required.";
	// 			break;
	// 		case 3:
	// 			if (photos.length < 3)
	// 				_errors.photos = "Upload at least 3 photos.";
	// 			break;
	// 		default:
	// 			break;
	// 	}
	// 	setErrors(_errors);
	// 	return Object.keys(_errors).length === 0;
	// };

	const next = () => {
		if (validateStep()) {
			stepperRef.current.nextCallback();
		} else {
			toast.current.show({
				severity: "error",
				summary: "Validation Error",
				detail: "Please fill in all required fields."
			});
		}
	};

	const back = () => {
		stepperRef.current.prevCallback();
	};

	const onAmenityChange = e => {
		let _amenities = [...amenities];
		if (e.checked) _amenities.push(e.value);
		else _amenities = _amenities.filter(a => a !== e.value);
		setAmenities(_amenities);
	};

	const onPhotoSelect = e => {
		let selected = Array.from(e.target.files || []);
		const invalid = selected.filter(f => !f.type.startsWith("image/"));
		if (invalid.length) {
			toast.current.show({
				severity: "warn",
				summary: "Unsupported Format",
				detail: "Only image files allowed."
			});
		}
		selected = selected.filter(f => f.type.startsWith("image/"));
		let combined = [
			...photos,
			...selected.map(file => ({
				file,
				id: Date.now() + Math.random(),
				url: URL.createObjectURL(file)
			}))
		];
		if (combined.length > 15) {
			toast.current.show({
				severity: "error",
				summary: "Too Many Photos",
				detail: "Max 15 images allowed."
			});
			combined = combined.slice(0, 15);
		}
		setPhotos(combined);
		if (fileInputRef.current) fileInputRef.current.value = null;
	};

	const onDragStart = (e, index) => {
		e.dataTransfer.effectAllowed = "move";
		setDragOverIndex(index);
	};

	const onDrop = (e, index) => {
		e.preventDefault();
		if (dragOverIndex === null) return;
		const dragged = photos[dragOverIndex];
		const copy = [...photos];
		copy.splice(dragOverIndex, 1);
		copy.splice(index, 0, dragged);
		setPhotos(copy);
		setDragOverIndex(null);
	};

	const removePhoto = id => setPhotos(photos.filter(p => p.id !== id));

	const publish = () => {
		if (validateStep()) {
			toast.current.show({
				severity: "success",
				summary: "Published!",
				detail: "Your property listing is now live."
			});
			// Here you would typically submit all the collected data
			console.log("Submitting all data...");
		}
	};

	return (
		<div className="min-h-screen bg-white p-6">
			<Toast ref={toast} />
			<Stepper
				ref={stepperRef}
				activeIndex={step}
				onStepChange={e => setStep(e.index)}
				linear
			>
				{/* Step 1: Basic Info */}
				<StepperPanel header="Basic Info">
					<div className="space-y-4">
						<div className="flex flex-col">
							<label htmlFor="title" className="font-medium mb-2">
								Property Title *
							</label>
							<InputText
								id="title"
								value={title}
								onChange={e => setTitle(e.target.value)}
								className={classNames({
									"p-invalid": errors.title
								})}
							/>
							{errors.title && (
								<small className="p-error">
									{errors.title}
								</small>
							)}
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div className="flex flex-col">
								<label
									htmlFor="sizeSqFt"
									className="font-medium mb-2"
								>
									Size (sq ft) *
								</label>
								<InputNumber
									id="sizeSqFt"
									value={sizeSqFt}
									onValueChange={e => setSizeSqFt(e.value)}
									className={classNames({
										"p-invalid": errors.sizeSqFt
									})}
								/>
								{errors.sizeSqFt && (
									<small className="p-error">
										{errors.sizeSqFt}
									</small>
								)}
							</div>
							<div className="flex flex-col">
								<label
									htmlFor="sizeSqM"
									className="font-medium mb-2"
								>
									Size (sq m) *
								</label>
								<InputNumber
									id="sizeSqM"
									value={sizeSqM}
									onValueChange={e => setSizeSqM(e.value)}
									className={classNames({
										"p-invalid": errors.sizeSqM
									})}
								/>
								{errors.sizeSqM && (
									<small className="p-error">
										{errors.sizeSqM}
									</small>
								)}
							</div>
						</div>
						<div className="flex flex-col">
							<label
								htmlFor="propertyType"
								className="font-medium mb-2"
							>
								Property Type *
							</label>
							<Dropdown
								id="propertyType"
								value={propertyType}
								options={propertyTypes}
								onChange={e => setPropertyType(e.value)}
								placeholder="Select a Type"
								className={classNames({
									"p-invalid": errors.propertyType
								})}
							/>
							{errors.propertyType && (
								<small className="p-error">
									{errors.propertyType}
								</small>
							)}
						</div>
						{propertyType === "Other (please specify)" && (
							<div className="flex flex-col">
								<label
									htmlFor="otherType"
									className="font-medium mb-2"
								>
									Please Specify Type *
								</label>
								<InputText
									id="otherType"
									value={otherType}
									onChange={e => setOtherType(e.target.value)}
									className={classNames({
										"p-invalid": errors.otherType
									})}
								/>
								{errors.otherType && (
									<small className="p-error">
										{errors.otherType}
									</small>
								)}
							</div>
						)}
						<div className="grid grid-cols-3 gap-4">
							<div className="flex flex-col">
								<label
									htmlFor="regularBedrooms"
									className="font-medium mb-2"
								>
									Bedrooms *
								</label>
								<Dropdown
									id="regularBedrooms"
									value={regularBedrooms}
									options={bedroomOptions}
									onChange={e => setRegularBedrooms(e.value)}
									placeholder="Select"
									className={classNames({
										"p-invalid": errors.regularBedrooms
									})}
								/>
							</div>
							<div className="flex flex-col">
								<label
									htmlFor="ensuiteBedrooms"
									className="font-medium mb-2"
								>
									En-suite Bedrooms *
								</label>
								<Dropdown
									id="ensuiteBedrooms"
									value={ensuiteBedrooms}
									options={bedroomOptions}
									onChange={e => setEnsuiteBedrooms(e.value)}
									placeholder="Select"
									className={classNames({
										"p-invalid": errors.ensuiteBedrooms
									})}
								/>
							</div>
							<div className="flex flex-col">
								<label
									htmlFor="bathrooms"
									className="font-medium mb-2"
								>
									Bathrooms *
								</label>
								<Dropdown
									id="bathrooms"
									value={bathrooms}
									options={bathroomOptions}
									onChange={e => setBathrooms(e.value)}
									placeholder="Select"
									className={classNames({
										"p-invalid": errors.bathrooms
									})}
								/>
							</div>
						</div>
						<div className="flex flex-col">
							<label
								htmlFor="description"
								className="font-medium mb-2"
							>
								Description *
							</label>
							<InputTextarea
								id="description"
								value={description}
								onChange={e => setDescription(e.target.value)}
								rows={5}
								autoResize
								className={classNames({
									"p-invalid": errors.description
								})}
							/>
							{errors.description && (
								<small className="p-error">
									{errors.description}
								</small>
							)}
						</div>
						<div>
							<label className="font-medium">Amenities</label>
							<div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
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
				</StepperPanel>

				{/* Step 2: Location & Availability */}
				<StepperPanel header="Location & Availability">
					<div className="space-y-4">
						<div className="flex flex-col">
							<label
								htmlFor="street"
								className="font-medium mb-2"
							>
								Street Address *
							</label>
							<InputText
								id="street"
								value={street}
								onChange={e => setStreet(e.target.value)}
								className={classNames({
									"p-invalid": errors.street
								})}
							/>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div className="flex flex-col">
								<label
									htmlFor="city"
									className="font-medium mb-2"
								>
									City / Town *
								</label>
								<InputText
									id="city"
									value={city}
									onChange={e => setCity(e.target.value)}
									className={classNames({
										"p-invalid": errors.city
									})}
								/>
							</div>
							<div className="flex flex-col">
								<label
									htmlFor="postcode"
									className="font-medium mb-2"
								>
									Postcode / ZIP *
								</label>
								<InputText
									id="postcode"
									value={postcode}
									onChange={e => setPostcode(e.target.value)}
									className={classNames({
										"p-invalid": errors.postcode
									})}
								/>
							</div>
							<div className="flex flex-col">
								<label
									htmlFor="country"
									className="font-medium mb-2"
								>
									Country *
								</label>
								<InputText
									id="country"
									value={country}
									onChange={e => setCountry(e.target.value)}
									className={classNames({
										"p-invalid": errors.country
									})}
								/>
							</div>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div className="flex flex-col">
								<label
									htmlFor="rent"
									className="font-medium mb-2"
								>
									Monthly Rent (£) *
								</label>
								<InputNumber
									id="rent"
									value={rent}
									onValueChange={e => setRent(e.value)}
									mode="currency"
									currency="GBP"
									locale="en-GB"
									className={classNames({
										"p-invalid": errors.rent
									})}
								/>
							</div>
							<div className="flex flex-col">
								<label
									htmlFor="deposit"
									className="font-medium mb-2"
								>
									Security Deposit (£) *
								</label>
								<InputNumber
									id="deposit"
									value={deposit}
									onValueChange={e => setDeposit(e.value)}
									mode="currency"
									currency="GBP"
									locale="en-GB"
									className={classNames({
										"p-invalid": errors.deposit
									})}
								/>
							</div>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div className="flex flex-col">
								<label
									htmlFor="availabilityDate"
									className="font-medium mb-2"
								>
									Available From *
								</label>
								<Calendar
									id="availabilityDate"
									value={availabilityDate}
									onChange={e => setAvailabilityDate(e.value)}
									showIcon
									className={classNames({
										"p-invalid": errors.availabilityDate
									})}
								/>
							</div>
							<div className="flex flex-col">
								<label
									htmlFor="leaseDuration"
									className="font-medium mb-2"
								>
									Lease Duration *
								</label>
								<Dropdown
									id="leaseDuration"
									value={leaseDuration}
									options={leaseOptions}
									onChange={e => setLeaseDuration(e.value)}
									placeholder="Select a duration"
									className={classNames({
										"p-invalid": errors.leaseDuration
									})}
								/>
							</div>
						</div>
					</div>
					<div className="flex pt-4 justify-between">
						<Button
							label="Back"
							severity="secondary"
							icon="pi pi-arrow-left"
							onClick={back}
						/>
						<Button
							label="Next"
							icon="pi pi-arrow-right"
							iconPos="right"
							onClick={next}
						/>
					</div>
				</StepperPanel>

				{/* Step 3: Features */}
				<StepperPanel header="Features">
					<div className="space-y-6">
						<div>
							<label className="font-medium mb-4 block">
								Furnishing Status *
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
											onChange={e =>
												setFurnishingStatus(e.value)
											}
											checked={
												furnishingStatus ===
												option.value
											}
											className={classNames({
												"p-invalid":
													errors.furnishingStatus
											})}
										/>
										<label
											htmlFor={option.value}
											className="ml-2"
										>
											{option.label}
										</label>
									</div>
								))}
							</div>
						</div>
						<div className="flex flex-col w-full md:w-1/2">
							<label
								htmlFor="epcRating"
								className="font-medium mb-2"
							>
								EPC Rating (optional)
							</label>
							<Dropdown
								id="epcRating"
								value={epcRating}
								options={epcOptions}
								onChange={e => setEpcRating(e.value)}
								placeholder="Select rating"
							/>
						</div>
					</div>
					<div className="flex pt-4 justify-between">
						<Button
							label="Back"
							severity="secondary"
							icon="pi pi-arrow-left"
							onClick={back}
						/>
						<Button
							label="Next"
							icon="pi pi-arrow-right"
							iconPos="right"
							onClick={next}
						/>
					</div>
				</StepperPanel>

				{/* Step 4: Photos & Media */}
				<StepperPanel header="Photos & Media">
					<div className="space-y-6">
						<div>
							<label className="font-medium">Photos *</label>
							<div
								className={classNames(
									"border-2 border-dashed p-8 rounded text-center cursor-pointer mt-2",
									{ "p-invalid": errors.photos }
								)}
								onClick={() => fileInputRef.current?.click()}
								onDrop={e => {
									e.preventDefault();
									onPhotoSelect({
										target: { files: e.dataTransfer.files }
									});
								}}
								onDragOver={e => e.preventDefault()}
							>
								Drag & drop or click to browse files
								<input
									type="file"
									accept="image/*"
									multiple
									ref={fileInputRef}
									className="hidden"
									onChange={onPhotoSelect}
								/>
							</div>
							{errors.photos && (
								<small className="p-error">
									{errors.photos}
								</small>
							)}
							<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
								{photos.map((p, idx) => (
									<div
										key={p.id}
										className="relative border rounded overflow-hidden cursor-move"
										draggable
										onDragStart={e => onDragStart(e, idx)}
										onDrop={e => onDrop(e, idx)}
										onDragOver={e => e.preventDefault()}
									>
										<img
											src={p.url}
											alt="preview"
											className="w-full h-32 object-cover"
										/>
										<Button
											type="button"
											icon="pi pi-times"
											className="absolute top-1 right-1 !p-1 !min-w-0 w-6 h-6"
											rounded
											severity="danger"
											onClick={() => removePhoto(p.id)}
										/>
										{idx === 0 && (
											<span className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs py-0.5 px-1 rounded">
												Primary
											</span>
										)}
									</div>
								))}
							</div>
						</div>
						<div className="flex flex-col">
							<label
								htmlFor="videoLink"
								className="font-medium mb-2"
							>
								Video Tour Link (optional)
							</label>
							<InputText
								id="videoLink"
								value={videoLink}
								onChange={e => setVideoLink(e.target.value)}
								placeholder="e.g., https://www.youtube.com/watch?v=..."
							/>
						</div>
						<div className="flex flex-col">
							<label
								htmlFor="floorPlan"
								className="font-medium mb-2"
							>
								Floor Plan Image (optional)
							</label>
							<Button
								type="button"
								label={
									floorPlan ? floorPlan.name : "Choose File"
								}
								icon="pi pi-upload"
								outlined
								onClick={() =>
									floorPlanInputRef.current?.click()
								}
								className="w-max"
							/>
							<input
								type="file"
								ref={floorPlanInputRef}
								accept="image/png,image/jpeg"
								className="hidden"
								onChange={e => setFloorPlan(e.target.files[0])}
							/>
							{floorPlan && (
								<div className="mt-2 text-sm text-gray-600 flex items-center">
									{floorPlan.name}
									<Button
										icon="pi pi-times"
										text
										rounded
										size="small"
										className="ml-2"
										onClick={() => setFloorPlan(null)}
									/>
								</div>
							)}
						</div>
					</div>
					<div className="flex pt-4 justify-between">
						<Button
							label="Back"
							severity="secondary"
							icon="pi pi-arrow-left"
							onClick={back}
						/>
						<Button
							label="Next"
							icon="pi pi-arrow-right"
							iconPos="right"
							onClick={next}
						/>
					</div>
				</StepperPanel>

				{/* Step 5: Review & Publish */}
				<StepperPanel header="Review & Publish">
					<div className="flex flex-col h-24">
						<div className="border-2 border-dashed surface-border border-round surface-ground flex-auto flex justify-center items-center font-medium">
							Please review all information before publishing.
						</div>
					</div>
					<div className="flex pt-4 justify-between">
						<Button
							label="Back"
							severity="secondary"
							icon="pi pi-arrow-left"
							onClick={back}
						/>
						<Button
							label="Publish Listing"
							icon="pi pi-check"
							onClick={publish}
						/>
					</div>
				</StepperPanel>
			</Stepper>
		</div>
	);
};

export default AddProperty;
