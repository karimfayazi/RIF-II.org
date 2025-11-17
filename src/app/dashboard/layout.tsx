"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
	
	return (
		<div className="min-h-screen bg-gray-50 flex flex-col">
			{/* Top Navigation */}
			<header className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
				<Navbar />
			</header>

			{/* Main Content with Sidebar */}
			<div className="flex flex-1">
				{/* Sidebar */}
				<aside className={`hidden md:flex border-r border-gray-200 bg-white p-4 transition-all duration-300 ${
					sidebarCollapsed ? "w-16" : "w-60"
				}`}>
					<div className="sticky top-20 w-full">
						<Sidebar 
							collapsed={sidebarCollapsed} 
							setCollapsed={setSidebarCollapsed} 
						/>
					</div>
				</aside>

				{/* Main Section */}
				<main className="flex-1 p-6 overflow-y-auto transition-all duration-300">
					{children}
				</main>
			</div>
		</div>
	);
}
