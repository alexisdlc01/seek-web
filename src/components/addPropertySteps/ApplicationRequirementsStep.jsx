import React, { useState } from "react";
import { FiMinus, FiPlus } from "react-icons/fi";
import { Button } from "primereact/button";
import { InputNumber } from "primereact/inputnumber";

const GUARANTOR_OPTIONS = [
	["UK_ONLY", "UK guarantor only"],
	["UK_OR_SERVICE", "UK guarantor or guarantor service"],
	["NONE", "Not needed"]
];

const PLAN_OPTIONS = [
	["MONTHLY", "Monthly (autopay or reminder)"],
	["SIX_MONTHS", "Half-year upfront"],
	["YEARLY", "Full year upfront"]
];

const slotLabel = iso =>
	new Date(iso).toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

const ApplicationRequirements = ({
	back,
	next,
	App2requirements,
	setRequirements,
	numOfPeople = 0,
	rent,
	setRent,
	deposit,
	setDeposit,
	holdingDeposit,
	setHoldingDeposit,
	criteria,
	setCriteria,
	paymentPlans,
	setPaymentPlans,
	viewingSlots = [],
	setViewingSlots,
	viewingSlotCapacity,
	setViewingSlotCapacity,
	nation,
	billsIncluded,
	setBillsIncluded
}) => {
	// The listing stores whole-property totals in pounds; landlords think per
	// room, so the inputs below are per room (total = per room x people).
	const people = Math.max(1, Number(numOfPeople) || 1);
	const perRoomRent = rent ? Math.round(rent / people) : null;
	const perRoomDeposit = deposit ? Math.round(deposit / people) : null;
	const england = nation === "ENGLAND";
	// Holding deposit max one week, security deposit max five weeks.
	const weekly = perRoomRent ? Math.floor((perRoomRent * 12) / 52) : 0;
	const depositCap = perRoomRent ? Math.floor(((perRoomRent * 12) / 52) * 5) : 0; // same as backend compliance.ts
	const plans = england ? ["MONTHLY"] : paymentPlans?.length ? paymentPlans : ["MONTHLY"];
	const togglePlan = plan => {
		if (plan === "MONTHLY") return;
		setPaymentPlans(plans.includes(plan) ? plans.filter(p => p !== plan) : [...plans, plan]);
	};

	const [newSlot, setNewSlot] = useState("");
	const addSlot = () => {
		const iso = newSlot ? new Date(newSlot).toISOString() : "";
		if (iso && !viewingSlots.includes(iso)) setViewingSlots([...viewingSlots, iso].sort());
		setNewSlot("");
	};

	// Remove Requirement
	const removeRequirement = (id) => {
		if (id == null) {
			throw new Error("null id in remove requirment");
		}
		setRequirements(App2requirements.filter((item) => item.id !== id));
	};

	// Add New Editable Requirement
	const addRequirement = () => {
		setRequirements([
			...App2requirements,
			{
				id: Date.now(),
				name: "",
				desc: "",
				required: false,
				isEditing: true,
			},
		]);
	};

	// Handle Editing Inputs
	const updateRequirement = (id, field, value) => {
		if (id == null) {
			throw new Error("null id in remove requirment");
		}
		setRequirements((prev) =>
			prev.map((req) =>
				req.id === id ? { ...req, [field]: value } : req
			)
		);
	};

	// Toggle required/optional
	const toggleRequired = (id) => {
		if (id == null) {
			throw new Error("null id in update requirment");
		}
		setRequirements((prev) =>
			prev.map((req) =>
				req.id === id ? { ...req, required: !req.required } : req
			)
		);
	};

	return (
		<div className="listing-flow-surface min-h-screen bg-sk-bg px-6 py-5 text-sk-text">
			<div className="max-w-5xl mx-auto">
				<h3 className="text-lg font-semibold">Who can apply</h3>
				<p className="mb-3 text-sm text-sk-text2">
					Seek checks these from each student's passport. Households that pass are ranked first come, first served.
				</p>
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-3" data-testid="who-can-apply">
					<div className="flex flex-col gap-1.5 rounded-xl bg-sk-card2 p-3 text-sm">
						<span className="font-semibold">Right to Rent check</span>
						<span className="text-sk-muted">Required by law, always on.</span>
					</div>
					<div className="flex flex-col gap-1.5">
						<label htmlFor="guarantor" className="text-sm font-semibold">Guarantor</label>
						<select
							id="guarantor"
							value={criteria.guarantor}
							onChange={e => setCriteria({ ...criteria, guarantor: e.target.value })}
							className="h-10 rounded-lg border border-sk-border2 bg-sk-card px-2 text-sm text-sk-text"
						>
							{GUARANTOR_OPTIONS.map(([v, l]) => (
								<option key={v} value={v}>{l}</option>
							))}
						</select>
					</div>
					<div className="flex flex-col gap-1.5">
						<label htmlFor="maxHousehold" className="text-sm font-semibold">Household size</label>
						<InputNumber
							inputId="maxHousehold"
							value={criteria.maxHousehold ?? null}
							onValueChange={e => setCriteria({ ...criteria, maxHousehold: e.value ?? undefined })}
							min={1}
							max={20}
							placeholder={`Up to ${people}`}
						/>
					</div>
				</div>
				<label className="mt-3 flex items-center gap-2 text-sm">
					<input
						type="checkbox"
						checked={!!criteria.referencesRequired}
						onChange={e => setCriteria({ ...criteria, referencesRequired: e.target.checked })}
					/>
					References required (previous landlord, if any)
				</label>
				<div className="mt-4 rounded-xl bg-sk-card2 p-3 text-sm" data-testid="criteria-preview">
					<span className="font-semibold">How students see it</span>
					<ul className="m-0 mt-1.5 flex list-disc flex-col gap-1 pl-[18px] text-sk-text2">
						<li>Right to Rent check</li>
						<li>{GUARANTOR_OPTIONS.find(([v]) => v === criteria.guarantor)?.[1] ?? "Guarantor not needed"}</li>
						<li>Household of up to {criteria.maxHousehold ?? people}</li>
						{criteria.referencesRequired && <li>Previous landlord reference</li>}
					</ul>
				</div>

				<label className="mt-8 block text-lg font-semibold">Application requirements</label>


				<div className="grid grid-cols-12 text-sm font-semibold border-b border-sk-border pb-2 mb-4 mt-4">
					<div className="col-span-6 listing-flow-text-muted">Requirement</div>
					<div className="col-span-2 text-center listing-flow-text-muted">Required</div>
					<div className="col-span-2"></div>
				</div>

				{/* Requirements List */}
				<div className="space-y-6">
					{App2requirements.map((req) => (
						<div key={req.id} className="grid grid-cols-12 items-center gap-2">
							{/* Title + Description */}
							<div className="col-span-6">
								{req.isEditing ? (
									<div className="space-y-2">
										<input
											type="text"
											value={req.name}
											onChange={(e) =>
												updateRequirement(req.id, "name", e.target.value)
											}
											placeholder="Enter requirement title..."
											className="w-full bg-transparent border-b border-sk-border2 focus:outline-none"
										/>
										<textarea
											value={req.desc}
											onChange={(e) =>
												updateRequirement(req.id, "desc", e.target.value)
											}
											placeholder="Enter requirement description..."
											className="w-full bg-transparent border-b border-sk-border2 focus:outline-none"
										/>
									</div>
								) : (
									<>
										<p className="font-medium">{req.name}</p>
										<p className="text-sm listing-flow-text-muted cursor-default">
											{req.desc}
										</p>
									</>
								)}
							</div>

							{/* Required Toggle */}
							<div className="col-span-2 text-center">
								<button
									onClick={() => toggleRequired(req.id)}
									className={`px-3 py-1 rounded-full text-sm ${req.required
											? "bg-sk-accent text-sk-on-accent"
											: "bg-sk-hair text-sk-text2"
										}`}
								>
									{req.required ? "Required" : "Optional"}
								</button>
							</div>

							{/* Remove */}
							<div className="col-span-2 flex items-center gap-2">
								<button
									onClick={() => removeRequirement(req.id)}
									className="flex items-center gap-1 text-sk-danger"
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
					className="mt-8 flex items-center gap-2 listing-flow-action-text"
				>
					<FiPlus /> Add requirement
				</button>

				<div className="mt-10 flex flex-col gap-3" data-testid="viewing-slots">
					<h3 className="text-lg font-semibold">Viewing slots</h3>
					<p className="text-sm text-sk-text2">
						Offer fixed times and qualified households pick one. Leave empty to arrange viewings by message.
					</p>
					<div className="flex flex-wrap items-end gap-2">
						<label className="flex flex-col gap-1 text-xs text-sk-muted">
							Date and time
							<input
								type="datetime-local"
								value={newSlot}
								onChange={e => setNewSlot(e.target.value)}
								className="h-10 rounded-lg border border-sk-border2 bg-sk-card px-2 text-sm text-sk-text"
							/>
						</label>
						<button type="button" onClick={addSlot} disabled={!newSlot} className="h-10 rounded-lg border border-sk-border2 px-3 text-sm disabled:opacity-50">
							Add slot
						</button>
						<label className="ml-auto flex flex-col gap-1 text-xs text-sk-muted">
							Households per slot
							<InputNumber
								inputId="slotCapacity"
								value={viewingSlotCapacity ?? 2}
								onValueChange={e => setViewingSlotCapacity(e.value ?? 1)}
								min={1}
								max={20}
								showButtons
							/>
						</label>
					</div>
					<div className="flex flex-wrap gap-2">
						{viewingSlots.map(slot => (
							<span key={slot} className="flex items-center gap-2 rounded-full bg-sk-card2 py-1 pl-3 pr-1 text-[13px]">
								{slotLabel(slot)}
								<button
									type="button"
									aria-label={`Remove ${slotLabel(slot)}`}
									onClick={() => setViewingSlots(viewingSlots.filter(x => x !== slot))}
									className="flex h-7 w-7 items-center justify-center rounded-full text-sk-danger"
								>
									<FiMinus />
								</button>
							</span>
						))}
					</div>
				</div>

				<div className="mt-10 flex flex-col gap-4" data-testid="rent-and-plans">
					<h3 className="text-lg font-semibold">Rent and payment plans</h3>
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div className="flex flex-col gap-1.5">
							<label htmlFor="rentPerRoom" className="text-sm font-semibold">Rent per room (per month)</label>
							<InputNumber
								inputId="rentPerRoom"
								value={perRoomRent}
								onValueChange={e => setRent(e.value ? e.value * people : null)}
								mode="currency"
								currency="GBP"
								locale="en-GB"
								min={0}
							/>
							<span className="text-xs text-sk-muted">
								Fixed price, no bidding. {people} {people === 1 ? "room" : "rooms"}
								{rent ? `, £${Number(rent).toLocaleString("en-GB")} a month in total` : ""}.
							</span>
						</div>
						<label className="flex items-center gap-2 self-end pb-2 text-sm font-semibold">
							<input
								type="checkbox"
								checked={!!billsIncluded}
								onChange={e => setBillsIncluded(e.target.checked)}
							/>
							Bills included
						</label>
					</div>

					<div className="flex flex-col gap-1.5">
						<span className="text-sm font-semibold">Plans you offer</span>
						<div className="flex flex-wrap gap-2" role="group" aria-label="Plans you offer">
							{PLAN_OPTIONS.map(([v, l]) => {
								const on = plans.includes(v);
								const locked = v === "MONTHLY" || (england && v !== "MONTHLY");
								return (
									<button
										key={v}
										type="button"
										aria-pressed={on}
										disabled={locked}
										onClick={() => togglePlan(v)}
										className={`h-9 rounded-full px-3.5 text-[13px] ${on ? "border-none bg-sk-accent font-semibold text-sk-on-accent" : "border border-sk-border2 bg-transparent text-sk-text"} ${locked && !on ? "opacity-50" : ""}`}
									>
										{l}
									</button>
								);
							})}
						</div>
						<span className="text-xs text-sk-muted">
							England: rent in advance is capped at one month for new tenancies, so only monthly is available. Half-year and full-year stay available for properties in Wales and Scotland.
						</span>
					</div>

					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div className="flex flex-col gap-1.5">
							<label htmlFor="holdingDeposit" className="text-sm font-semibold">Holding deposit, per room</label>
							<InputNumber
								inputId="holdingDeposit"
								value={holdingDeposit ?? null}
								onValueChange={e => setHoldingDeposit(e.value ?? null)}
								mode="currency"
								currency="GBP"
								locale="en-GB"
								min={0}
								max={weekly || undefined}
							/>
							<span className="text-xs text-sk-muted">
								Max one week{weekly ? ` (${"£" + weekly.toLocaleString("en-GB")})` : ""}. Counts toward first rent.
							</span>
						</div>
						<div className="flex flex-col gap-1.5">
							<label htmlFor="securityDeposit" className="text-sm font-semibold">Security deposit, per room</label>
							<InputNumber
								inputId="securityDeposit"
								value={perRoomDeposit}
								onValueChange={e => setDeposit(e.value ? e.value * people : null)}
								mode="currency"
								currency="GBP"
								locale="en-GB"
								min={0}
								max={depositCap || undefined}
							/>
							<span className="text-xs text-sk-muted">
								Max five weeks{depositCap ? ` (${"£" + depositCap.toLocaleString("en-GB")})` : ""}. Protected with a government-approved scheme by Seek.
							</span>
						</div>
					</div>
				</div>
			</div>
			<div className="flex pt-8 justify-between">
				<Button
					label="Back"
					severity="secondary"
					icon="pi pi-arrow-left"
					className="listing-flow-action-button listing-flow-action-button--secondary px-4 py-2.5"
					onClick={back}
				/>
				<Button
					label="Continue to review"
					icon="pi pi-arrow-right"
					iconPos="right"
					className="listing-flow-action-button px-4 py-2.5"
					onClick={next}
				/>
			</div>
		</div>
	);
};

export default ApplicationRequirements;
