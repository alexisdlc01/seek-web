import { useContext, useEffect, useRef, useState } from "react";
import { useNavbarTheme } from "../context/NavBarThemeContext.jsx";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Avatar } from "primereact/avatar";
import axios from "axios";
import UserContext from "../context/UserContext.jsx";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function EditProfile() {
	const fileRef = useRef(null);

	const [loading2, setLoading2] = useState(true);
	const [saving, setSaving] = useState(false);

	const [displayName, setDisplayName] = useState("");
	const [avatarUrl, setAvatarUrl] = useState("");
	const [avatarKey, setAvatarKey] = useState("");

	const [initialName, setInitialName] = useState("");
	const [initialKey, setInitialKey] = useState("");
	const { loading, user, setUser } = useContext(UserContext);

	useEffect(() => {
		(async () => {
			if (!loading) {
				try {
					setDisplayName(user.name);
					setAvatarUrl(user.profilePicUrl);
				} finally {
					setLoading2(false);
				}
			}
		})();
	}, [loading, user]);

	const pickFile = () => fileRef.current?.click();

	const onFile = async f => {
		if (!f?.type?.startsWith("image/")) return;
		const { data } = await axios.get(`${BASE_URL}/upload/presign`, {
			params: {
				filename: f.name,
				fileType: f.type,
				folder: "public/avatars"
			},
			withCredentials: true
		});
		await axios.put(data.uploadUrl, f, {
			headers: { "Content-Type": f.type }
		});
		setAvatarKey(data.key);
		setAvatarUrl(data.fileUrl || URL.createObjectURL(f)); // instant preview
	};

	const dirty = displayName !== initialName || avatarKey !== initialKey;
	const canSave = displayName.trim().length > 0 && dirty && !saving;

	const save = async () => {
		if (!canSave) return;
		setSaving(true);
		try {
			if (avatarUrl !== "") {
				await axios.put(
					`${BASE_URL}/users/setProfilePic`,
					{ url: avatarUrl },
					{ withCredentials: true }
				);
			}
			await axios.put(
				`${BASE_URL}/users/setUsername`,
				{ name: displayName },
				{ withCredentials: true }
			);
			setInitialName(displayName);
			setInitialKey(avatarKey);
			setUser(prev => ({
				...prev,
				name: displayName,
				profilePicUrl: avatarUrl
			}));
		} finally {
			setSaving(false);
		}
	};

	if (loading2) {
		return (
			<div className="min-h-screen bg-[#0f0f23] text-white px-4 py-10">
				<div className="max-w-xl mx-auto animate-pulse space-y-6">
					<div className="h-8 w-48 bg-white/10 rounded-lg" />
					<div className="h-64 bg-white/5 rounded-2xl" />
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-[#0f0f23] text-white px-4 py-10">
			<div className="max-w-3xl mx-auto">
				<h1 className="text-2xl md:text-4xl font-bold mb-6">
					Edit Profile
				</h1>

				<div className="bg-white/5 rounded-2xl ring-1 ring-white/10 p-6">
					<div className="flex flex-col sm:flex-row items-center gap-6">
						<Avatar
							image={avatarUrl}
							label={
								!avatarUrl
									? displayName?.[0]?.toUpperCase() || "?"
									: undefined
							}
							size="xlarge"
							shape="circle"
						/>
						<div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
							<Button
								label="Change Photo"
								icon="pi pi-image"
								onClick={pickFile}
								style={{
									background: "#2563eb",
									border: "none",
									color: "white"
								}}
							/>
							{avatarUrl ? (
								<Button
									label="Remove"
									icon="pi pi-times"
									severity="danger"
									outlined
									onClick={() => {
										setAvatarUrl("");
										setAvatarKey("");
									}}
									style={{
										borderColor: "#ef4444",
										color: "#ef4444"
									}}
								/>
							) : null}
							<input
								ref={fileRef}
								type="file"
								accept="image/*"
								className="hidden"
								onChange={e => onFile(e.target.files?.[0])}
							/>
						</div>
					</div>

					<div className="mt-6">
						<label className="block mb-2 text-sm">
							Display Name
						</label>
						<InputText
							value={displayName}
							onChange={e => setDisplayName(e.target.value)}
							className="w-full"
						/>
					</div>

					<div className="mt-6 flex flex-col sm:flex-row gap-3 justify-end">
						<Button
							label={saving ? "Saving..." : "Save Changes"}
							icon={
								saving ? "pi pi-spin pi-spinner" : "pi pi-check"
							}
							disabled={!canSave}
							onClick={save}
							style={{
								background: "#22c55e",
								border: "none",
								color: "white"
							}}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
