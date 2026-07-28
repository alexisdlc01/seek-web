import React, { useContext, useRef, useState } from "react";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { FloatLabel } from "primereact/floatlabel";
import { Button } from "primereact/button";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import UserContext from "../context/UserContext.jsx";
import { Toast } from "primereact/toast";
import BackgroundBubbles from "../components/BackgroundBubbles.jsx";

export default function SignUpStudent() {
	const { signup } = useContext(UserContext);
	const [email, setEmail] = useState("");
	const [name, setName] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const navigate = useNavigate();
	const toast = useRef(null);

	const showError = detail => {
		toast.current?.show({
			severity: "error",
			summary: "Sign-Up Failed",
			detail: { detail },
			life: 4000,
			style: {
				background: "#1E1E2F",
				color: "#fff",
				borderLeft: "5px solid #EF4444", // red accent
				borderRadius: "8px",
				boxShadow: "0 4px 15px rgba(0,0,0,0.3)"
			},
			content: (
				<div className="flex items-center space-x-3">
					<i className="pi pi-times-circle text-red-400 text-xl"></i>
					<div>
						<p className="font-semibold">Sign-Up Failed</p>
						<p className="text-sm text-gray-200">{detail}</p>
					</div>
				</div>
			)
		});
	};

	const validateName = () => {
		if (name.length === 0) {
			showError("Please enter your name");
			return false;
		}
		return true;
	};

	const validateEmail = () => {
		const regex = /^[a-zA-Z0-9._-]+$/;
		if (!email.trim()) {
			showError("A valid St Andrews email prefix is required.");
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
			showError("The passwords inputted do not match.");
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
		<div className="relative overflow-hidden min-h-screen bg-[var(--surface-a)] flex items-center justify-center px-4">
			{/* same bubbles as sign in */}

			<Toast ref={toast} position="bottom-right" />
			<BackgroundBubbles count={20} color="#8B5CF6" />

			<motion.div
				initial={{ opacity: 0, y: 30 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="relative z-10 w-full max-w-md bg-white rounded-xl shadow-md p-8 border border-[var(--surface-border)] auth-form-card"
			>
				<form onSubmit={handleSubmit} className="space-y-6">
					<h1 className="text-center text-2xl font-bold text-primary">
						Create Student Account
					</h1>

					<FloatLabel>
						<InputText
							className="w-full"
							id="name"
							value={name}
							onChange={e => setName(e.target.value)}
						/>
						<label htmlFor="name">First and last name</label>
					</FloatLabel>

					<FloatLabel>
						<InputText
							className="w-full"
							id="email"
							value={email}
							onChange={e => setEmail(e.target.value)}
						/>
						<label htmlFor="email">St Andrews Email</label>
					</FloatLabel>

					<FloatLabel>
						<Password id="password"
							value={password}
							onChange={e => setPassword(e.target.value)}
							feedback={false}
							className="w-full"
							inputClassName="w-full border rounded-md px-3 py-2"
							toggleMask
							pt={{
								showIcon: {
									className:
										"-translate-y-1/4 -translate-x-2/3 text-slate-600"
								},
								hideIcon: {
									className:
										"-translate-y-1/4 -translate-x-2/3 text-slate-600"
								}
							}}
						/>
						<label htmlFor="password">Password</label>
					</FloatLabel>

					<FloatLabel>
						<Password
							inputId="confirmPwd"
							value={confirmPassword}
							onChange={e => setConfirmPassword(e.target.value)}
							feedback={false}
							className="w-full"
							inputClassName="w-full border rounded-md px-3 py-2"
							toggleMask
							pt={{
								showIcon: {
									className:
										"-translate-y-1/4 -translate-x-2/3 text-slate-600"
								},
								hideIcon: {
									className:
										"-translate-y-1/4 -translate-x-2/3 text-slate-600"
								}
							}}
						/>
						<label htmlFor="confirmPwd">Confirm Password</label>
					</FloatLabel>

					<motion.div whileHover={{ scale: 1.02 }}>
						<Button
							type="submit"
							label="Send Activation Email"
							className="w-full font-semibold"
							style={{
								backgroundColor: "var(--primary-color)",
								color: "var(--primary-color-text)",
								border: "none"
							}}
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
							className="text-[var(--primary-color)] font-semibold underline-offset-2 hover:underline"
						>
							Login
						</Link>
					</motion.p>
				</form>
			</motion.div>
		</div>
	);
}
