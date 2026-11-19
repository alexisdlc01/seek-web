import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, Chip, Empty, ErrorState, Loading, Page, PageHeader, btnSmGhost } from "../components/sk.jsx";
import { DEPOSIT_SCHEMES, api, fmtDate, gbp } from "../lib/landlord.js";

const SCHEME_LABEL = Object.fromEntries(DEPOSIT_SCHEMES.map((s) => [s.value, s.label]));
const RENT = {
	PAID: { tone: "ok", label: "All paid" },
	DUE: { tone: "accent", label: "Rent due" },
	LATE: { tone: "warn", label: "Rent late" },
	NOT_DUE: { tone: "muted", label: "Not due yet" },
	NOT_LET: { tone: "muted", label: "Not let" }
};
const STATUS = { ACTIVE: ["ok", "Active"], PENDING_ACCEPTANCE: ["warn", "Waiting for tenants"] };

export default function Tenancies() {
	const tenancies = useQuery({ queryKey: ["landlord-tenancies"], queryFn: async () => (await api.get("/tenancies/landlord")).data });
	const overview = useQuery({ queryKey: ["landlord-overview"], queryFn: async () => (await api.get("/landlord/overview")).data });
	const list = tenancies.data ?? [];

	return (
		<Page className="!gap-[22px]">
			<PageHeader eyebrow={tenancies.data ? `${list.length} ${list.length === 1 ? "tenancy" : "tenancies"}` : "Your lets"} title="Tenancies" />
			{tenancies.isLoading && <Loading label="Loading tenancies" />}
			{tenancies.isError && <ErrorState error={tenancies.error} onRetry={() => tenancies.refetch()} />}
			{tenancies.data && list.length === 0 && <Empty title="No tenancies yet">Once a household moves in, it appears here.</Empty>}
			<div className="flex max-w-[860px] flex-col gap-4">
				{list.map((t) => {
					const [tone, label] = STATUS[t.status] ?? ["muted", "Ended"];
					const rent = RENT[overview.data?.properties?.find((p) => p.listingId === t.listing?._id)?.rentStatus];
					const toConfirm = (t.documents ?? []).filter((d) => d.type === "TENANCY_AGREEMENT" && d.confirmedByLandlord === false).length;
					return (
						<Card key={t._id} as="article" className="!gap-3">
							<div className="flex flex-wrap items-center justify-between gap-2">
								<div className="flex flex-col gap-0.5">
									<h2 className="font-display text-lg font-semibold">{t.listing?.propertyTitle || "Tenancy"}</h2>
									<span className="text-[13px] text-sk-muted">{(t.tenants ?? []).map((x) => x.name).join(", ") || "No tenants yet"}</span>
								</div>
								<div className="flex flex-wrap gap-2">
									{t.status === "ACTIVE" && rent && <Chip tone={rent.tone}>{rent.label}</Chip>}
									<Chip tone={tone}>{label}</Chip>
								</div>
							</div>
							<div className="flex flex-col gap-1 text-[13.5px] text-sk-text2">
								<span>{fmtDate(t.startDate)} to {t.endDate ? fmtDate(t.endDate) : "periodic"} · {gbp(t.monthlyRent)} pcm each</span>
								<span>
									Deposit: {t.depositScheme ? `${SCHEME_LABEL[t.depositScheme] ?? t.depositScheme} · ref ${t.depositReference || "-"}` : "not protected yet"}
								</span>
								<span className={toConfirm ? "font-semibold text-sk-warn" : ""}>
									{toConfirm ? `${toConfirm} tenancy agreement from email to confirm` : `${t.documents?.length ?? 0} documents`}
								</span>
							</div>
							<div className="flex flex-wrap gap-2">
								<Link to={`/contracts?tenancy=${t._id}`} className={btnSmGhost}>Contract and deposit</Link>
								<Link to="/rent" className={btnSmGhost}>Rent</Link>
							</div>
						</Card>
					);
				})}
			</div>
		</Page>
	);
}
