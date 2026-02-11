import React, { FormEventHandler, useContext, useRef, useState } from "react";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { FloatLabel } from "primereact/floatlabel";
import { Button } from "primereact/button";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import UserContext from "../context/UserContext.jsx";
import { Toast } from "primereact/toast";
import BackgroundBubbles from "../components/BackgroundBubbles.jsx";
import { showCustomToast } from "../utils/custom-toast.tsx";
import { useAuthControllerSignup } from "../api/auth/auth.js";

export default function SignUpStudent() {
	const { mutate: signup } = useAuthControllerSignup();
	const [email, setEmail] = useState("");
	const [name, setName] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const navigate = useNavigate();
	const toast = useRef(null);

	function showError(detail: string) {
		showCustomToast(toast.current, {
			summary: "Sign-Up Failed",
			detail
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
		if (!email.trim() || !email.trim().endsWith("@st-andrews.ac.uk")) {
			showError("A valid St Andrews email is required.");
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

	const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
		e.preventDefault();
		if (!validateName()) return;
		if (!validateEmail()) return;
		if (!validatePasswords()) return;
		signup({
			// @ts-ignore
			data: {
				name,
				email,
				password,
				role: "STUDENT"
			}
		}, {
			onError(error) {
				showError(error.response.data.message ?? "Sign up failed.");
			},
			onSuccess() {
				navigate("/activation-sent");
			}
		});
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
				className="relative z-10 w-full max-w-md bg-white rounded-xl shadow-md p-8 border border-[var(--surface-border)]"
			>
				<form onSubmit={handleSubmit} className="space-y-6">
					<h1 className="text-center text-2xl font-bold text-primary">
						Create Student Account
					</h1>

					<FloatLabel>
						<label htmlFor="name" className="text-black">First and last name</label>
						<InputText className="w-full"
							id="name"
							value={name}
							onChange={e => setName(e.target.value)} />
					</FloatLabel>

					<FloatLabel>
						<label htmlFor="email">St Andrews Email</label>
						<InputText className="w-full bg-red-500"
							id="email"
							value={email}
							onChange={e => setEmail(e.target.value)} />
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
										"-translate-y-1/4 -translate-x-2/3"
								},
								hideIcon: {
									className:
										"-translate-y-1/4 -translate-x-2/3"
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
										"-translate-y-1/4 -translate-x-2/3"
								},
								hideIcon: {
									className:
										"-translate-y-1/4 -translate-x-2/3"
								}
							}}
						/>
						<label htmlFor="confirmPwd">Confirm Password</label>
					</FloatLabel>

					<motion.div whileHover={{ scale: 1.02 }}>
						<Button
							type="submit"
							label="Send Activation Email"
							className="w-full font-medium"
							style={{
								backgroundColor: "var(--surface-300)",
								color: "white",
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
							className="text-[var(--primary-color-text)] font-medium"
						>
							Login
						</Link>
					</motion.p>
				</form>
			</motion.div>
		</div>
	);
}
