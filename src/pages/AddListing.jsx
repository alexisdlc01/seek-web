import React, { useEffect, useRef, useState } from "react";
import { Stepper } from "primereact/stepper";
import { StepperPanel } from "primereact/stepperpanel";
import { Toast } from "primereact/toast";
import BasicInfoStep from "../components/addPropertySteps/BasicInfoStep";
import FeaturesStep from "../components/addPropertySteps/FeaturesStep";
import PhotosMediaStep from "../components/addPropertySteps/PhotosMediaStep";
import ApplicationRequirements from "../components/addPropertySteps/ApplicationRequirementsStep.jsx";
import ReviewPublishStep from "../components/addPropertySteps/ReviewPublishStep";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { ProgressSpinner } from "primereact/progressspinner";

import { API_BASE } from "../lib/landlord.js";

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
	const [numOfPeople, setNumOfPeople] = useState(0);
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
	// Nation, bills and compliance dates (landlord redesign)
	const [extras, setExtras] = useState({
		nation: "ENGLAND",
		billsIncluded: false,
		gasSafetyExpiry: null,
		eicrExpiry: null,
		epcExpiry: null,
		hmoLicenceExpiry: null,
		licenceNumber: ""
	});
	const extrasPayload = () => ({
		nation: extras.nation,
		billsIncluded: extras.billsIncluded,
		gasSafetyExpiry: extras.gasSafetyExpiry,
		eicrExpiry: extras.eicrExpiry,
		epcExpiry: extras.epcExpiry,
		hmoLicenceExpiry: extras.hmoLicenceExpiry,
		licenceNumber: extras.licenceNumber?.trim() || null
	});
	// "Requirements and rent" step: per-room holding deposit, who can apply and
	// the plans offered. Rent and security deposit stay whole-property totals.
	const [holdingDeposit, setHoldingDeposit] = useState(null);
	const [criteria, setCriteria] = useState({
		guarantor: "UK_OR_SERVICE",
		referencesRequired: false
	});
	const [paymentPlans, setPaymentPlans] = useState(["MONTHLY"]);
	const [viewingSlots, setViewingSlots] = useState([]);
	const [viewingSlotCapacity, setViewingSlotCapacity] = useState(2);
	const rentStepPayload = () => ({
		monthlyRent: rent,
		securityDeposit: deposit,
		holdingDeposit,
		billsIncluded: extras.billsIncluded,
		criteria,
		paymentPlans: extras.nation === "ENGLAND" ? ["MONTHLY"] : paymentPlans,
		viewingSlots,
		viewingSlotCapacity
	});
	const bedroomOptions = [...Array(10).keys()].map(i => ({
		label: i.toString(),
		value: i
	}));
	const [regularBedrooms, setRegularBedrooms] = useState(null);
	const [ensuiteBedrooms, setEnsuiteBedrooms] = useState(null);
	const bathroomOptions = [
		{ label: "0", value: 0 },
		{ label: "0.5", value: 0.5 },
		{ label: "1", value: 1 },
		{ label: "1.5", value: 1.5 },
		{ label: "2", value: 2 },
		{ label: "2.5", value: 2.5 },
		{ label: "3", value: 3 },
		{ label: "3.5", value: 3.5 },
		{ label: "4", value: 4 },
		{ label: "4.5", value: 4.5 },
		{ label: "5", value: 5 },
		{ label: "5.5", value: 5.5 },
		{ label: "6", value: 6 },
		{ label: "6.5", value: 6.5 },
		{ label: "7", value: 7 },
		{ label: "7.5", value: 7.5 }
	];
	const [bathrooms, setBathrooms] = useState(null);
	const [description, setDescription] = useState("");
	const [registerOfTitle, setRegisterOfTitle] = useState(null);
	const [registrationNumber, setRegistrationNumber] = useState("");
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

	const [Apprequirements, setRequirements] = useState([
		{
			id: 1,
			name: "Identification",
			desc: "National ID or Passport",
			required: true
		},
		{
			id: 2,
			name: "Proof of income or financial support",
			desc: "A proof of student loan or scholarship, savings, financial support from parents/guardians",
			required: true
		},
		{
			id: 3,
			name: "Guarantor information",
			desc: "Upload your guarantor agreement with a UK based guarantor",
			required: true
		},
		{
			id: 4,
			name: "Landlord reference",
			desc: "Upload your previous landlord reference or University accommodation letter",
			required: false
		}
	]);

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
		setStep(prev => Math.min(prev + 1, 5));
	};

	const publish = async () => {
		let missing = [];

		if (!title?.trim()) missing.push("Property title");
		if (!sizeSqM) missing.push("Size (sq m)");
		if (!propertyType) missing.push("Property type");
		if (propertyType === "Other (please specify)" && !otherType?.trim())
			missing.push("Custom property type");
		if (numOfPeople === 0) missing.push("Number of People");
		if (!street?.trim()) missing.push("Street");
		if (!city?.trim()) missing.push("City");
		if (!postcode?.trim()) missing.push("Postcode");
		if (!country?.trim()) missing.push("Country");
		if (regularBedrooms == null) missing.push("Bedrooms");
		if (ensuiteBedrooms == null) missing.push("En-suite bedrooms");
		if (bathrooms == null) missing.push("Bathrooms");
		if (!description?.trim()) missing.push("Description");
		if (!rent) missing.push("Rent per room");
		if (!deposit) missing.push("Security deposit");
		if (!availabilityDate) missing.push("Available from");
		if (!registerOfTitle && !registrationNumber) {
			missing.push(
				"One of Register of Title (PDF) or Registration Number"
			);
		}
		if (!furnishingStatus) missing.push("Furnishing status");
		if (photos.length === 0) missing.push("At least one photo");
		if (Apprequirements.length === 0)
			missing.push("At least one requirement");

		if (missing.length > 0) {
			toast.current?.show({
				severity: "warn",
				summary: "Missing Required Fields",
				detail: `Please fill in: ${missing.join(", ")}`,
				life: 5000,
				style: {
					background: "var(--sk-card)",
					color: "var(--sk-text)",
					borderLeft: "5px solid var(--sk-warn)", // amber accent
					borderRadius: "8px",
					boxShadow: "0 4px 15px var(--sk-hair)"
				},
				content: (
					<div className="flex items-center space-x-3">
						<i className="pi pi-exclamation-triangle text-sk-warn text-xl"></i>
						<div>
							<p className="font-semibold">
								Missing Required Fields
							</p>
							<p className="text-sm listing-flow-text-muted">
								Please fill in: {missing.join(", ")}
							</p>
						</div>
						<button
							onClick={() => toast.current.clear()}
							className="listing-flow-text-soft hover:listing-flow-text-strong transition-colors cursor-pointer"
						>
							<i className="pi pi-times text-sm"></i>
						</button>
					</div>
				)
			});
			return;
		}

		const finalData = cleanObject({
			propertyTitle: title,
			sizeSqMeters: sizeSqM,
			numOfPeople: numOfPeople.toString(),
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
			availableFrom: utcDay(availabilityDate),
			availableUntil: endAvailabilityDate,
			registerOfTitleKey: registerOfTitleKeyFromBackend,
			registrationNumber: registrationNumber,
			...extrasPayload(),
			...cleanObject(rentStepPayload()),
			furnishingStatus: furnishingStatus ? furnishingStatus : null,
			epcRating: epcRating,
			amenities: amenities,
			photos: allPhotosUrls,
			videoTourLink: videoLink,
			floorPlanImage: floorPlanUrl,
			requirements: Apprequirements
		});

		try {
			await axios.post(`${API_BASE}/listings/${id}/publish`, finalData, {
				withCredentials: true
			});

			toast.current?.show({
				severity: "success",
				summary: "Listing Published!",
				detail: "Your property listing is now live.",
				life: 4000,
				style: {
					background: "var(--sk-card)",
					color: "var(--sk-text)",
					borderLeft: "5px solid var(--sk-ok)",
					borderRadius: "8px",
					boxShadow: "0 4px 15px var(--sk-hair)",
					position: "relative"
				},
				content: (
					<div className="flex items-center space-x-3">
						<i className="pi pi-check-circle text-sk-ok text-xl"></i>
						<div className="flex-1">
							<p className="font-semibold">Listing Published!</p>
							<p className="text-sm listing-flow-text-muted">
								Your property listing is now live.
							</p>
						</div>
						<button
							onClick={() => toast.current.clear()}
							className="listing-flow-text-soft hover:listing-flow-text-strong transition-colors"
						>
							<i className="pi pi-times text-sm"></i>
						</button>
					</div>
				)
			});

			navigate("/listings");
		} catch (error) {
			console.error("Publishing failed:", error);
			const serverMessage = error?.response?.data?.message;
			const detail = Array.isArray(serverMessage)
				? serverMessage.join(", ")
				: serverMessage || "An error occurred while publishing your listing.";
			toast.current?.show({
				severity: "error",
				summary: "Publish Failed",
				detail,
				life: 6000,
				style: {
					background: "var(--sk-card)",
					color: "var(--sk-text)",
					borderLeft: "5px solid var(--sk-danger)",
					borderRadius: "8px",
					boxShadow: "0 4px 15px var(--sk-hair)"
				},
				content: (
					<div className="flex items-center space-x-3">
						<i className="pi pi-times-circle text-sk-danger text-xl"></i>
						<div>
							<p className="font-semibold">Publish Failed</p>
							<p className="text-sm listing-flow-text-muted">
								{detail}
							</p>
							<button
								onClick={() => toast.current.clear()}
								className="text-sk-muted hover:text-sk-text transition-colors"
							>
								<i className="pi pi-times text-sm"></i>
							</button>
						</div>
					</div>
				)
			});
		}
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
				const res = await axios.get(`${API_BASE}/listings/mine/${id}`, {
					withCredentials: true
				});
				if (res.data) setValidListing(true);
				else navigate("/not-authorized");
			} catch (err) {
				console.error("Verification failed:", err);
				navigate("/not-authorized");
			} finally {
				setLoading(false);

				const res = await axios.get(`${API_BASE}/listings/mine/${id}`, {
					withCredentials: true
				});
				setCurrentListing(res.data);
				originalListingRef.current = res.data;
				res.data.propertyTitle ? setTitle(res.data.propertyTitle) : {};
				res.data.numOfPeople != null
					? setNumOfPeople(res.data.numOfPeople)
					: {};
				res.data.sizeSqMeters != null ? setSizeSqM(res.data.sizeSqMeters) : {};
				res.data.propertyType
					? setPropertyType(
							propertyTypeMap[res.data.propertyType] || null
						)
					: {};
				res.data.bedroomsCount != null
					? setRegularBedrooms(res.data.bedroomsCount)
					: {};
				res.data.enSuiteBedroomCount != null
					? setEnsuiteBedrooms(res.data.enSuiteBedroomCount)
					: {};
				res.data.bathrooms != null ? setBathrooms(res.data.bathrooms) : {};
				res.data.propertyDesc
					? setDescription(res.data.propertyDesc)
					: {};

				setExtras(prev => {
					const d = v => (v ? new Date(v) : null);
					return {
						nation: res.data.nation || prev.nation,
						billsIncluded: !!res.data.billsIncluded,
						gasSafetyExpiry: d(res.data.gasSafetyExpiry),
						eicrExpiry: d(res.data.eicrExpiry),
						epcExpiry: d(res.data.epcExpiry),
						hmoLicenceExpiry: d(res.data.hmoLicenceExpiry),
						licenceNumber: res.data.licenceNumber || ""
					};
				});
				res.data.amenities ? setAmenities(res.data.amenities) : {};
				res.data.streetAddress ? setStreet(res.data.streetAddress) : {};
				res.data.cityTown ? setCity(res.data.cityTown) : {};
				res.data.postcodeZIP ? setPostcode(res.data.postcodeZIP) : {};
				res.data.country ? setCountry(res.data.country) : {};
				res.data.monthlyRent ? setRent(res.data.monthlyRent) : {};
				res.data.holdingDeposit != null
					? setHoldingDeposit(res.data.holdingDeposit)
					: {};
				res.data.criteria ? setCriteria(res.data.criteria) : {};
				res.data.paymentPlans?.length
					? setPaymentPlans(res.data.paymentPlans)
					: {};
				setViewingSlots(res.data.viewingSlots ?? []);
				if (res.data.viewingSlotCapacity)
					setViewingSlotCapacity(res.data.viewingSlotCapacity);
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
					? setFurnishingStatus(res.data.furnishingStatus)
					: {};
				res.data.epcRating ? setEpcRating(res.data.epcRating) : {};
				res.data.videoTourLink
					? setVideoLink(res.data.videoTourLink)
					: {};

				res.data.requirements.length !== 0
					? setRequirements(res.data.requirements)
					: {};

				res.data.registrationNumber
					? setRegistrationNumber(res.data.registrationNumber)
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
			switch (step) {
				case 2: {
					const step1Data = cleanObject({
						propertyTitle: title,
						numOfPeople: parseInt(numOfPeople),
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
						availableFrom: utcDay(availabilityDate),
						availableUntil: endAvailabilityDate,
						registerOfTitleKey: registerOfTitleKeyFromBackend,
						registrationNumber: registrationNumber,
						...extrasPayload()
					});

					const step1Changes = getChangedFields(
						step1Data,
						originalListingRef.current || {}
					);
					if (Object.keys(step1Changes).length > 0) {
						await axios.patch(
							`${API_BASE}/listings/${currentListing._id}/createStep1`,
							step1Changes,
							{ withCredentials: true }
						);
					}
					break;
				}
				case 3: {
					const step2Data = cleanObject({
						furnishingStatus: furnishingStatus
							? furnishingStatus
							: null,
						epcRating: epcRating,
						amenities: amenities
					});

					const step2Changes = getChangedFields(
						step2Data,
						originalListingRef.current || {}
					);
					if (Object.keys(step2Changes).length > 0) {
						await axios.patch(
							`${API_BASE}/listings/${currentListing._id}/createStep2`,
							step2Changes,
							{ withCredentials: true }
						);
					}
					break;
				}
				case 4: {
					const existingUrls = photos
						.filter(p => p.url.startsWith("https://"))
						.map(p => p.url);

					const newFiles = photos.filter(p => p.file);

					const uploadedUrls = await Promise.all(
						newFiles.map(async p => {
							const res = await axios.get(
								`${API_BASE}/upload/presign`,
								{
									params: {
										filename: p.file.name,
										fileType: p.file.type,
										fileSize: p.file.size,
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

					const combinedUrls = [...existingUrls, ...uploadedUrls];
					setAllPhotosUrls(combinedUrls);

					const step4Data = cleanObject({
						photos: combinedUrls,
						videoTourLink: videoLink,
						floorPlanImage: floorPlanUrl
					});

					const step4Changes = getChangedFields(
						step4Data,
						originalListingRef.current || {}
					);

					if (Object.keys(step4Changes).length > 0) {
						await axios.patch(
							`${API_BASE}/listings/${currentListing._id}/createStep3`,
							step4Changes,
							{ withCredentials: true }
						);
					}
					originalListingRef.current = {
						...originalListingRef.current,
						...step4Data
					};

					break;
				}
				case 5:
					await axios.patch(
						`${API_BASE}/listings/${currentListing._id}/createStep1`,
						cleanObject(rentStepPayload()),
						{ withCredentials: true }
					);
					await axios.patch(
						`${API_BASE}/listings/${currentListing._id}/createStep4`,
						{
							requirements: Apprequirements
						},
						{ withCredentials: true }
					);
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
			style={{ background: "var(--sk-bg)" }}
		>
			<Toast ref={toast} position="bottom-right" />
			<div className="w-[75%] max-w-screen-2xl mx-auto px-2 md:px-4">
				<h1 className="text-2xl sm:text-3xl font-bold text-sk-link pb-6">
					Add New Property
				</h1>

				<Stepper ref={stepperRef} linear className="listing-flow-stepper">
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
							registrationNumber={registrationNumber}
							setRegistrationNumber={setRegistrationNumber}
							registerOfTitleKeyFromBackend={
								registerOfTitleKeyFromBackend
							}
							setRegisterOfTitleKeyFromBackend={
								setRegisterOfTitleKeyFromBackend
							}
							numOfPeople={numOfPeople}
							setNumOfPeople={setNumOfPeople}
							extras={extras}
							setExtras={setExtras}
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

					<StepperPanel header="Requirements and rent">
						<ApplicationRequirements
							back={back}
							next={next}
							App2requirements={Apprequirements}
							setRequirements={setRequirements}
							numOfPeople={numOfPeople}
							rent={rent}
							setRent={setRent}
							deposit={deposit}
							setDeposit={setDeposit}
							holdingDeposit={holdingDeposit}
							setHoldingDeposit={setHoldingDeposit}
							criteria={criteria}
							setCriteria={setCriteria}
							paymentPlans={paymentPlans}
							setPaymentPlans={setPaymentPlans}
							viewingSlots={viewingSlots}
							setViewingSlots={setViewingSlots}
							viewingSlotCapacity={viewingSlotCapacity}
							setViewingSlotCapacity={setViewingSlotCapacity}
							nation={extras.nation}
							billsIncluded={extras.billsIncluded}
							setBillsIncluded={v =>
								setExtras(prev => ({ ...prev, billsIncluded: v }))
							}
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
							appRequirements={Apprequirements}
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

// The server compares whole UTC days: send the picked calendar day as UTC midnight so local-time offsets never push "today" into yesterday.
const utcDay = d => d && new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));

export default AddListing;
