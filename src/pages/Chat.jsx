import React, { useState } from "react";
import { Button } from "primereact/button";
import { Chip } from "primereact/chip";

const conversations = Array.from({ length: 20 }, (_, i) => {
	const messages = Array.from({ length: 50 }, (_, j) => ({
		from: j % 2 === 0 ? "them" : "me",
		text:
			j % 2 === 0
				? `Message ${j + 1} from User ${i + 1}`
				: `You replied to message ${j + 1}`
	}));
	return {
		id: i + 1,
		name: `User ${i + 1}`,
		initials: `U${i + 1}`,
		messages
	};
});

export default function ChatPage() {
	const [selectedId, setSelectedId] = useState(conversations[0].id);
	const [input, setInput] = useState("");
	const selectedChat = conversations.find(c => c.id === selectedId);

	const sendMessage = () => {
		if (!input.trim()) return;
		selectedChat.messages.push({ from: "me", text: input });
		setInput("");
	};

	return (
		<div className="fixed inset-x-0 bottom-0 top-16 flex overflow-hidden bg-gray-50">
			{/* Sidebar */}
			<div className="w-1/3 bg-blue-50 border-r border-gray-200 flex flex-col min-h-0">
				<div className="flex-1 overflow-y-auto divide-y divide-blue-100">
					{conversations.map(c => (
						<div
							key={c.id}
							onClick={() => setSelectedId(c.id)}
							className={`flex items-center justify-between gap-4 p-4 px-5 cursor-pointer transition ${
								selectedId === c.id
									? "bg-white shadow-sm"
									: "hover:bg-white"
							}`}
						>
							<div className="flex items-center gap-3 overflow-hidden">
								<div className="overflow-hidden">
									<p className="font-medium text-base text-blue-900 truncate">
										{c.name}
									</p>
									<p className="text-sm text-gray-500 truncate">
										{c.messages.at(-1)?.from === "me"
											? "You: "
											: ""}
										{c.messages.at(-1)?.text}
									</p>
								</div>
							</div>
							<div className="flex flex-col items-end shrink-0 min-w-[50px]">
								<div className="flex items-center gap-1">
									<p className="text-sm text-gray-400">
										{new Date().toLocaleTimeString([], {
											hour: "2-digit",
											minute: "2-digit"
										})}
									</p>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Chat Panel */}
			<div className="w-2/3 flex flex-col border-l border-gray-200 bg-white min-h-0">
				{/* Header */}
				<div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
					<h2 className="text-lg font-semibold text-gray-800">
						{selectedChat.name}
					</h2>
					<div className="flex gap-2">
						<Button
							label="Approve"
							icon="pi pi-check"
							className="px-4 py-1 border border-green-600 text-green-600 bg-transparent rounded-full text-sm"
							outlined
						/>
						<Button
							label="Reject"
							icon="pi pi-times"
							className="px-4 py-1 border border-red-600 text-red-600 bg-transparent rounded-full text-sm"
							outlined
						/>
					</div>
				</div>

				{/* Messages and Input */}
				<div className="flex flex-col flex-1 overflow-hidden min-h-0">
					{/* Messages */}
					<div className="flex-1 px-6 py-4 overflow-y-auto space-y-3 bg-gray-50">
						{selectedChat.messages.map((msg, i) => (
							<div
								key={i}
								className={`max-w-[75%] px-4 py-2 text-sm rounded-xl shadow ${
									msg.from === "me"
										? "ml-auto bg-blue-100 text-blue-900"
										: "bg-white text-gray-800"
								}`}
							>
								{msg.text}
							</div>
						))}
					</div>

					<div className="border-t border-gray-200 p-4">
						<input
							value={input}
							onChange={e => setInput(e.target.value)}
							onKeyDown={e => e.key === "Enter" && sendMessage()}
							className="w-full border rounded-lg px-3 py-2 text-sm"
							placeholder="Type a message..."
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
