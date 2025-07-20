import React, { useRef } from "react";
import { Stepper } from "primereact/stepper";
import { StepperPanel } from "primereact/stepperpanel";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { Calendar } from "primereact/calendar";
import { Checkbox } from "primereact/checkbox";
import { RadioButton } from "primereact/radiobutton";
import { FileUpload } from "primereact/fileupload";

export default function AddProperty() {
	const stepperRef = useRef(null);

	return (
		<div className="min-h-screen bg-white px-6 py-10">
			<h1 className="text-3xl font-bold text-[var(--text-color)] mb-8">
				Add New Property
			</h1>

			<Stepper ref={stepperRef} style={{ width: "100%" }} linear>
				{/* Step 1: Basic Info */}
				<StepperPanel header="Basic Info">
					<div className="space-y-6">
						<div>
							<label>Property Name/Title *</label>
							<InputText
								placeholder="e.g., Spacious 2-bed flat with garden"
								className="w-full"
							/>
						</div>
						<div className="flex gap-4">
							<InputText
								className="w-full"
								placeholder="Property Size (sq ft)"
								defaultValue="850"
							/>
							<InputText
								className="w-full"
								placeholder="Property Size (m²)"
								defaultValue="79"
							/>
						</div>
						<div>
							<label>Property Type *</label>
							<div className="flex flex-col gap-2 mt-2">
								{[
									"Flat/Apartment",
									"House",
									"Room in Shared House",
									"Studio",
									"Other (please specify)"
								].map(type => (
									<div
										key={type}
										className="flex items-center gap-2"
									>
										<RadioButton
											inputId={type}
											name="propertyType"
											value={type}
										/>
										<label htmlFor={type}>{type}</label>
									</div>
								))}
							</div>
						</div>
						<div className="flex gap-4">
							<Dropdown
								className="w-full"
								placeholder="Regular Bedrooms *"
							/>
							<Dropdown
								className="w-full"
								placeholder="Ensuite Bedrooms"
							/>
						</div>
						<Dropdown
							className="w-full"
							placeholder="Number of Bathrooms"
						/>
						<InputTextarea
							className="w-full"
							rows={4}
							placeholder="Property Description *"
						/>
						<div>
							<Checkbox inputId="amenity1" />
							<label htmlFor="amenity1" className="ml-2">
								Carbon Monoxide Alarm
							</label>
						</div>
						<div className="flex py-4 justify-end">
							<Button
								label="Next"
								icon="pi pi-arrow-right"
								iconPos="right"
								onClick={() =>
									stepperRef.current.nextCallback()
								}
							/>
						</div>
					</div>
				</StepperPanel>

				{/* Step 2: Location */}
				<StepperPanel header="Location">
					<div className="space-y-6">
						<InputText
							className="w-full"
							placeholder="Full Address *"
						/>
						<div className="flex gap-4">
							<InputText
								className="w-full"
								placeholder="Street Name and Number"
							/>
							<InputText
								className="w-full"
								placeholder="Town/City"
								defaultValue="St Andrews"
							/>
							<InputText
								className="w-full"
								placeholder="Postcode"
								defaultValue="KY16 9AL"
							/>
						</div>
						<div className="flex gap-4">
							<InputText
								className="w-full"
								placeholder="Monthly Rent (£) *"
								defaultValue="3000"
							/>
							<InputText
								className="w-full"
								placeholder="Deposit (£) *"
								defaultValue="1200"
							/>
						</div>
						<div className="flex gap-4">
							<Calendar
								className="w-full"
								placeholder="Availability Date *"
								showIcon
							/>
							<Dropdown
								className="w-full"
								placeholder="Lease Duration *"
							/>
						</div>
						<div className="flex py-4 justify-between">
							<Button
								label="Back"
								icon="pi pi-arrow-left"
								onClick={() =>
									stepperRef.current.prevCallback()
								}
							/>
							<Button
								label="Next"
								icon="pi pi-arrow-right"
								iconPos="right"
								onClick={() =>
									stepperRef.current.nextCallback()
								}
							/>
						</div>
					</div>
				</StepperPanel>

				{/* Step 3: Features */}
				<StepperPanel header="Features">
					<div className="space-y-6">
						<label>Furnishing Status *</label>
						<div className="flex flex-col gap-2">
							{["Furnished", "Unfurnished", "Part-Furnished"].map(
								status => (
									<div
										key={status}
										className="flex items-center gap-2"
									>
										<RadioButton
											inputId={status}
											name="furnishing"
											value={status}
										/>
										<label htmlFor={status}>{status}</label>
									</div>
								)
							)}
						</div>
						<Dropdown
							className="w-full"
							placeholder="Energy Performance Certificate (EPC) Rating"
						/>
						<div className="flex py-4 justify-between">
							<Button
								label="Back"
								icon="pi pi-arrow-left"
								onClick={() =>
									stepperRef.current.prevCallback()
								}
							/>
							<Button
								label="Next"
								icon="pi pi-arrow-right"
								iconPos="right"
								onClick={() =>
									stepperRef.current.nextCallback()
								}
							/>
						</div>
					</div>
				</StepperPanel>

				{/* Step 4: Photos */}
				<StepperPanel header="Photos">
					<div className="space-y-6">
						<label>Photo Upload *</label>
						<FileUpload
							name="photos"
							url="/upload"
							multiple
							accept="image/*"
							className="w-full"
						/>
						<InputText
							className="w-full"
							placeholder="Video Tour Link"
						/>
						<FileUpload
							name="floorplan"
							url="/upload"
							accept="image/png, image/jpeg"
							mode="basic"
							chooseLabel="Choose File"
							className="w-full"
						/>
						<div className="flex py-4 justify-between">
							<Button
								label="Back"
								icon="pi pi-arrow-left"
								onClick={() =>
									stepperRef.current.prevCallback()
								}
							/>
							<Button
								label="Next"
								icon="pi pi-arrow-right"
								iconPos="right"
								onClick={() =>
									stepperRef.current.nextCallback()
								}
							/>
						</div>
					</div>
				</StepperPanel>

				{/* Step 5: Review */}
				<StepperPanel header="Review">
					<div className="space-y-6">
						<div className="bg-[var(--surface-b)] p-4 rounded shadow">
							<h2 className="font-semibold mb-2">
								Property Details Summary
							</h2>
							<p>
								Spacious 2-bed flat with garden | Flat/Apartment
								| 2 Beds | 2 Baths | Fully Furnished
							</p>
						</div>
						<div className="bg-[var(--surface-b)] p-4 rounded shadow">
							<h2 className="font-semibold mb-2">
								Location & Pricing
							</h2>
							<p>
								123 North Street, St Andrews, KY16 9AL |
								£3000/month | £1200 deposit | Available 1st Sep
								2024 | 12 Months | EPC: B
							</p>
						</div>
						<div className="bg-[var(--surface-b)] p-4 rounded shadow">
							<h2 className="font-semibold mb-2">
								Photos & Media
							</h2>
							<p>
								3 photos uploaded • Video tour included • Floor
								plan attached
							</p>
						</div>
						<div className="flex justify-between py-4">
							<Button
								label="Back"
								icon="pi pi-arrow-left"
								onClick={() =>
									stepperRef.current.prevCallback()
								}
							/>
							<div className="flex gap-2">
								<Button
									label="Save as Draft"
									severity="secondary"
								/>
								<Button label="Publish Listing" />
							</div>
						</div>
					</div>
				</StepperPanel>
			</Stepper>
		</div>
	);
}
