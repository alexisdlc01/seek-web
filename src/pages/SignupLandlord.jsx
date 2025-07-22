import React, { useState } from "react";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { FloatLabel } from "primereact/floatlabel";
import { Button } from "primereact/button";
import { Divider } from "primereact/divider";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function SignUpLandlord() {
	const navigate = useNavigate();
	const [email, setEmail] = useState("");
	const [pwd, setPwd] = useState("");
	const [confirmPwd, setConfirmPwd] = useState("");
	const [confirm, setConfirm] = useState("");

	return (
		<div className="min-h-screen bg-[var(--surface-a)] flex items-center justify-center px-4">
			<motion.div
				initial={{ opacity: 0, y: 30 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="w-full max-w-md bg-white rounded-xl shadow-md p-8 space-y-6 border border-[var(--surface-border)]"
			>
				<h1 className="text-center text-2xl font-bold text-[var(--primary-color)]">
					Create Landlord Account
				</h1>

				<FloatLabel className="mt-5">
					<InputText
						id="email"
						value={email}
						onChange={e => setEmail(e.target.value)}
						className="w-full p-3 text-lg"
					/>
					<label htmlFor="email" className="ml-2">
						Email
					</label>
				</FloatLabel>

				<FloatLabel>
					<Password
						inputId="confirm"
						value={confirm}
						onChange={e => setConfirm(e.target.value)}
						feedback={false}
						className="w-full"
						inputClassName="w-full border border-[var(--surface-border)] rounded-md px-3 py-2"
					/>
					<label htmlFor="confirm">Password</label>
				</FloatLabel>

				<FloatLabel>
					<Password
						inputId="confirmPwd"
						value={confirmPwd}
						onChange={e => setConfirmPwd(e.target.value)}
						feedback={false}
						className="w-full"
						inputClassName="w-full border border-[var(--surface-border)] rounded-md px-3 py-2"
					/>
					<label htmlFor="confirmPwd">Confirm Password</label>
				</FloatLabel>

				<motion.div whileHover={{ scale: 1.02 }}>
					<Button
						label="Create Account"
						className="w-full bg-[var(--primary-color)] text-[var(--primary-color-text)] font-medium"
						onClick={() => navigate("/landlord")}
					/>
				</motion.div>

				<Divider layout="horizontal">
					<span className="text-sm text-[var(--text-color-secondary)]">
						or sign up with
					</span>
				</Divider>

				<div className="flex flex-col gap-2">
					<motion.div whileHover={{ scale: 1.02 }}>
						<Button
							label="Sign up with Google"
							icon="pi pi-google"
							className="w-full border border-gray-300 text-gray-800 bg-white"
							onClick={() => navigate("/landlord")}
						/>
					</motion.div>
					<motion.div whileHover={{ scale: 1.02 }}>
						<Button
							label="Sign up with Apple"
							icon="pi pi-apple"
							className="w-full border border-gray-300 text-gray-800 bg-white"
							onClick={() => navigate("/landlord")}
						/>
					</motion.div>
				</div>

				<motion.p
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4, delay: 0.2 }}
					className="text-sm text-center text-[var(--text-color-secondary)]"
				>
					Already have an account?{" "}
					<Link
						to="/signin/landlord"
						className="text-[var(--primary-color)] font-medium"
					>
						Login
					</Link>
				</motion.p>
			</motion.div>
		</div>
	);
}
