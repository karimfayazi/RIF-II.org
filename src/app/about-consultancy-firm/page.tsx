"use client";

import { useState } from "react";
import { Upload, AlertCircle, CheckCircle, FileText } from "lucide-react";

export default function AboutConsultancyFirm() {
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [uploading, setUploading] = useState(false);
	const [success, setSuccess] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0] || null;
		if (file) {
			// Check if it's a PDF or DOC file
			const allowedTypes = [
				'application/pdf',
				'application/msword',
				'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
			];
			
			if (!allowedTypes.includes(file.type)) {
				setError('Please select a PDF or DOC file (PDF, DOC, DOCX)');
				return;
			}
			setSelectedFile(file);
			setError(null);
		}
	};

	const handleUpload = async () => {
		if (!selectedFile) {
			setError('Please select a document file first');
			return;
		}

		setUploading(true);
		setError(null);
		setSuccess(null);

		try {
			const formData = new FormData();
			formData.append('document', selectedFile);

			const response = await fetch('/api/upload-document', {
				method: 'POST',
				body: formData,
			});

			const data = await response.json();

			if (data.success) {
				const successMsg = data.uploadMethod === 'external-server'
					? `✅ Document uploaded successfully to rif-ii.org server!`
					: `✅ Document uploaded successfully!`;
				
				setSuccess(`${successMsg} File: ${data.filename}`);
				if (data.note) {
					setSuccess(prev => prev + ` ${data.note}`);
				}
				setUploadedImageUrl(data.url);
				setSelectedFile(null);
				// Reset file input
				const fileInput = document.getElementById('documentFile') as HTMLInputElement;
				if (fileInput) fileInput.value = '';
			} else {
				setError(`❌ Upload failed: ${data.message || 'Unknown error'}`);
				if (data.troubleshooting) {
					setError(prev => prev + `\n\nTroubleshooting:\n${data.troubleshooting.map((t: string) => `• ${t}`).join('\n')}`);
				}
			}
		} catch (err) {
			setError('Error uploading document: ' + (err instanceof Error ? err.message : 'Unknown error'));
		} finally {
			setUploading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
			<div className="max-w-6xl mx-auto">
				{/* Header */}
				<div className="text-center mb-8">
					<h1 className="text-4xl font-bold text-gray-900">About Consultancy Firm</h1>
					<p className="text-gray-600 mt-2">Upload and manage consultancy firm documents</p>
				</div>

				{/* Document Upload Section */}
				<div className="bg-white rounded-lg shadow-lg p-8 mb-8">
					<h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
						<FileText className="h-6 w-6" />
						Upload Document
					</h2>

					{/* Success Message */}
					{success && (
						<div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
							<CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
							<div>
								<p className="text-green-800 font-medium">{success}</p>
							</div>
						</div>
					)}

					{/* Error Message */}
					{error && (
						<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
							<AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
							<div>
								<p className="text-red-800 font-medium">{error}</p>
							</div>
						</div>
					)}

					{/* File Upload */}
					<div className="space-y-6">
						<div>
							<label htmlFor="documentFile" className="block text-sm font-medium text-gray-700 mb-2">
								Select Document File <span className="text-red-500">*</span>
							</label>
							<div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
								<input
									type="file"
									id="documentFile"
									accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
									onChange={handleFileChange}
									className="hidden"
								/>
								<label htmlFor="documentFile" className="cursor-pointer">
									<Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
									<p className="text-sm font-medium text-gray-700">
										{selectedFile ? selectedFile.name : "Click to select a document or drag and drop"}
									</p>
									<p className="text-xs text-gray-500 mt-1">Supports PDF, DOC, DOCX files</p>
								</label>
							</div>
						</div>

						{/* Upload Button */}
						<div className="flex gap-3">
							<button
								onClick={handleUpload}
								disabled={!selectedFile || uploading}
								className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2 transition-colors"
							>
								<Upload className="h-4 w-4" />
								{uploading ? "Uploading..." : "Upload Document"}
							</button>
							<button
								onClick={() => {
									setSelectedFile(null);
									setError(null);
									setSuccess(null);
									setUploadedImageUrl(null);
									const fileInput = document.getElementById('documentFile') as HTMLInputElement;
									if (fileInput) fileInput.value = '';
								}}
								className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition-colors"
							>
								Clear
							</button>
						</div>
					</div>

					{/* Uploaded Document Preview */}
					{uploadedImageUrl && (
						<div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
							<h3 className="text-sm font-semibold text-green-900 mb-4">Uploaded Document</h3>
							<div className="flex flex-col items-center space-y-4">
								<div className="flex items-center justify-center w-32 h-32 bg-blue-100 rounded-lg">
									<FileText className="h-16 w-16 text-blue-600" />
								</div>
								<div className="text-center">
									<p className="text-sm text-green-800 mb-2">Document URL:</p>
									<a
										href={uploadedImageUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="text-blue-600 hover:text-blue-800 text-sm break-all"
									>
										{uploadedImageUrl}
									</a>
									<div className="mt-2">
										<a
											href={uploadedImageUrl}
											target="_blank"
											rel="noopener noreferrer"
											className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
										>
											<FileText className="h-4 w-4" />
											Open Document
										</a>
									</div>
								</div>
							</div>
						</div>
					)}

					{/* Upload Info */}
					<div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
						<h3 className="text-sm font-semibold text-blue-900 mb-2">Upload Information</h3>
						<ul className="text-sm text-blue-800 space-y-1">
							<li>• Documents are saved directly to the server (no PHP required!)</li>
							<li>• Supported formats: PDF, DOC, DOCX</li>
							<li>• Maximum file size: 10MB</li>
							<li>• Files are automatically renamed to prevent conflicts</li>
							<li>• Uploaded documents are immediately accessible via the provided URL</li>
							<li>• Files are saved to: <code className="bg-blue-100 px-1 rounded">public/uploads/test/</code> (default) or <code className="bg-blue-100 px-1 rounded">httpdocs/Uploads/test/</code> (if configured)</li>
						</ul>
						<p className="text-xs text-blue-700 mt-3">
							💡 <strong>Tip:</strong> To save directly to rif-ii.org server, set <code className="bg-blue-100 px-1 rounded">DOCUMENTS_UPLOAD_PATH</code> in your <code className="bg-blue-100 px-1 rounded">.env.local</code> file
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}