import { useState } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputTextarea } from "primereact/inputtextarea";

// Decline with an optional reason (max 500, as RejectApplicationDto); the household sees it.
export default function DeclineDialog({
	visible,
	busy,
	onHide,
	onConfirm
}: {
	visible: boolean;
	busy?: boolean;
	onHide: () => void;
	onConfirm: (reason?: string) => void;
}) {
	const [reason, setReason] = useState("");
	return (
		<Dialog
			header="Decline this household"
			draggable={false}
			visible={visible}
			style={{ width: "30rem" }}
			modal
			onHide={onHide}
			footer={
				<div className="flex justify-end gap-2">
					<Button label="Cancel" severity="secondary" onClick={onHide} />
					<Button
						label="Decline"
						severity="danger"
						loading={busy}
						onClick={() => {
							onConfirm(reason.trim() || undefined);
							setReason("");
						}}
					/>
				</div>
			}
		>
			<p className="mb-3 text-[var(--text-color-secondary)]">
				Optionally tell them why. The household will see this message.
			</p>
			<InputTextarea
				autoFocus
				value={reason}
				maxLength={500}
				onChange={e => setReason(e.target.value)}
				rows={4}
				className="w-full"
				placeholder="Reason (optional)"
			/>
		</Dialog>
	);
}
