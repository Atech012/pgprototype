'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchAllApplications, createJob } from '../../../services/api';

interface RequirementInput {
  title: string;
  file: File | null;
}

export default function AdminJobs() {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string>('');
  
  // Tab Switcher: 'jobs' or 'applicants'
  const [activeTab, setActiveTab] = useState<'jobs' | 'applicants'>('jobs');

  // Job Listings State
  const [jobs, setJobs] = useState<any[]>([]);
  const [loadingJobs, setLoadingJobs] = useState<boolean>(false);

  // Applications State
  const [applications, setApplications] = useState<any[]>([]);
  const [loadingApps, setLoadingApps] = useState<boolean>(false);
  const [jobCategoryFilter, setJobCategoryFilter] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  // Status Confirmation & Email Preview Modal State
  const [showEmailModal, setShowEmailModal] = useState<boolean>(false);
  const [pendingUpdate, setPendingUpdate] = useState<{ appId: string; newStatus: string; applicantName: string; email: string; jobTitle: string } | null>(null);
  const [emailSubject, setEmailSubject] = useState<string>('');
  const [emailBody, setEmailBody] = useState<string>('');
  const [sendingEmail, setSendingEmail] = useState<boolean>(false);

  // Job Posting / Editing Modal State
  const [showJobModal, setShowJobModal] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [posting, setPosting] = useState<boolean>(false);
  const [jobFormData, setJobFormData] = useState({
    title: '',
    company_name: 'Municipal Government of Guagua',
    location: 'Guagua, Pampanga',
    job_type: 'Full-time',
    salary_range: '₱18,000 - ₱25,000',
    description: '',
    requirements: ''
  });

  const [reqInputs, setReqInputs] = useState<RequirementInput[]>([
    { title: 'Applicants Form', file: null }
  ]);

  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem('peso_token');
    const storedUser = localStorage.getItem('peso_user');

    if (!storedToken || !storedUser || storedUser === 'undefined') {
      router.push('/admin/login');
      return;
    }

    try {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      loadJobs(storedToken);
      loadApplications('All', storedToken);
    } catch (err) {
      localStorage.removeItem('peso_token');
      localStorage.removeItem('peso_user');
      router.push('/admin/login');
    }
  }, []);

  const loadJobs = async (authToken: string) => {
    setLoadingJobs(true);
    try {
      const res = await fetch('http://localhost:5000/api/jobs', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setJobs(data);
      } else if (data.jobs) {
        setJobs(data.jobs);
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setLoadingJobs(false);
    }
  };

  const loadApplications = async (category: string, authToken: string) => {
    setLoadingApps(true);
    const apps = await fetchAllApplications(category, authToken);
    setApplications(apps);
    setLoadingApps(false);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cat = e.target.value;
    setJobCategoryFilter(cat);
    loadApplications(cat, token);
  };

  const handleOpenCreateModal = () => {
    setIsEditing(false);
    setCurrentJobId(null);
    setJobFormData({
      title: '',
      company_name: 'Municipal Government of Guagua',
      location: 'Guagua, Pampanga',
      job_type: 'Full-time',
      salary_range: '₱18,000 - ₱25,000',
      description: '',
      requirements: ''
    });
    setReqInputs([{ title: 'Applicants Form', file: null }]);
    setShowJobModal(true);
  };

  const handleOpenEditModal = (job: any) => {
    setIsEditing(true);
    setCurrentJobId(job.job_id || job.id);
    setJobFormData({
      title: job.title || '',
      company_name: job.company_name || 'Municipal Government of Guagua',
      location: job.location || 'Guagua, Pampanga',
      job_type: job.job_type || 'Full-time',
      salary_range: job.salary_range || '₱18,000 - ₱25,000',
      description: job.description || '',
      requirements: job.requirements || ''
    });
    setReqInputs([{ title: 'Applicants Form', file: null }]);
    setShowJobModal(true);
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job vacancy?')) return;

    try {
      const res = await fetch(`http://localhost:5000/api/jobs/${jobId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok || data.status === 'success') {
        alert('Job vacancy deleted successfully.');
        loadJobs(token);
      } else {
        alert(data.message || 'Failed to delete job vacancy.');
      }
    } catch (err) {
      console.error('Error deleting job:', err);
      alert('Network error while deleting job.');
    }
  };

  const handleSaveJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setPosting(true);

    const body = new FormData();
    body.append('title', jobFormData.title);
    body.append('company_name', jobFormData.company_name);
    body.append('location', jobFormData.location);
    body.append('job_type', jobFormData.job_type);
    body.append('salary_range', jobFormData.salary_range);
    body.append('description', jobFormData.description);
    body.append('requirements', jobFormData.requirements);

    reqInputs.forEach((req) => {
      if (req.file) {
        body.append('requirement_titles', req.title || 'Required Document');
        body.append('requirement_files', req.file);
      }
    });

    try {
      if (isEditing && currentJobId) {
        const res = await fetch(`http://localhost:5000/api/jobs/${currentJobId}`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` },
          body
        });
        const data = await res.json();
        if (res.ok || data.status === 'success') {
          alert('Job vacancy updated successfully!');
          setShowJobModal(false);
          loadJobs(token);
        } else {
          alert(data.message || 'Failed to update job.');
        }
      } else {
        const res = await createJob(body, token);
        if (res.status === 'success') {
          alert('Job vacancy posted successfully!');
          setShowJobModal(false);
          loadJobs(token);
        } else {
          alert(res.message || 'Failed to post vacancy.');
        }
      }
    } catch (err) {
      console.error('Error saving job:', err);
      alert('Network error while saving job.');
    } finally {
      setPosting(false);
    }
  };

  const handleStatusSelectTrigger = async (app: any, newStatus: string) => {
    if (app.status === newStatus) return;

    setPendingUpdate({
      appId: app.application_id,
      newStatus,
      applicantName: `${app.first_name} ${app.last_name}`,
      email: app.email,
      jobTitle: app.job_title
    });

    try {
      const res = await fetch(`http://localhost:5000/api/applications/email-template/${newStatus}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();

      if (data.status === 'success' && data.template) {
        const formattedSubject = data.template.subject.replace(/{{position_title}}/g, app.job_title);
        const formattedBody = data.template.body_content
          .replace(/{{applicant_name}}/g, app.first_name)
          .replace(/{{position_title}}/g, app.job_title);

        setEmailSubject(formattedSubject);
        setEmailBody(formattedBody);
      } else {
        setEmailSubject(`PESO Guagua: Application Update for ${app.job_title}`);
        setEmailBody(`Dear ${app.first_name},\n\nYour application status has been updated to: ${newStatus}.\n\nPESO Guagua Team`);
      }
    } catch (err) {
      setEmailSubject(`PESO Guagua: Application Update for ${app.job_title}`);
      setEmailBody(`Dear ${app.first_name},\n\nYour application status has been updated to: ${newStatus}.\n\nPESO Guagua Team`);
    }

    setShowEmailModal(true);
  };

  const confirmAndSendStatusUpdate = async () => {
    if (!pendingUpdate) return;
    setSendingEmail(true);

    try {
      const res = await fetch(`http://localhost:5000/api/applications/${pendingUpdate.appId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: pendingUpdate.newStatus,
          emailSubject,
          emailMessage: emailBody
        })
      });

      const data = await res.json();
      if (data.status === 'success') {
        setApplications((prevApps) =>
          prevApps.map((app) => (app.application_id === pendingUpdate.appId ? { ...app, status: pendingUpdate.newStatus } : app))
        );
        setShowEmailModal(false);
        setPendingUpdate(null);
        alert('Status updated and notification email sent successfully!');
      } else {
        alert(data.message || 'Failed to update status.');
      }
    } catch (err) {
      alert('Network error while updating status.');
    } finally {
      setSendingEmail(false);
    }
  };

  const filteredApps = applications.filter((app) =>
    filterStatus === 'All' ? true : app.status === filterStatus
  );

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800">
      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Admin Console Header Banner */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-8 flex flex-wrap justify-between items-center gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full">
              PESO Portal Admin Console
            </span>
            <h1 className="text-2xl font-black text-[#0B1F3B] mt-1">Job Vacancies & Applicants Management</h1>
            <p className="text-xs text-slate-500">Create, edit, and manage job listings or review incoming candidate applications.</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Tab Switcher Buttons */}
            <div className="bg-slate-100 p-1 rounded-lg flex border border-slate-200">
              <button
                onClick={() => setActiveTab('jobs')}
                className={`px-4 py-2 rounded-md text-xs font-bold transition ${
                  activeTab === 'jobs' ? 'bg-[#0B1F3B] text-white shadow' : 'text-slate-600 hover:text-[#0B1F3B]'
                }`}
              >
                💼 Job Listings ({jobs.length})
              </button>
              <button
                onClick={() => setActiveTab('applicants')}
                className={`px-4 py-2 rounded-md text-xs font-bold transition ${
                  activeTab === 'applicants' ? 'bg-[#0B1F3B] text-white shadow' : 'text-slate-600 hover:text-[#0B1F3B]'
                }`}
              >
                📋 Job Applicants ({applications.length})
              </button>
            </div>

            <button
              onClick={handleOpenCreateModal}
              className="bg-[#059669] hover:bg-emerald-600 text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow transition flex items-center gap-1.5"
            >
              + Post New Vacancy
            </button>
          </div>
        </div>

        {/* TAB 1: JOB LISTINGS MANAGEMENT */}
        {activeTab === 'jobs' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-[#0B1F3B] text-sm">Active Job Postings</h3>
            </div>

            {loadingJobs ? (
              <div className="p-8 text-center text-slate-500 text-sm">Loading job vacancies...</div>
            ) : jobs.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">No job postings available. Click "+ Post New Vacancy" to add one.</div>
            ) : (
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b text-slate-600 text-xs uppercase tracking-wider">
                    <th className="p-4">Position & Company</th>
                    <th className="p-4">Location & Type</th>
                    <th className="p-4">Salary Range</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {jobs.map((job) => {
                    const jId = job.job_id || job.id;
                    return (
                      <tr key={jId} className="hover:bg-slate-50">
                        <td className="p-4 font-semibold text-slate-800">
                          {job.title}
                          <p className="text-xs text-slate-500 font-normal">🏢 {job.company_name}</p>
                        </td>
                        <td className="p-4 text-xs text-slate-600">
                          <div>📍 {job.location}</div>
                          <span className="inline-block bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold mt-1">
                            {job.job_type}
                          </span>
                        </td>
                        <td className="p-4 text-xs font-medium text-emerald-700">
                          {job.salary_range || 'Not specified'}
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => handleOpenEditModal(job)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded text-xs font-bold transition border border-slate-300"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteJob(jId)}
                            className="bg-red-50 hover:bg-red-100 text-red-700 px-3 py-1.5 rounded text-xs font-bold transition border border-red-200"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* TAB 2: APPLICANTS MANAGEMENT */}
        {activeTab === 'applicants' && (
          <div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-wrap gap-4 items-center">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Filter by Job Category</label>
                <select
                  value={jobCategoryFilter}
                  onChange={handleCategoryChange}
                  className="p-2 border border-slate-300 rounded text-xs font-semibold bg-slate-50 outline-none text-slate-800"
                >
                  <option value="All">All Applicants</option>
                  <option value="Municipal">Municipal Job Vacancy</option>
                  <option value="Private">Private Partner Company</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Filter Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="p-2 border border-slate-300 rounded text-xs font-semibold bg-slate-50 outline-none text-slate-800"
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Reviewing">Reviewing</option>
                  <option value="Scheduled Interview">Scheduled Interview</option>
                  <option value="Shortlisted">Shortlisted</option>
                  <option value="Hired">Hired</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b bg-slate-50 flex justify-between items-center">
                <h3 className="font-bold text-[#0B1F3B] text-sm">Job Applicants ({filteredApps.length})</h3>
              </div>

              {loadingApps ? (
                <div className="p-8 text-center text-slate-500 text-sm">Loading applicant data...</div>
              ) : filteredApps.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">No applicant records found matching this filter.</div>
              ) : (
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b text-slate-600 text-xs uppercase tracking-wider">
                      <th className="p-4">Applicant Name & Position</th>
                      <th className="p-4">Contact Info</th>
                      <th className="p-4">Attached Documents</th>
                      <th className="p-4">Status & Email Automation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredApps.map((app) => (
                      <tr key={app.application_id} className="hover:bg-slate-50">
                        <td className="p-4 font-semibold text-slate-800">
                          {app.first_name} {app.middle_name ? `${app.middle_name} ` : ''}{app.last_name}
                          <p className="text-xs text-blue-600 font-medium">📌 Applied for: {app.job_title} ({app.company_name})</p>
                        </td>
                        <td className="p-4 text-slate-600 text-xs">
                          <div>📧 {app.email}</div>
                          <div>📞 {app.phone}</div>
                          <div className="text-slate-400">📍 {app.address}</div>
                        </td>
                        <td className="p-4 text-xs space-y-1">
                          {app.uploaded_requirements && app.uploaded_requirements.length > 0 ? (
                            app.uploaded_requirements.map((doc: any, i: number) => (
                              <div key={i}>
                                <a
                                  href={`http://localhost:5000${doc.file_path}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-emerald-700 hover:underline font-semibold"
                                >
                                  📄 [{doc.requirement_title}]
                                </a>
                              </div>
                            ))
                          ) : (
                            <span className="text-slate-400">No documents attached</span>
                          )}
                        </td>
                        <td className="p-4">
                          <select
                            value={app.status}
                            onChange={(e) => handleStatusSelectTrigger(app, e.target.value)}
                            className={`p-1.5 rounded text-xs font-bold border outline-none ${
                              app.status === 'Hired'
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : app.status === 'Scheduled Interview'
                                ? 'bg-purple-100 text-purple-800 border-purple-300'
                                : app.status === 'Shortlisted'
                                ? 'bg-blue-100 text-blue-800 border-blue-300'
                                : app.status === 'Rejected'
                                ? 'bg-red-100 text-red-800 border-red-300'
                                : 'bg-amber-100 text-amber-800 border-amber-300'
                            }`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Reviewing">Reviewing</option>
                            <option value="Scheduled Interview">Scheduled Interview</option>
                            <option value="Shortlisted">Shortlisted</option>
                            <option value="Hired">Hired</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

      </main>

      {/* Email Preview & Confirmation Modal */}
      {showEmailModal && pendingUpdate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-xl w-full p-6">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <div>
                <h3 className="text-lg font-bold text-[#0B1F3B]">Confirm Status Change & Review Email</h3>
                <p className="text-xs text-slate-500">Applicant: <strong>{pendingUpdate.applicantName}</strong> ({pendingUpdate.email})</p>
              </div>
              <button onClick={() => setShowEmailModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-3 rounded text-xs text-amber-900 mb-4">
              ⚠️ Changing status to <strong className="uppercase">{pendingUpdate.newStatus}</strong> will automatically send this email notification to the applicant.
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Email Subject</label>
                <input
                  type="text"
                  className="w-full p-2 border border-slate-300 rounded text-sm text-slate-800 outline-none font-medium"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Email Body Message</label>
                <textarea
                  rows={8}
                  className="w-full p-2.5 border border-slate-300 rounded text-sm text-slate-800 outline-none font-mono text-slate-700 leading-relaxed"
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t mt-4">
              <button 
                type="button" 
                onClick={() => { setShowEmailModal(false); setPendingUpdate(null); }} 
                className="px-4 py-2 border rounded text-slate-600 text-xs font-semibold"
              >
                Cancel
              </button>
              <button 
                type="button" 
                disabled={sendingEmail}
                onClick={confirmAndSendStatusUpdate} 
                className="px-5 py-2 bg-[#059669] hover:bg-emerald-600 text-white rounded text-xs font-semibold shadow"
              >
                {sendingEmail ? 'Sending...' : 'Confirm & Send Email'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Post / Edit Job Modal */}
      {showJobModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="text-lg font-bold text-[#0B1F3B]">
                {isEditing ? 'Edit Job Vacancy' : 'Post New Job Vacancy & Document Banners'}
              </h3>
              <button onClick={() => setShowJobModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleSaveJob} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Job Title *</label>
                <input required type="text" className="w-full p-2 border border-slate-300 rounded text-sm text-slate-800 outline-none" value={jobFormData.title} onChange={(e) => setJobFormData({ ...jobFormData, title: e.target.value })} placeholder="e.g. Administrative Assistant II" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Employer / Partner Company *</label>
                  <input required type="text" className="w-full p-2 border border-slate-300 rounded text-sm text-slate-800 outline-none" value={jobFormData.company_name} onChange={(e) => setJobFormData({ ...jobFormData, company_name: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Job Type *</label>
                  <select className="w-full p-2 border border-slate-300 rounded text-sm text-slate-800 outline-none text-slate-800" value={jobFormData.job_type} onChange={(e) => setJobFormData({ ...jobFormData, job_type: e.target.value })}>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Location *</label>
                  <input required type="text" className="w-full p-2 border border-slate-300 rounded text-sm text-slate-800 outline-none" value={jobFormData.location} onChange={(e) => setJobFormData({ ...jobFormData, location: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Salary Range</label>
                  <input type="text" className="w-full p-2 border border-slate-300 rounded text-sm text-slate-800 outline-none" value={jobFormData.salary_range} onChange={(e) => setJobFormData({ ...jobFormData, salary_range: e.target.value })} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Description *</label>
                <textarea 
                  required 
                  rows={4}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = `${target.scrollHeight}px`;
                  }}
                  className="w-full p-2.5 border border-slate-300 rounded text-sm text-slate-800 outline-none resize-none overflow-hidden" 
                  value={jobFormData.description} 
                  onChange={(e) => setJobFormData({ ...jobFormData, description: e.target.value })} 
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Qualifications / Requirements</label>
                <textarea 
                  rows={3} 
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = `${target.scrollHeight}px`;
                  }}
                  className="w-full p-2.5 border border-slate-300 rounded text-sm text-slate-800 outline-none resize-none overflow-hidden" 
                  value={jobFormData.requirements} 
                  onChange={(e) => setJobFormData({ ...jobFormData, requirements: e.target.value })} 
                />
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Required Document Banners & Files</label>
                  <button type="button" onClick={() => setReqInputs([...reqInputs, { title: '', file: null }])} className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded font-semibold transition">
                    + Add Another Document
                  </button>
                </div>

                <div className="space-y-3">
                  {reqInputs.map((req, index) => (
                    <div key={index} className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex gap-3 items-center">
                      <div className="flex-1">
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Banner Title</label>
                        <input 
                          type="text" 
                          value={req.title}
                          onChange={(e) => {
                            const updated = [...reqInputs];
                            updated[index].title = e.target.value;
                            setReqInputs(updated);
                          }}
                          className="w-full p-1.5 border rounded text-xs bg-white text-slate-800 outline-none"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Template File</label>
                        <input 
                          type="file" 
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => {
                            const updated = [...reqInputs];
                            updated[index].file = e.target.files?.[0] || null;
                            setReqInputs(updated);
                          }}
                          className="w-full text-xs text-slate-500"
                        />
                      </div>
                      {reqInputs.length > 1 && (
                        <button type="button" onClick={() => setReqInputs(reqInputs.filter((_, i) => i !== index))} className="text-red-500 font-bold text-sm px-2 pt-4">
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t mt-4">
                <button type="button" onClick={() => setShowJobModal(false)} className="px-4 py-2 border rounded text-slate-600 text-xs font-semibold">Cancel</button>
                <button type="submit" disabled={posting} className="px-5 py-2 bg-[#059669] hover:bg-emerald-600 text-white rounded text-xs font-semibold">
                  {posting ? 'Saving...' : (isEditing ? 'Save Changes' : 'Publish Vacancy')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}