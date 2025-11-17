"use client";
 

// Sample team member data
const teamMembers = [
	{
		id: 1,
		name: "Maj (R) Ayaz Khan",
		position: "Project Director",
		department: "RIF-II Management",
		image: "https://picsum.photos/400/400?random=1",
		email: "Ayaz.Khan@team.dorsch-impact.de",
		phone: "+92 300 8110102",
		experience: "30+ years in infrastructure development",
		education: "PhD in Civil Engineering, NUST",
		description: "Leading the RIF-II project with extensive experience in urban infrastructure and resource management.",
		color: "from-blue-500 to-blue-700"
	},
	{
		id: 2,
		name: "Ghulam Mussa",
		position: "M&E Expert",
		department: "Monitoring & Evaluation",
		image: "https://picsum.photos/400/400?random=2",
		email: "g.mussa@rif-mis.com",
		phone: "+92 51 234-5678",
		experience: "12+ years in monitoring and evaluation systems",
		education: "MS in Development Studies, Aga Khan University",
		description: "Expert in monitoring and evaluation frameworks, data analysis, and project performance assessment for development initiatives.",
		color: "from-green-500 to-green-700"
	},
	{
		id: 3,
		name: "Karim Fayazi",
		position: "MIS Expert",
		department: "Management Information Systems",
		image: "https://picsum.photos/400/400?random=3",
		email: "karim.fayazi@sjdap.org",
		phone: "+92-346-9750336",
		experience: "10+ years in MIS and database management",
		education: "MS in Information Technology, NUST",
		description: "Specialized in management information systems, database design, and system integration for development projects.",
		color: "from-purple-500 to-purple-700"
	},
	{
		id: 4,
		name: "Ghulam Mussa",
		position: "Environmental Specialist",
		department: "Environmental Impact",
		image: "https://picsum.photos/400/400?random=4",
		email: "ghulam.mussa@rif-mis.com",
		phone: "+92 51 234-5679",
		experience: "8+ years in environmental assessment and sustainability",
		education: "MS in Environmental Science, LUMS",
		description: "Leading environmental impact assessments and ensuring sustainable development practices across all project initiatives.",
		color: "from-emerald-500 to-emerald-700"
	},
	{
		id: 5,
		name: "Ghulam Mussa",
		position: "Financial Analyst",
		department: "Finance & Budgeting",
		image: "https://picsum.photos/400/400?random=5",
		email: "ghulam.mussa@rif-mis.com",
		phone: "+92 51 234-5680",
		experience: "15+ years in project finance and budget management",
		education: "MBA in Finance, IBA Karachi",
		description: "Managing project finances, budget allocations, and financial reporting for optimal resource utilization.",
		color: "from-orange-500 to-orange-700"
	},
	{
		id: 6,
		name: "Ghulam Mussa",
		position: "Community Liaison",
		department: "Stakeholder Engagement",
		image: "https://picsum.photos/400/400?random=6",
		email: "ghulam.mussa@rif-mis.com",
		phone: "+92 51 234-5681",
		experience: "10+ years in community development and stakeholder engagement",
		education: "MS in Social Sciences, Quaid-i-Azam University",
		description: "Building strong relationships with local communities and ensuring inclusive development approaches.",
		color: "from-indigo-500 to-indigo-700"
	}
];

