 

export default function ContactUs() {
    return (
        <>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
			{/* Hero Section */}
			<div className="relative overflow-hidden bg-gradient-to-r from-[#0b4d2b] via-[#1a5f3a] to-[#0b4d2b] py-16">
				<div className="absolute inset-0 bg-black opacity-20"></div>
				<div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
					<h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
						Get In <span className="text-blue-300">Touch</span>
					</h1>
					<p className="text-base md:text-lg text-gray-200 max-w-2xl mx-auto leading-relaxed">
						We&apos;d love to hear from you. Send us a message and we&apos;ll respond as soon as possible.
					</p>
					<div className="mt-6 flex justify-center">
						<div className="w-24 h-1 bg-blue-300 rounded-full"></div>
					</div>
				</div>
			</div>

 

			{/* Main Content */}
			<div className="py-16 px-4 sm:px-6 lg:px-8">
				<div className="max-w-7xl mx-auto">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
						
						{/* Contact Information */}
						<div className="space-y-8">
							<div>
								<h2 className="text-3xl font-bold text-gray-900 mb-6">
									Contact Information
								</h2>
								<p className="text-lg text-gray-600 mb-8">
									Reach out to us through any of the following channels. We&apos;re here to help with your inquiries about the RIF-II project.
								</p>
							</div>

							{/* Contact Cards */}
							<div className="space-y-6">
								{/* Office Address */}
								<div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
									<div className="flex items-start">
										<div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
											<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
											</svg>
										</div>
										<div>
											<h3 className="text-xl font-semibold text-gray-900 mb-2">Office Address</h3>
											<p className="text-gray-600 leading-relaxed">
												Regional Infrastructure Fund – II<br />
												Government of Khyber Pakhtunkhwa<br />
												Peshawar, KPK, Pakistan<br />
												Postal Code: 25000
											</p>
										</div>
									</div>
								</div>

								{/* Phone Numbers */}
								<div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
									<div className="flex items-start">
										<div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
											<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
											</svg>
										</div>
										<div>
											<h3 className="text-xl font-semibold text-gray-900 mb-2">Phone Numbers</h3>
											<div className="space-y-2">
												<p className="text-gray-600">
													<strong>Main Office:</strong> +92-91-921-1234
												</p>
												<p className="text-gray-600">
													<strong>Project Director:</strong> +92-51-123-4567
												</p>
												<p className="text-gray-600">
													<strong>Emergency:</strong> +92-91-921-9999
												</p>
											</div>
										</div>
									</div>
								</div>

								{/* Email Addresses */}
								<div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
									<div className="flex items-start">
										<div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
											<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
											</svg>
										</div>
										<div>
											<h3 className="text-xl font-semibold text-gray-900 mb-2">Email Addresses</h3>
											<div className="space-y-2">
												<p className="text-gray-600">
													<strong>General Inquiries:</strong> info@rif-mis.com
												</p>
												<p className="text-gray-600">
													<strong>Project Director:</strong> sarah.ahmed@rif-mis.com
												</p>
												<p className="text-gray-600">
													<strong>Technical Support:</strong> support@rif-mis.com
												</p>
											</div>
										</div>
									</div>
								</div>

								{/* Office Hours */}
								<div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
									<div className="flex items-start">
										<div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
											<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
											</svg>
										</div>
										<div>
											<h3 className="text-xl font-semibold text-gray-900 mb-2">Office Hours</h3>
											<div className="space-y-1">
												<p className="text-gray-600">
													<strong>Monday - Friday:</strong> 9:00 AM - 5:00 PM
												</p>
												<p className="text-gray-600">
													<strong>Saturday:</strong> 9:00 AM - 1:00 PM
												</p>
												<p className="text-gray-600">
													<strong>Sunday:</strong> Closed
												</p>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* Contact Form */}
						<div className="bg-white rounded-3xl shadow-xl p-8">
							<div className="mb-8">
								<h2 className="text-3xl font-bold text-gray-900 mb-4">
									Send Us a Message
								</h2>
								<p className="text-lg text-gray-600">
									Fill out the form below and we&apos;ll get back to you within 24 hours.
								</p>
							</div>

							<form className="space-y-6">
								{/* Name Fields */}
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div>
										<label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-2">
											First Name *
										</label>
										<input
											type="text"
											id="firstName"
											name="firstName"
											required
											className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
											placeholder="Enter your first name"
										/>
									</div>
									<div>
										<label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-2">
											Last Name *
										</label>
										<input
											type="text"
											id="lastName"
											name="lastName"
											required
											className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
											placeholder="Enter your last name"
										/>
									</div>
								</div>

								{/* Email */}
								<div>
									<label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
										Email Address *
									</label>
									<input
										type="email"
										id="email"
										name="email"
										required
										className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
										placeholder="Enter your email address"
									/>
								</div>

								{/* Phone */}
								<div>
									<label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
										Phone Number
									</label>
									<input
										type="tel"
										id="phone"
										name="phone"
										className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
										placeholder="Enter your phone number"
									/>
								</div>

								{/* Subject */}
								<div>
									<label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
										Subject *
									</label>
									<select
										id="subject"
										name="subject"
										required
										className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
									>
										<option value="">Select a subject</option>
										<option value="general">General Inquiry</option>
										<option value="project">Project Information</option>
										<option value="technical">Technical Support</option>
										<option value="partnership">Partnership Opportunity</option>
										<option value="media">Media Inquiry</option>
										<option value="other">Other</option>
									</select>
								</div>

								{/* Message */}
								<div>
									<label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
										Message *
									</label>
									<textarea
										id="message"
										name="message"
										rows={6}
										required
										className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
										placeholder="Please describe your inquiry in detail..."
									></textarea>
								</div>

								{/* Submit Button */}
								<div className="pt-4">
									<button
										type="submit"
										className="w-full bg-gradient-to-r from-[#0b4d2b] to-[#1a5f3a] text-white font-semibold py-4 px-6 rounded-xl hover:from-[#1a5f3a] hover:to-[#0b4d2b] transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
									>
										Send Message
									</button>
								</div>
							</form>
						</div>
					</div>

					{/* Map Section */}
					<div className="mt-20">
						<div className="bg-white rounded-3xl shadow-xl p-8">
							<div className="text-center mb-8">
								<h2 className="text-3xl font-bold text-gray-900 mb-4">
									Find Us
								</h2>
								<p className="text-lg text-gray-600">
									Visit our office in Peshawar, Khyber Pakhtunkhwa
								</p>
							</div>
							
							{/* Interactive GIS Map */}
							<div className="bg-white rounded-2xl h-96 relative overflow-hidden shadow-lg">
								{/* Map Header */}
								<div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-[#0b4d2b] to-[#1a5f3a] text-white p-4 z-10">
									<div className="flex items-center justify-between">
										<div>
											<h3 className="text-lg font-bold">DC House DIK Location</h3>
											<p className="text-sm opacity-90">District Coordination Office, Dera Ismail Khan</p>
										</div>
										<div className="flex space-x-2">
											<button className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg px-3 py-1 text-sm transition-colors">
												📍 Satellite
											</button>
											<button className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg px-3 py-1 text-sm transition-colors">
												🗺️ Street
											</button>
										</div>
									</div>
								</div>
								
								{/* Map Container */}
								<div className="absolute top-16 left-0 right-0 bottom-0">
									{/* Embedded Google Maps for DC House DIK */}
									<iframe
										src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3396.1234567890!2d70.9023456789!3d31.8312345678!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x392a1234567890ab%3A0x1234567890abcdef!2sDC%20House%20DIK!5e0!3m2!1sen!2spk!4v1234567890123!5m2!1sen!2spk"
										width="100%"
										height="100%"
										style={{ border: 0 }}
										allowFullScreen
										loading="lazy"
										referrerPolicy="no-referrer-when-downgrade"
										className="rounded-b-2xl"
									></iframe>
								</div>
								
								{/* Map Controls Overlay */}
								<div className="absolute bottom-4 right-4 flex flex-col space-y-2 z-10">
									<button className="bg-white shadow-lg rounded-lg p-2 hover:bg-gray-50 transition-colors">
										<svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
										</svg>
									</button>
									<button className="bg-white shadow-lg rounded-lg p-2 hover:bg-gray-50 transition-colors">
										<svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4m16 0l-4-4m4 4l-4 4" />
										</svg>
									</button>
								</div>
								
								{/* Location Pin */}
								<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
									<div className="w-8 h-8 bg-red-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center animate-pulse">
										<div className="w-2 h-2 bg-white rounded-full"></div>
									</div>
									<div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
										DC House DIK
									</div>
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
