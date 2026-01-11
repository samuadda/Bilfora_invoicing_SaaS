"use client";

import { useState, ReactNode } from "react";
import { SidebarContext } from "./sidebar/SidebarContext";

interface SidebarProviderProps {
	children: ReactNode;
}

export default function SidebarProvider({ children }: SidebarProviderProps) {
	const [isCollapsed, setIsCollapsed] = useState(false);

	return (
		<SidebarContext.Provider value={{ isCollapsed, setIsCollapsed }}>
			{children}
		</SidebarContext.Provider>
	);
}
