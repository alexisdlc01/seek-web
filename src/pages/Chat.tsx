import React, { Dispatch, Ref, SetStateAction, useRef, useState } from "react";
import { Button } from "primereact/button";
import { ConversationDto, MessageDto } from "../client";
import { Toast } from "primereact/toast";

export default function ChatPage() {
	const [selectedId, setSelectedId] = useState(conversations[0]._id);
	const [chats, setChats] = useState(conversations);
	const toast: Ref<Toast> = useRef(null);

	const selectedChat = chats.find(c => c._id === selectedId);

	const sendMessage = async (message: string) => {
		if (!message.trim()) return;

		const msg: MessageDto = {
			sender: "me",
			data: message,
			_id: "" + Math.random(),
			messageType: "Text",
			createdAt: "2025-12-01T10:05:00Z",
			conversation: selectedId,
			seenUsers: [],
			deliveredTo: []
		};

		setChats(curr => {
			// modify the current chat in place
			const idx = curr.findIndex(val => val._id === selectedId);
			if (idx === -1) {
				console.log("failed to find chat");
				return;
			}

			const chat = curr[idx];
			const modified: ConversationDto = {
				...chat,
				messages: chat.messages.concat(msg)
			};

			const output = [...curr];
			output.splice(idx, 1, modified);
			return output;
		});
	};

	return (
		<div className="fixed inset-x-0 bottom-0 top-16 bg-gray-50">
			<Toast ref={toast} />
			<div className="flex h-full overflow-hidden">
				<div className="w-1/3 bg-[var(--surface-a)] border-r-1 border-[var(--gray-900)] flex flex-col min-h-0">
					<div className="flex-1 overflow-y-auto divide-y divide-[var(--gray-900)]">
						{chats.map(conversation => (
							<ConverationsElem
								key={conversation._id}
								converation={conversation}
								selected={selectedId}
								setSelected={setSelectedId}
							/>
						))}
					</div>
				</div>

				{/* Chat Panel */}
				<div className="w-2/3 flex flex-col bg-[var(--surface-a)] min-h-0">
					{/* Header */}
					<div className="flex items-center justify-between px-6 py-4 border-b-1 border-[var(--gray-900)]">
						<div className="flex-col items-center gap-3">
							<h2 className="text-lg font-semibold text-[var(--primary-color)]">
								{selectedChat.name}
							</h2>
							<p className="text-sm text-gray-400">
								Members: {selectedChat.users}
							</p>
						</div>

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
						<div className="flex-1 px-4 py-4 overflow-y-auto space-y-3 bg-[var(--surface-a)]">
							{selectedChat.messages.map((msg, i) => (
								<ChatMessage
									key={msg._id}
									isLast={i === selectedChat.messages.length}
									isMe={msg.sender === "me"}
									data={msg}
								/>
							))}
						</div>

						{/* Input */}
						<ChatInput send={sendMessage} toast={toast.current} />
					</div>
				</div>
			</div>
		</div>
	);
}

type ChatInputProps = {
	send: (message: string) => Promise<void>;
	toast: Toast | null;
};

function ChatInput({ send, toast }: ChatInputProps) {
	const [input, setInput] = useState<string>("");

	const handleSend = async () => {
		try {
			await send(input);
		} catch {
			toast?.show({
				severity: "error",
				summary: "Failed to send message",
				detail: "Failed to send a message in this chat",
				life: 3000
			});
		} finally {
			setInput("");
		}
	};

	return (
		<div className="border-t-1 border-[var(--gray-900)] p-4 flex gap-3">
			<input
				value={input}
				onChange={e => setInput(e.target.value)}
				onKeyDown={e => e.key === "Enter" && handleSend()}
				className="w-full rounded-lg px-3 py-2 text-sm text-white placeholder:!text-white"
				placeholder="Type a message..."
				style={{ backgroundColor: "var(--gray-62)" }}
			/>
			<Button
				onClick={() => handleSend()}
				label="Send"
				className="px-4 py-1 border border-blue-600 text-blue-600 bg-transparent rounded-full text-sm"
				style={{ color: "white" }}
			/>
		</div>
	);
}

type ChatMessageProp = {
	data: MessageDto;
	isLast: boolean;
	isMe: boolean;
};

function ChatMessage({ data, isMe, isLast }: ChatMessageProp) {
	const showLabel = !isLast || !isMe;

	return (
		<div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
			<div className="max-w-[55%]">
				{showLabel && (
					<div
						className={`text-xs mb-1 ${
							isMe ? "text-right" : ""
						} text-gray-300`}
					>
						{data.sender}
					</div>
				)}
				<div
					className={`px-4 py-3 text-sm rounded-xl shadow ${
						isMe
							? "bg-[var(--primary-color)] text-white"
							: "bg-[var(--gray-62)] text-white"
					}`}
				>
					{data.data}
				</div>
			</div>
		</div>
	);
}

