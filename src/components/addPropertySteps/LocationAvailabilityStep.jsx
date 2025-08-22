import React from "react";
import { StepperPanel } from "primereact/stepperpanel";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";

const LocationAvailabilityStep = ({
	street,
	setStreet,
	city,
	setCity,
	postcode,
	setPostcode,
	country,
	setCountry,
	rent,
	setRent,
	deposit,
	setDeposit,
	availabilityDate,
	endAvailabilityDate,
	setEndAvailabilityDate,
	setAvailabilityDate,
	leaseDuration,
	setLeaseDuration,
	leaseOptions,
	back,
	next
}) => {
	return (
		<div
			style={{
				background: "#0f0f23",
				color: "white"
			}}
		>
			<div className="space-y-4">
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
			<div className="flex pt-8 justify-between">
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
		</div>
	);
};

export default LocationAvailabilityStep;
