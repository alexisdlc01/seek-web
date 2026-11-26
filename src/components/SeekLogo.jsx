// The Seek wordmark. Dot is always turquoise; text is white on dark, site blue on light.
export default function SeekLogo({ dark = false, className = "text-[22px]" }) {
	return (
		<span
			className={`font-display font-bold leading-none ${className}`}
			style={{ color: dark ? "#ffffff" : "#0b2a5b" }}
		>
			seek<span style={{ color: "#23b7c5" }}>.</span>
		</span>
	);
}
