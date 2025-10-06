import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { motion } from "framer-motion";
import { ConfirmPopup, confirmPopup } from "primereact/confirmpopup";
import { Toast } from "primereact/toast";
import { Dialog } from "primereact/dialog";
import { InputTextarea } from "primereact/inputtextarea";

export default function ApplicationPage() {
	const navigate = useNavigate();
	const toast = useRef(null);
	const [visible, setVisible] = useState(false);
	const [reportMsg, setReportMsg] = useState("");

	const applicant = {
		initials: "ES",
		names: "Emma Smith and Ethan Smith",
		genders: "Female & Male",
		degrees: "Economics and Finance Students",
		years: "3rd Years",
		letters: [
			{ name: "Letter from Dr. A. Smith", url: "/files/letter1.pdf" },
			{ name: "Letter from Prof. J. Brown", url: "/files/letter2.pdf" }
		]
	};

	const accept = () => {
		toast.current.show({
			severity: "warn",
			summary: "Rejected",
			detail: "You have rejected the application",
			life: 3000
		});
	};

	const confirm2 = event => {
		confirmPopup({
			target: event.currentTarget,
			message: "Are you sure you want to reject the application?",
			icon: "pi pi-info-circle",
			defaultFocus: "reject",
			acceptClassName: "p-button-danger",
			accept
		});
	};

	const submitReport = () => {
		toast.current.show({
			severity: "info",
			summary: "Report Submitted",
			detail: `Your report has been submitted.`,
			life: 4000
		});
		setVisible(false);
		setReportMsg("");
	};

	const { names, genders, degrees, years, letters } = applicant;

	return (
		<div className="min-h-screen px-4 py-8 sm:px-6 lg:px-12">
			<Toast ref={toast} />
			<ConfirmPopup />

			<h1 className="text-3xl font-bold text-[var(--text-color)] mb-6">
				Application Details
			</h1>

			<div
				className="border border-[var(--surface-border)] rounded-xl p-6 shadow-sm mb-10"
				style={{ background: "var(--gray-62)" }}
			>
				<div className="flex items-center gap-4 mb-4">
					<div>
						<h2 className="text-xl font-semibold">{names}</h2>
						<p className="text-gray-200 text-sm">
							{genders} • {degrees} • {years}
						</p>
					</div>
				</div>

				<div className="mt-6">
					<h3 className="font-semibold text-[var(--text-color)] mb-2">
						Letters of Recommendation
					</h3>
					<ul className="list-disc list-inside text-sm space-y-1">
						{letters.map((letter, i) => (
							<li key={i}>
								<a
									href={letter.url}
									download
									className="underline"
								>
									{letter.name}
								</a>
							</li>
						))}
					</ul>
				</div>
			</div>

			<div className="flex flex-wrap gap-3 mb-6">
				<Button
					label="Approve"
					icon="pi pi-check"
					className="border border-green-600 text-green-600 bg-transparent px-4 py-2 rounded-lg hover:bg-green-50 transition"
					outlined
				/>
				<Button
					label="Reject"
					icon="pi pi-times"
					className="border border-red-600 text-red-600 bg-transparent px-4 py-2 rounded-lg hover:bg-red-50 transition"
					outlined
					onClick={confirm2}
				/>
				<Button
					label="Report"
					icon="pi pi-flag"
					className="border border-yellow-500 text-yellow-600 bg-transparent px-4 py-2 rounded-lg hover:bg-yellow-50 transition"
					outlined
					onClick={() => setVisible(true)}
				/>
			</div>

			<Dialog
				header="Report Applicant"
				draggable={false}
				visible={visible}
				style={{
					width: "30rem"
				}}
				className="rounded-xl shadow-lg border border-[var(--surface-border)]"
				modal
				onHide={() => setVisible(false)}
				footer={
					<div className="flex justify-end gap-2">
						<Button
							label="Cancel"
							severity="secondary"
							onClick={() => setVisible(false)}
						/>
						<Button
							label="Submit Report"
							icon="pi pi-check"
							onClick={submitReport}
							disabled={!reportMsg.trim()}
						/>
					</div>
				}
			>
				<p className="mb-3 text-[var(--text-color-secondary)]">
					Please describe your reason for reporting this application:
				</p>
				<InputTextarea
					autoFocus
					value={reportMsg}
					onChange={e => setReportMsg(e.target.value)}
					rows={5}
					className="w-full"
					placeholder="Type your report message here..."
				/>
			</Dialog>
		</div>
	);
}
