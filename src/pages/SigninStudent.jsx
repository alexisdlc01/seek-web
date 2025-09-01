import { useContext, useRef, useState } from "react";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { FloatLabel } from "primereact/floatlabel";
import { Button } from "primereact/button";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import UserContext from "../context/UserContext.jsx";
import { Toast } from "primereact/toast";

export default function SignInStudent() {
	const { login } = useContext(UserContext);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const navigate = useNavigate();

	const toast = useRef(null);

	const showError = () => {
		toast.current.show({
			severity: "error",
			summary: "Error",
			detail: "Invalid email or password",
			life: 3000
		});
	};

	const handleSubmit = async e => {
		e.preventDefault();

		if (!validateEmailPrefix(email) || email.includes("@")) {
			toast.current.show({
				severity: "error",
				summary: "Invalid Email",
				detail: "Please enter only your email prefix (before @st-andrews.ac.uk)",
				life: 3000
			});
			return;
		}

		const fullEmail = `${email}@st-andrews.ac.uk`;
		const res = await login(fullEmail, password);

		if (res === "Credentials are not valid." || res === "Unauthorized") {
			showError();
		} else {
			navigate("/");
		}
	};

	const validateEmailPrefix = prefix => {
		const emailPrefixRegex = /^[a-zA-Z0-9._-]+$/;
		return emailPrefixRegex.test(prefix);
	};

	return (
		<div className="relative overflow-hidden min-h-screen bg-[var(--surface-a)] flex items-center justify-center px-4">
			{/* Animated Particles (behind the card) */}
			<div
				aria-hidden
				style={{
					position: "absolute",
					inset: 0,
					pointerEvents: "none",
					zIndex: 0
				}}
			>
				{[...Array(20)].map((_, i) => (
					<motion.div
						key={i}
						style={{
							position: "absolute",
							width: 8,
							height: 8,
							background: "#8B5CF6",
							borderRadius: "50%",
							left: `${Math.random() * 100}%`,
							top: `${Math.random() * 100}%`
						}}
						animate={{
							y: [0, -100, 0],
							opacity: [0, 1, 0],
							scale: [0, 1, 0]
						}}
						transition={{
							duration: 3 + Math.random() * 2,
							repeat: Infinity,
							delay: Math.random() * 2
						}}
					/>
				))}
			</div>

			<motion.form
				initial={{ opacity: 0, y: 30 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="relative z-10 w-full max-w-md bg-white rounded-xl shadow-md p-8 space-y-6 border border-[var(--surface-border)]"
				onSubmit={handleSubmit}
			>
				<h1 className="text-center text-2xl font-bold text-[var(--primary-color)] mb-8">
					Welcome Back, Student
				</h1>

				{/* Desktop version */}
				<div className="hidden sm:block mb-8">
					<FloatLabel className="w-full">
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
					<FloatLabel className="w-full">
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

				<Toast ref={toast} />
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