export default function AboutTeam() {
    return (
        <>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
			{/* Hero Section */}
			<div className="relative overflow-hidden bg-gradient-to-r from-[#0b4d2b] via-[#1a5f3a] to-[#0b4d2b] py-20">
				<div className="absolute inset-0 bg-black opacity-20"></div>
				<div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
					<h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
						Meet Our <span className="text-blue-300">Expert Team</span>
					</h1>
					<p className="text-base md:text-lg text-gray-200 max-w-2xl mx-auto leading-relaxed">
						Dedicated professionals driving the Regional Infrastructure Fund – II project 
						for Resilient Resource Management in Cities across Khyber Pakhtunkhwa
					</p>
					<div className="mt-8 flex justify-center">
						<div className="w-24 h-1 bg-blue-300 rounded-full"></div>
					</div>
				</div>
			</div>

 

			{/* Team Section */}
			<div className="py-20 px-4 sm:px-6 lg:px-8">
				<div className="max-w-7xl mx-auto">
					{/* Section Header */}
					<div className="text-center mb-16">
						<h2 className="text-4xl font-bold text-gray-900 mb-4">
							Our Leadership Team
						</h2>
						<p className="text-lg text-gray-600 max-w-3xl mx-auto">
							Each member brings unique expertise and passion to ensure the success of our infrastructure development initiatives.
						</p>
					</div>

					{/* Team Grid */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
						{teamMembers.map((member, index) => (
							<div 
								key={member.id} 
								className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:-translate-y-2"
								style={{ animationDelay: `${index * 100}ms` }}
							>
								{/* Profile Image Section */}
								<div className={`relative h-72 bg-gradient-to-br ${member.color} flex items-center justify-center overflow-hidden`}>
									<div className="absolute inset-0 bg-black opacity-10"></div>
							<div className="relative w-full h-full flex items-center justify-center">
									<img
										src={member.image}
										alt={member.name}
										className="w-full h-full object-cover"
										onError={(e) => {
											console.log('Remote image failed, showing initials:', member.image);
											// Show initials if image fails to load
											const target = e.target as HTMLElement;
											const container = target.closest('.relative');
											const fallback = container?.querySelector('.fallback-initials') as HTMLElement;
											if (fallback) {
												fallback.style.display = 'flex';
											}
											if (target) {
												target.style.display = 'none';
											}
										}}
									/>
											<div className="absolute inset-0 bg-black bg-opacity-20"></div>
											<div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-90 backdrop-blur-sm rounded-full px-4 py-2">
												<p className="text-sm font-medium text-gray-800">Professional Photo</p>
											</div>
											{/* Fallback initials if image fails to load */}
											<div className="fallback-initials absolute inset-0 flex items-center justify-center text-white z-10" style={{ display: 'none' }}>
												<div className="w-40 h-40 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-6 mx-auto backdrop-blur-sm border-2 border-white border-opacity-30">
													<span className="text-5xl font-bold">
														{member.name.split(' ').map(n => n[0]).join('')}
													</span>
												</div>
											</div>
										</div>
									
									{/* Decorative Elements */}
									<div className="absolute top-4 right-4 w-8 h-8 bg-white bg-opacity-20 rounded-full"></div>
									<div className="absolute bottom-4 left-4 w-6 h-6 bg-white bg-opacity-20 rounded-full"></div>
								</div>
								
								{/* Member Information */}
								<div className="p-8">
									<div className="mb-6">
										<h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
											{member.name}
										</h3>
										<div className="flex items-center mb-3">
											<div className={`w-3 h-3 bg-gradient-to-r ${member.color} rounded-full mr-3`}></div>
											<p className="text-lg font-semibold text-gray-700">
												{member.position}
											</p>
										</div>
										<p className="text-sm text-gray-500 font-medium">
											{member.department}
										</p>
									</div>
									
									{/* Contact Information */}
									<div className="space-y-3 mb-4">
										<div className="flex items-center text-gray-600 hover:text-blue-600 transition-colors">
											<div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
												<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
												</svg>
											</div>
											<span className="text-sm">{member.email}</span>
										</div>
										<div className="flex items-center text-gray-600 hover:text-green-600 transition-colors">
											<div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
												<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
												</svg>
											</div>
											<span className="text-sm">{member.phone}</span>
										</div>
									</div>

									{/* Professional Details */}
									<div className="space-y-4">
										<div className="bg-gray-50 rounded-lg p-4">
											<h4 className="font-semibold text-gray-900 mb-2 flex items-center">
												<svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
												</svg>
												Experience
											</h4>
											<p className="text-sm text-gray-700">{member.experience}</p>
										</div>
									</div>

									{/* Description */}
									<div className="mt-6 pt-6 border-t border-gray-200">
										<p className="text-sm text-gray-600 leading-relaxed">
											{member.description}
										</p>
									</div>
								</div>
							</div>
						))}
					</div>

					{/* Team Statistics */}
					<div className="bg-white rounded-3xl shadow-xl p-12 relative overflow-hidden">
						<div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100 to-transparent rounded-full -translate-y-32 translate-x-32"></div>
						<div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-green-100 to-transparent rounded-full translate-y-24 -translate-x-24"></div>
						
						<div className="relative z-10">
							<div className="text-center mb-12">
								<h2 className="text-4xl font-bold text-gray-900 mb-4">
									Our Team Excellence
								</h2>
								<p className="text-lg text-gray-600 max-w-2xl mx-auto">
									Numbers that reflect our commitment to delivering exceptional infrastructure development solutions
								</p>
							</div>
							
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
								<div className="text-center group">
									<div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
										<span className="text-3xl font-bold text-white">6</span>
									</div>
									<h3 className="text-2xl font-bold text-gray-900 mb-2">Team Members</h3>
									<p className="text-gray-600">Expert professionals</p>
								</div>
								
								<div className="text-center group">
									<div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
										<span className="text-3xl font-bold text-white">50+</span>
									</div>
									<h3 className="text-2xl font-bold text-gray-900 mb-2">Years Experience</h3>
									<p className="text-gray-600">Combined expertise</p>
								</div>
								
								<div className="text-center group">
									<div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
										<span className="text-3xl font-bold text-white">5</span>
									</div>
									<h3 className="text-2xl font-bold text-gray-900 mb-2">Departments</h3>
									<p className="text-gray-600">Specialized areas</p>
								</div>
								
								<div className="text-center group">
									<div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
										<span className="text-3xl font-bold text-white">100%</span>
									</div>
									<h3 className="text-2xl font-bold text-gray-900 mb-2">Local Expertise</h3>
									<p className="text-gray-600">Regional knowledge</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>



		</div>

 
        </>
    );
}
