import React, { useEffect } from "react";
import { StepperPanel } from "primereact/stepperpanel";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";

const ReviewPublishStep = ({ back, publish }) => {
	useEffect(() => {
		window.scrollTo({ top: 0, behavior: "smooth" });
	}, []);

	const navigate = useNavigate();

	return (
		<>
			<div className="flex flex-col h-24">
				<div className="border-2 border-dashed surface-border border-round surface-ground flex-auto flex justify-center items-center font-medium">
					Please review all information before publishing.
				</div>
			</div>
			<div className="flex pt-8 justify-between items-center">
				<Button
					label="Back"
					severity="secondary"
					icon="pi pi-arrow-left"
					onClick={back}
				/>

				<div className="flex gap-3">
					<Button
						label="Save Draft"
						icon="pi pi-save"
						className="p-button-secondary"
						onClick={() => navigate("/listings")}
					/>
					<Button
						label="Publish Listing"
						icon="pi pi-check"
						onClick={publish}
					/>
				</div>
			</div>
		</>
	);
};

export default ReviewPublishStep;
