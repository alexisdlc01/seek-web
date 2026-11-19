import { api } from "../lib/landlord.js";

export const MAX_REPAIR_PHOTOS = 5;
export const PHOTO_ACCEPT = "image/jpeg,image/png,image/webp";

// Uploads one photo to the private bucket and returns its key (signed upload, no SSE header).
export async function uploadRepairPhoto(file) {
	const { data } = await api.get("/upload/presign", {
		params: { filename: file.name, fileType: file.type, fileSize: file.size, folder: "private" }
	});
	const response = await fetch(data.uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
	if (!response.ok) throw new Error("The upload didn't go through.");
	return data.key;
}

// Thumbnails of a repair's photos; each links to the full image.
export function RepairPhotoThumbs({ urls }) {
	if (!urls?.length) return null;
	return (
		<div className="flex flex-wrap gap-1.5">
			{urls.map((url, i) => (
				<a key={url} href={url} target="_blank" rel="noreferrer" aria-label={`Open repair photo ${i + 1}`}>
					<img loading="lazy" src={url} alt={`Repair photo ${i + 1}`} className="h-14 w-14 rounded-lg object-cover" />
				</a>
			))}
		</div>
	);
}
