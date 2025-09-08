import React, { useState } from "react";
import { Button } from "primereact/button";

const conversations = [
	{
		id: 1,
		name: "User 1",
		messages: [
			{ from: "them", text: "Message 1 from User 1" },
			{ from: "me", text: "You replied to message 2" },
			{ from: "them", text: "Message 3 from User 1" },
			{ from: "me", text: "You replied to message 4" }
		]
	},
	{
		id: 2,
		name: "User 2",
		messages: [
			{ from: "them", text: "Message 1 from User 2" },
			{ from: "me", text: "You replied to message 2" },
			{ from: "them", text: "Message 3 from User 2" },
			{ from: "me", text: "You replied to message 4" }
		]
	}
];

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
			<div className="w-1/3  bg-[var(--surface-a)] border-r border-gray-200 flex flex-col min-h-0">
				<div className="flex-1 overflow-y-auto divide-y divide-blue-100">
					{conversations.map(c => (
						<div
							key={c.id}
							onClick={() => setSelectedId(c.id)}
							className={`flex items-center justify-between gap-4 p-4 px-5 cursor-pointer transition ${
								selectedId === c.id
									? "bg-[var(--gray-62)]"
									: "hover:bg-[var(--gray-62)]"
							}`}
						>
							<div className="flex items-center gap-3 overflow-hidden">
								<div className="overflow-hidden">
									<p className="font-medium text-base text-[var(--primary-color)] truncate">
										{c.name}
									</p>
									<p className="text-sm truncate">
										{c.messages.at(-1)?.from === "me" && (
											<span className="text-[var(--primary-color)]">
												You:{" "}
											</span>
										)}
										<span className="text-white">
											{c.messages.at(-1)?.text}
										</span>
									</p>
								</div>
							</div>
							<div className="flex flex-col items-end shrink-0 min-w-[50px]">
								<div className="flex items-center gap-1">
									<p className="text-sm text-gray-400">
										Yesterday
									</p>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Chat Panel */}
			<div className="w-2/3 flex flex-col border-l border-gray-200 bg-[var(--surface-a)] min-h-0">
				{/* Header */}
				<div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
					<h2 className="text-lg font-semibold text-[var(--primary-color)]">
						{selectedChat.name}
					</h2>
					<div className="flex gap-2">
						<Button
							label="View Status"
							className="px-4 py-1 border border-red-600 rounded-full text-sm"
							style={{ color: "white" }}
						/>
					</div>
				</div>

				{/* Messages and Input */}
				<div className="flex flex-col flex-1 overflow-hidden min-h-0">
					{/* Messages */}
					<div className="flex-1 px-6 py-4 overflow-y-auto space-y-4 bg-[var(--surface-a)]">
						{selectedChat.messages.map((msg, i) => (
							<div
								key={i}
								className={`max-w-[55%] px-4 py-3 text-sm rounded-xl shadow ${
									msg.from === "me"
										? "ml-auto bg-[var(--primary-color)] text-white"
										: "bg-[var(--gray-62)] text-white"
								}`}
							>
								{msg.text}
							</div>
						))}
					</div>

					<div className="border-t border-gray-200 p-4 flex gap-3">
						<input
							value={input}
							onChange={e => setInput(e.target.value)}
							onKeyDown={e => e.key === "Enter" && sendMessage()}
							className="w-full border rounded-lg px-3 py-2 text-sm"
							placeholder="Type a message..."
						/>

						<Button
							label="Send"
							className="px-4 py-1 border border-blue-600 text-blue-600 bg-transparent rounded-full text-sm"
							outlined
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
