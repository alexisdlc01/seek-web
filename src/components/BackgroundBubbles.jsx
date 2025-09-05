// ../components/BackgroundBubbles.jsx
import React, { useRef } from "react";
import { motion } from "framer-motion";

const BackgroundBubbles = React.memo(function BackgroundBubbles({
	count = 20,
	color = "#8B5CF6",
	size = 8,
	rise = 100,
	durationMin = 3,
	durationMax = 5,
	delayMax = 2
}) {
	const cfgRef = useRef(null);
	if (!cfgRef.current) {
		const r = Math.random;
		cfgRef.current = Array.from({ length: count }).map((_, i) => ({
			id: i,
			left: `${r() * 100}%`,
			top: `${r() * 100}%`,
			delay: r() * delayMax,
			duration: durationMin + r() * (durationMax - durationMin)
		}));
	}

	return (
		<div
			aria-hidden
			style={{
				position: "absolute",
				inset: 0,
				zIndex: 0,
				pointerEvents: "none"
			}}
		>
			{cfgRef.current.map(b => (
				<motion.div
					key={b.id}
					style={{
						position: "absolute",
						left: b.left,
						top: b.top,
						width: size,
						height: size,
						borderRadius: "50%",
						background: color,
						willChange: "transform,opacity"
					}}
					animate={{
						y: [0, -rise, 0],
						opacity: [0, 1, 0],
						scale: [0, 1, 0]
					}}
					transition={{
						duration: b.duration,
						delay: b.delay,
						repeat: Infinity,
						ease: "easeInOut"
					}}
				/>
			))}
		</div>
	);
});

export default BackgroundBubbles;
