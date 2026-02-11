import { Toast, type ToastMessage } from "primereact/toast";

type MakeIconProps = { variant: ToastMessage["severity"] };

function MakeIcon({ variant }: MakeIconProps) {
	if (variant === "error") {
		return <i className="pi pi-times-circle text-red-400 text-xl" />;
	}
	return <i className="pi pi-check-circle text-green-800 text-xl" />;

}

type ShowCustomToastProps = {
	severity?: ToastMessage["severity"];
	summary: string;
	detail: string;
	life?: number,
}

export function showCustomToast(toast: Toast, {
	severity = "error",
	life = 3500,
	summary,
	detail,
}: ShowCustomToastProps) {
	toast.show({
		severity,
		summary,
		detail,
		life,
		style: {
			background: "#1E1E2F",
			color: "#fff",
			borderLeft: "5px solid #EF4444", // red accent
			borderRadius: "8px",
			boxShadow: "0 4px 15px rgba(0,0,0,0.3)"
		},
		content: (props) => (
			<div className="flex items-center space-x-3">
				<MakeIcon variant={severity} />
				<div>
					<p className="font-semibold">{props.message.summary}</p>
					<p className="text-sm text-gray-200">
						{props.message.detail}
					</p>
				</div>
			</div>
		)
	});


}
