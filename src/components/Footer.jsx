import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {

	return (
		<footer className="bg-[var(--primary-color)] text-[var(--primary-color-text)] text-center text-sm py-6 px-4 mt-auto">
			<div className="flex justify-center gap-6 flex-wrap mb-2">
				<Link to="/about">About Us</Link>
				<Link to="/terms">Terms & Conditions</Link>
				<Link to="/privacy">Privacy Policy</Link>
				<Link to="/security">Security</Link>
				<Link to="/contact">Contact</Link>
			</div>

			<p>© 2025 Seek St Andrews. All rights reserved.</p>
		</footer>
	);
}
