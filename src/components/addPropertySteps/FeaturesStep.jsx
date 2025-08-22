import React from "react";
import { StepperPanel } from "primereact/stepperpanel";
import { RadioButton } from "primereact/radiobutton";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";

const FeaturesStep = ({
	furnishingStatus,
	setFurnishingStatus,
	furnishingOptions,
	epcRating,
	setEpcRating,
	epcOptions,
	back,
	next
}) => {
	return (
				<div style={{
			background: "#0f0f23",
			color: "white"
		}}>
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
									onChange={e =>
										setFurnishingStatus(e.value)
									}
									checked={
										furnishingStatus === option.value
									}
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
						EPC Rating
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

export default FeaturesStep;
