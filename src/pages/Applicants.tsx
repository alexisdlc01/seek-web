import React, { useState } from "react";
import { Button } from "primereact/button";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function Applicants() {
	const navigate = useNavigate()
	const [activeTab, setActiveTab] = useState("new");

	const renderApplicantCard = (applicant, buttons) => (
		<motion.div
			key={applicant.id}
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3 }}
			className="flex flex-col md:flex-row items-center justify-between border border-[var(--surface-border)] rounded-xl px-4 py-5 shadow-sm gap-4"
			style={{
				background: "var(--gray-62)"
			}}
		>
			{/* Avatar and Info */}
			<div className="flex items-start gap-4 w-full md:w-auto">
				<div className="w-12 h-12 rounded-full bg-gray-200 text-[var(--text-color)] flex items-center justify-center font-bold text-sm">
					{applicant.initials}
				</div>
				<div>
					<h2 className="font-semibold text-[var(--text-color)]">
						{applicant.names}
					</h2>
					<p className="text-sm text-white">
						{applicant.genders} • {applicant.degrees} •{" "}
						{applicant.years}
					</p>
				</div>
			</div>

			{/* Action Buttons */}
			<div className="grid sm:grid-cols-3 gap-2 w-full md:w-auto">
				<Button
					label="View Profile"
					outlined
					size="small"
					className="w-full sm:w-auto"
					onClick={() => navigate("/application")}
					style={{
						color: "white",
					}}
				/>

				<Button
					label="Approve"
					size="small"
					className="w-full sm:w-auto"
					style={{
						color: "white",
					}}
				/>
				<Button
					label="Reject"
					severity="danger"
					size="small"
					className="w-full sm:w-auto"
					style={{
						color: "white",
					}}
				/>
			</div>
		</motion.div>
	);

	return (
		<div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
			{/* Header */}
			<motion.div
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="mb-6"
			>
				<h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-color)]">
					Applications - 14 North Street
				</h1>
			</motion.div>

			{/* Tabs */}
			<div className="flex border-b border-gray-200 mb-6 text-sm font-medium">
				<div
					onClick={() => setActiveTab("new")}
					className={`px-4 py-2 cursor-pointer ${
						activeTab === "new"
							? "text-[var(--primary-color)] border-b-2 border-[var(--primary-color)]"
							: "text-gray-500"
					}`}
				>
					New Applications ({newApplicants.length})
				</div>
				<div
					onClick={() => setActiveTab("approved")}
					className={`px-4 py-2 cursor-pointer ml-4 ${
						activeTab === "approved"
							? "text-[var(--primary-color)] border-b-2 border-[var(--primary-color)]"
							: "text-gray-500"
					}`}
				>
					Approved Applicants ({approvedApplicants.length})
				</div>
			</div>

			{/* Applicant Cards */}
			<div className="space-y-6">
				{activeTab === "new"
					? newApplicants.map(a =>
							renderApplicantCard(a, [
								{
									label: "View Profile",
									icon: "pi pi-user",
									severity: "primary",
									onClick: () => navigate("/application")
								},
								{
									label: "Approve",
									icon: "pi pi-check",
									severity: "primary"
								}
							])
					  )
					: approvedApplicants.map(a =>
							renderApplicantCard(a, [
								{
									label: "Chat",
									icon: "pi pi-comments",
									severity: "primary",
									onClick: () => navigate("/chat")
								},
								{
									label: "Reject Application",
									icon: "pi pi-times",
									severity: "danger"
								}
							])
					  )}
			</div>
		</div>
	);
}

var newApplicants = [
	{
		id: 1,
		initials: "ES",
		names: "Emma Smith and Ethan Smith",
		genders: "Female & Male",
		degrees: "Economics and Finance Students",
		years: "3rd Years"
	},
	{
		id: 2,
		initials: "JM",
		names: "James Miller & 3 Others",
		genders: "All Male",
		degrees: "Math and Computer Science Students",
		years: "2nd Year & 3rd Years"
	}
];

var approvedApplicants = [
	{
		id: 3,
		initials: "SC",
		names: "Sarah Chen and Olivia Green",
		genders: "Both Female",
		degrees: "Psychology and Biology Students",
		years: "4th Years"
	}
];
