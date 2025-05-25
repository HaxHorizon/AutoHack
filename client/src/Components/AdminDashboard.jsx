import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function AdminDashboard() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [showSelectModal, setShowSelectModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetch('http://localhost:4000/api/submissions')
      .then((res) => res.json())
      .then((data) => {
        setSubmissions(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching submissions:', err);
        setLoading(false);
        toast.error('Failed to load submissions');
      });
  }, []);

  const updateStatus = async (id, status) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`http://localhost:4000/api/submissions/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error('Failed to update status');

      const updated = await res.json();

      toast.success(
        `Team "${updated.team_name}" has been ${status === 'selected' ? 'selected and email will be sent shortly' : 'rejected'}.`
      );

      setSubmissions((prev) =>
        prev.map((s) => (s._id === updated._id ? updated : s))
      );

      setSelectedSubmission(null);
    } catch (err) {
      console.error('Error updating status:', err);
      toast.error('Something went wrong while saving the decision.');
    } finally {
      setIsUpdating(false);
      setShowSelectModal(false);
      setShowRejectModal(false);
    }
  };

  const handleDecision = (decision) => {
    if (!selectedSubmission) return;

    if (decision === 'select') {
      setShowSelectModal(true);
    } else if (decision === 'reject') {
      setShowRejectModal(true);
    }
  };

  const filteredSubmissions = submissions.filter((sub) =>
    sub.team_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-gray-600 text-lg font-medium">Loading submissions...</p>
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    );

  if (selectedSubmission) {
    const sub = selectedSubmission;
    const decisionMade = sub.status === 'selected' || sub.status === 'rejected';

    return (
      <div className="p-6 sm:p-10 min-h-screen bg-gray-50 font-sans text-gray-800">
        <button
          onClick={() => setSelectedSubmission(null)}
          className="mb-4 text-blue-600 hover:underline text-sm"
          disabled={isUpdating}
        >
          ← Back to Team List
        </button>

        <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-900">
          {sub.team_name} - Submission Details
        </h1>

        {sub.status && (
          <div className="mb-4">
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                sub.status === 'selected'
                  ? 'bg-green-100 text-green-800'
                  : sub.status === 'rejected'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              Status: {sub.status}
            </span>
          </div>
        )}

        <div className="bg-white rounded-xl shadow p-6 sm:p-8 space-y-5">
          <div>
            <p>
              <span className="font-semibold">Email:</span> {sub.email}
            </p>
            <p>
              <span className="font-semibold">Submitted At:</span>{' '}
              {sub.submitted_at ? new Date(sub.submitted_at).toLocaleString() : 'N/A'}
            </p>
          </div>

          <div>
            <p className="font-semibold mb-1">Scores:</p>
            <div className="bg-gray-50 border rounded p-3 font-mono text-sm">
              {sub.scores && typeof sub.scores === 'object' ? (
                Object.entries(sub.scores).map(([param, score]) => (
                  <div key={param}>
                    {param}: {score}
                  </div>
                ))
              ) : (
                <div>N/A</div>
              )}
            </div>
          </div>

          <div>
            <p className="font-semibold mb-1">Analysis Summary:</p>
            <p className="bg-gray-50 border rounded p-3 text-sm whitespace-pre-wrap">
              {sub.analysis_summary || 'N/A'}
            </p>
          </div>

          <div>
            <p className="font-semibold mb-1">PDF:</p>
            {sub.pdf_url ? (
              <a
                href={sub.pdf_url}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:underline font-semibold text-sm"
              >
                View PDF
              </a>
            ) : (
              'N/A'
            )}
          </div>

          {!decisionMade && (
            <div className="mt-6 flex gap-4">
              <button
                onClick={() => handleDecision('select')}
                disabled={isUpdating}
                className={`px-4 py-2 rounded text-white transition ${
                  isUpdating ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                ✅ Select
              </button>
              <button
                onClick={() => handleDecision('reject')}
                disabled={isUpdating}
                className={`px-4 py-2 rounded text-white transition ${
                  isUpdating ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                ❌ Reject
              </button>
            </div>
          )}
        </div>

        {/* Select Modal */}
        {showSelectModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full text-center">
              <p className="mb-4 text-lg font-semibold">
                Team "{sub.team_name}" is selected.
              </p>
              <p className="mb-6 text-gray-600">Email will be sent shortly.</p>
              <button
                onClick={() => updateStatus(sub._id, 'selected')}
                disabled={isUpdating}
                className={`px-4 py-2 rounded text-white transition ${
                  isUpdating ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                OK
              </button>
            </div>
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full text-center">
              <p className="mb-4 text-lg font-semibold">
                Are you sure you want to reject team "{sub.team_name}"?
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => updateStatus(sub._id, 'rejected')}
                  disabled={isUpdating}
                  className={`px-4 py-2 rounded text-white transition ${
                    isUpdating ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  Yes, Reject
                </button>
                <button
                  onClick={() => setShowRejectModal(false)}
                  disabled={isUpdating}
                  className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-10 min-h-screen bg-gray-50 font-sans text-gray-800">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Admin Dashboard - Team Submissions</h1>

      <div className="bg-white rounded-xl shadow p-6 sm:p-8">
        <div className="mb-4">
          <label
            htmlFor="search"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Search Team Name:
          </label>
          <input
            id="search"
            type="text"
            placeholder="Start typing to filter..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isUpdating}
          />
        </div>

        <ul className="space-y-3">
          {filteredSubmissions.length > 0 ? (
            filteredSubmissions.map((sub) => (
              <li key={sub._id}>
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setSelectedSubmission(sub)}
                    className="text-blue-600 hover:underline text-left text-base font-medium"
                    disabled={isUpdating}
                  >
                    {sub.team_name}
                  </button>
                  {sub.status && (
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded ${
                        sub.status === 'selected'
                          ? 'bg-green-100 text-green-800'
                          : sub.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {sub.status}
                    </span>
                  )}
                </div>
              </li>
            ))
          ) : (
            <p className="text-gray-500 text-sm">No teams match your search.</p>
          )}
        </ul>
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
