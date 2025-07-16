import { useState } from "react";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { FloatLabel } from "primereact/floatlabel";
import { Button } from "primereact/button";
import { Link } from "react-router-dom";

export default function SignInLandlord() {
	const [email, setEmail] = useState("");
	const [pwd, setPwd] = useState("");
	const [confirm, setConfirm] = useState("");

	return (
		<div className="min-h-screen bg-[var(--surface-a)] flex items-center justify-center px-4">
			<div className="w-full max-w-md bg-white rounded-xl shadow-md p-8 space-y-6 border border-[var(--surface-border)]">
				{/* Heading */}
				<h1 className="text-center text-2xl font-bold text-[var(--primary-color)]">
					Welcome Back, Student
				</h1>
				<FloatLabel className="p-float-label mt-5">
					<div className="p-inputgroup w-full">
						<InputText
							id="email"
							value={email}
							onChange={e => setEmail(e.target.value)}
							className="flex-1"
						/>
						<span className="p-inputgroup-addon">
							@st-andrews.ac.uk
						</span>
					</div>
					<label htmlFor="email">St Andrews Email</label>
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
					<label htmlFor="confirm"> Password</label>
				</FloatLabel>
				{/* Confirm Password */}

				{/* Create Account Button */}
				<Button
					label="Sign in"
					className="w-full bg-[var(--primary-color)] text-[var(--primary-color-text)] font-medium"
				/>

				{/* Footer */}
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
			</div>
		</div>
	);
}
