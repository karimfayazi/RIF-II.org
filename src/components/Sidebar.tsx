"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
    LayoutDashboard,
    Map,
    ClipboardList,
    GraduationCap,
    FileText,
    BarChart3,
    ImagePlus,
    Link2,
    Settings,
    LogOut,
    ChevronsLeft,
    ChevronsRight,
    ChevronDown,
    ChevronRight,
    FolderPlus,
} from "lucide-react";

type SidebarProps = {
    collapsed: boolean;
    setCollapsed: (collapsed: boolean) => void;
};

type NavSubItem = {
	label: string;
	href: string;
};

type NavItem = {
	label: string;
	href?: string;
	icon: React.ComponentType<{ className?: string }>;
	subItems?: NavSubItem[];
	subMenus?: {
		label: string;
		items: NavSubItem[];
	}[];
};

type NavGroup = {
	items: NavItem[];
	divider?: boolean;
};

const GROUPS: NavGroup[] = [
	{
		divider: true,
		items: [
			{ label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
			{ label: "Add Project", href: "/dashboard/projects/add", icon: FolderPlus },
			{ 
				label: "GIS Maps", 
				icon: Map,
				subMenus: [
					{
						label: "Online Maps",
						items: [
							{ label: "Maps Master", href: "/dashboard/maps" },
							{ label: "Shapefile Maps", href: "/dashboard/maps/shapefiles" },
							{ label: "KPK-DIK & Bannu Maps", href: "/dashboard/maps/kpk-dik-bannu" },
							{ label: "Bannu Maps", href: "/dashboard/maps/bannu" },
							{ label: "DIK Maps", href: "/dashboard/maps/dik" },
						]
					},
					{
						label: "Maps Images",
						items: [
							{ label: "View Maps Images", href: "/dashboard/maps/images" },
							{ label: "Manage GIS Maps", href: "/dashboard/maps/manage" },
							{ label: "GIS Maps Records", href: "/dashboard/maps/records" },
						]
					}
				]
			},
			{ label: "Tracking Sheet", href: "/dashboard/tracking-sheet", icon: ClipboardList },
			{ label: "Training, Capacity Building & Awareness", href: "/dashboard/training", icon: GraduationCap },
		],
	},
	{
		divider: true,
		items: [
			{ label: "Important Documents", href: "/dashboard/documents", icon: FileText },
			{ label: "Reports", href: "/dashboard/reports", icon: BarChart3 },
			{ label: "Pictures", href: "/dashboard/pictures", icon: ImagePlus },
			{ label: "Links", href: "/dashboard/links", icon: Link2 },
		],
	},
	{
		divider: true,
		items: [
			{ label: "Setting", href: "/dashboard/settings", icon: Settings },
			{ label: "Logout", href: "/logout", icon: LogOut },
		],
	},
];

export default function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
    const pathname = usePathname();
    const [expandedMenus, setExpandedMenus] = useState<{ [key: string]: boolean }>({});
    const [expandedSubMenus, setExpandedSubMenus] = useState<{ [key: string]: boolean }>({});
    
    const toggleMenu = (label: string) => {
        setExpandedMenus(prev => ({ ...prev, [label]: !prev[label] }));
    };
    
    const toggleSubMenu = (label: string) => {
        setExpandedSubMenus(prev => ({ ...prev, [label]: !prev[label] }));
    };
    
    return (
        <nav className={`rounded-lg border border-gray-200 bg-white p-3 text-[12px] shadow-sm transition-all ${collapsed ? "w-12" : "w-full"}`}>
            <div className="mb-2 flex items-center justify-end">
                <button
                    title={collapsed ? "Expand" : "Collapse"}
                    onClick={() => setCollapsed(!collapsed)}
                    className="rounded-md p-1 hover:bg-gray-100"
                >
                    {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
                </button>
            </div>
			{GROUPS.map((group, groupIdx) => (
				<div key={groupIdx} className="mb-3 last:mb-0">
					<ul className="space-y-1">
						{group.items.map((item, itemIdx) => {
							const Icon = item.icon;
							const isLogout = item.label === "Logout";
							const hasSubMenus = item.subMenus && item.subMenus.length > 0;
							const isExpanded = expandedMenus[item.label];
							const isActive = item.href ? pathname === item.href : false;
							
							return (
								<li key={`${item.label}-${itemIdx}`}>
									{isLogout ? (
										<button
											onClick={async () => {
												await fetch("/api/logout", { method: "POST" });
												window.location.href = "/login";
											}}
                                            className={`flex w-full items-center ${collapsed ? "justify-center" : "gap-2"} rounded-md px-3 py-2 text-left transition-colors hover:bg-red-50 hover:text-red-700`}
										>
											<Icon className="h-4 w-4" />
                                            <span className={collapsed ? "sr-only" : undefined}>{item.label}</span>
										</button>
									) : hasSubMenus ? (
										<>
											<button
												onClick={() => toggleMenu(item.label)}
                                                className={`flex w-full items-center ${collapsed ? "justify-center" : "gap-2"} rounded-md px-3 py-2 text-left transition-colors hover:bg-gray-100`}
											>
												<Icon className="h-4 w-4" />
                                                {!collapsed && (
													<>
														<span className="flex-1">{item.label}</span>
														{isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
													</>
												)}
											</button>
											{isExpanded && !collapsed && item.subMenus && (
												<ul className="ml-6 mt-1 space-y-1 border-l-2 border-gray-200 pl-2">
													{item.subMenus.map((subMenu, subMenuIdx) => (
														<li key={subMenuIdx}>
															<button
																onClick={() => toggleSubMenu(subMenu.label)}
																className="flex w-full items-center justify-between rounded-md px-3 py-1.5 text-left text-[11px] text-gray-700 transition-colors hover:bg-gray-50"
															>
																<span className="font-medium">{subMenu.label}</span>
																{expandedSubMenus[subMenu.label] ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
															</button>
															{expandedSubMenus[subMenu.label] && (
																<ul className="ml-3 mt-1 space-y-0.5">
																	{subMenu.items.map((subItem, subItemIdx) => {
																		const isSubActive = pathname === subItem.href;
																		return (
																			<li key={subItemIdx}>
																				<Link
																					href={subItem.href}
																					className={`block rounded-md px-3 py-1.5 text-[11px] transition-colors ${
																						isSubActive
																							? "bg-[#0b4d2b] text-white font-medium"
																							: "text-gray-600 hover:bg-gray-50"
																					}`}
																				>
																					{subItem.label}
																				</Link>
																			</li>
																		);
																	})}
																</ul>
															)}
														</li>
													))}
												</ul>
											)}
										</>
									) : (
										<Link
											href={item.href!}
                                            className={`flex items-center ${collapsed ? "justify-center" : "gap-2"} rounded-md px-3 py-2 transition-colors ${
												isActive
													? "bg-[#0b4d2b] text-white font-medium"
													: "hover:bg-gray-100"
											}`}
										>
											<Icon className="h-4 w-4" />
                                            <span className={collapsed ? "sr-only" : undefined}>{item.label}</span>
										</Link>
									)}
								</li>
							);
						})}
					</ul>
					{group.divider && groupIdx < GROUPS.length - 1 && (
						<div className="my-3 border-t border-gray-300"></div>
					)}
				</div>
			))}
        </nav>
	);
}


