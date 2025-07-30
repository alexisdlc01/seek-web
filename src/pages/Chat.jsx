import React, { useState, useEffect } from "react";
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
	useEffect(() => {
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = "";
		};
	}, []);

	const [selectedId, setSelectedId] = useState(conversations[0].id);
	const [input, setInput] = useState("");
	const selectedChat = conversations.find(c => c.id === selectedId);

	const sendMessage = () => {
		if (!input.trim()) return;
		selectedChat.messages.push({ from: "me", text: input });
		setInput("");
	};

	return (
		<div className="flex h-screen bg-gray-50 border-t-2 border-gray-200">
			{/* Sidebar */}
			<div className="w-1/3 bg-blue-50 border-r border-gray-200 flex flex-col">
				{/* Top bar: Search + Filters */}
				<div className="p-4 border-b border-blue-200 bg-blue-50">
					<div className="flex items-center justify-between mb-3">
						<h2 className="text-lg font-semibold text-blue-900">
							Applicants for 14 North Street
						</h2>
						<button className="text-sm text-blue-600 border border-blue-300 rounded-full px-3 py-1 hover:bg-blue-100">
							Switch
						</button>
					</div>

					<div className="flex items-center bg-white border border-blue-200 rounded-full px-4 py-2.5 text-sm text-blue-900 shadow-sm mb-3">
						<i className="pi pi-search mr-2 text-blue-500 text-base" />
						<input
							type="text"
							placeholder="Search by Name"
							className="bg-transparent focus:outline-none w-full placeholder-blue-400 text-base"
						/>
					</div>

					<div className="flex gap-2">
						<Chip
							label="All"
							className="border border-blue-500 text-blue-600 bg-white text-xs px-2 py-0.5 rounded-full cursor-pointer"
						/>
						<Chip
							label="Unread"
							className="border border-blue-500 text-blue-600 bg-white text-xs px-2 py-0.5 rounded-full cursor-pointer"
						/>
					</div>
				</div>

				{/* Chat list */}
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
								<div className="w-11 h-11 rounded-full bg-white text-blue-900 flex items-center justify-center font-semibold text-sm border border-blue-200 shrink-0">
									{c.initials}
								</div>
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
									{Math.random() > 0.5 && (
										<div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />
									)}
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
			<div className="w-2/3 flex flex-col border-l border-gray-200 bg-white">
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
				<div className="flex flex-col flex-1 overflow-hidden">
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
				</div>
			</div>
		</div>
	);
}
