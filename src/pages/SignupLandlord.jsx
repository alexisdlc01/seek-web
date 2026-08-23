import { Button } from "primereact/button";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import BackgroundBubbles from "../components/BackgroundBubbles.jsx";

export default function LandlordAccountAccess() {
	const navigate = useNavigate();

	return (
		<div className="relative overflow-hidden min-h-screen bg-[var(--surface-a)] flex items-center justify-center px-4">
			<BackgroundBubbles count={20} color="#8B5CF6" />
			<motion.div
				initial={{ opacity: 0, y: 30 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="relative z-10 w-full max-w-md rounded-xl border border-[var(--surface-border)] bg-white p-8 text-center shadow-md"
			>
				<h1 className="text-2xl font-bold text-[var(--primary-color)]">
					Landlord and Agency Access
				</h1>
				<p className="mt-4 text-[var(--text-color-secondary)]">
					These accounts are created by Seek administrators. If your
					organisation needs access, contact us and we will help you get
					started.
				</p>
				<div className="mt-8 flex flex-col gap-3">
					<Button
						label="Sign in to an existing account"
						onClick={() => navigate("/signin/landlord")}
					/>
					<Button
						label="Contact Seek"
						outlined
						onClick={() => navigate("/contact")}
					/>
				</div>
			</motion.div>
		</div>
	);
}
