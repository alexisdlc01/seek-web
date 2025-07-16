import React from 'react';
import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="bg-[var(--primary-color)] text-[var(--primary-color-text)] py-16 text-center px-4">
        <h1 className="text-3xl md:text-5xl font-bold mb-4">
          Find Your Perfect Student Home
        </h1>
        <p className="text-lg md:text-xl mb-6">
          Connect students with trusted landlords in St Andrews
        </p>
        <div className="flex justify-center gap-4">
          <Button label="I'm a Student" className="bg-[var(--primary-color-text)] font-bold px-4 py-2" onClick={() => navigate("/signup/student")} />
          <Button label="I'm a Landlord" className="bg-[var(--primary-color-text)] font-bold px-4 py-2" onClick={() => navigate("/signup/landlord")} />
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-[var(--surface-a)] py-16 px-4 text-center">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto">
          <div>
            <div className="flex justify-center mb-3">
              <span className="pi pi-search text-4xl bg-[var(--surface-c)] p-4 rounded-full text-[var(--text-color)]"></span>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-[var(--text-color)]">Easy Search</h3>
            <p className="text-[var(--text-color-secondary)] text-sm">
              Find properties that match your needs with our advanced search filters
            </p>
          </div>
          <div>
            <div className="flex justify-center mb-3">
              <span className="pi pi-check-circle text-4xl bg-[var(--surface-c)] p-4 rounded-full text-green-500"></span>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-[var(--text-color)]">Verified Listings</h3>
            <p className="text-[var(--text-color-secondary)] text-sm">
              All properties are verified to ensure quality and safety standards
            </p>
          </div>
          <div>
            <div className="flex justify-center mb-3">
              <span className="pi pi-comment text-4xl bg-[var(--surface-c)] p-4 rounded-full text-[var(--text-color)]"></span>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-[var(--text-color)]">Direct Communication</h3>
            <p className="text-[var(--text-color-secondary)] text-sm">
              Message landlords directly through our secure platform
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="text-center py-12 px-4 bg-[var(--surface-a)]">
        <h2 className="text-2xl font-bold mb-2 text-[var(--text-color)]">Ready to Get Started?</h2>
        <p className="text-[var(--text-color-secondary)] mb-4">
          Join thousands of students and landlords already using Seek
        </p>
        <Button label="Sign Up Today" className="bg-[var(--primary-color)] text-[var(--primary-color-text)] px-5 py-3 font-semibold" />
      </section>
    </div>
  );
}
