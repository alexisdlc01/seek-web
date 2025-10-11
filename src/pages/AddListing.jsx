import React, { useState, useRef, useEffect, useContext } from "react";
import { Stepper } from "primereact/stepper";
import { StepperPanel } from "primereact/stepperpanel";
import { Toast } from "primereact/toast";
import BasicInfoStep from "../components/addPropertySteps/BasicInfoStep";
import LocationAvailabilityStep from "../components/addPropertySteps/LocationAvailabilityStep";
import FeaturesStep from "../components/addPropertySteps/FeaturesStep";
import PhotosMediaStep from "../components/addPropertySteps/PhotosMediaStep";
import ReviewPublishStep from "../components/addPropertySteps/ReviewPublishStep";
import ListingsContext from "../context/ListingsContext.jsx";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { ProgressSpinner } from "primereact/progressspinner";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const AddListing = () => {
	const toast = useRef(null);
	const stepperRef = useRef(null);
	const fileInputRef = useRef(null);
	const floorPlanInputRef = useRef(null);
	const registerOfTitleRef = useRef(null);
	const [step, setStep] = useState(1);
	const [currentListing, setCurrentListing] = useState({});
	const originalListingRef = useRef(null);

	// Step 1 state
	const [title, setTitle] = useState("");
	const [street, setStreet] = useState("");
	const [city, setCity] = useState("");
	const [postcode, setPostcode] = useState("");
	const [country, setCountry] = useState("");
	const [sizeSqM, setSizeSqM] = useState(null);
	const propertyTypes = [
		"Flat/Apartment",
		"House",
		"Room in Shared House",
		"Studio",
		"Other (please specify)"
	];
	const propertyTypeMap = {
		FLAT_APARTMENT: "Flat/Apartment",
		HOUSE: "House",
		ROOM_IN_SHARED_HOUSE: "Room in Shared House",
		STUDIO: "Studio",
		OTHER: "Other (please specify)"
	};
	const propertyTypeMapInverse = {
		"Flat/Apartment": "FLAT_APARTMENT",
		House: "HOUSE",
		"Room in Shared House": "ROOM_IN_SHARED_HOUSE",
		Studio: "STUDIO",
		"Other (please specify)": "OTHER"
	};
	const [propertyType, setPropertyType] = useState(null);
	const [otherType, setOtherType] = useState("");
	const bedroomOptions = [...Array(10).keys()].map(i => ({
		label: i.toString(),
		value: i
	}));
	const [regularBedrooms, setRegularBedrooms] = useState(null);
	const [ensuiteBedrooms, setEnsuiteBedrooms] = useState(null);
	const bathroomOptions = [
		{ label: "0.5", value: 0.5 },
		{ label: "1", value: 1 },
		{ label: "1.5", value: 1.5 },
		{ label: "2", value: 2 },
		{ label: "2.5", value: 2.5 }
	];
	const [bathrooms, setBathrooms] = useState(null);
	const [description, setDescription] = useState("");
	const [registerOfTitle, setRegisterOfTitle] = useState(null);
	const [rent, setRent] = useState(null);
	const [deposit, setDeposit] = useState(null);
	const [availabilityDate, setAvailabilityDate] = useState(null);
	const [endAvailabilityDate, setEndAvailabilityDate] = useState(null);
	const [registerOfTitleKeyFromBackend, setRegisterOfTitleKeyFromBackend] =
		useState("");

	const leaseOptions = [
		{ label: "12 Months", value: "12 Months" },
		{ label: "Academic Year (Approx 9-10 Months)", value: "Academic Year" },
		{ label: "Trimester", value: "Trimester" },
		{ label: "Quarter", value: "Quarter" },
		{ label: "Flexible", value: "Flexible" }
	];

	// Step 2 state
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

	// Step 3 state
	const [photos, setPhotos] = useState([]);
	const [allPhotosUrls, setAllPhotosUrls] = useState([]);
	const [dragOverIndex, setDragOverIndex] = useState(null);
	const [videoLink, setVideoLink] = useState("");
	const [floorPlan, setFloorPlan] = useState(null);
	const [floorPlanUrl, setFloorPlanUrl] = useState("");

	useEffect(() => {
		if (propertyType === "Studio") {
			setRegularBedrooms(0);
			setEnsuiteBedrooms(1);
		}
	}, [propertyType]);
	const next = () => {
		stepperRef.current.nextCallback();
		setStep(prev => Math.min(prev + 1, 4));
	};

	const publish = async () => {
		let missing = [];

		if (!title?.trim()) missing.push("Property title");
		if (!sizeSqM) missing.push("Size (sq m)");
		if (!propertyType) missing.push("Property type");
		if (propertyType === "Other (please specify)" && !otherType?.trim())
			missing.push("Custom property type");
		if (!street?.trim()) missing.push("Street");
		if (!city?.trim()) missing.push("City");
		if (!postcode?.trim()) missing.push("Postcode");
		if (!country?.trim()) missing.push("Country");
		if (regularBedrooms == null) missing.push("Bedrooms");
		if (ensuiteBedrooms == null) missing.push("En-suite bedrooms");
		if (bathrooms == null) missing.push("Bathrooms");
		if (!description?.trim()) missing.push("Description");
		if (!rent) missing.push("Monthly rent");
		if (!deposit) missing.push("Security deposit");
		if (!availabilityDate) missing.push("Available from");
		if (!endAvailabilityDate) missing.push("Available until");
		if (!registerOfTitle) missing.push("Register of Title (PDF)");
		if (!furnishingStatus) missing.push("Furnishing status");
		if (photos.length === 0) missing.push("At least one photo");

		if (missing.length > 0) {
			toast.current.show({
				severity: "warn",
				summary: "Missing Required Fields",
				detail: `Please fill in: ${missing.join(", ")}`
			});
			return;
		}

		const finalData = cleanObject({
			propertyTitle: title,
			sizeSqMeters: sizeSqM,
			propertyType: propertyTypeMapInverse[propertyType],
			streetAddress: street,
			cityTown: city,
			postcodeZIP: postcode,
			country: country,
			bedroomsCount: regularBedrooms,
			enSuiteBedroomCount: ensuiteBedrooms,
			bathrooms: bathrooms,
			propertyDesc: description,
			monthlyRent: rent,
			securityDeposit: deposit,
			availableFrom: availabilityDate,
			availableUntil: endAvailabilityDate,
			registerOfTitleKey: registerOfTitleKeyFromBackend,
			furnishingStatus: furnishingStatus
				? furnishingStatus.charAt(0).toLowerCase() +
					furnishingStatus.slice(1)
				: null,
			epcRating: epcRating,
			amenities: amenities,
			photos: allPhotosUrls,
			videoTourLink: videoLink,
			floorPlanImage: floorPlanUrl
		});

		await axios.post(`${BASE_URL}/listings/${id}/publish`, finalData, {
			withCredentials: true
		});

		toast.current.show({
			severity: "success",
			summary: "Published!",
			detail: "Your property listing is now live."
		});
		navigate("/listings");
		console.log("Submitting all data...");
	};

	const back = () => {
		stepperRef.current.prevCallback();
		setStep(prev => Math.max(prev - 1, 0));
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

	// Page protection
	const { id } = useParams();
	const navigate = useNavigate();
	const [validListing, setValidListing] = useState(false);
	const [loading, setLoading] = useState(true);

	const getChangedFields = (current, original) => {
		const changed = {};
		for (const key in current) {
			if (current[key] !== original[key]) {
				changed[key] = current[key];
			}
		}
		return changed;
	};

	const cleanObject = obj =>
		Object.fromEntries(
			Object.entries(obj).filter(
				([, v]) => v !== null && v !== undefined && !Number.isNaN(v)
			)
		);

	useEffect(() => {
		(async () => {
			try {
				const res = await axios.get(`${BASE_URL}/listings/mine/${id}`, {
					withCredentials: true
				});
				if (res.data) setValidListing(true);
				else navigate("/not-authorized");
			} catch (err) {
				console.error("Verification failed:", err);
				navigate("/not-authorized");
			} finally {
				setLoading(false);

				const res = await axios.get(`${BASE_URL}/listings/mine/${id}`, {
					withCredentials: true
				});
				console.log("data back", res.data);
				setCurrentListing(res.data);
				originalListingRef.current = res.data;
				res.data.propertyTitle ? setTitle(res.data.propertyTitle) : {};
				res.data.sizeSqMeters ? setSizeSqM(res.data.sizeSqMeters) : {};
				res.data.propertyType
					? setPropertyType(
							propertyTypeMap[res.data.propertyType] || null
						)
					: {};
				res.data.bedroomsCount
					? setRegularBedrooms(res.data.bedroomsCount)
					: {};
				res.data.enSuiteBedroomCount
					? setEnsuiteBedrooms(res.data.enSuiteBedroomCount)
					: {};
				res.data.bathrooms ? setBathrooms(res.data.bathrooms) : {};
				res.data.propertyDesc
					? setDescription(res.data.propertyDesc)
					: {};

				res.data.amenities ? setAmenities(res.data.amenities) : {};
				res.data.streetAddress ? setStreet(res.data.streetAddress) : {};
				res.data.cityTown ? setCity(res.data.cityTown) : {};
				res.data.postcodeZIP ? setPostcode(res.data.postcodeZIP) : {};
				res.data.country ? setCountry(res.data.country) : {};
				res.data.monthlyRent ? setRent(res.data.monthlyRent) : {};
				res.data.securityDeposit
					? setDeposit(res.data.securityDeposit)
					: {};
				res.data.availableFrom
					? setAvailabilityDate(new Date(res.data.availableFrom))
					: {};
				res.data.availableUntil
					? setEndAvailabilityDate(new Date(res.data.availableUntil))
					: {};

				res.data.furnishingStatus
					? setFurnishingStatus(
							res.data.furnishingStatus.charAt(0).toUpperCase() +
								res.data.furnishingStatus.slice(1)
						)
					: {};
				res.data.epcRating ? setEpcRating(res.data.epcRating) : {};
				res.data.videoTourLink
					? setVideoLink(res.data.videoTourLink)
					: {};

				if (res.data.registerOfTitleKey) {
					setRegisterOfTitleKeyFromBackend(
						res.data.registerOfTitleKey
					);
					const key = res.data.registerOfTitleKey;
					const fakeFileName = key
						.split("/")
						.pop()
						.split("-")
						.slice(1)
						.join("-");
					setRegisterOfTitle({ name: fakeFileName });
				}

				if (res.data.floorPlanImage) {
					setFloorPlanUrl(res.data.floorPlanImage);
					const fakeFileName = res.data.floorPlanImage
						.split("/")
						.pop()
						.split("-")
						.slice(1)
						.join("-");
					setFloorPlan({ name: fakeFileName });
				}

				if (res.data.photos && res.data.photos.length > 0) {
					const loadedPhotos = res.data.photos.map(url => ({
						id: Date.now() + Math.random(),
						file: null,
						url
					}));
					setPhotos(loadedPhotos);
				}
			}
		})();
	}, [id, navigate]);

	useEffect(() => {
		(async () => {
			console.log("On step:", step);
			switch (step) {
				case 2:
					const step1Data = cleanObject({
						propertyTitle: title,
						sizeSqMeters: sizeSqM,
						propertyType: propertyTypeMapInverse[propertyType],
						bedroomsCount: regularBedrooms,
						enSuiteBedroomCount: parseInt(ensuiteBedrooms),
						bathrooms,
						propertyDesc: description,
						streetAddress: street,
						cityTown: city,
						postcodeZIP: postcode,
						country,
						monthlyRent: rent,
						securityDeposit: deposit,
						availableFrom: availabilityDate,
						availableUntil: endAvailabilityDate,
						registerOfTitleKey: registerOfTitleKeyFromBackend
					});

					const step1Changes = getChangedFields(
						step1Data,
						originalListingRef.current || {}
					);
					console.log("changes from step 1", step1Changes);
					if (Object.keys(step1Changes).length > 0) {
						await axios.patch(
							`${BASE_URL}/listings/${currentListing._id}/createStep1`,
							step1Changes,
							{ withCredentials: true }
						);
					}
					break;
				case 3:
					const step2Data = cleanObject({
						furnishingStatus: furnishingStatus
							? furnishingStatus.charAt(0).toLowerCase() +
								furnishingStatus.slice(1)
							: null,
						epcRating: epcRating,
						// TODO: get custom amenities to work.
						amenities: amenities
					});

					const step2Changes = getChangedFields(
						step2Data,
						originalListingRef.current || {}
					);
					if (Object.keys(step2Changes).length > 0) {
						await axios.patch(
							`${BASE_URL}/listings/${currentListing._id}/createStep2`,
							step2Changes,
							{ withCredentials: true }
						);
					}
					break;
				case 4:
					const existingUrls = photos
						.filter(p => p.url.startsWith("https://"))
						.map(p => p.url);

					const newFiles = photos.filter(p => p.file);

					// Upload new photos
					const uploadedUrls = await Promise.all(
						newFiles.map(async p => {
							const res = await axios.get(
								`${BASE_URL}/upload/presign`,
								{
									params: {
										filename: p.file.name,
										fileType: p.file.type,
										folder: "public"
									},
									withCredentials: true
								}
							);
							const { uploadUrl, fileUrl } = res.data;
							await axios.put(uploadUrl, p.file, {
								headers: { "Content-Type": p.file.type }
							});
							return fileUrl;
						})
					);

					// Combine old + new
					setAllPhotosUrls([...existingUrls, ...uploadedUrls]);

					const step3Data = cleanObject({
						photos: allPhotosUrls,
						videoTourLink: videoLink,
						floorPlanImage: floorPlanUrl
					});

					const step3Changes = getChangedFields(
						step3Data,
						originalListingRef.current || {}
					);
					if (Object.keys(step3Changes).length > 0) {
						await axios.patch(
							`${BASE_URL}/listings/${currentListing._id}/createStep3`,
							step3Changes,
							{ withCredentials: true }
						);
					}
					break;
			}
		})();
	}, [step]);

	if (loading) {
		return (
			<div className="flex items-center justify-center h-screen">
				<ProgressSpinner style={{ width: "50px", height: "50px" }} />
			</div>
		);
	}

	if (!validListing) return null;

	return (
		<div
			className="min-h-screen py-6 px-2 md:px-4"
			style={{ background: "#0f0f23" }}
		>
			<Toast ref={toast} />
			<div className="w-[75%] max-w-screen-2xl mx-auto px-2 md:px-4">
				<h1 className="text-2xl sm:text-3xl font-bold text-[var(--primary-color)] pb-6">
					Add New Property
				</h1>

				<Stepper ref={stepperRef} linear>
					<StepperPanel header="Basics">
						<BasicInfoStep
							title={title}
							setTitle={setTitle}
							sizeSqM={sizeSqM}
							setSizeSqM={setSizeSqM}
							propertyType={propertyType}
							setPropertyType={setPropertyType}
							street={street}
							setStreet={setStreet}
							city={city}
							setCity={setCity}
							postcode={postcode}
							setPostcode={setPostcode}
							country={country}
							setCountry={setCountry}
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
							rent={rent}
							setRent={setRent}
							deposit={deposit}
							setDeposit={setDeposit}
							availabilityDate={availabilityDate}
							setAvailabilityDate={setAvailabilityDate}
							endAvailabilityDate={endAvailabilityDate}
							setEndAvailabilityDate={setEndAvailabilityDate}
							leaseOptions={leaseOptions}
							registerOfTitleRef={registerOfTitleRef}
							registerOfTitle={registerOfTitle}
							setRegisterOfTitle={setRegisterOfTitle}
							registerOfTitleKeyFromBackend={
								registerOfTitleKeyFromBackend
							}
							setRegisterOfTitleKeyFromBackend={
								setRegisterOfTitleKeyFromBackend
							}
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
							amenities={amenities}
							onAmenityChange={onAmenityChange}
							amenitiesList={amenitiesList}
							back={back}
							next={next}
						/>
					</StepperPanel>
					<StepperPanel header="Media">
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
							floorPlanUrl={floorPlanUrl}
							setFloorPlanUrl={setFloorPlanUrl}
							back={back}
							next={next}
						/>
					</StepperPanel>
					<StepperPanel header="Review">
						<ReviewPublishStep
							title={title}
							sizeSqM={sizeSqM}
							propertyType={propertyType}
							street={street}
							city={city}
							postcode={postcode}
							country={country}
							propertyTypes={propertyTypes}
							otherType={otherType}
							regularBedrooms={regularBedrooms}
							ensuiteBedrooms={ensuiteBedrooms}
							bedroomOptions={bedroomOptions}
							bathrooms={bathrooms}
							bathroomOptions={bathroomOptions}
							description={description}
							rent={rent}
							deposit={deposit}
							availabilityDate={availabilityDate}
							endAvailabilityDate={endAvailabilityDate}
							leaseOptions={leaseOptions}
							registerOfTitleRef={registerOfTitleRef}
							registerOfTitle={registerOfTitle}
							registerOfTitleKeyFromBackend={
								registerOfTitleKeyFromBackend
							}
							furnishingStatus={furnishingStatus}
							furnishingOptions={furnishingOptions}
							epcRating={epcRating}
							epcOptions={epcOptions}
							amenities={amenities}
							photos={photos}
							videoLink={videoLink}
							floorPlan={floorPlan}
							fileInputRef={fileInputRef}
							floorPlanInputRef={floorPlanInputRef}
							onPhotoSelect={onPhotoSelect}
							floorPlanUrl={floorPlanUrl}
							back={back}
							publish={publish}
						/>
					</StepperPanel>
				</Stepper>
			</div>
		</div>
	);
};

export default AddListing;
