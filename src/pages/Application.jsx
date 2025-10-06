import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { motion } from "framer-motion";
import { ConfirmPopup, confirmPopup } from "primereact/confirmpopup";
import { Toast } from "primereact/toast";

export default function ApplicationPage() {
	const navigate = useNavigate();

	// Hardcoded dummy applicant data
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
	const toast = useRef(null);

	const accept = () => {
		toast.current.show({ severity: 'info', summary: 'Confirmed', detail: 'You have accepted', life: 3000 });
	};

	const reject = () => {
		toast.current.show({ severity: 'warn', summary: 'Rejected', detail: 'You have rejected', life: 3000 });
	};

	const confirm1 = (event) => {
		confirmPopup({
			target: event.currentTarget,
			message: 'Are you sure you want to approve?',
			icon: 'pi pi-exclamation-triangle',
			defaultFocus: 'accept',
			accept,
			reject
		});
	};

	const confirm2 = (event) => {
		confirmPopup({
			target: event.currentTarget,
			message: 'Are you sure you want to reject?',
			icon: 'pi pi-info-circle',
			defaultFocus: 'reject',
			acceptClassName: 'p-button-danger',
			accept,
			reject
		});
	};


	const { initials, names, genders, degrees, years, letters } = applicant;

	return (
		<div className="min-h-screen bg-white px-4 py-8 sm:px-6 lg:px-12">
			<Toast ref={toast} />
			<ConfirmPopup />
			<h1 className="text-3xl font-bold text-[var(--text-color)] mb-6">
				Application Details
			</h1>

			{/* Profile Card */}
			<div className="bg-white border border-[var(--surface-border)] rounded-xl p-6 shadow-sm mb-10">
				<div className="flex items-center gap-4 mb-4">
					<div className="w-14 h-14 rounded-full bg-gray-200 text-[var(--text-color)] flex items-center justify-center font-bold text-base">
						{initials}
					</div>
					<div>
						<h2 className="text-xl font-semibold">{names}</h2>
						<p className="text-gray-600 text-sm">
							{genders} • {degrees} • {years}
						</p>
					</div>
				</div>

				{/* Letters of Recommendation */}
				<div className="mt-6">
					<h3 className="font-semibold text-[var(--text-color)] mb-2">
						Letters of Recommendation
					</h3>
					<ul className="list-disc list-inside text-sm text-blue-600 space-y-1">
						{letters.map((letter, index) => (
							<li key={index}>
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

			{/* Action Buttons */}
			<div className="flex flex-wrap gap-3 mb-6">
				<Button
					label="Approve"
					icon="pi pi-check"
					className="border border-green-600 text-green-600 bg-transparent px-4 py-2 rounded-lg hover:bg-green-50 transition"
					outlined
					onClick={confirm1}
				/>
				<Button
					label="Ignore for Now"
					icon="pi pi-clock"
					className="border border-gray-500 text-gray-600 bg-transparent px-4 py-2 rounded-lg hover:bg-gray-50 transition"
					outlined
					onClick={() => navigate("/applicants")}
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
					onClick={() => navigate("/applicants")}
				/>
			</div>
		</div>
	);
}
