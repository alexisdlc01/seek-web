import React, { useEffect } from "react";
import { StepperPanel } from "primereact/stepperpanel";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";

const LocationAvailabilityStep = ({
	rent,
	setRent,
	deposit,
	setDeposit,
	availabilityDate,
	endAvailabilityDate,
	setEndAvailabilityDate,
	setAvailabilityDate,
	back,
	next
}) => {
	useEffect(() => {
		window.scrollTo({ top: 0, behavior: "smooth" });
	}, []);

	return (
		<div
			style={{
				background: "#0f0f23",
				color: "white"
			}}
		>
			<div className="space-y-4">
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
