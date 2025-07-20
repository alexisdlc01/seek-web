import React, { useState } from "react";
import { Steps } from "primereact/steps";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { Calendar } from "primereact/calendar";
import { Checkbox } from "primereact/checkbox";
import { RadioButton } from "primereact/radiobutton";
import { FileUpload } from "primereact/fileupload";

export default function AddProperty() {
  const [step, setStep] = useState(0);
  const steps = [
    { label: "Basic Info" },
    { label: "Location" },
    { label: "Features" },
    { label: "Photos" },
    { label: "Review" },
  ];

  const nextStep = () => setStep(prev => Math.min(prev + 1, steps.length - 1));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 0));

  return (
    <div className="min-h-screen bg-white px-6 py-10">
      <h1 className="text-3xl font-bold text-[var(--text-color)] mb-8">
        Add New Property
      </h1>

      <Steps model={steps} activeIndex={step} readOnly className="mb-6" />

      {step === 0 && (
        <div className="space-y-6">
          <div>
            <label>Property Name/Title *</label>
            <InputText placeholder="e.g., Spacious 2-bed flat with garden" className="w-full" />
            <small>Enter a short, descriptive, and catchy title (max 100 characters)</small>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label>Property Size (sq ft)</label>
              <InputText className="w-full" defaultValue="850" />
            </div>
            <div className="flex-1">
              <label>Property Size (m²)</label>
              <InputText className="w-full" defaultValue="79" />
            </div>
          </div>
          <div>
            <label>Property Type *</label>
            <div className="flex flex-col gap-2 mt-2">
              {["Flat/Apartment", "House", "Room in Shared House", "Studio", "Other (please specify)"].map(type => (
                <div key={type} className="flex items-center gap-2">
                  <RadioButton inputId={type} name="propertyType" value={type} />
                  <label htmlFor={type}>{type}</label>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label>Regular Bedrooms *</label>
              <Dropdown className="w-full" placeholder="Select number" />
            </div>
            <div className="flex-1">
              <label>Ensuite Bedrooms</label>
              <Dropdown className="w-full" placeholder="Select number" />
            </div>
          </div>
          <div>
            <label>Number of Bathrooms</label>
            <Dropdown className="w-full" placeholder="Select number" />
          </div>
          <div>
            <label>Property Description *</label>
            <InputTextarea className="w-full" rows={4} placeholder="Provide a detailed description of your property..." />
            <small>
              Include unique selling points, neighborhood vibe, proximity to university, public transport, etc. (max 1000 characters)
            </small>
          </div>
          <div>
            <Checkbox inputId="amenity1" />
            <label htmlFor="amenity1" className="ml-2">Carbon Monoxide Alarm</label>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-6">
          <div>
            <label>Full Address *</label>
            <InputText className="w-full" placeholder="Enter postcode to search or type full address" />
            <small>Start typing your postcode and select from suggestions</small>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label>Street Name and Number</label>
              <InputText className="w-full" placeholder="e.g., 123 North Street" />
            </div>
            <div className="flex-1">
              <label>Town/City</label>
              <InputText className="w-full" defaultValue="St Andrews" />
            </div>
            <div className="flex-1">
              <label>Postcode</label>
              <InputText className="w-full" defaultValue="KY16 9AL" />
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label>Monthly Rent (£) *</label>
              <InputText className="w-full" defaultValue="3000" />
              <small>Enter the total rent amount per calendar month</small>
            </div>
            <div className="flex-1">
              <label>Deposit (£) *</label>
              <InputText className="w-full" defaultValue="1200" />
              <small>Enter the required security deposit amount</small>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label>Availability Date *</label>
              <Calendar className="w-full" placeholder="mm/dd/yyyy" showIcon />
              <small>Select the earliest date the property is available</small>
            </div>
            <div className="flex-1">
              <label>Lease Duration *</label>
              <Dropdown className="w-full" placeholder="Select duration" />
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div>
            <label>Furnishing Status *</label>
            <div className="flex flex-col gap-2 mt-2">
              {["Furnished (including beds, sofas, wardrobes, kitchen appliances)", "Unfurnished", "Part-Furnished (some major appliances/furniture provided)"].map(opt => (
                <div key={opt} className="flex items-center gap-2">
                  <RadioButton inputId={opt} name="furnishing" value={opt} />
                  <label htmlFor={opt}>{opt}</label>
                </div>
              ))}
            </div>
          </div>
          <div>
            <label>Energy Performance Certificate (EPC) Rating</label>
            <Dropdown className="w-full" placeholder="Select rating" />
            <small>Optional: Enter your property's EPC rating if known</small>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <div>
            <label>Photo Upload *</label>
            <FileUpload name="photos" url="/upload" multiple accept="image/*" className="w-full" />
            <small>
              Upload high-quality photos of your property. Include various rooms, common areas, kitchen, bathroom, and exterior. (Min 3, Max 15 images)
            </small>
          </div>
          <div>
            <label>Video Tour Link</label>
            <InputText className="w-full" placeholder="https://youtube.com/watch?v=..." />
            <small>Optional: Paste a link to a video tour of your property (Youtube, Vimeo, etc.)</small>
          </div>
          <div>
            <label>Floor Plan Image</label>
            <FileUpload name="floorplan" url="/upload" accept="image/png, image/jpeg" mode="basic" chooseLabel="Choose File" className="w-full" />
            <small>Optional: Upload a floor plan to help students visualize the layout</small>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-6">
          <div className="p-6 bg-[var(--surface-b)] rounded-md border">
            <h2 className="text-lg font-semibold mb-2">Property Details Summary</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p><strong>Property Title</strong><br />Spacious 2-bed flat with garden</p>
                <p><strong>Bedrooms</strong><br />2 Regular, 1 Ensuite</p>
                <p><strong>Property Size</strong><br />850 sq ft / 79 m²</p>
              </div>
              <div>
                <p><strong>Property Type</strong><br />Flat/Apartment</p>
                <p><strong>Bathrooms</strong><br />2</p>
                <p><strong>Furnishing</strong><br />Fully Furnished</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-[var(--surface-b)] rounded-md border">
            <h2 className="text-lg font-semibold mb-2">Location & Pricing</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p><strong>Full Address</strong><br />123 North Street, St Andrews, KY16 9AL</p>
                <p><strong>Deposit</strong><br />£1,200</p>
                <p><strong>Lease Duration</strong><br />12 Months</p>
              </div>
              <div>
                <p><strong>Monthly Rent</strong><br />£3,000 pcm</p>
                <p><strong>Available From</strong><br />1st September 2024</p>
                <p><strong>EPC Rating</strong><br />B</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-[var(--surface-b)] rounded-md border">
            <h2 className="text-lg font-semibold mb-2">Amenities</h2>
            <p>Wi-Fi, Washing Machine, Dishwasher, Garden, Smoke Alarm, Parking</p>
          </div>

          <div className="p-6 bg-[var(--surface-b)] rounded-md border">
            <h2 className="text-lg font-semibold mb-2">Photos & Media</h2>
            <p>3 photos uploaded • Video tour included • Floor plan attached</p>
          </div>

          <div className="flex justify-between">
            <Button label="Back: Photos" icon="pi pi-arrow-left" onClick={prevStep} />
            <div className="flex gap-2">
              <Button label="Save as Draft" severity="secondary" />
              <Button label="Publish Listing" />
            </div>
          </div>
        </div>
      )}

      {step < 4 && (
        <div className="mt-10 flex justify-between">
          <Button label="Back" icon="pi pi-arrow-left" onClick={prevStep} disabled={step === 0} />
          <Button label={`Next: ${steps[step + 1]?.label}`} iconPos="right" icon="pi pi-arrow-right" onClick={nextStep} />
        </div>
      )}
    </div>
  );
}
