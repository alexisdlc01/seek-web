import React, { useEffect } from "react";
import { StepperPanel } from "primereact/stepperpanel";
import { Button } from "primereact/button";

const ReviewPublishStep = ({ back, publish }) => {
	useEffect(() => {
		window.scrollTo({ top: 0, behavior: "smooth" });
	}, []);

	return (
		<>
			<div className="flex flex-col h-24">
				<div className="border-2 border-dashed surface-border border-round surface-ground flex-auto flex justify-center items-center font-medium">
					Please review all information before publishing.
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
					label="Publish Listing"
					icon="pi pi-check"
					onClick={publish}
				/>
			</div>
		</>
	);
};

export default ReviewPublishStep;
