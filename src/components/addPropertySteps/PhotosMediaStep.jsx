import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";

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
	back,
	next
}) => {
	return (
		<>
			<div className="space-y-6">
				<div>
					<label className="font-medium">Photos</label>
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
									className="absolute top-1 right-1 !p-1 !min-w-0 w-6 h-6"
									rounded
									severity="danger"
									onClick={() => removePhoto(p.id)}
								/>
								{idx === 0 && (
									<span className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs py-0.5 px-1 rounded">
										Primary
									</span>
								)}
							</div>
						))}
					</div>
				</div>
				<div className="flex flex-col">
					<label htmlFor="videoLink" className="font-medium mb-2">
						Video Tour Link
					</label>
					<InputText
						id="videoLink"
						value={videoLink}
						onChange={e => setVideoLink(e.target.value)}
						placeholder="e.g., https://www.youtube.com/watch?v=..."
					/>
				</div>
				<div className="flex flex-col">
					<label
						htmlFor="floorPlan"
						className="font-medium mb-2"
					>
						Floor Plan Image
					</label>
					<Button
						type="button"
						label={
							floorPlan ? floorPlan.name : "Choose File"
						}
						icon="pi pi-upload"
						outlined
						onClick={() =>
							floorPlanInputRef.current?.click()
						}
						className="w-max"
					/>
					<input
						type="file"
						ref={floorPlanInputRef}
						accept="image/png,image/jpeg"
						className="hidden"
						onChange={e => setFloorPlan(e.target.files[0])}
					/>
					{floorPlan && (
						<div className="mt-2 text-sm text-gray-600 flex items-center">
							{floorPlan.name}
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
