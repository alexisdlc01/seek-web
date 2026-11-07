// Small building blocks for the redesigned (token-based) pages.
// All colours come from the --sk-* tokens in index.css, so they follow the
// active role/theme palette.

export const btnPrimary =
	"inline-flex h-11 cursor-pointer items-center justify-center rounded-xl border-none bg-sk-accent px-4 text-sm font-semibold text-sk-on-accent no-underline hover:opacity-90";
export const btnGhost =
	"inline-flex h-11 cursor-pointer items-center justify-center rounded-xl border border-sk-border2 bg-sk-card px-4 text-sm font-semibold text-sk-text no-underline hover:bg-sk-card2";
export const btnSmPrimary =
	"inline-flex h-10 cursor-pointer items-center justify-center rounded-[10px] border-none bg-sk-accent px-3.5 text-[13px] font-semibold text-sk-on-accent no-underline hover:opacity-90";
export const btnSmGhost =
	"inline-flex h-10 cursor-pointer items-center justify-center rounded-[10px] border border-sk-border2 bg-sk-card px-3.5 text-[13px] font-semibold text-sk-text no-underline hover:bg-sk-card2";

export const Page = ({ children, className = "" }) => (
	<div className={`flex flex-col gap-6 p-4 md:p-8 ${className}`}>{children}</div>
);

export const PageHeader = ({ eyebrow, title, children }) => (
	<div className="flex flex-wrap items-center justify-between gap-3">
		<div className="flex flex-col gap-1">
			{eyebrow && <span className="text-sm text-sk-muted">{eyebrow}</span>}
			<h1 className="font-display text-2xl font-semibold md:text-[30px]">{title}</h1>
		</div>
		{children && <div className="flex flex-wrap gap-2">{children}</div>}
	</div>
);

export const Card = ({ title = "", children, className = "", as: Tag = "section" }) => (
	<Tag
		className={`flex min-w-0 flex-col gap-3 rounded-2xl border border-sk-border bg-sk-card p-5 ${className}`}
	>
		{title && <h2 className="font-display text-lg font-semibold">{title}</h2>}
		{children}
	</Tag>
);

export const Tile = ({ label, value, sub = "", subClass = "text-sk-text2", progress = null, className = "" }) => (
	<div
		className={`flex flex-col gap-2 rounded-2xl border border-sk-border bg-sk-card p-[18px] ${className}`}
	>
		<span className="text-[13px] text-sk-muted">{label}</span>
		<span className="font-display text-[28px] font-semibold">{value}</span>
		{progress != null && (
			<div className="h-1.5 rounded-[3px] bg-sk-border">
				<div className="h-1.5 rounded-[3px] bg-sk-accent" style={{ width: `${progress}%` }} />
			</div>
		)}
		{sub && <span className={`text-[12.5px] ${subClass}`}>{sub}</span>}
	</div>
);

export const Chip = ({ children, tone = "accent", className = "" }) => {
	const tones = {
		accent: "bg-sk-tint text-sk-link",
		ok: "bg-sk-ok-bg text-sk-ok",
		warn: "bg-sk-warn-bg text-sk-warn",
		muted: "bg-sk-hair text-sk-muted"
	};
	return (
		<span
			className={`inline-flex items-center rounded-lg px-2.5 py-1.5 text-[12.5px] font-semibold ${tones[tone]} ${className}`}
		>
			{children}
		</span>
	);
};

export const Table = ({ head, children, minWidth = 560 }) => (
	<div className="overflow-x-auto">
		<table className="w-full border-collapse text-sm" style={{ minWidth }}>
			<thead>
				<tr className="text-left text-[12.5px] text-sk-muted">
					{head.map((h, i) => (
						<th key={i} className="py-2 pr-2 font-semibold first:pl-0 [&:not(:first-child)]:px-2">
							{h || <span className="sr-only">Action</span>}
						</th>
					))}
				</tr>
			</thead>
			<tbody>{children}</tbody>
		</table>
	</div>
);

export const Tr = ({ children }) => (
	<tr className="border-t border-sk-hair [&>td]:px-2 [&>td]:py-3 [&>td:first-child]:pl-0">
		{children}
	</tr>
);

// Loading, empty and error placeholders shared by the data pages.
export const Loading = ({ label = "Loading" }) => (
	<div role="status" className="flex items-center gap-3 py-6 text-sm text-sk-muted">
		<span className="h-4 w-4 animate-spin rounded-full border-2 border-sk-border2 border-t-sk-accent" />
		{label}…
	</div>
);

export const Empty = ({ title, children }) => (
	<div className="flex flex-col gap-1 rounded-xl bg-sk-card2 p-4 text-sm">
		<span className="font-semibold">{title}</span>
		{children && <span className="text-sk-text2">{children}</span>}
	</div>
);

export const ErrorState = ({ error, onRetry }) => (
	<div role="alert" className="flex flex-wrap items-center gap-3 rounded-xl bg-sk-warn-bg p-4 text-sm text-sk-warn">
		<span className="flex-1">
			{error?.response?.data?.message || error?.message || "We couldn't load this."}
		</span>
		{onRetry && (
			<button type="button" onClick={onRetry} className={btnSmGhost}>
				Try again
			</button>
		)}
	</div>
);
