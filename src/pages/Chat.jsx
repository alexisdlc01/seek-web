import React, { useState, useEffect } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { useNavigate } from "react-router-dom";

const conversations = Array.from({ length: 20 }, (_, i) => ({
	id: i + 1,
	name: `User ${i + 1}`,
	initials: `U${i + 1}`,
	messages: [
		{ from: "them", text: "Sample message?" },
		{ from: "me", text: "Yes!" }
	]
}));

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
		<div className="flex h-screen bg-gray-50">
			<div className="w-1/3 bg-blue-100 border-r border-gray-200 h-screen flex flex-col">
				{/* Fixed Top: Title + Search + Buttons */}
				<div className="p-4 pb-2">
					<h2 className="text-center text-lg font-semibold text-blue-900 mb-4">
						Chat with Applicants
					</h2>

					<div className="flex flex-col items-center gap-3">
						<InputText
							placeholder="Search..."
							className="w-full px-4 py-2 text-sm border-blue-300 rounded-full"
						/>

						<div className="flex justify-center gap-2 flex-wrap">
							<Button
								label="All"
								className="text-blue-700 border-blue-300 bg-blue-50 rounded-full px-4 py-1 text-xs"
								outlined
							/>
							<Button
								label="Unread"
								className="text-blue-700 border-blue-300 bg-blue-50 rounded-full px-4 py-1 text-xs"
								outlined
							/>
							<Button
								label="Switch"
								className="text-blue-700 border-blue-300 bg-blue-50 rounded-full px-4 py-1 text-xs"
								outlined
							/>
						</div>
					</div>
				</div>

				{/* Scrollable Users List */}
				<div className="flex-1 overflow-y-auto p-4 pt-2 space-y-4">
					{conversations.map(c => (
						<div
							key={c.id}
							onClick={() => setSelectedId(c.id)}
							className={`p-3 rounded-xl cursor-pointer hover:bg-white transition ${
								selectedId === c.id ? "bg-white shadow" : ""
							}`}
						>
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 rounded-full bg-white text-blue-900 flex items-center justify-center font-semibold text-sm border border-blue-200">
									{c.initials}
								</div>
								<span>{c.name}</span>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Right Panel */}
			<div className="w-2/3 flex flex-col px-6 py-4">
				<div className="mb-4">
					<h2 className="text-xl font-semibold">
						{selectedChat.name}
					</h2>
				</div>

				<div className="flex-1 border border-gray-200 rounded-xl bg-white p-4 overflow-y-auto space-y-3 mb-4 max-h-[60vh]">
					{selectedChat.messages.map((msg, i) => (
						<div
							key={i}
							className={`max-w-[75%] px-4 py-2 text-sm rounded-xl shadow-sm ${
								msg.from === "me"
									? "ml-auto bg-blue-100 text-blue-900"
									: "bg-gray-100 text-gray-800"
							}`}
						>
							{msg.text}
						</div>
					))}
				</div>

				<div className="flex gap-2 mb-4">
					<InputText
						value={input}
						onChange={e => setInput(e.target.value)}
						placeholder="Type a message..."
						className="flex-1 rounded-xl"
						onKeyDown={e => e.key === "Enter" && sendMessage()}
					/>
					<Button
						icon="pi pi-send"
						className="w-10 h-10 p-0 border border-blue-600 text-blue-600 bg-transparent rounded-full flex items-center justify-center"
						outlined
						onClick={sendMessage}
					/>
				</div>

				<div className="flex justify-center gap-4">
					<Button
						label="Approve"
						icon="pi pi-check"
						className="px-6 py-2 border border-green-600 text-green-600 bg-transparent rounded-xl"
						outlined
					/>
					<Button
						label="Reject"
						icon="pi pi-times"
						className="px-6 py-2 border border-red-600 text-red-600 bg-transparent rounded-xl"
						outlined
					/>
				</div>
			</div>
		</div>
	);
}
