"use client";

import { useEffect, useRef, useState } from "react";

interface StatNumberProps {
	value: number;
	prefix?: string;
	suffix?: string;
	duration?: number;
}

export function StatNumber({
	value,
	prefix = "",
	suffix = "",
	duration = 1200,
}: StatNumberProps) {
	const ref = useRef<HTMLSpanElement | null>(null);
	const [display, setDisplay] = useState(0);
	const [hasAnimated, setHasAnimated] = useState(false);

	useEffect(() => {
		const element = ref.current;
		if (!element) return;

		const observer = new IntersectionObserver(
			(entries) => {
				const entry = entries[0];
				if (entry.isIntersecting && !hasAnimated) {
					setHasAnimated(true);
					const start = performance.now();
					const startValue = 0;

					const animate = (time: number) => {
						const progress = Math.min((time - start) / duration, 1);
						const current =
							startValue + (value - startValue) * progress;
						setDisplay(current);
						if (progress < 1) {
							requestAnimationFrame(animate);
						}
					};

					requestAnimationFrame(animate);
				}
			},
			{ threshold: 0.5 }
		);

		observer.observe(element);
		return () => observer.disconnect();
	}, [value, duration, hasAnimated]);

	const formatted = Math.round(display).toLocaleString("en-US");

	return (
		<span ref={ref}>
			{prefix}
			{formatted}
			{suffix}
		</span>
	);
}
