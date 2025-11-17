"use client";

import { useEffect, useState } from "react";
import { Plus, Save, Trash2, Edit, X } from "lucide-react";

type MainActivity = {
	ActivityID: number;
	MainActivityName: string;
	OutputID: string;
};

export default function ManageMainActivitiesPage() {
	const [items, setItems] = useState<MainActivity[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [editing, setEditing] = useState<MainActivity | null>(null);
	const [creating, setCreating] = useState<MainActivity>({ ActivityID: 0, MainActivityName: "", OutputID: "" });

	const load = async () => {
		try {
			setLoading(true);
			setError(null);
			const res = await fetch('/api/tracking-sheet/main-activities');
			const data = await res.json();
			if (data.success) setItems(data.activities || []);
			else setError(data.message || 'Failed to load');
		} catch (e) {
			setError('Failed to load');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => { load(); }, []);

	const handleCreate = async () => {
		if (!creating.ActivityID || !creating.MainActivityName || !creating.OutputID) return;
		await fetch('/api/tracking-sheet/main-activities', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(creating)
		});
		setCreating({ ActivityID: 0, MainActivityName: "", OutputID: "" });
		await load();
	};

	const handleUpdate = async () => {
		if (!editing) return;
		await fetch('/api/tracking-sheet/main-activities', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(editing)
		});
		setEditing(null);
		await load();
	};

	const handleDelete = async (ActivityID: number) => {
		await fetch(`/api/tracking-sheet/main-activities?ActivityID=${encodeURIComponent(ActivityID)}`, { method: 'DELETE' });
		await load();
	};

	return (
		<div className="max-w-5xl mx-auto p-6 space-y-6">
			<h1 className="text-2xl font-bold text-gray-900">Manage Main Activities</h1>

			{/* Create */}
			<div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
				<h2 className="text-lg font-semibold mb-3">Create</h2>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
					<input className="border rounded-lg px-3 py-2" placeholder="Activity ID" type="number" value={creating.ActivityID || ''} onChange={e => setCreating(v => ({ ...v, ActivityID: Number(e.target.value) }))} />
					<input className="border rounded-lg px-3 py-2" placeholder="Main Activity Name" value={creating.MainActivityName} onChange={e => setCreating(v => ({ ...v, MainActivityName: e.target.value }))} />
					<input className="border rounded-lg px-3 py-2" placeholder="Output ID" value={creating.OutputID} onChange={e => setCreating(v => ({ ...v, OutputID: e.target.value }))} />
				</div>
				<div className="mt-3">
					<button onClick={handleCreate} className="inline-flex items-center px-4 py-2 bg-[#0b4d2b] text-white rounded-lg hover:bg-[#0a3d24]">
						<Plus className="h-4 w-4 mr-2" /> Create
					</button>
				</div>
			</div>

			{/* List */}
			<div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
				<div className="flex items-center justify-between mb-3">
					<h2 className="text-lg font-semibold">Main Activities</h2>
					<button onClick={load} className="text-sm text-[#0b4d2b]">Refresh</button>
				</div>
				{loading ? (
					<p className="text-gray-600">Loading...</p>
				) : error ? (
					<p className="text-red-600">{error}</p>
				) : (
					<div className="overflow-x-auto">
						<table className="min-w-full divide-y divide-gray-200">
							<thead className="bg-gray-50">
								<tr>
									<th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Activity ID</th>
									<th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Main Activity Name</th>
									<th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Output ID</th>
									<th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
								</tr>
							</thead>
							<tbody className="bg-white divide-y divide-gray-200">
								{items.map((it) => (
									<tr key={it.ActivityID}>
										<td className="px-4 py-2 text-sm text-gray-900">{it.ActivityID}</td>
										<td className="px-4 py-2 text-sm text-gray-900">{it.MainActivityName}</td>
										<td className="px-4 py-2 text-sm text-gray-900">{it.OutputID}</td>
										<td className="px-4 py-2 text-right">
											<button onClick={() => setEditing(it)} className="inline-flex items-center px-2 py-1 text-sm text-blue-700 hover:underline mr-2"><Edit className="h-4 w-4 mr-1" />Edit</button>
											<button onClick={() => handleDelete(it.ActivityID)} className="inline-flex items-center px-2 py-1 text-sm text-red-700 hover:underline"><Trash2 className="h-4 w-4 mr-1" />Delete</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>

			{/* Edit Drawer */}
			{editing && (
				<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-lg font-semibold">Edit Main Activity</h3>
							<button onClick={() => setEditing(null)}><X className="h-5 w-5" /></button>
						</div>
						<div className="space-y-3">
							<input className="border rounded-lg px-3 py-2 w-full" placeholder="Activity ID" type="number" value={editing.ActivityID} disabled />
							<input className="border rounded-lg px-3 py-2 w-full" placeholder="Main Activity Name" value={editing.MainActivityName} onChange={e => setEditing(v => v ? ({ ...v, MainActivityName: e.target.value }) : v)} />
							<input className="border rounded-lg px-3 py-2 w-full" placeholder="Output ID" value={editing.OutputID} onChange={e => setEditing(v => v ? ({ ...v, OutputID: e.target.value }) : v)} />
						</div>
						<div className="mt-4 flex justify-end">
							<button onClick={handleUpdate} className="inline-flex items-center px-4 py-2 bg-[#0b4d2b] text-white rounded-lg hover:bg-[#0a3d24]"><Save className="h-4 w-4 mr-2"/>Save</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}


