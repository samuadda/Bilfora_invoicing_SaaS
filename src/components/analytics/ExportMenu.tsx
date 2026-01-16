"use client";

import { useState, useRef, useEffect } from "react";
import { Download, FileText, Table, Printer, ChevronDown } from "lucide-react";
import { m, AnimatePresence } from "framer-motion";

interface ExportMenuProps {
	onExportCSV: () => void;
	onExportExcel: () => void;
	onExportPDF: () => void;
}

export default function ExportMenu({
	onExportCSV,
	onExportExcel,
	onExportPDF,
}: ExportMenuProps) {
	const [isOpen, setIsOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	return (
		<div className="relative" ref={menuRef}>
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 text-sm font-medium transition-colors"
			>
				<Download size={16} />
				<span>تصدير</span>
				<ChevronDown
					size={16}
					className={isOpen ? "rotate-180 transition-transform" : "transition-transform"}
				/>
			</button>

			<AnimatePresence>
				{isOpen && (
					<>
						<div
							className="fixed inset-0 z-40"
							onClick={() => setIsOpen(false)}
						/>
						<m.div
							initial={{ opacity: 0, y: -10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -10 }}
							className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg p-2 z-50 min-w-48"
						>
							<button
								onClick={() => {
									onExportCSV();
									setIsOpen(false);
								}}
								className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
							>
								<FileText size={16} />
								تصدير CSV
							</button>
							<button
								onClick={() => {
									onExportExcel();
									setIsOpen(false);
								}}
								className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
							>
								<Table size={16} />
								تصدير Excel
							</button>
							<button
								onClick={() => {
									onExportPDF();
									setIsOpen(false);
								}}
								className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
							>
								<Printer size={16} />
								تصدير PDF
							</button>
						</m.div>
					</>
				)}
			</AnimatePresence>
		</div>
	);
}

