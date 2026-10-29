'use client';

import { useState, useEffect } from 'react';

interface EventItem {
  id: number;
  title: string;
  category: string;
  event_date: string;
  location: string;
  description: string;
  max_attendees: number;
  speakers?: string;
  guest_of_honor?: string;
  benefits?: string;
  is_active: boolean;
}

interface RegistrationItem {
  id: number;
  event_title: string;
  event_date: string;
  location: string;
  full_name: string;
  email: string;
  phone: string;
  gov_id_type: string;
  gov_id_path: string;
  status: string;
  registered_at: string;
}

export default function AdminEventsPage() {
  const [activeTab, setActiveTab] = useState<'events' | 'registrations'>('events');
  
  // Events state
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Job Summit');
  const [eventDate, setEventDate] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [maxAttendees, setMaxAttendees] = useState(100);
  const [speakers, setSpeakers] = useState('');
  const [guestOfHonor, setGuestOfHonor] = useState('');
  const [benefits, setBenefits] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Registrations & Email Preview Modal state
  const [registrations, setRegistrations] = useState<RegistrationItem[]>([]);
  const [regLoading, setRegLoading] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedReg, setSelectedReg] = useState<RegistrationItem | null>(null);
  const [targetStatus, setTargetStatus] = useState<string>('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [adminUser, setAdminUser] = useState('Admin Staff');

  useEffect(() => {
    fetchEvents();
    fetchRegistrations();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/events/admin/all');
      const data = await res.json();
      if (data.status === 'success') {
        setEvents(data.events);
      }
    } catch (err) {
      console.error('Error fetching admin events:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrations = async () => {
    try {
      setRegLoading(true);
      const res = await fetch('http://localhost:5000/api/events/admin/registrations');
      const data = await res.json();
      if (data.status === 'success') {
        setRegistrations(data.registrations);
      }
    } catch (err) {
      console.error('Error fetching registrations:', err);
    } finally {
      setRegLoading(false);
    }
  };

  const handleOpenModal = (ev?: EventItem) => {
    if (ev) {
      setEditingEvent(ev);
      setTitle(ev.title);
      setCategory(ev.category);
      setEventDate(new Date(ev.event_date).toISOString().slice(0, 16));
      setLocation(ev.location);
      setDescription(ev.description);
      setMaxAttendees(ev.max_attendees);
      setSpeakers(ev.speakers || '');
      setGuestOfHonor(ev.guest_of_honor || '');
      setBenefits(ev.benefits || '');
      setIsActive(ev.is_active);
    } else {
      setEditingEvent(null);
      setTitle('');
      setCategory('Job Summit');
      setEventDate('');
      setLocation('');
      setDescription('');
      setMaxAttendees(100);
      setSpeakers('');
      setGuestOfHonor('');
      setBenefits('');
      setIsActive(true);
    }
    setShowEventModal(true);
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title,
      category,
      event_date: eventDate,
      location,
      description,
      max_attendees: maxAttendees,
      speakers,
      guest_of_honor: guestOfHonor,
      benefits,
      is_active: isActive
    };

    try {
      const url = editingEvent
        ? `http://localhost:5000/api/events/admin/update/${editingEvent.id}`
        : 'http://localhost:5000/api/events/admin/create';
      const method = editingEvent ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.status === 'success') {
        alert(editingEvent ? 'Event updated successfully!' : 'Event created successfully!');
        setShowEventModal(false);
        fetchEvents();
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (err) {
      console.error('Error saving event:', err);
      alert('Failed to save event.');
    }
  };

  const handleDeleteEvent = async (id: number) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/events/admin/delete/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.status === 'success') {
        alert('Event deleted.');
        fetchEvents();
      }
    } catch (err) {
      console.error('Error deleting event:', err);
    }
  };

  // Open Template Customization & Confirmation Modal
  const handleOpenStatusModal = async (reg: RegistrationItem, status: string) => {
    setSelectedReg(reg);
    setTargetStatus(status);

    try {
      const res = await fetch('http://localhost:5000/api/email-templates');
      const data = await res.json();
      let template = null;

      if (data.status === 'success' && data.templates) {
        const key = status === 'Confirmed Attendance' ? 'Event Confirmed' : 'Rejected';
        template = data.templates.find((t: any) => t.status_key === key);
      }

      const formattedDate = new Date(reg.event_date).toLocaleString();

      if (template) {
        setEmailSubject(
          template.subject
            .replace('{{event_title}}', reg.event_title)
        );
        setEmailBody(
          template.body_content
            .replace('{{applicant_name}}', reg.full_name)
            .replace('{{event_title}}', reg.event_title)
            .replace('{{event_date}}', formattedDate)
            .replace('{{event_location}}', reg.location)
        );
      } else {
        // Fallback default templates
        if (status === 'Confirmed Attendance') {
          setEmailSubject(`PESO Guagua: Attendance Confirmed - ${reg.event_title}`);
          setEmailBody(`Dear ${reg.full_name},\n\nYour attendance for "${reg.event_title}" has been officially VERIFIED & CONFIRMED.\n\nEvent Schedule: ${formattedDate}\nVenue: ${reg.location}\n\nPlease present this notification and your valid ID upon entry.`);
        } else {
          setEmailSubject(`PESO Guagua: Status Update - ${reg.event_title}`);
          setEmailBody(`Dear ${reg.full_name},\n\nWe regret to inform you that your registration status for "${reg.event_title}" has been marked as Rejected.`);
        }
      }

      setShowEmailModal(true);
    } catch (err) {
      console.error('Error loading template for modal:', err);
    }
  };

  // Submit Status Update & Dispatch Email with Non-Repudiation Audit Trail
  const handleConfirmStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReg) return;

    try {
      const res = await fetch(`http://localhost:5000/api/events/admin/registrations/${selectedReg.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: targetStatus,
          subject: emailSubject,
          body_content: emailBody,
          admin_user: adminUser
        })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setShowEmailModal(false);
        fetchRegistrations();
      } else {
        alert(`Failed to update status: ${data.message}`);
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Error updating status.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200 gap-4">
          <div>
            <span className="text-[10px] font-black uppercase text-[#059669] bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              PESO Portal Admin Console
            </span>
            <h1 className="text-2xl font-black text-[#0B1F3B] mt-1">Events & Attendance Management</h1>
            <p className="text-xs text-slate-500">Create events, set speakers and takeaways, and verify attendee government IDs.</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('events')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'events' ? 'bg-[#0B1F3B] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              📅 Municipal Events
            </button>
            <button
              onClick={() => setActiveTab('registrations')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'registrations' ? 'bg-[#0B1F3B] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              📋 Attendance & Gov IDs ({registrations.length})
            </button>
            <button
              onClick={() => handleOpenModal()}
              className="bg-[#059669] hover:bg-[#047857] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md transition"
            >
              + Create New Event
            </button>
          </div>
        </div>

        {/* TAB 1: EVENTS CRUD TABLE */}
        {activeTab === 'events' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-xs text-slate-500">Loading events database...</div>
            ) : events.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500">No events found. Click "+ Create New Event" to add one.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-4">Title & Category</th>
                      <th className="p-4">Schedule & Location</th>
                      <th className="p-4">Speakers & Guests</th>
                      <th className="p-4">Capacity</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {events.map((ev) => (
                      <tr key={ev.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-4">
                          <span className="text-[10px] font-bold bg-emerald-50 text-[#059669] px-2 py-0.5 rounded border border-emerald-200">
                            {ev.category}
                          </span>
                          <p className="font-bold text-[#0B1F3B] mt-1 text-sm">{ev.title}</p>
                        </td>
                        <td className="p-4 space-y-0.5">
                          <p className="font-semibold text-slate-800">{new Date(ev.event_date).toLocaleString()}</p>
                          <p className="text-slate-400">📍 {ev.location}</p>
                        </td>
                        <td className="p-4 max-w-xs space-y-0.5">
                          <p className="truncate text-slate-700">🎤 {ev.speakers || 'N/A'}</p>
                          <p className="truncate text-slate-500 text-[11px]">⭐ {ev.guest_of_honor || 'N/A'}</p>
                        </td>
                        <td className="p-4 font-bold text-slate-700">{ev.max_attendees} slots</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold ${ev.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                            {ev.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => handleOpenModal(ev)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-lg text-xs"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(ev.id)}
                            className="bg-red-50 hover:bg-red-100 text-red-600 font-bold px-3 py-1.5 rounded-lg text-xs"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ATTENDANCE & GOV ID VERIFICATION */}
        {activeTab === 'registrations' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
            <h3 className="font-bold text-base text-[#0B1F3B]">Citizen Pre-Registrations & Identity Verification</h3>
            
            {regLoading ? (
              <div className="py-12 text-center text-xs text-slate-500">Loading registrations...</div>
            ) : registrations.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">No citizen registrations recorded yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Applicant Name</th>
                      <th className="p-3">Event Title</th>
                      <th className="p-3">Contact Details</th>
                      <th className="p-3">Gov ID Type & File</th>
                      <th className="p-3">Attendance Status</th>
                      <th className="p-3 text-right">Verification Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {registrations.map((reg) => (
                      <tr key={reg.id} className="hover:bg-slate-50/80">
                        <td className="p-3 font-bold text-[#0B1F3B]">{reg.full_name}</td>
                        <td className="p-3 font-medium text-slate-700">{reg.event_title}</td>
                        <td className="p-3 space-y-0.5 text-slate-500">
                          <p>{reg.email}</p>
                          <p>{reg.phone}</p>
                        </td>
                        <td className="p-3">
                          <span className="font-semibold text-slate-700 block">{reg.gov_id_type}</span>
                          <a
                            href={`http://localhost:5000/uploads/${reg.gov_id_path}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#059669] font-bold underline text-[11px]"
                          >
                            📄 View Uploaded ID
                          </a>
                        </td>
                        <td className="p-3">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-black ${
                            reg.status === 'Confirmed Attendance' ? 'bg-emerald-100 text-emerald-800' :
                            reg.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {reg.status}
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-1">
                          <button
                            onClick={() => handleOpenStatusModal(reg, 'Confirmed Attendance')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1 rounded text-[11px]"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => handleOpenStatusModal(reg, 'Rejected')}
                            className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-2.5 py-1 rounded text-[11px]"
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* MODAL: CREATE / EDIT EVENT FORM */}
        {showEventModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 max-h-[90vh] flex flex-col">
              <div className="bg-[#0B1F3B] text-white p-5 flex justify-between items-center">
                <h3 className="font-black text-base">{editingEvent ? 'Edit Municipal Event' : 'Create New Municipal Event'}</h3>
                <button onClick={() => setShowEventModal(false)} className="text-slate-400 hover:text-white font-bold">✕</button>
              </div>

              <form onSubmit={handleSaveEvent} className="p-6 overflow-y-auto space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Event Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#059669]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Category *</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#059669] bg-white font-medium"
                    >
                      <option value="Job Summit">Job Summit</option>
                      <option value="Barangay Assembly">Barangay Assembly</option>
                      <option value="Skills Training">Skills Training</option>
                      <option value="Seminar & Workshop">Seminar & Workshop</option>
                      <option value="Municipal Activity">Municipal Activity</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Max Attendee Capacity *</label>
                    <input
                      type="number"
                      required
                      value={maxAttendees}
                      onChange={(e) => setMaxAttendees(parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#059669]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Date & Time *</label>
                    <input
                      type="datetime-local"
                      required
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#059669]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Location / Venue *</label>
                    <input
                      type="text"
                      required
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Guagua Municipal Gym"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#059669]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Description *</label>
                  <textarea
                    rows={3}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#059669]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Featured Speakers</label>
                    <input
                      type="text"
                      value={speakers}
                      onChange={(e) => setSpeakers(e.target.value)}
                      placeholder="e.g. Atty. Jojo Dante, Panel Speakers"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#059669]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Guest of Honor</label>
                    <input
                      type="text"
                      value={guestOfHonor}
                      onChange={(e) => setGuestOfHonor(e.target.value)}
                      placeholder="e.g. Mayor Tonton S. Gatus"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#059669]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Attendee Takeaways & Benefits</label>
                  <textarea
                    rows={2}
                    value={benefits}
                    onChange={(e) => setBenefits(e.target.value)}
                    placeholder="e.g. Certificate of Attendance, direct employer interviews, food allowance"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#059669]"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 text-[#059669] rounded focus:ring-[#059669]"
                  />
                  <label htmlFor="isActive" className="font-bold text-slate-700">Display this event on the public portal</label>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowEventModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#059669] hover:bg-[#047857] text-white font-bold rounded-lg shadow-md"
                  >
                    Save Event
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: EMAIL TEMPLATE PREVIEW & NON-REPUDIATION VERIFICATION */}
        {showEmailModal && selectedReg && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200 flex flex-col">
              <div className="bg-[#0B1F3B] text-white p-4 flex justify-between items-center">
                <div>
                  <span className="text-[10px] bg-emerald-500 text-white font-bold px-2 py-0.5 rounded uppercase">
                    Data Assurance & Non-Repudiation
                  </span>
                  <h3 className="font-black text-base mt-1">Review & Send Official Notification</h3>
                </div>
                <button onClick={() => setShowEmailModal(false)} className="text-slate-400 hover:text-white font-bold text-lg">✕</button>
              </div>

              <form onSubmit={handleConfirmStatusUpdate} className="p-6 space-y-4 text-xs">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                  <p><strong className="text-[#0B1F3B]">Applicant:</strong> {selectedReg.full_name} ({selectedReg.email})</p>
                  <p><strong className="text-[#0B1F3B]">Event:</strong> {selectedReg.event_title}</p>
                  <p><strong className="text-[#0B1F3B]">Target Status Action:</strong> <span className="text-emerald-700 font-bold">{targetStatus}</span></p>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Subject *</label>
                  <input
                    type="text"
                    required
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#059669] font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Body Content *</label>
                  <textarea
                    rows={6}
                    required
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#059669] font-mono text-[11px]"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">This will be automatically formatted inside the official PESO Guagua header/footer template.</p>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Verifying Admin Officer (Audit Non-Repudiation) *</label>
                  <input
                    type="text"
                    required
                    value={adminUser}
                    onChange={(e) => setAdminUser(e.target.value)}
                    placeholder="e.g. Rham Layug (Student Dev Coordinator / Admin)"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#059669]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowEmailModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#059669] hover:bg-[#047857] text-white font-bold rounded-lg shadow-md"
                  >
                    Confirm & Send Official Notice
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}