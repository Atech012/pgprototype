'use client';

import { useEffect, useState } from 'react';
import { fetchJobs, submitApplication } from '../../../services/api';

export default function PublicJobBoard() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const [formData, setFormData] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    cover_letter: '',
  });
  const [applicantReqFiles, setApplicantReqFiles] = useState<{ [key: string]: File }>({});

  useEffect(() => {
    loadJobs();
  }, []);

  async function loadJobs() {
    setLoading(true);
    const data = await fetchJobs();
    setJobs(data);
    setLoading(false);
  }

  const handleRequirementFileChange = (title: string, file: File | null) => {
    if (file) {
      setApplicantReqFiles((prev) => ({ ...prev, [title]: file }));
    }
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;

    setSubmitting(true);
    setMessage('');

    const body = new FormData();
    body.append('job_id', selectedJob.id);
    body.append('first_name', formData.first_name);
    body.append('middle_name', formData.middle_name);
    body.append('last_name', formData.last_name);
    body.append('email', formData.email);
    body.append('phone', formData.phone);
    body.append('address', formData.address);
    body.append('cover_letter', formData.cover_letter);

    // Append applicant requirement files mapped to their banner titles
    Object.entries(applicantReqFiles).forEach(([title, file]) => {
      const fieldName = `req_file_${title.replace(/\s+/g, '_')}`;
      body.append(fieldName, file);
    });

    const res = await submitApplication(body);
    setSubmitting(false);

    if (res.status === 'success') {
      setMessage('Application submitted successfully!');
      setTimeout(() => {
        setSelectedJob(null);
        setMessage('');
        setFormData({ first_name: '', middle_name: '', last_name: '', email: '', phone: '', address: '', cover_letter: '' });
        setApplicantReqFiles({});
      }, 2000);
    } else {
      setMessage(res.message || 'Failed to submit application.');
    }
  };

  const filteredJobs = jobs.filter((j) =>
    j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    j.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    j.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Hero Banner Section */}
      <section className="bg-gradient-to-r from-[#0B1F3B] to-[#1E3A8A] text-white py-16 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-extrabold mb-4">Your Gateway to Local & Partner Employment</h2>
          <p className="text-lg text-slate-200 mb-8">
            Connecting job seekers of Guagua with municipal vacancies and verified private partner industries.
          </p>
          <div className="flex max-w-xl mx-auto bg-white rounded-lg overflow-hidden shadow-lg">
            <input
              type="text"
              placeholder="Search by job title, partner company, or location..."
              className="w-full px-5 py-3 text-slate-800 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Active Job Opportunities List */}
      <main id="jobs" className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-[#0B1F3B]">Active Employment Opportunities</h3>
          <span className="text-sm font-semibold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
            {filteredJobs.length} Vacancies Available
          </span>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-500 font-medium">Loading job vacancies...</div>
        ) : filteredJobs.length === 0 ? (
          <div className="bg-white p-8 rounded-lg border border-slate-200 text-center text-slate-500">
            No job postings found matching your search query.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <div key={job.id} className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      🏢 {job.company_name}
                    </span>
                    <h4 className="text-xl font-bold text-[#0B1F3B] mt-1">{job.title}</h4>
                    <p className="text-xs text-slate-500 mt-1">📍 {job.location} | 💼 {job.job_type}</p>
                  </div>
                  <span className="text-sm font-bold text-[#059669] bg-emerald-50 border border-emerald-200 px-3 py-1 rounded">
                    {job.salary_range || 'Salary Undisclosed'}
                  </span>
                </div>
                
                <p className="text-sm text-slate-700 mt-3 line-clamp-2">{job.description}</p>
                
                <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-xs text-slate-400">Posted on {new Date(job.created_at).toLocaleDateString()}</span>
                  <button
                    onClick={() => setSelectedJob(job)}
                    className="bg-[#0B1F3B] hover:bg-[#1E3A8A] text-white text-sm font-semibold px-5 py-2 rounded-md transition shadow"
                  >
                    View Details & Apply
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Details & Application Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <div>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {selectedJob.company_name}
                </span>
                <h3 className="text-2xl font-bold text-[#0B1F3B] mt-1">{selectedJob.title}</h3>
                <p className="text-xs text-slate-500">📍 {selectedJob.location} | 💼 {selectedJob.job_type} | 💰 {selectedJob.salary_range}</p>
              </div>
              <button onClick={() => setSelectedJob(null)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">✕</button>
            </div>

            <div className="space-y-4 mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Job Description & Responsibilities</h4>
                <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">{selectedJob.description}</p>
              </div>

              {selectedJob.requirements && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Candidate Qualifications</h4>
                  <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">{selectedJob.requirements}</p>
                </div>
              )}

              {/* Requirement Document Banners & Applicant Uploads */}
              {selectedJob.requirements_files && selectedJob.requirements_files.length > 0 && (
                <div className="border-t pt-3 mt-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 mb-2">Required Document Banners & File Submissions</h4>
                  <div className="space-y-3">
                    {selectedJob.requirements_files.map((fileObj: any, idx: number) => (
                      <div key={idx} className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-lg shadow-sm space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider">
                            📋 {fileObj.title}
                          </span>
                          <a
                            href={`http://localhost:5000${fileObj.file_path}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-[#059669] hover:bg-emerald-600 text-white text-xs font-semibold px-3 py-1.5 rounded transition shadow flex items-center gap-1"
                          >
                            📥 Download Template Form
                          </a>
                        </div>
                        <div className="pt-2 border-t border-emerald-200">
                          <label className="block text-[11px] font-semibold text-emerald-900 mb-1">
                            Upload your filled copy for: <span className="underline">{fileObj.title}</span> *
                          </label>
                          <input 
                            required
                            type="file" 
                            accept=".pdf,.doc,.docx,.jpg,.png"
                            onChange={(e) => handleRequirementFileChange(fileObj.title, e.target.files?.[0] || null)}
                            className="w-full text-xs text-slate-600 bg-white p-1.5 border border-emerald-300 rounded"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <h4 className="text-md font-bold text-[#0B1F3B] mb-3 border-b pb-2">Submit Your Application</h4>

            {message && (
              <div className={`p-3 rounded mb-4 text-sm font-semibold ${message.includes('success') ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                {message}
              </div>
            )}

            <form onSubmit={handleApplySubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">First Name *</label>
                  <input required type="text" className="w-full p-2 border border-slate-300 rounded text-sm outline-none" value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Middle Name</label>
                  <input type="text" className="w-full p-2 border border-slate-300 rounded text-sm outline-none" value={formData.middle_name} onChange={(e) => setFormData({ ...formData, middle_name: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Last Name *</label>
                  <input required type="text" className="w-full p-2 border border-slate-300 rounded text-sm outline-none" value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Email *</label>
                  <input required type="email" className="w-full p-2 border border-slate-300 rounded text-sm outline-none" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Phone *</label>
                  <input required type="text" className="w-full p-2 border border-slate-300 rounded text-sm outline-none" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Address *</label>
                <input required type="text" className="w-full p-2 border border-slate-300 rounded text-sm outline-none" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Cover Letter / Statement</label>
                <textarea rows={3} className="w-full p-2 border border-slate-300 rounded text-sm outline-none" value={formData.cover_letter} onChange={(e) => setFormData({ ...formData, cover_letter: e.target.value })} />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button type="button" onClick={() => setSelectedJob(null)} className="px-4 py-2 border rounded text-slate-600 text-sm font-semibold">Cancel</button>
                <button type="submit" disabled={submitting} className="px-5 py-2 bg-[#059669] hover:bg-emerald-600 text-white rounded text-sm font-semibold shadow">
                  {submitting ? 'Submitting Application...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}