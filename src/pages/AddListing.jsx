import React, { useState, useRef, useEffect } from "react";
import { Stepper } from "primereact/stepper";
import { StepperPanel } from "primereact/stepperpanel";
import { Toast } from "primereact/toast";
import BasicInfoStep from "../components/addPropertySteps/BasicInfoStep";
import LocationAvailabilityStep from "../components/addPropertySteps/LocationAvailabilityStep";
import FeaturesStep from "../components/addPropertySteps/FeaturesStep";
import PhotosMediaStep from "../components/addPropertySteps/PhotosMediaStep";
import ReviewPublishStep from "../components/addPropertySteps/ReviewPublishStep";

const AddListing = () => {
	const toast = useRef(null);
	const stepperRef = useRef(null);
	const fileInputRef = useRef(null);
	const floorPlanInputRef = useRef(null);
	const [step, setStep] = useState(0);

	// Step 1 state
	const [title, setTitle] = useState("");
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
	const [endAvailabilityDate, setEndAvailabilityDate] = useState(null);

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

	useEffect(() => {
		if (propertyType === "Studio") {
			setRegularBedrooms(0);
			setEnsuiteBedrooms(1);
		}
	}, [propertyType]);

	const next = () => {
		stepperRef.current.nextCallback();
	};

	const back = () => {
		stepperRef.current.prevCallback();
	};

	const publish = () => {
		toast.current.show({
			severity: "success",
			summary: "Published!",
			detail: "Your property listing is now live."
		});
		// Here you would typically submit all the collected data
		console.log("Submitting all data...");
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

	return (
		<div className="min-h-screen bg-white p-4 md:p-6">
			<Toast ref={toast} />
			<div className="w-full 2xl:max-w-[60%] xl:max-w-[70%] lg:max-w-[80%] mx-auto">
				<Stepper
					ref={stepperRef}
					activeIndex={step}
					onStepChange={e => setStep(e.index)}
					linear
				>
					<StepperPanel header="Basic Info">
						<BasicInfoStep
							title={title}
							setTitle={setTitle}
							sizeSqM={sizeSqM}
							setSizeSqM={setSizeSqM}
							propertyType={propertyType}
							setPropertyType={setPropertyType}
							propertyTypes={propertyTypes}
							otherType={otherType}
							setOtherType={setOtherType}
							regularBedrooms={regularBedrooms}
							setRegularBedrooms={setRegularBedrooms}
							ensuiteBedrooms={ensuiteBedrooms}
							setEnsuiteBedrooms={setEnsuiteBedrooms}
							bedroomOptions={bedroomOptions}
							bathrooms={bathrooms}
							setBathrooms={setBathrooms}
							bathroomOptions={bathroomOptions}
							description={description}
							setDescription={setDescription}
							amenities={amenities}
							onAmenityChange={onAmenityChange}
							amenitiesList={amenitiesList}
							next={next}
						/>
					</StepperPanel>
					<StepperPanel header="Location & Availability">
						<LocationAvailabilityStep
							street={street}
							setStreet={setStreet}
							city={city}
							setCity={setCity}
							postcode={postcode}
							setPostcode={setPostcode}
							country={country}
							setCountry={setCountry}
							rent={rent}
							setRent={setRent}
							deposit={deposit}
							setDeposit={setDeposit}
							availabilityDate={availabilityDate}
							setAvailabilityDate={setAvailabilityDate}
							endAvailabilityDate={endAvailabilityDate}
							setEndAvailabilityDate={setEndAvailabilityDate}
							leaseOptions={leaseOptions}
							back={back}
							next={next}
						/>
					</StepperPanel>
					<StepperPanel header="Features">
						<FeaturesStep
							furnishingStatus={furnishingStatus}
							setFurnishingStatus={setFurnishingStatus}
							furnishingOptions={furnishingOptions}
							epcRating={epcRating}
							setEpcRating={setEpcRating}
							epcOptions={epcOptions}
							back={back}
							next={next}
						/>
					</StepperPanel>
					<StepperPanel header="Photos & Media">
						<PhotosMediaStep
							photos={photos}
							videoLink={videoLink}
							setVideoLink={setVideoLink}
							floorPlan={floorPlan}
							setFloorPlan={setFloorPlan}
							fileInputRef={fileInputRef}
							floorPlanInputRef={floorPlanInputRef}
							onPhotoSelect={onPhotoSelect}
							onDragStart={onDragStart}
							onDrop={onDrop}
							removePhoto={removePhoto}
							back={back}
							next={next}
						/>
					</StepperPanel>
					<StepperPanel header="Review & Publish">
						<ReviewPublishStep back={back} publish={publish} />
					</StepperPanel>
				</Stepper>
			</div>
		</div>
	);
};

export default AddListing;
