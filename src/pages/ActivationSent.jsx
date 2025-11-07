import React from "react";

export default function ActivationSent() {
    return (
        <div className="min-h-screen bg-[var(--surface-a)] flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-md p-8 space-y-6 border border-[var(--surface-border)]">
                {/* Heading */}
                <h1 className="text-center text-2xl font-bold text-[var(--primary-color)]">
                    Activation Email Sent
                </h1>
                <p className="text-center text-gray-600">
                    An activation email has been sent to your email address. Please check your inbox and follow the instructions to activate your account.
                </p>
                
            </div>
        </div>
    );
}
