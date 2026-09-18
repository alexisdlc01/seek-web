import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { motion } from "framer-motion";
import axios, { AxiosError } from "axios";
import { useNavigate, useParams } from "react-router-dom";
import ListingsContext from "../context/ListingsContext.jsx";

const BASE_URL = import.meta.env.VITE_BASE_URL;

type Applicant = {
	_id: string;
	name: string;
	email?: string;
	profilePicUrl?: string;
};

type ApplicationStage = "NOT_SENT" | "SENT" | "ACCEPTED" | "REJECTED";

type Application = {
	_id: string;
	stage: ApplicationStage;
	createdAt: string;
	conversation?: string | { _id?: string };
	applicants: string[];
	applicantUsers?: Applicant[];
};

const TABS: { stage: ApplicationStage; label: string }[] = [
	{ stage: "SENT", label: "New Applications" },
	{ stage: "ACCEPTED", label: "Approved Applicants" },
	{ stage: "REJECTED", label: "Rejected" }
];

export default function Applicants() {
	const navigate = useNavigate();
	const { listingId } = useParams<{ listingId: string }>();
	const { listings } = useContext(ListingsContext) as { listings: any[] };
	const toast = useRef<Toast>(null);

	const [activeStage, setActiveStage] = useState<ApplicationStage>("SENT");
	const [applications, setApplications] = useState<Application[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [loadError, setLoadError] = useState<string | null>(null);
	const [pendingId, setPendingId] = useState<string | null>(null);

	const listing = listings?.find(l => l._id === listingId);
	const title = listing
		? `Applications - ${listing.streetAddress || listing.propertyTitle}`
		: "Applications";

	const loadApplications = useCallback(async () => {
		if (!listingId) return;
		setIsLoading(true);
		setLoadError(null);
		try {
			const { data } = await axios.get<Application[]>(
				`${BASE_URL}/application/listing/${listingId}`,
				{ withCredentials: true }
			);
			setApplications(data ?? []);
		} catch (error) {
			setLoadError(getErrorMessage(error));
		} finally {
			setIsLoading(false);
		}
	}, [listingId]);

	useEffect(() => {
		loadApplications();
	}, [loadApplications]);

	const updateStage = async (application: Application, action: "approve" | "reject") => {
		setPendingId(application._id);
		try {
			await axios.patch(
				`${BASE_URL}/application/${application._id}/${action}`,
				{},
				{ withCredentials: true }
			);
			await loadApplications();
		} catch (error) {
			toast.current?.show({
				severity: "error",
				summary: action === "approve" ? "Approve failed" : "Reject failed",
				detail: getErrorMessage(error),
				life: 4000
			});
		} finally {
			setPendingId(null);
		}
	};

	const openChat = (application: Application) => {
		const conversationId = getConversationId(application);
		if (!conversationId) {
			toast.current?.show({
				severity: "warn",
				summary: "No conversation",
				detail: "This application has no chat attached to it.",
				life: 3000
			});
			return;
		}
		navigate(`/chat?conversation=${conversationId}`);
	};

	const visible = applications.filter(a => a.stage === activeStage);
	const countFor = (stage: ApplicationStage) =>
		applications.filter(a => a.stage === stage).length;

	const renderApplicationCard = (application: Application) => {
		const applicants = application.applicantUsers ?? [];
		const busy = pendingId === application._id;

		return (
			<motion.div
				key={application._id}
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
						{initialsOf(applicants)}
					</div>
					<div>
						<h2 className="font-semibold text-[var(--text-color)]">
							{formatApplicantNames(applicants)}
						</h2>
						<p className="text-sm text-white">
							Applied {formatDate(application.createdAt)} •{" "}
							{applicants.length || application.applicants.length}{" "}
							{applicants.length === 1 ? "applicant" : "applicants"}
						</p>
						{applicants.some(a => a.email) && (
							<p className="text-sm text-gray-300 truncate">
								{applicants
									.map(a => a.email)
									.filter(Boolean)
									.join(", ")}
							</p>
						)}
					</div>
				</div>

				{/* Action Buttons */}
				<div className="grid sm:grid-cols-3 gap-2 w-full md:w-auto">
					<Button
						label="Chat"
						icon="pi pi-comments"
						outlined
						size="small"
						className="w-full sm:w-auto"
						onClick={() => openChat(application)}
						style={{ color: "white" }}
					/>
					{application.stage !== "ACCEPTED" && (
						<Button
							label="Approve"
							icon="pi pi-check"
							size="small"
							className="w-full sm:w-auto"
							loading={busy}
							onClick={() => updateStage(application, "approve")}
							style={{ color: "white" }}
						/>
					)}
					{application.stage !== "REJECTED" && (
						<Button
							label="Reject"
							icon="pi pi-times"
							severity="danger"
							size="small"
							className="w-full sm:w-auto"
							loading={busy}
							onClick={() => updateStage(application, "reject")}
							style={{ color: "white" }}
						/>
					)}
				</div>
			</motion.div>
		);
	};

	return (
		<div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
			<Toast ref={toast} position="bottom-right" />

			{/* Header */}
			<motion.div
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="mb-6"
			>
				<h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-color)]">
					{title}
				</h1>
			</motion.div>

			{/* Tabs */}
			<div className="flex border-b border-gray-200 mb-6 text-sm font-medium">
				{TABS.map((tab, i) => (
					<div
						key={tab.stage}
						onClick={() => setActiveStage(tab.stage)}
						className={`px-4 py-2 cursor-pointer ${i > 0 ? "ml-4" : ""} ${
							activeStage === tab.stage
								? "text-[var(--primary-color)] border-b-2 border-[var(--primary-color)]"
								: "text-gray-500"
						}`}
					>
						{tab.label} ({countFor(tab.stage)})
					</div>
				))}
			</div>

			{/* Applicant Cards */}
			<div className="space-y-6">
				{isLoading ? (
					<p className="text-sm text-gray-400">Loading applications...</p>
				) : loadError ? (
					<p className="text-sm text-red-400">{loadError}</p>
				) : visible.length === 0 ? (
					<p className="text-sm text-gray-400">
						No {TABS.find(t => t.stage === activeStage)?.label.toLowerCase()} yet.
					</p>
				) : (
					visible.map(renderApplicationCard)
				)}
			</div>
		</div>
	);
}

function getConversationId(application: Application): string | undefined {
	const { conversation } = application;
	if (!conversation) return undefined;
	return typeof conversation === "string" ? conversation : conversation._id;
}

function formatApplicantNames(applicants: Applicant[]): string {
	const names = applicants.map(a => a.name).filter(Boolean);
	if (names.length === 0) return "Applicant";
	if (names.length <= 2) return names.join(" and ");
	return `${names[0]} & ${names.length - 1} others`;
}

function initialsOf(applicants: Applicant[]): string {
	const name = applicants[0]?.name ?? "";
	const initials = name
		.split(" ")
		.map(word => word[0])
		.filter(Boolean)
		.slice(0, 2)
		.join("")
		.toUpperCase();
	return initials || "?";
}

function formatDate(dateStr: string): string {
	return new Date(dateStr).toLocaleDateString([], {
		day: "numeric",
		month: "short",
		year: "numeric"
	});
}

function getErrorMessage(error: unknown): string {
	if (axios.isAxiosError(error)) {
		const axiosError = error as AxiosError<{ message?: string | string[] }>;
		const message = axiosError.response?.data?.message;
		if (Array.isArray(message)) return message.join(", ");
		return message ?? axiosError.message;
	}
	return "Please try again shortly.";
}
