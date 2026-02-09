"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, m } from "framer-motion";
import { useState, useEffect } from "react";
import { Check, Loader2 } from "lucide-react";

export interface LoadingState {
	text: string;
}

const CheckIcon = ({ className }: { className?: string }) => {
	return (
		<Check className={cn("h-4 w-4 text-white", className)} strokeWidth={3} />
	);
};

const CheckFilled = ({ className }: { className?: string }) => {
	return (
		<m.div
			initial={{ scale: 0, opacity: 0 }}
			animate={{ scale: 1, opacity: 1 }}
			transition={{ duration: 0.3, ease: "easeOut" }}
			className={cn(
				"h-8 w-8 rounded-full bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center shadow-lg shadow-green-500/30",
				className
			)}
		>
			<CheckIcon />
		</m.div>
	);
};

const LoaderCore = ({
	loadingStates,
	value = 0,
}: {
	loadingStates: LoadingState[];
	value?: number;
}) => {
	return (
		<div className="flex flex-col gap-3 max-w-xs mx-auto">
			{loadingStates.map((loadingState, index) => {
				const isActive = index === value;
				const isComplete = index < value;
				const isPending = index > value;

				return (
					<m.div
						key={index}
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: index * 0.1 }}
						className={cn(
							"flex items-center gap-3 p-3 rounded-xl transition-all duration-300",
							isActive && "bg-white/80 shadow-lg shadow-purple-500/10",
							isComplete && "bg-green-50/80",
							isPending && "opacity-50"
						)}
					>
						{/* Status Icon */}
						<div className="flex-shrink-0">
							{isComplete ? (
								<CheckFilled />
							) : isActive ? (
								<m.div
									animate={{ rotate: 360 }}
									transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
									className="h-8 w-8 rounded-full bg-gradient-to-br from-[#7f2dfb] to-[#6a1fd8] flex items-center justify-center shadow-lg shadow-purple-500/30"
								>
									<Loader2 className="h-4 w-4 text-white" />
								</m.div>
							) : (
								<div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
									<div className="h-2 w-2 rounded-full bg-gray-400" />
								</div>
							)}
						</div>

						{/* Text */}
						<span
							className={cn(
								"text-sm font-medium transition-colors",
								isActive && "text-[#012d46]",
								isComplete && "text-green-700",
								isPending && "text-gray-400"
							)}
						>
							{loadingState.text}
						</span>
					</m.div>
				);
			})}
		</div>
	);
};

export const MultiStepLoader = ({
	loadingStates,
	loading,
	duration = 2000,
	loop = true,
	onComplete,
}: {
	loadingStates: LoadingState[];
	loading?: boolean;
	duration?: number;
	loop?: boolean;
	onComplete?: () => void;
}) => {
	const [currentState, setCurrentState] = useState(0);

	useEffect(() => {
		if (!loading) {
			setCurrentState(0);
			return;
		}

		const timeout = setTimeout(() => {
			if (currentState < loadingStates.length - 1) {
				setCurrentState((prev) => prev + 1);
			} else if (loop) {
				setCurrentState(0);
			} else if (onComplete) {
				onComplete();
			}
		}, duration);

		return () => clearTimeout(timeout);
	}, [currentState, loading, loop, loadingStates.length, duration, onComplete]);

	return (
		<AnimatePresence mode="wait">
			{loading && (
				<m.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className="fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-md"
				>
					{/* Gradient Background */}
					<div className="absolute inset-0 bg-gradient-to-br from-gray-50/95 via-white/95 to-purple-50/95" />
					
					{/* Aurora Effects */}
					<m.div
						animate={{
							x: [0, 30, 0],
							y: [0, 20, 0],
							scale: [1, 1.1, 1],
						}}
						transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
						className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-gradient-to-br from-[#7f2dfb]/20 to-transparent rounded-full blur-[100px]"
					/>
					<m.div
						animate={{
							x: [0, -20, 0],
							y: [0, 30, 0],
							scale: [1, 1.15, 1],
						}}
						transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
						className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-gradient-to-tl from-pink-300/20 to-transparent rounded-full blur-[80px]"
					/>

					{/* Content */}
					<div className="relative z-10">
						{/* Logo */}
						<m.div
							initial={{ opacity: 0, y: -20 }}
							animate={{ opacity: 1, y: 0 }}
							className="text-center mb-8"
						>
							<span className="text-2xl font-bold text-[#012d46]">بِلفورا</span>
						</m.div>

						{/* Loading Steps */}
						<m.div
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ delay: 0.2 }}
							className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/50 p-8 shadow-xl shadow-gray-200/50"
						>
							<LoaderCore loadingStates={loadingStates} value={currentState} />
						</m.div>

						{/* Progress indicator */}
						<div className="mt-6 flex justify-center gap-1.5">
							{loadingStates.map((_, index) => (
								<m.div
									key={index}
									className={cn(
										"h-1.5 rounded-full transition-all duration-300",
										index <= currentState
											? "w-6 bg-[#7f2dfb]"
											: "w-1.5 bg-gray-300"
									)}
								/>
							))}
						</div>
					</div>
				</m.div>
			)}
		</AnimatePresence>
	);
};