type ConverationElemProp = {
	selected: string;
	setSelected: Dispatch<SetStateAction<string>>;
	converation: ConversationDto;
};

function ConverationsElem({
	selected,
	setSelected,
	converation
}: ConverationElemProp) {
	return (
		<div
			key={converation._id}
			onClick={() => setSelected(converation._id)}
			className={`flex items-center justify-between gap-4 p-4 px-5 cursor-pointer transition ${
				selected === converation._id
					? "bg-[var(--gray-62)]"
					: "hover:bg-[var(--gray-62)]"
			}`}
		>
			<div className="flex items-center gap-3 overflow-hidden">
				<div className="overflow-hidden">
					<p className="font-medium text-base text-[var(--primary-color)] truncate">
						{converation.name}
					</p>
					<p className="text-sm truncate">
						{converation.messages.at(-1)?.sender === "me" && (
							<span className="text-[var(--primary-color)]">
								You:{" "}
							</span>
						)}
						<span className="text-white">
							{converation.messages.at(-1)?.data}
						</span>
					</p>
				</div>
			</div>
			<div className="flex flex-col items-end shrink-0 min-w-[50px]">
				<div className="flex items-center gap-1">
					<p className="text-sm text-gray-400">Yesterday</p>
				</div>
			</div>
		</div>
	);
}

// HEATHCOTE
// {
// 	/* ===== Mobile (< md): List view ===== */
// }
// <div
// 	className={`${
// 		mobileView === "list" ? "flex" : "hidden"
// 	} md:hidden h-full overflow-hidden`}
// >
// 	<div className="w-full bg-[var(--surface-a)] flex flex-col min-h-0">
// 		{/* Mobile List Header */}
// 		<div className="flex items-center justify-between px-5 py-3 border-b-1 border-[var(--gray-900)]">
// 			<h2 className="text-lg font-semibold text-[var(--primary-color)]">
// 				Chats
// 			</h2>
// 		</div>
//
// 		{/* Conversations */}
// 		<div className="flex-1 overflow-y-auto divide-y divide-[var(--gray-900)]">
// 			{conversations.map(c => (
// 				<div
// 					key={c.id}
// 					onClick={() => openChat(c.id)}
// 					className={`flex items-center justify-between gap-4 p-4 px-5 cursor-pointer transition ${
// 						selectedId === c.id
// 							? "bg-[var(--gray-62)]"
// 							: "hover:bg-[var(--gray-62)]"
// 					}`}
// 				>
// 					<div className="flex items-center gap-3 overflow-hidden">
// 						<div className="overflow-hidden">
// 							<p className="font-medium text-base text-[var(--primary-color)] truncate">
// 								{c.name}
// 							</p>
// 							<p className="text-sm truncate">
// 								{c.messages.at(-1)?.from === "me" && (
// 									<span className="text-[var(--primary-color)]">
// 										You:{" "}
// 									</span>
// 								)}
// 								<span className="text-white">
// 									{c.messages.at(-1)?.text}
// 								</span>
// 							</p>
// 						</div>
// 					</div>
// 					<div className="flex flex-col items-end shrink-0 min-w-[50px]">
// 						<p className="text-sm text-gray-400">Yesterday</p>
// 					</div>
// 				</div>
// 			))}
// 		</div>
// 	</div>
// </div>;
//
// {
// 	/* ===== Mobile (< md): Chat view ===== */
// }
// <div
// 	className={`${
// 		mobileView === "chat" ? "flex" : "hidden"
// 	} md:hidden h-full overflow-hidden`}
// >
// 	<div className="w-full flex flex-col bg-[var(--surface-a)] min-h-0">
// 		{/* Mobile Chat Header */}
// 		<div className="flex items-center justify-between px-4 py-3 border-b-1 border-[var(--gray-900)]">
// 			<div className="flex items-center gap-3">
// 				<button
// 					onClick={() => setMobileView("list")}
// 					className="text-[var(--primary-color)] text-xl leading-none"
// 					aria-label="Back to chats"
// 				>
// 					←
// 				</button>
// 				<div className="flex-col items-center gap-3">
// 					<h2 className="text-lg font-semibold text-[var(--primary-color)]">
// 						{selectedChat.name}
// 					</h2>
// 					<p className="text-sm text-gray-400">
// 						Members: {selectedChat.members}
// 					</p>
// 				</div>
// 			</div>
// 			<div className="flex gap-2">
// 				<Button
// 					label="View Status"
// 					className="px-3 py-1 border border-red-600 rounded-full text-sm"
// 					style={{ color: "white" }}
// 				/>
// 			</div>
// 		</div>
//
// 		{/* Messages + Input */}
// 		<div className="flex flex-col flex-1 overflow-hidden min-h-0">
// 			<div className="flex-1 px-4 py-4 overflow-y-auto space-y-3 bg-[var(--surface-a)]">
// 				{selectedChat.messages.map((msg, i) => {
// 					const isMe = msg.from === "me";
// 					const showLabel =
// 						i === 0 ||
// 						selectedChat.messages[i - 1].from !== msg.from;
// 					return (
// 						<div
// 							key={i}
// 							className={`flex ${
// 								isMe ? "justify-end" : "justify-start"
// 							}`}
// 						>
// 							<div className="max-w-[80%]">
// 								{showLabel && (
// 									<div
// 										className={`text-xs mb-1 ${
// 											isMe ? "text-right" : ""
// 										} text-gray-300`}
// 									>
// 										{msg.from}
// 									</div>
// 								)}
// 								<div
// 									className={`px-4 py-3 text-sm rounded-xl shadow ${
// 										isMe
// 											? "bg-[var(--primary-color)] text-white"
// 											: "bg-[var(--gray-62)] text-white"
// 									}`}
// 								>
// 									{msg.text}
// 								</div>
// 							</div>
// 						</div>
// 					);
// 				})}
// 			</div>
//
// 			<div className="border-t-1 border-[var(--gray-900)] p-3 flex gap-2">
// 				<input
// 					value={input}
// 					onChange={e => setInput(e.target.value)}
// 					onKeyDown={e => e.key === "Enter" && sendMessage()}
// 					className="w-full rounded-lg px-3 py-2 text-sm text-white placeholder:!text-white"
// 					placeholder="Type a message..."
// 					style={{ backgroundColor: "var(--gray-62)" }}
// 				/>
// 				<Button
// 					label="Send"
// 					className="px-3 py-1 border border-blue-600 text-blue-600 bg-transparent rounded-full text-sm"
// 					style={{ color: "white" }}
// 				/>
// 			</div>
// 		</div>
// 	</div>
// </div>;
//
//
//

