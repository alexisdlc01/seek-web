import React, { Dispatch, Ref, SetStateAction, useContext, useRef, useState } from "react";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import UserContext from "../context/UserContext.jsx";

type ChatUser = {
	_id: string;
	name: string;
	profilePicUrl?: string;
};

type MessageType = "Text" | "Image";

type Message = {
	_id: string;
	sender: ChatUser;
	messageType: MessageType;
	data: string;
	createdAt: string;
	conversation: string;
	seenUsers: string[];
	deliveredTo: string[];
};

type Conversation = {
	_id: string;
	name: string;
	createdAt: string;
	groupDescription: string;
	avatar?: string;
	users: ChatUser[];
	unreadCount?: number;
	messages: Message[];
};

export default function ChatPage() {
	const { user: currentUser } = useContext(UserContext) as { user?: ChatUser };
	const [selectedId, setSelectedId] = useState(conversations[0]?._id);
	const [chats, setChats] = useState(conversations);
	const [search, setSearch] = useState("");
	const toast: Ref<Toast> = useRef(null);

	const selectedChat = chats.find(c => c._id === selectedId);
	const visibleChats = chats.filter(c =>
		c.name.toLowerCase().includes(search.toLowerCase())
	);

	const isMe = (msg: Message) => !!currentUser && msg.sender._id === currentUser._id;

	const sendMessage = async (message: string) => {
		if (!message.trim() || !selectedId || !currentUser) return;

		const msg: Message = {
			sender: currentUser,
			data: message,
			_id: `local-${Date.now()}`,
			messageType: "Text",
			createdAt: new Date().toISOString(),
			conversation: selectedId,
			seenUsers: [currentUser._id],
			deliveredTo: []
		};

		setChats(curr => {
			const idx = curr.findIndex(val => val._id === selectedId);
			if (idx === -1) return curr;

			const chat = curr[idx];
			const modified: Conversation = {
				...chat,
				messages: chat.messages.concat(msg)
			};

			const output = [...curr];
			output.splice(idx, 1, modified);
			return output;
		});
	};

	return (
		<div className="fixed inset-x-0 bottom-0 top-16 bg-[var(--surface-a)]">
			<Toast ref={toast} />
			<div className="flex h-full overflow-hidden">
				<div className="w-1/3 bg-[var(--surface-a)] border-r-1 border-[var(--gray-900)] flex flex-col min-h-0">
					<div className="flex items-center gap-2 px-4 pt-6 pb-4">
						<div className="relative flex-1">
							<i className="pi pi-search absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
							<input
								value={search}
								onChange={e => setSearch(e.target.value)}
								type="text"
								placeholder="Search conversations"
								className="w-full rounded-lg text-sm text-white placeholder:text-gray-400"
								style={{ background: "var(--gray-62)", paddingLeft: "2.5rem" }}
							/>
						</div>
						<button
							type="button"
							className="shrink-0 rounded-lg p-2.5 flex items-center justify-center"
							style={{ background: "var(--gray-62)" }}
							aria-label="Filter conversations"
						>
							<i className="pi pi-sliders-h text-white text-sm" />
						</button>
					</div>
					<div className="flex-1 overflow-y-auto divide-y divide-[var(--gray-900)]">
						{visibleChats.map(conversation => (
							<ConverationsElem
								key={conversation._id}
								converation={conversation}
								currentUser={currentUser}
								selected={selectedId}
								setSelected={setSelectedId}
							/>
						))}
						{visibleChats.length === 0 && (
							<div className="p-6 text-center text-sm text-gray-400">
								No conversations found
							</div>
						)}
					</div>
				</div>

				{/* Chat Panel */}
				<div className="w-2/3 flex flex-col bg-[var(--surface-a)] min-h-0">
					{selectedChat ? (
						<>
							{/* Header */}
							<div className="flex items-center justify-between px-6 py-4 border-b-1 border-[var(--gray-900)]">
								<div className="flex items-center gap-3">
									<ConversationAvatar conversation={selectedChat} size={44} />
									<div className="flex flex-col">
										<h2 className="text-lg font-semibold text-white">
											{selectedChat.name}
										</h2>
										<p className="text-sm text-gray-400">
											Members: {formatMembers(selectedChat.users)}
										</p>
									</div>
								</div>

								<div className="flex gap-2">
									<Button
										label="View Status"
										className="px-4 py-1 border border-red-500 text-red-500 bg-transparent rounded-full text-sm"
									/>
								</div>
							</div>

							{/* Messages + Input */}
							<div className="flex flex-col flex-1 overflow-hidden min-h-0">
								<div className="flex-1 px-4 py-4 overflow-y-auto space-y-3 bg-[var(--surface-a)]">
									{selectedChat.messages.length === 0 ? (
										<div className="h-full flex items-center justify-center text-sm text-gray-400">
											No messages yet
										</div>
									) : (
										renderMessages(selectedChat.messages, isMe)
									)}
								</div>

								{/* Input */}
								<ChatInput send={sendMessage} toast={toast.current} />
							</div>
						</>
					) : (
						<div className="h-full flex items-center justify-center text-sm text-gray-400">
							Select a conversation to start chatting
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

function renderMessages(messages: Message[], isMe: (msg: Message) => boolean) {
	const items: React.ReactNode[] = [];
	let lastDayKey: string | null = null;

	messages.forEach((msg, i) => {
		const dayKey = new Date(msg.createdAt).toDateString();
		if (dayKey !== lastDayKey) {
			items.push(
				<DateDivider key={`divider-${dayKey}`} label={formatDayDivider(msg.createdAt)} />
			);
			lastDayKey = dayKey;
		}

		const prev = messages[i - 1];
		const consecutive =
			!!prev &&
			prev.sender._id === msg.sender._id &&
			new Date(prev.createdAt).toDateString() === dayKey;

		items.push(
			<ChatMessage
				key={msg._id}
				data={msg}
				isMe={isMe(msg)}
				showLabel={!isMe(msg) && !consecutive}
			/>
		);
	});

	return items;
}

function formatMembers(users: ChatUser[]): string {
	const names = users.map(u => u.name);
	return names.length === 2 ? names.join(" & ") : names.join(", ");
}

function startOfDay(date: Date) {
	return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function daysBetween(a: Date, b: Date) {
	return Math.round((startOfDay(a).getTime() - startOfDay(b).getTime()) / 86400000);
}

function formatDayDivider(dateStr: string): string {
	const date = new Date(dateStr);
	const now = new Date();
	const diff = daysBetween(now, date);

	if (diff === 0) return "Today";
	if (diff === 1) return "Yesterday";
	if (diff > 1 && diff < 7) return date.toLocaleDateString([], { weekday: "long" });
	return date.toLocaleDateString([], {
		month: "long",
		day: "numeric",
		year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined
	});
}

function formatListTimestamp(dateStr?: string): string {
	if (!dateStr) return "";
	const date = new Date(dateStr);
	const now = new Date();
	const diff = daysBetween(now, date);

	if (diff === 0) return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
	if (diff === 1) return "Yesterday";
	if (diff > 1 && diff < 7) return date.toLocaleDateString([], { weekday: "short" });
	return date.toLocaleDateString([], {
		month: "short",
		day: "numeric",
		year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined
	});
}

function DateDivider({ label }: { label: string }) {
	return (
		<div className="flex items-center gap-3 px-2">
			<div className="flex-1 h-px bg-[var(--gray-900)]" />
			<span className="text-xs text-gray-400 shrink-0">{label}</span>
			<div className="flex-1 h-px bg-[var(--gray-900)]" />
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
		<div className="border-t-1 border-[var(--gray-900)] p-4 flex items-center gap-3">
			<button
				type="button"
				className="shrink-0 rounded-full p-2.5 flex items-center justify-center"
				style={{ backgroundColor: "var(--gray-62)" }}
				aria-label="Attach file"
			>
				<i className="pi pi-paperclip text-white text-sm" />
			</button>
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
				className="px-4 py-1 border border-blue-400 text-blue-400 bg-transparent rounded-full text-sm"
			/>
		</div>
	);
}

type ChatMessageProp = {
	data: Message;
	isMe: boolean;
	showLabel: boolean;
};

function ChatMessage({ data, isMe, showLabel }: ChatMessageProp) {
	return (
		<div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
			<div className="max-w-[55%]">
				{showLabel && (
					<div className="text-xs mb-1 text-gray-300">{data.sender.name}</div>
				)}
				<div
					className={`px-4 py-3 text-sm rounded-xl shadow-sm border ${
						isMe
							? "bg-[var(--primary-color)] text-white border-[var(--primary-color)]"
							: "chat-bubble--received"
					}`}
				>
					<MessageContent data={data} />
				</div>
				<div
					className={`text-xs mt-1 text-gray-400 ${
						isMe ? "text-right" : ""
					}`}
				>
					{new Date(data.createdAt).toLocaleTimeString([], {
						hour: "numeric",
						minute: "2-digit"
					})}
				</div>
			</div>
		</div>
	);
}

function MessageContent({ data }: { data: Message }) {
	const [imageErrored, setImageErrored] = useState(false);
	const isImageUrl =
		data.messageType === "Image" && /^(https?:)?\/\//.test(data.data);

	if (isImageUrl && !imageErrored) {
		return (
			<img
				src={data.data}
				alt="Attachment"
				className="max-w-full max-h-64 rounded-lg"
				onError={() => setImageErrored(true)}
			/>
		);
	}

	if (data.messageType === "Image") {
		return (
			<span className="flex items-center gap-2">
				<i className="pi pi-image" />
				{data.data}
			</span>
		);
	}

	return <>{data.data}</>;
}

type AvatarConfig = { icon?: string; initials?: string; color: string };

const AVATAR_CONFIG: Record<string, AvatarConfig> = {
	c1: { initials: "A&B", color: "#10b981" },
	c2: { icon: "pi pi-building", color: "#1b2f4a" },
	c3: { initials: "SF", color: "#1b2f4a" },
	c4: { icon: "pi pi-calendar", color: "#1b2f4a" },
	c5: { icon: "pi pi-wrench", color: "#1b2f4a" }
};

function getAvatarConfig(conversation: Conversation): AvatarConfig {
	if (AVATAR_CONFIG[conversation._id]) return AVATAR_CONFIG[conversation._id];

	const initials = conversation.name
		.split(" ")
		.map(word => word[0])
		.filter(Boolean)
		.slice(0, 2)
		.join("")
		.toUpperCase();

	return { initials, color: "#1b2f4a" };
}

function ConversationAvatar({
	conversation,
	size = 40
}: {
	conversation: Conversation;
	size?: number;
}) {
	const imageUrl =
		conversation.avatar && /^https?:\/\//.test(conversation.avatar)
			? conversation.avatar
			: undefined;

	if (imageUrl) {
		return (
			<img
				src={imageUrl}
				alt={conversation.name}
				className="rounded-full object-cover shrink-0"
				style={{ width: size, height: size }}
			/>
		);
	}

	const { icon, initials, color } = getAvatarConfig(conversation);

	return (
		<div
			className="flex items-center justify-center rounded-full text-white font-semibold shrink-0"
			style={{ width: size, height: size, background: color, fontSize: size * 0.35 }}
		>
			{icon ? <i className={icon} /> : initials}
		</div>
	);
}

type ConverationElemProp = {
	selected?: string;
	setSelected: Dispatch<SetStateAction<string | undefined>>;
	converation: Conversation;
	currentUser?: ChatUser;
};

function ConverationsElem({
	selected,
	setSelected,
	converation,
	currentUser
}: ConverationElemProp) {
	const isSelected = selected === converation._id;
	const lastMessage = converation.messages.at(-1);
	const lastActivity = lastMessage?.createdAt ?? converation.createdAt;

	return (
		<div
			key={converation._id}
			onClick={() => setSelected(converation._id)}
			className={`relative flex items-center justify-between gap-4 p-4 px-5 cursor-pointer transition ${
				isSelected ? "bg-[var(--gray-62)]" : "hover:bg-[var(--gray-62)]"
			}`}
		>
			<div
				className={`absolute left-0 top-0 bottom-0 w-[3px] ${
					isSelected ? "bg-[var(--primary-color)]" : "bg-transparent"
				}`}
			/>
			<div className="flex items-center gap-3 overflow-hidden">
				<ConversationAvatar conversation={converation} />
				<div className="overflow-hidden">
					<p className="font-medium text-base text-white truncate">
						{converation.name}
					</p>
					{lastMessage && (
						<p className="text-sm truncate">
							{currentUser && lastMessage.sender._id === currentUser._id && (
								<span className="text-[var(--primary-color)]">You: </span>
							)}
							<span className="text-gray-300">{lastMessage.data}</span>
						</p>
					)}
				</div>
			</div>
			<div className="flex flex-col items-end shrink-0 min-w-[50px] gap-1.5">
				<p className="text-sm text-gray-400">{formatListTimestamp(lastActivity)}</p>
				{!!converation.unreadCount && (
					<span
						className="flex items-center justify-center rounded-full text-[11px] font-semibold text-white"
						style={{
							width: 18,
							height: 18,
							background: "var(--primary-color)"
						}}
					>
						{converation.unreadCount}
					</span>
				)}
			</div>
		</div>
	);
}

function daysAgoAt(days: number, hour: number, minute: number): string {
	const d = new Date();
	d.setDate(d.getDate() - days);
	d.setHours(hour, minute, 0, 0);
	return d.toISOString();
}

const USERS = {
	alice: { _id: "u-alice", name: "Alice" },
	bob: { _id: "u-bob", name: "Bob" },
	charlie: { _id: "u-charlie", name: "Charlie" },
	dave: { _id: "u-dave", name: "Dave" },
	landlordJoe: { _id: "u-landlord-joe", name: "Landlord_Joe" },
	emmaSmith: { _id: "u-emma-smith", name: "Emma_Smith" },
	ethanSmith: { _id: "u-ethan-smith", name: "Ethan_Smith" },
	agentSarah: { _id: "u-agent-sarah", name: "Agent_Sarah" },
	adminRepair: { _id: "u-admin-repair", name: "Admin_Repair" }
} satisfies Record<string, ChatUser>;

var conversations: Conversation[] = [
	// 1. Private Chat
	{
		_id: "c1",
		name: "Alice & Bob",
		createdAt: "2025-12-01T10:00:00Z",
		groupDescription: "Direct message",
		avatar: "avatar_alice.png",
		users: [USERS.alice, USERS.bob],
		unreadCount: 1,
		messages: [
			{
				_id: "m1",
				sender: USERS.alice,
				messageType: "Text",
				data: "Hi Bob!",
				createdAt: daysAgoAt(1, 11, 4),
				conversation: "c1",
				seenUsers: [USERS.alice._id],
				deliveredTo: [USERS.bob._id]
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
		users: [USERS.alice, USERS.bob, USERS.charlie, USERS.dave],
		messages: [
			{
				_id: "m2",
				sender: USERS.dave,
				messageType: "Text",
				data: "Who left the fridge open?",
				createdAt: daysAgoAt(1, 8, 0),
				conversation: "c2",
				seenUsers: [USERS.dave._id],
				deliveredTo: [USERS.alice._id, USERS.bob._id, USERS.charlie._id]
			}
		]
	},

	// 3. Application Discussion
	{
		_id: "c3",
		name: "Smith Family Application",
		createdAt: daysAgoAt(1, 14, 30),
		groupDescription: "Discussing the lease for the Smith family.",
		avatar: "folder_icon.png",
		users: [USERS.landlordJoe, USERS.emmaSmith, USERS.ethanSmith],
		messages: []
	},

	// 4. Viewing Coordination
	{
		_id: "c4",
		name: "Viewing - Friday 4pm",
		createdAt: "2025-12-22T11:00:00Z",
		groupDescription: "Coordinating the walkthrough.",
		avatar: "calendar_icon.png",
		users: [USERS.agentSarah, USERS.alice, USERS.bob],
		messages: [
			{
				_id: "m3",
				sender: USERS.agentSarah,
				messageType: "Image",
				data: "map_location.png",
				createdAt: daysAgoAt(1, 11, 5),
				conversation: "c4",
				seenUsers: [USERS.agentSarah._id, USERS.alice._id],
				deliveredTo: [USERS.bob._id]
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
		users: [USERS.alice, USERS.adminRepair],
		messages: [
			{
				_id: "m4",
				sender: USERS.alice,
				messageType: "Text",
				data: "The sink is leaking again.",
				createdAt: daysAgoAt(1, 18, 0),
				conversation: "c5",
				seenUsers: [USERS.alice._id],
				deliveredTo: [USERS.adminRepair._id]
			}
		]
	}
];
