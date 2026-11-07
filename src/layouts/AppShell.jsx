import { useContext, useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import UserContext from "../context/UserContext.jsx";
import NotificationsBell from "../components/NotificationsBell.jsx";
import { useApplyTheme, useTheme } from "../context/ThemeContext.jsx";

/**
 * Shared dashboard shell: sticky sidebar from 768px up, top bar + drawer below.
 * items: [{ to, label, badge?, match?: string[] }]  (match = extra path prefixes that keep the item active)
 */
export default function AppShell({ role, label, items }) {
	useApplyTheme(role);
	const { theme, toggleTheme } = useTheme();
	const { logout } = useContext(UserContext);
	const { pathname } = useLocation();
	const [open, setOpen] = useState(false);

	useEffect(() => setOpen(false), [pathname]);

	const isActive = (item) =>
		[item.to, ...(item.match ?? [])].some(
			(p) => pathname === p || pathname.startsWith(p + "/")
		);

	const linkClass = (active) =>
		`flex h-11 items-center justify-between rounded-[10px] px-3 text-sm no-underline transition-colors ${
			active
				? "bg-sk-accent font-semibold text-sk-on-accent"
				: "text-sk-muted hover:bg-sk-hair hover:text-sk-text"
		}`;

	const nav = (
		<nav aria-label={label} className="flex flex-col gap-1">
			{items.map((item) => {
				const active = isActive(item);
				return (
					<NavLink
						key={item.to}
						to={item.to}
						aria-current={active ? "page" : undefined}
						className={linkClass(active)}
					>
						{item.label}
						{item.badge != null && (
							<span
								className={`rounded-full px-2 py-0.5 text-xs font-bold ${
									active
										? "bg-sk-on-accent text-sk-accent"
										: "bg-sk-accent text-sk-on-accent"
								}`}
							>
								{item.badge}
							</span>
						)}
					</NavLink>
				);
			})}
		</nav>
	);

	const footer = (
		<div className="mt-auto flex flex-col gap-1 pt-6">
			<NotificationsBell />
			<button
				type="button"
				onClick={toggleTheme}
				aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
				className="flex h-11 cursor-pointer items-center justify-between rounded-[10px] border border-sk-border bg-transparent px-3 text-sm text-sk-text2"
			>
				<span>{theme === "dark" ? "Dark theme" : "Light theme"}</span>
				<span aria-hidden="true">{theme === "dark" ? "☾" : "☀"}</span>
			</button>
			<button
				type="button"
				onClick={logout}
				className="flex h-11 cursor-pointer items-center rounded-[10px] border-none bg-transparent px-3 text-sm text-sk-muted hover:text-sk-text"
			>
				Sign out
			</button>
		</div>
	);

	const logo = (
		<span className="font-display text-[22px] font-bold text-sk-text">
			seek<span className="text-sk-link">.</span>
		</span>
	);

	return (
		<div className="min-h-screen bg-sk-bg font-sans text-sk-text md:flex">
			{/* Desktop sidebar */}
			<aside className="sticky top-0 hidden h-screen w-[240px] shrink-0 flex-col overflow-y-auto border-r border-sk-side-border bg-sk-side px-4 py-6 md:flex">
				<div className="px-3 pb-5">{logo}</div>
				{nav}
				{footer}
			</aside>

			{/* Mobile top bar + drawer */}
			<header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-sk-side-border bg-sk-side px-4 md:hidden">
				{logo}
				<button
					type="button"
					aria-label={open ? "Close menu" : "Open menu"}
					aria-expanded={open}
					onClick={() => setOpen((o) => !o)}
					className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-[10px] border border-sk-border bg-transparent text-sk-text"
				>
					<i className={`pi ${open ? "pi-times" : "pi-bars"}`} />
				</button>
			</header>
			{open && (
				<div className="fixed inset-0 top-14 z-30 md:hidden">
					<button
						type="button"
						aria-label="Close menu"
						className="absolute inset-0 cursor-pointer border-none bg-black/50"
						onClick={() => setOpen(false)}
					/>
					<div className="relative flex h-full w-[min(300px,85vw)] flex-col overflow-y-auto border-r border-sk-side-border bg-sk-side px-4 py-4">
						{nav}
						{footer}
					</div>
				</div>
			)}

			<main className="min-w-0 flex-1">
				<Outlet />
			</main>
		</div>
	);
}
