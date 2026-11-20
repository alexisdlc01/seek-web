import RepairsPanel from "../components/RepairsPanel.jsx";
import { Page, PageHeader } from "../components/sk.jsx";

export default function Repairs() {
	return (
		<Page>
			<PageHeader eyebrow="Reported by your tenants" title="Repairs" />
			<RepairsPanel />
		</Page>
	);
}
