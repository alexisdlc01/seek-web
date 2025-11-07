import React from "react";
import { Button } from "primereact/button";

export default function AboutPage() {
	return (
		<div className="min-h-screen bg-[var(--surface-a)] text-[var(--text-color)] px-4 py-16">
			<div className="max-w-6xl mx-auto space-y-10">
				<h1 className="text-3xl md:text-4xl font-bold text-[var(--primary-color)]">
					About Seek St Andrews
				</h1>
				<div>
					<h2 className="text-xl font-semibold text-[var(--text-color)] mb-4">
						Our{" "}
						<span className="text-[var(--primary-color)]">
							Mission
						</span>
					</h2>
					<p>
						As students ourselves, we understand the reality of our
						housing process. We face a fragmented, outdated, and
						stressful market where, every year, over 10,000 students
						lose themselves between a ridiculous amount of tabs,
						overpriced properties, and unreliable leads. Our vision
						is to reclaim the student housing experience and give
						students the power of instant, intuitive discovery.
						We’re Alexis and Victor, two friends from Paris who met
						in St Andrews, and we decided to create Seek.
						<br />
						<br />
						Our mission is to centralize every student property,
						starting in St Andrews, from private landlords to major
						agencies, and present them to students in an ergonomic,
						scroll-based experience. Students benefit from the most
						complete, user-friendly, and mobile-first discovery tool
						while landlords are offered instant access to a verified
						student audience, reducing irrelevant inquiries and
						providing peace of mind about who your future tenants
						will be.
						<br />
						<br />
						We simply want to make the search for housing exciting.
						We want to replace your luck with choice. Seek is
						completely free and accessible to everyone. Our priority
						is for all students and landlords to embark on our
						journey to revolutionize student housing.
					</p>
				</div>
				<div>
					<h2 className="text-xl font-semibold text-[var(--text-color)] mb-2">
						Why Seek works{" "}
						<span className="text-[var(--primary-color)]">
							for you
						</span>
					</h2>
					<p className="mb-3">
						As a{" "}
						<span className="text-[var(--primary-color)]">
							student:
						</span>
					</p>
					<p className="mb-2">
						The stress of searching is over. Seek gives you the edge
						you need in a competitive market:
					</p>
					<ul className="list-disc list-inside space-y-2">
						<li>
							<span className="text-white font-bold">
								Verified Community:{" "}
							</span>
							<span>
								Connect only with verified property providers
								and student tenants, building trust from the
								start.{" "}
							</span>
						</li>
						<li>
							<span className="text-white font-bold">
								Efficient Discovery:{" "}
							</span>
							<span>
								Escape the chaos of word of mouth and unreliable
								leads. See all available properties in one
								engaging, mobile-first feed?{" "}
							</span>
						</li>
						<li>
							<span className="text-white font-bold">
								Collaborative Applications:{" "}
							</span>
							<span>
								Create group profiles and submit applications
								with your flatmates, streamlining the process.{" "}
							</span>
						</li>
						<li className="">
							<div className="inline-block">
								<span className="text-white font-bold">
									Direct, Clear Communication & Tracking:{" "}
								</span>
								<span className="">
									Say goodbye to chasing emails and wondering
									about your application status.
									<br />
									Use our in-app messaging platform and live
									progress marker to communicate with your
									prospective landlord and track your
									application.
								</span>
							</div>
						</li>
					</ul>
				</div>
				<div className="mt-12">
					<h2 className="text-xl font-semibold text-[var(--text-color)] mb-6">
						Meet the{" "}
						<span className="text-[var(--primary-color)]">
							Team
						</span>
					</h2>

					<div className="grid grid-cols-2 sm:grid-cols-5 gap-8">
						{/* Team Member */}
						<div className="flex flex-col items-center">
							<div className="w-28 h-28 bg-gray-300 rounded-full"></div>
							<p className="mt-4 font-medium text-[var(--text-color)]">
								Victor Trinel
							</p>
							<p className="text-sm text-gray-400">Co-Founder</p>
						</div>

						<div className="flex flex-col items-center">
							<div className="w-28 h-28 bg-gray-300 rounded-full"></div>
							<p className="mt-4 font-medium text-[var(--text-color)]">
								Alexis de La Chapelle
							</p>
							<p className="text-sm text-gray-400">Co-Founder</p>
						</div>

						<div className="flex flex-col items-center">
							<div className="w-28 h-28 bg-gray-300 rounded-full"></div>
							<p className="mt-4 font-medium text-[var(--text-color)]">
								Kshitij Verma
							</p>
							<p className="text-sm text-gray-400">Developer</p>
						</div>

						<div className="flex flex-col items-center">
							<div className="w-28 h-28 bg-gray-300 rounded-full"></div>
							<p className="mt-4 font-medium text-[var(--text-color)]">
								Matthew Pancer
							</p>
							<p className="text-sm text-gray-400">Developer</p>
						</div>

						<div className="flex flex-col items-center">
							<div className="w-28 h-28 bg-gray-300 rounded-full"></div>
							<p className="mt-4 font-medium text-[var(--text-color)]">
								Graham Heathcote
							</p>
							<p className="text-sm text-gray-400">Developer</p>
						</div>
					</div>
				</div>

				<div className="mt-16">
					<h2 className="text-xl font-semibold text-[var(--text-color)] mb-6">
						Meet our{" "}
						<span className="text-[var(--primary-color)]">
							Partners
						</span>
					</h2>

					<div className="flex flex-col md:flex-row items-center md:items-start gap-10">
						{/* Left: Text Section */}
						<div className="md:w-2/3 space-y-4">
							<h3 className="font-semibold text-lg">
								Balcarres Estate
							</h3>
							<p>
								Balcarres Estate is a distinguished, family-run
								estate rooted in centuries of history in the
								East Neuk of Fife, just a short distance from St
								Andrews. Renowned for its commitment to
								sustainable stewardship, elegant living, and
								professional property management, Balcarres
								represents the gold standard of quality
								accommodation. Their operations include managing
								extensive farmland, the world-class Dumbarnie
								Links golf course, and a portfolio of 150+
								residential properties, making them the biggest
								private landlord group in Fife.
							</p>
							<p>
								Balcarres is a cornerstone partner for Seek's
								launch, providing invaluable early credibility
								and a strong foundation of quality inventory.
								Their partnership ensures that, from day one,
								Seek features reliable, high-quality homes,
								setting a standard that attracts the most
								discerning student and property providers. As a
								family that has been integral to the Fife
								community for generations, their partnership
								gives our platform a crucial layer of local
								trust and authority, helping us overcome initial
								landlord skepticism in the St Andrews area.
							</p>
							<p className="italic">
								Learn more at:{" "}
								<a
									href="https://www.balcarresestate.com/"
									target="_blank"
									rel="noopener noreferrer"
									className="text-[var(--primary-color)] hover:underline"
								>
									https://www.balcarresestate.com/
								</a>
							</p>
						</div>

						{/* Right: Logo Section */}
						<div className="md:w-1/3 flex justify-center md:justify-end">
							<img
								src="/bulcarresestates.svg" // <-- your SVG path here
								alt="Balcarres Estate Logo"
								className="w-48 md:w-64 opacity-90"
							/>
						</div>
					</div>
				</div>

				<div className="pt-6">
					<Button
						label="Get Started"
						className="bg-[var(--primary-color)] text-[var(--primary-color-text)] px-4 py-3"
					/>
				</div>
			</div>
		</div>
	);
}
