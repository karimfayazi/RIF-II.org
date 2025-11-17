import Image from "next/image";

export default function Home() {
	return (
		<div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 space-y-8">
			{/* Header */}
			<div className="text-center space-y-4">
				<h1 className="text-4xl font-bold text-gray-800">
					Regional Infrastructure Fund – II in Khyber Pakhtunkhwa for
				</h1>
				<h2 className="text-3xl font-semibold text-blue-600">
					&ldquo;RESILIENT RESOURCE MANAGEMENT IN CITIES (RRMIC)&rdquo;
				</h2>
				<p className="text-xl font-medium text-gray-700 mt-4">
					Welcome to RIF-II Management Information System
				</p>
			</div>
			
			{/* Action Buttons */}
			<div className="flex flex-wrap gap-4 justify-center items-center">
				<a
					href="/login"
					className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-6 py-3 text-white font-semibold hover:bg-green-700 transition-colors shadow-md"
				>
					<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
					</svg>
					Login
				</a>
				
				<a
					href="/RIF-II MIS-Concept Paper.docx"
					target="_blank"
					rel="noopener noreferrer"
					className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700 transition-colors shadow-md"
				>
					<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
					</svg>
					View Concept Paper
				</a>
			</div>

			{/* Logos Section */}
			<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-6 items-center justify-center mt-8">
				<Image src="/logo/gov_kpk.png" alt="Government of KPK" width={120} height={80} className="mx-auto object-contain" />
				<Image src="/logo/german cooperation.jpg" alt="German Cooperation" width={120} height={80} className="mx-auto object-contain" />
				<Image src="/uppalogo.jpg" alt="UPPA" width={120} height={80} className="mx-auto object-contain" />
				<Image src="/uppu.png" alt="UPPU" width={120} height={80} className="mx-auto object-contain" />
				<Image src="/logo/bodra.png" alt="BORDA" width={120} height={80} className="mx-auto object-contain" />
				<Image src="/logo/Cynosure.png" alt="Cynosure" width={120} height={80} className="mx-auto object-contain" />
				<Image src="/logo/Dorsch_Impact.png" alt="Dorsch Impact" width={120} height={80} className="mx-auto object-contain" />
			</div>

			{/* Navigation Cards removed as requested */}
		</div>
	);
}
