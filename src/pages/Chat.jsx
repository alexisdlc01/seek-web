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
			{ from: "me", text: "You replied to message 4" },
			{ from: "them", text: "Message 1 from User 1" },
			{ from: "me", text: "You replied to message 2" },
			{ from: "them", text: "Message 3 from User 1" },
			{ from: "me", text: "You replied to message 4" },
			{ from: "them", text: "Message 1 from User 1" },
			{ from: "me", text: "You replied to message 2" },
			{ from: "them", text: "Message 3 from User 1" },
			{ from: "me", text: "You replied to message 4" },
			{ from: "them", text: "Message 1 from User 1" },
			{ from: "me", text: "You replied to message 2" },
			{ from: "them", text: "Message 3 from User 1" },
			{ from: "me", text: "You replied to message 4" }
		]
	},
	{
		id: 23,
		name: "User 2",
		messages: [
			{ from: "them", text: "Message 1 from User 2" },
			{ from: "me", text: "You replied to message 2" },
			{ from: "them", text: "Message 3 from User 2" },
			{ from: "me", text: "You replied to message 4" }
		]
	},
	{
		id: 42,
		name: "User 2",
		messages: [
			{ from: "them", text: "Message 1 from User 2" },
			{ from: "me", text: "You replied to message 2" },
			{ from: "them", text: "Message 3 from User 2" },
			{ from: "me", text: "You replied to message 4" }
		]
	},
	{
		id: 24,
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
	const [mobileView, setMobileView] = useState("list"); // 'list' | 'chat'
	const selectedChat = conversations.find(c => c.id === selectedId);

	const openChat = id => {
		setSelectedId(id);
		setMobileView("chat");
	};

	const sendMessage = () => {
		if (!input.trim()) return;
		selectedChat.messages.push({ from: "me", text: input });
		setInput("");
	};

	return (
		<div className="fixed inset-x-0 bottom-0 top-16 bg-gray-50">
			{/* ===== Desktop (>= md): unchanged layout/colors ===== */}
			<div className="hidden md:flex h-full overflow-hidden">
				{/* Sidebar */}
				<div className="w-1/3 bg-[var(--surface-a)] border-r-1 border-[var(--gray-900)] flex flex-col min-h-0">
					<div className="flex-1 overflow-y-auto divide-y divide-[var(--gray-900)]">
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
											{c.messages.at(-1)?.from ===
												"me" && (
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
				<div className="w-2/3 flex flex-col bg-[var(--surface-a)] min-h-0">
					{/* Header */}
					<div className="flex items-center justify-between px-6 py-4 border-b-1 border-[var(--gray-900)]">
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

					{/* Messages + Input */}
					<div className="flex flex-col flex-1 overflow-hidden min-h-0">
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

						<div className="border-t-1 border-[var(--gray-900)] p-4 flex gap-3">
							<input
								value={input}
								onChange={e => setInput(e.target.value)}
								onKeyDown={e =>
									e.key === "Enter" && sendMessage()
								}
								className="w-full rounded-lg px-3 py-2 text-sm text-white placeholder:!text-white"
								placeholder="Type a message..."
								style={{ backgroundColor: "var(--gray-62)" }}
							/>
							<Button
								label="Send"
								className="px-4 py-1 border border-blue-600 text-blue-600 bg-transparent rounded-full text-sm"
								style={{ color: "white" }}
							/>
						</div>
					</div>
				</div>
			</div>

			{/* ===== Mobile (< md): List view ===== */}
			<div
				className={`${
					mobileView === "list" ? "flex" : "hidden"
				} md:hidden h-full overflow-hidden`}
			>
				<div className="w-full bg-[var(--surface-a)] flex flex-col min-h-0">
					{/* Mobile List Header */}
					<div className="flex items-center justify-between px-5 py-3 border-b-1 border-[var(--gray-900)]">
						<h2 className="text-lg font-semibold text-[var(--primary-color)]">
							Chats
						</h2>
					</div>

					{/* Conversations */}
					<div className="flex-1 overflow-y-auto divide-y divide-[var(--gray-900)]">
						{conversations.map(c => (
							<div
								key={c.id}
								onClick={() => openChat(c.id)}
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
											{c.messages.at(-1)?.from ===
												"me" && (
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
									<p className="text-sm text-gray-400">
										Yesterday
									</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* ===== Mobile (< md): Chat view ===== */}
			<div
				className={`${
					mobileView === "chat" ? "flex" : "hidden"
				} md:hidden h-full overflow-hidden`}
			>
				<div className="w-full flex flex-col bg-[var(--surface-a)] min-h-0">
					{/* Mobile Chat Header */}
					<div className="flex items-center justify-between px-4 py-3 border-b-1 border-[var(--gray-900)]">
						<div className="flex items-center gap-3">
							<button
								onClick={() => setMobileView("list")}
								className="text-[var(--primary-color)] text-xl leading-none"
								aria-label="Back to chats"
							>
								←
							</button>
							<h2 className="text-lg font-semibold text-[var(--primary-color)]">
								{selectedChat.name}
							</h2>
						</div>
						<div className="flex gap-2">
							<Button
								label="View Status"
								className="px-3 py-1 border border-red-600 rounded-full text-sm"
								style={{ color: "white" }}
							/>
						</div>
					</div>

					{/* Messages + Input */}
					<div className="flex flex-col flex-1 overflow-hidden min-h-0">
						<div className="flex-1 px-4 py-4 overflow-y-auto space-y-3 bg-[var(--surface-a)]">
							{selectedChat.messages.map((msg, i) => (
								<div
									key={i}
									className={`max-w-[80%] px-4 py-3 text-sm rounded-xl shadow ${
										msg.from === "me"
											? "ml-auto bg-[var(--primary-color)] text-white"
											: "bg-[var(--gray-62)] text-white"
									}`}
								>
									{msg.text}
								</div>
							))}
						</div>

						<div className="border-t-1 border-[var(--gray-900)] p-3 flex gap-2">
							<input
								value={input}
								onChange={e => setInput(e.target.value)}
								onKeyDown={e =>
									e.key === "Enter" && sendMessage()
								}
								className="w-full rounded-lg px-3 py-2 text-sm text-white placeholder:!text-white"
								placeholder="Type a message..."
								style={{ backgroundColor: "var(--gray-62)" }}
							/>
							<Button
								label="Send"
								className="px-3 py-1 border border-blue-600 text-blue-600 bg-transparent rounded-full text-sm"
								style={{ color: "white" }}
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
