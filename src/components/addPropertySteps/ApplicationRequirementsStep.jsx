import React, { useState } from "react";
import { FiMinus, FiPlus } from "react-icons/fi";
import { Button } from "primereact/button";

const ApplicationRequirements = ({
	back,
	next,
	App2requirements,
	setRequirements
}) => {
	// Remove Requirement
	const removeRequirement = (id) => {
		console.log("REMOVING REQUIRMENTS!!!!!!", App2requirements);
		if (id == null) {
			throw new Error("null id in remove requirment");
		}
		setRequirements(App2requirements.filter((item) => item._id !== id));
	};

	// Add New Editable Requirement
	const addRequirement = () => {
		setRequirements([
			...App2requirements,
			{
				_id: Date.now(),
				name: "",
				desc: "",
				required: false,
				isEditing: true,
			},
		]);
	};

	// Handle Editing Inputs
	const updateRequirement = (id, field, value) => {
		console.log("update name", "id:", id, "field:", field, "value:", value);
		if (id == null) {
			throw new Error("null id in remove requirment");
		}
		setRequirements((prev) =>
			prev.map((req) =>
				req._id === id ? { ...req, [field]: value } : req
			)
		);
	};

	// Toggle required/optional
	const toggleRequired = (id) => {
		console.log("toggle name", "id:", id);
		if (id == null) {
			throw new Error("null id in update requirment");
		}
		setRequirements((prev) =>
			prev.map((req) =>
				req._id === id ? { ...req, required: !req.required } : req
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
					{App2requirements.map((req) => (
						<div key={req._id} className="grid grid-cols-12 items-center gap-2">
							{/* Title + Description */}
							<div className="col-span-6">
								{req.isEditing ? (
									<div className="space-y-2">
										<input
											type="text"
											value={req.name}
											onChange={(e) =>
												updateRequirement(req._id, "name", e.target.value)
											}
											placeholder="Enter requirement title..."
											className="w-full bg-transparent border-b border-gray-500 focus:outline-none"
										/>
										<textarea
											value={req.desc}
											onChange={(e) =>
												updateRequirement(req._id, "desc", e.target.value)
											}
											placeholder="Enter requirement description..."
											className="w-full bg-transparent border-b border-gray-500 focus:outline-none"
										/>
									</div>
								) : (
									<>
										<p className="font-medium">{req.name}</p>
										<p className="text-sm text-gray-400 cursor-default">
											{req.desc}
										</p>
									</>
								)}
							</div>

							{/* Required Toggle */}
							<div className="col-span-2 text-center">
								<button
									onClick={() => toggleRequired(req._id)}
									className={`px-3 py-1 rounded-full text-sm ${req.required
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
									onClick={() => removeRequirement(req._id)}
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
