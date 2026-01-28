import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import React, { useEffect } from "react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const PhotosMediaStep = ({
	photos,
	videoLink,
	setVideoLink,
	floorPlan,
	setFloorPlan,
	fileInputRef,
	floorPlanInputRef,
	onPhotoSelect,
	onDragStart,
	onDrop,
	removePhoto,
	floorPlanUrl,
	setFloorPlanUrl,
	back,
	next
}) => {
	useEffect(() => {
		window.scrollTo({ top: 0, behavior: "smooth" });
	}, []);

	useEffect(() => {
		console.log("here", photos);
	}, [photos]);

	return (
		<>
			<div className="space-y-6">
				<div>
					<label className="font-medium text-white">Photos</label>
					<div
						className="border-2 border-dashed p-8 rounded text-center cursor-pointer mt-2"
						onClick={() => fileInputRef.current?.click()}
						onDrop={e => {
							e.preventDefault();
							onPhotoSelect({
								target: { files: e.dataTransfer.files }
							});
						}}
						onDragOver={e => e.preventDefault()}
					>
						Drag & drop or click to browse files
						<input
							type="file"
							accept="image/*"
							multiple
							ref={fileInputRef}
							className="hidden"
							onChange={onPhotoSelect}
						/>
					</div>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
						{photos.map((p, idx) => (
							<div
								key={p.id}
								className="relative border rounded overflow-hidden cursor-move"
								draggable
								onDragStart={e => onDragStart(e, idx)}
								onDrop={e => onDrop(e, idx)}
								onDragOver={e => e.preventDefault()}
							>
								<img
									src={p.url}
									alt="preview"
									className="w-full h-32 object-cover"
								/>
								<Button
									type="button"
									icon="pi pi-times"
									className="absolute right-1 !p-1 !min-w-0 w-6 h-6"
									rounded
									severity="danger"
									onClick={() => removePhoto(p.id)}
								/>
							</div>
						))}
					</div>
				</div>
				<div className="flex flex-col">
					<label htmlFor="videoLink" className="font-medium mb-2 text-white">
						Video Tour Link (Optional)
					</label>
					<InputText
						id="videoLink"
						value={videoLink}
						onChange={e => setVideoLink(e.target.value)}
						placeholder="e.g., https://www.youtube.com/watch?v=..."
					/>
				</div>
				<div className="flex flex-col">
					<label htmlFor="floorPlan" className="font-medium mb-2 text-white">
						Floor Plan Image, PDF Only (Optional)
					</label>
					<Button
						type="button"
						label={floorPlan ? floorPlan.name : "Choose File"}
						icon="pi pi-upload"
						outlined
						onClick={() => floorPlanInputRef.current?.click()}
						className="w-max"
					/>
					<input
						type="file"
						ref={floorPlanInputRef}
						accept=".*/*"
						className="hidden"
						onChange={async e => {
							const file = e.target.files[0];
							if (file) {
								alert("Please upload a file");
								return;
							}
							const res = await axios.get(
								`${BASE_URL}/upload/presign`,
								{
									params: {
										filename: file.name,
										fileType: file.type,
										folder: "public"
									},
									withCredentials: true
								}
							);

							const { uploadUrl, fileUrl } = res.data;

							await axios.put(uploadUrl, file, {
								headers: { "Content-Type": file.type }
							});
							setFloorPlan(file);
							setFloorPlanUrl(fileUrl);
						}}
					/>
					{floorPlan && (
						<div className="mt-2 text-sm text-[#1ba4ae] flex items-center">
							<span
								className={"cursor-pointer underline text-blue"}
								onClick={e => {
									window.open(floorPlanUrl, "_blank");
								}}
							>
							{floorPlan.name}
						</span>
							<Button
								icon="pi pi-times"
								text
								rounded
								size="small"
								className="ml-2"
								onClick={() => setFloorPlan(null)}
							/>
						</div>
					)}
				</div>
			</div>
			<div className="flex pt-8 justify-between">
				<Button
					label="Back"
					severity="secondary"
					icon="pi pi-arrow-left"
					onClick={back}
				/>
				<Button
					label="Next"
					icon="pi pi-arrow-right"
					iconPos="right"
					onClick={next}
				/>
			</div>
		</>
	);
};

export default PhotosMediaStep;