const textMessage: MessageDto = {
	_id: "m1",
	sender: "Alice",
	messageType: "Text",
	data: "Is the room still available?",
	createdAt: "2025-12-23T10:00:00Z",
	conversation: "c1",
	seenUsers: ["Alice", "Bob"],
	deliveredTo: ["Bob"]
};

var conversations: ConversationDto[] = [
	// 1. Private Chat
	{
		_id: "c1",
		name: "Alice & Bob",
		createdAt: "2025-12-01T10:00:00Z",
		groupDescription: "Direct message",
		avatar: "avatar_alice.png",
		users: ["Alice", "Bob"],
		messages: [
			{
				_id: "m1",
				sender: "Alice",
				messageType: "Text",
				data: "Hi Bob!",
				createdAt: "2025-12-01T10:05:00Z",
				conversation: "c1",
				seenUsers: ["Alice", "Bob"],
				deliveredTo: ["Bob"]
			}
		]
	},

	// 2. House Group Chat
	{
		_id: "c2",
		name: "221B Baker St. Residents",
		createdAt: "2025-11-15T09:00:00Z",
		groupDescription: "Official group for the Baker St. house.",
		avatar: "house_icon.jpg",
		users: ["Alice", "Bob", "Charlie", "Dave"],
		messages: [
			{
				_id: "m2",
				sender: "Dave",
				messageType: "Text",
				data: "Who left the fridge open?",
				createdAt: "2025-12-23T08:00:00Z",
				conversation: "c2",
				seenUsers: ["Dave"],
				deliveredTo: ["Alice", "Bob", "Charlie"]
			}
		]
	},

	// 3. Application Discussion
	{
		_id: "c3",
		name: "Smith Family Application",
		createdAt: "2025-12-20T14:30:00Z",
		groupDescription: "Discussing the lease for the Smith family.",
		avatar: "folder_icon.png",
		users: ["Landlord_Joe", "Emma_Smith", "Ethan_Smith"],
		messages: []
	},

	// 4. Viewing Coordination
	{
		_id: "c4",
		name: "Viewing - Friday 4pm",
		createdAt: "2025-12-22T11:00:00Z",
		groupDescription: "Coordinating the walkthrough.",
		avatar: "calendar_icon.png",
		users: ["Agent_Sarah", "Alice", "Bob"],
		messages: [
			{
				_id: "m3",
				sender: "Agent_Sarah",
				messageType: "Image",
				data: "map_location.png",
				createdAt: "2025-12-22T11:05:00Z",
				conversation: "c4",
				seenUsers: ["Agent_Sarah", "Alice"],
				deliveredTo: ["Bob"]
			}
		]
	},

	// 5. Maintenance Requests
	{
		_id: "c5",
		name: "Maintenance Support",
		createdAt: "2025-10-01T12:00:00Z",
		groupDescription: "Report repairs here.",
		avatar: "wrench_icon.png",
		users: ["Alice", "Admin_Repair"],
		messages: [
			{
				_id: "m4",
				sender: "Alice",
				messageType: "Text",
				data: "The sink is leaking again.",
				createdAt: "2025-12-23T18:00:00Z",
				conversation: "c5",
				seenUsers: ["Alice"],
				deliveredTo: ["Admin_Repair"]
			}
		]
	}
];
