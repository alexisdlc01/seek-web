import React, { useState } from "react";
import { FiMinus, FiPlus } from "react-icons/fi";
import { Button } from "primereact/button";

const ApplicationRequirements = ({
	back,
	next,
	App2requirements
}) => {
	const [requirements, setRequirements] = useState(App2requirements);

	// Remove Requirement
	const removeRequirement = (id) => {
		setRequirements(requirements.filter((item) => item.id !== id));
	};

	// Add New Editable Requirement
	const addRequirement = () => {
		setRequirements([
			...requirements,
			{
				id: Date.now(),
				title: "",
				description: "",
				required: false,
				isEditing: true,
			},
		]);
	};

	// Handle Editing Inputs
	const updateRequirement = (id, field, value) => {
		setRequirements((prev) =>
			prev.map((req) =>
				req.id === id ? { ...req, [field]: value } : req
			)
		);
	};

	// Toggle required/optional
	const toggleRequired = (id) => {
		setRequirements((prev) =>
			prev.map((req) =>
				req.id === id ? { ...req, required: !req.required } : req
			)
		);
	};

	return (
		<div className="min-h-screen bg-[var(--surface-a)] text-[var(--text-color)] px-6 py-5">
			<div className="max-w-5xl mx-auto">
					<label className="font-medium text-white">Application Requirements</label>


				<div className="grid grid-cols-12 text-sm font-semibold border-b border-gray-600 pb-2 mb-4 mt-4">
					<div className="col-span-6">Requirement</div>
					<div className="col-span-2 text-center">Required</div>
					<div className="col-span-2"></div>
				</div>

				{/* Requirements List */}
				<div className="space-y-6">
					{requirements.map((req) => (
						<div key={req.id} className="grid grid-cols-12 items-center gap-2">
							{/* Title + Description */}
							<div className="col-span-6">
								{req.isEditing ? (
									<div className="space-y-2">
										<input
											type="text"
											value={req.title}
											onChange={(e) =>
												updateRequirement(req.id, "title", e.target.value)
											}
											placeholder="Enter requirement title..."
											className="w-full bg-transparent border-b border-gray-500 focus:outline-none"
										/>
										<textarea
											value={req.description}
											onChange={(e) =>
												updateRequirement(req.id, "description", e.target.value)
											}
											placeholder="Enter requirement description..."
											className="w-full bg-transparent border-b border-gray-500 focus:outline-none"
										/>
									</div>
								) : (
									<>
										<p className="font-medium">{req.title}</p>
										<p className="text-sm text-gray-400 cursor-default">
											{req.description}
										</p>
									</>
								)}
							</div>

							{/* Required Toggle */}
							<div className="col-span-2 text-center">
								<button
									onClick={() => toggleRequired(req.id)}
									className={`px-3 py-1 rounded-full text-sm ${
										req.required
											? "bg-[var(--primary-color)] text-white"
											: "bg-gray-700 text-gray-300"
									}`}
								>
									{req.required ? "Required" : "Optional"}
								</button>
							</div>

							{/* Remove */}
							<div className="col-span-2 flex items-center gap-2">
								<button
									onClick={() => removeRequirement(req.id)}
									className="flex items-center gap-1 text-red-400 hover:text-red-500"
								>
									<FiMinus /> Remove
								</button>
							</div>
						</div>
					))}
				</div>

				{/* Add Requirement Button */}
				<button
					onClick={addRequirement}
					className="mt-8 flex items-center gap-2 text-[var(--primary-color)] hover:underline"
				>
					<FiPlus /> Add requirement
				</button>
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

export default ApplicationRequirements;
