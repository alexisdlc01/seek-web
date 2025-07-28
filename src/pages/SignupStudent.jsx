import React, { useContext, useRef, useState } from "react";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { FloatLabel } from "primereact/floatlabel";
import { Button } from "primereact/button";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import UserContext from "../context/UserContext.jsx";
import { Toast } from "primereact/toast";

export default function SignUpLandlord() {
	const { signup } = useContext(UserContext);
	const [email, setEmail] = useState("");
	const [name, setName] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const navigate = useNavigate();
	const toast = useRef(null);

	const showError = detail => {
		toast.current.show({
			severity: "error",
			summary: "Error",
			detail,
			life: 3000
		});
	};

	const validateName = () => {
		const nameParts = name.trim().split(/\s+/);

		if (nameParts.length !== 2) {
			showError(
				"Please enter exactly your first and last name, eg: Tom Flag"
			);
			return false;
		} else {
			return true;
		}
	};

	const validateEmail = () => {
		const regex = /^[a-zA-Z0-9._-]+$/;

		if (!email.trim()) {
			showError("Email is required.");
			return false;
		}

		if (!regex.test(email)) {
			showError(
				"Please enter only your email prefix (before @st-andrews.ac.uk)"
			);
			return false;
		}

		return true;
	};

	const validatePasswords = () => {
		if (!password || !confirmPassword) {
			showError("Please enter both password fields.");
			return false;
		}

		if (password !== confirmPassword) {
			showError("Passwords do not match.");
			return false;
		}

		const strongPasswordRegex =
			/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
		if (!strongPasswordRegex.test(password)) {
			showError(
				"Password must be at least 8 characters, with uppercase, lowercase, number, and symbol."
			);
			return false;
		}

		return true;
	};

	const handleSubmit = async e => {
		e.preventDefault();

		if (!validateName()) return;
		if (!validateEmail()) return;
		if (!validatePasswords()) return;

		await signup(name, `${email}@st-andrews.ac.uk`, password, "STUDENT");
		navigate("/activationSent");
	};

	return (
		<form
			className="min-h-screen bg-[var(--surface-a)] flex items-center justify-center px-4"
			onSubmit={handleSubmit}
		>
			<motion.div
				initial={{ opacity: 0, y: 30 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="w-full max-w-md bg-white rounded-xl shadow-md p-8 space-y-6 border border-[var(--surface-border)]"
			>
				<h1 className="text-center text-2xl font-bold text-[var(--primary-color)] mb-8">
					Create Student Account
				</h1>

				<div className="hidden sm:block">
					<FloatLabel className="w-full mb-8">
						<div className="p-inputgroup w-full">
							<InputText
								id="name"
								value={name}
								onChange={e => setName(e.target.value)}
								className="w-full"
							/>
						</div>
						<label htmlFor="name">First and last name</label>
					</FloatLabel>
				</div>

				<div className="hidden sm:block">
					<FloatLabel className="w-full mb-8">
						<div className="p-inputgroup w-full">
							<InputText
								id="email"
								value={email}
								onChange={e => setEmail(e.target.value)}
								className="w-full"
							/>
							<span className="p-inputgroup-addon">
								@st-andrews.ac.uk
							</span>
						</div>
						<label htmlFor="email">St Andrews Email</label>
					</FloatLabel>
				</div>

				{/* Mobile version */}
				<div className="block sm:hidden">
					<FloatLabel className="w-full mb-8">
						<InputText
							id="emailMobile"
							value={email}
							onChange={e => setEmail(e.target.value)}
							className="w-full"
						/>
						<label htmlFor="emailMobile">
							St Andrews Email Username
						</label>
					</FloatLabel>
					<div className="p-inputgroup-addon w-full mt-2 text-center rounded bg-[var(--surface-c)] text-[var(--text-color)] py-2 text-sm">
						@st-andrews.ac.uk
					</div>
				</div>

				<FloatLabel className={"mb-8"}>
					<Password
						inputId="password"
						value={password}
						onChange={e => setPassword(e.target.value)}
						feedback={false}
						className="w-full"
						inputClassName="w-full border border-[var(--surface-border)] rounded-md px-3 py-2"
						toggleMask
						pt={{
							showIcon: {
								className: "-translate-y-1/4 -translate-x-2/3"
							},
							hideIcon: {
								className: "-translate-y-1/4 -translate-x-2/3"
							}
						}}
					/>
					<label htmlFor="password">Password</label>
				</FloatLabel>

				<FloatLabel className={"mb-8"}>
					<Password
						inputId="confirmPwd"
						value={confirmPassword}
						onChange={e => setConfirmPassword(e.target.value)}
						feedback={false}
						className="w-full"
						inputClassName="w-full border border-[var(--surface-border)] rounded-md px-3 py-2"
						toggleMask
						pt={{
							showIcon: {
								className: "-translate-y-1/4 -translate-x-2/3"
							},
							hideIcon: {
								className: "-translate-y-1/4 -translate-x-2/3"
							}
						}}
					/>
					<label htmlFor="confirmPwd">Confirm Password</label>
				</FloatLabel>
				<Toast ref={toast} />

				<motion.div whileHover={{ scale: 1.02 }}>
					<Button
						label="Send Activation Email"
						className="w-full bg-[var(--primary-color)] text-[var(--primary-color-text)] font-medium"
					/>
				</motion.div>

				<motion.p
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4, delay: 0.2 }}
					className="text-sm text-center text-[var(--text-color-secondary)] pt-6"
				>
					Already have an account?{" "}
					<Link
						to="/signin/student"
						className="text-[var(--primary-color)] font-medium"
					>
						Login
					</Link>
				</motion.p>
			</motion.div>
		</form>
	);
}
