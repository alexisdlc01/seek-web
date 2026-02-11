import { FormEventHandler, useContext, useRef, useState } from "react";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { FloatLabel } from "primereact/floatlabel";
import { Button } from "primereact/button";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router";
import UserContext from "../context/UserContext.jsx";
import { Toast } from "primereact/toast";
import BackgroundBubbles from "../components/BackgroundBubbles";

export default function SignInStudent() {
	const { login } = useContext(UserContext);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const navigate = useNavigate();
	const toast = useRef(null);

	const showError = () => {
		toast.current?.show({
			severity: "error",
			summary: "Sign-In Failed",
			detail: "Your email or password didn’t match our records. Please try again.",
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
						<p className="font-semibold">Sign-In Failed</p>
						<p className="text-sm text-gray-200">
							Your email or password didn’t match our records.
						</p>
					</div>
				</div>
			)
		});
	};

	const validateEmailPrefix = (prefix: string) => /^[a-zA-Z0-9._-]+$/.test(prefix);

	const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
		e.preventDefault();
		if (!validateEmailPrefix(email) || email.includes("@")) {
			toast.current?.show({
				severity: "error",
				summary: "Sign-In Failed",
				detail: "Your email or password didn’t match our records. Please try again.",
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
							<p className="font-semibold">
								Invalid Email Format
							</p>
							<p className="text-sm text-gray-200">
								"Please enter only your email prefix (before
								@st-andrews.ac.uk)".
							</p>
						</div>
					</div>
				)
			});
			return;
		}
		const fullEmail = `${email}@st-andrews.ac.uk`;
		const res = await login(fullEmail, password);
		if (res === "Credentials are not valid." || res === "Unauthorized")
			showError();
		else navigate("/download");
	};

	return (
		<div className="relative overflow-hidden min-h-screen bg-[var(--surface-a)] flex items-center justify-center px-4">
			<Toast ref={toast} position="bottom-right" />
			<BackgroundBubbles />

			<motion.form
				initial={{ opacity: 0, y: 30 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="relative z-10 w-full max-w-md rounded-xl shadow-md p-8 bg-white space-y-8 border border-[var(--surface-border)]"
				onSubmit={handleSubmit}
			>
				<h1
					className="text-center text-2xl font-bold mb-8"
					style={{ color: "#23b7c5" }}
				>
					Welcome Back, Student
				</h1>

				{/* Desktop */}
				<FloatLabel className="w-full">
					<InputText
						id="email"
						value={email}
						onChange={e => setEmail(e.target.value)}
						className="w-full"
					/>
					<label htmlFor="email">St Andrews Email</label>
				</FloatLabel>

				<FloatLabel className="mb-8">
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

				<motion.div whileHover={{ scale: 1.02 }}>
					<Button
						label="Sign in"
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
					Don't have an account?{" "}
					<Link
						to="/signup/student"
						className="text-[var(--primary-color-text)] font-medium"
					>
						Signup
					</Link>
				</motion.p>

				<motion.p
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4, delay: 0.3 }}
					className="text-sm text-center text-[var(--text-color-secondary)]"
				>
					Forgot your password?{" "}
					<Link
						to="/resetpassword"
						className="text-[var(--primary-color-text)] font-medium"
					>
						Reset Password
					</Link>
				</motion.p>
			</motion.form>
		</div>
	);
}
