import { useContext, useState } from "react";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { FloatLabel } from "primereact/floatlabel";
import { Button } from "primereact/button";
import { Link } from "react-router-dom";
import UserContext from "../context/UserContext.jsx";

export default function SignInLandlord() {
	const { login } = useContext(UserContext);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const handleSubmit = async e => {
		e.preventDefault();
		console.log("logging in with", email, password);
		login(email, password);
	};

	return (
		<div className="min-h-screen bg-[var(--surface-a)] flex items-center justify-center px-4">
			<form
				className="w-full max-w-md bg-white rounded-xl shadow-md p-8 space-y-6 border border-[var(--surface-border)]"
				onSubmit={handleSubmit}
			>
				<h1 className="text-center text-2xl font-bold text-[var(--primary-color)]">
					Welcome Back, Student
				</h1>

				{/* Desktop version */}
				<div className="hidden sm:block">
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

				<FloatLabel>
					<Password
						inputId="password"
						value={password}
						onChange={e => setPassword(e.target.value)}
						feedback={false}
						className="w-full"
						inputClassName="w-full border border-[var(--surface-border)] rounded-md px-3 py-2"
					/>
					<label htmlFor="password">Password</label>
				</FloatLabel>

				<Button
					label="Sign in"
					className="w-full bg-[var(--primary-color)] text-[var(--primary-color-text)] font-medium"
				/>

				<p className="text-sm text-center text-[var(--text-color-secondary)] pt-6">
					Don't have an account?{" "}
					<Link
						to="/signup/student"
						className="text-[var(--primary-color)] font-medium"
					>
						Signup
					</Link>
				</p>
				<p className="text-sm text-center text-[var(--text-color-secondary)]">
					Forgot your password?{" "}
					<Link
						to="/resetpassword"
						className="text-[var(--primary-color)] font-medium"
					>
						Reset Password
					</Link>
				</p>
			</form>
		</div>
	);
}
