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
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');

  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [registerEvent, setRegisterEvent] = useState<EventItem | null>(null);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [govIdType, setGovIdType] = useState("Driver's License");
  const [govIdFile, setGovIdFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const categories = ['All', 'Job Summit', 'Barangay Assembly', 'Skills Training', 'Seminar & Workshop', 'Municipal Activity'];

  useEffect(() => {
    fetchEvents();
  }, [category, search]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/api/events?category=${category}&search=${search}`);
      const data = await res.json();
      if (data.status === 'success') {
        setEvents(data.events);
      }
    } catch (err) {
      console.error('Failed to fetch events', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerEvent) return;

    if (!fullName || !email || !phone || !govIdFile) {
      alert('Please fill in all required fields and upload your Government ID.');
      return;
    }

    const formData = new FormData();
    formData.append('full_name', fullName);
    formData.append('email', email);
    formData.append('phone', phone);
    formData.append('gov_id_type', govIdType);
    formData.append('gov_id', govIdFile);

    try {
      setSubmitting(true);
      const res = await fetch(`http://localhost:5000/api/events/${registerEvent.id}/register`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();

      if (data.status === 'success') {
        alert('🎉 Pre-registration submitted successfully! Check your email for confirmation.');
        setRegisterEvent(null);
        setFullName('');
        setEmail('');
        setPhone('');
        setGovIdFile(null);
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (err) {
      console.error('Registration error:', err);
      alert('Failed to process event registration.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Hero Banner */}
      <div className="bg-[#0B1F3B] text-white py-12 px-6 border-b-4 border-[#059669]">
        <div className="max-w-6xl mx-auto text-center space-y-3">
          <span className="bg-[#059669]/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            📅 Municipal Calendar & Engagements
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">PESO Municipal Events & Job Summits</h1>
          <p className="text-slate-300 text-sm max-w-2xl mx-auto">
            Discover upcoming job fairs, barangay employment assemblies, vocational skills training, and capacity-building seminars hosted by the Municipal Government of Guagua.
          </p>
        </div>
      </div>

      {/* Filters & Grid */}
      <div className="max-w-6xl mx-auto px-6 py-8 w-full flex-grow">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-wrap gap-2 items-center">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition ${
                  category === cat
                    ? 'bg-[#059669] text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="w-full md:w-72 flex">
            <input
              type="text"
              placeholder="Search event title or venue..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 text-xs border border-slate-300 rounded-l-lg focus:outline-none focus:border-[#059669]"
            />
            <button 
              onClick={fetchEvents}
              className="bg-[#0B1F3B] text-white px-4 py-2 text-xs font-bold rounded-r-lg hover:bg-[#071426] transition"
            >
              Search
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-500 text-sm">Loading scheduled events...</div>
        ) : events.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500 text-sm">
            No scheduled events found under this category.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((ev) => (
              <div
                key={ev.id}
                onClick={() => setSelectedEvent(ev)}
                className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden group border-t-4 border-t-[#059669]"
              >
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="bg-emerald-50 text-[#059669] text-[10px] font-black uppercase px-2.5 py-1 rounded-md tracking-wider border border-emerald-200">
                      {ev.category}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      Max: {ev.max_attendees} slots
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#0B1F3B] group-hover:text-[#059669] transition leading-snug">
                    {ev.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {ev.description}
                  </p>

                  <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                    <p className="flex items-center gap-2">
                      <span>📅</span> <strong>{new Date(ev.event_date).toLocaleString()}</strong>
                    </p>
                    <p className="flex items-center gap-2">
                      <span>📍</span> <span>{ev.location}</span>
                    </p>
                  </div>
                </div>

                <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-xs">
                  <span className="text-[#059669] font-bold group-hover:underline flex items-center gap-1">
                    View Full Details &rarr;
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setRegisterEvent(ev);
                    }}
                    className="bg-[#0B1F3B] hover:bg-[#059669] text-white px-3 py-1.5 rounded-lg font-bold transition text-xs shadow-sm"
                  >
                    Register
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Glassmorphism Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
          <div className="bg-white/90 backdrop-blur-xl border border-white/40 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-[#0B1F3B] text-white p-6 relative flex justify-between items-start">
              <div>
                <span className="bg-emerald-500/30 text-emerald-300 text-[10px] font-black uppercase px-2.5 py-1 rounded-md tracking-wider border border-emerald-400/30">
                  {selectedEvent.category}
                </span>
                <h2 className="text-xl font-black mt-2 text-white">{selectedEvent.title}</h2>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-slate-700 text-xs md:text-sm">
              <div>
                <h4 className="font-bold text-[#0B1F3B] uppercase tracking-wider text-xs mb-1">About the Event</h4>
                <p className="leading-relaxed text-slate-600">{selectedEvent.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/80 p-4 rounded-xl border border-slate-200">
                <div>
                  <p className="text-slate-400 font-bold uppercase text-[10px]">Date & Time</p>
                  <p className="font-bold text-[#0B1F3B] mt-0.5">{new Date(selectedEvent.event_date).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-bold uppercase text-[10px]">Venue / Location</p>
                  <p className="font-bold text-[#0B1F3B] mt-0.5">{selectedEvent.location}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-100">
                  <p className="text-[#059669] font-black uppercase text-[10px] mb-1">🎤 Featured Speakers</p>
                  <p className="font-semibold text-slate-800">{selectedEvent.speakers || 'To be announced'}</p>
                </div>
                <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-100">
                  <p className="text-blue-700 font-black uppercase text-[10px] mb-1">⭐ Guest of Honor</p>
                  <p className="font-semibold text-slate-800">{selectedEvent.guest_of_honor || 'Municipal Officials'}</p>
                </div>
              </div>

              <div className="bg-amber-50/80 border border-amber-200 p-4 rounded-xl space-y-1">
                <p className="text-amber-800 font-black uppercase text-[10px]">🎁 What Attendees Will Get / Takeaways</p>
                <p className="font-medium text-amber-900 leading-relaxed">
                  {selectedEvent.benefits || 'Certificate of Attendance, direct employer pre-screening, and municipal program priority access.'}
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg transition text-xs"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const evToReg = selectedEvent;
                  setSelectedEvent(null);
                  setRegisterEvent(evToReg);
                }}
                className="px-5 py-2 bg-[#059669] hover:bg-[#047857] text-white font-bold rounded-lg transition text-xs shadow-md"
              >
                Proceed to Pre-Register
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pre-Registration Modal */}
      {registerEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="bg-[#0B1F3B] text-white p-5 flex justify-between items-center">
              <div>
                <p className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Event Registration Pre-Form</p>
                <h3 className="text-base font-black">{registerEvent.title}</h3>
              </div>
              <button 
                onClick={() => setRegisterEvent(null)}
                className="text-slate-400 hover:text-white font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Legal Name *</label>
                <input 
                  type="text" 
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Juan Dela Cruz" 
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#059669]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@gmail.com" 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#059669]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contact Phone *</label>
                  <input 
                    type="text" 
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="09XXXXXXXXX" 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#059669]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Valid Government ID Type *</label>
                <select 
                  value={govIdType}
                  onChange={(e) => setGovIdType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#059669] bg-white font-medium text-slate-700"
                >
                  <option value="Driver's License">Driver's License</option>
                  <option value="National ID (PhilSys)">National ID (PhilSys)</option>
                  <option value="SSS / UMID ID">SSS / UMID ID</option>
                  <option value="Postal ID">Postal ID</option>
                  <option value="Voter's ID">Voter's ID</option>
                  <option value="Barangay ID / Clearance">Barangay ID / Clearance</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Upload Government ID Photo / Scan *</label>
                <input 
                  type="file" 
                  required
                  accept="image/*,.pdf"
                  onChange={(e) => setGovIdFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-[#059669] hover:file:bg-emerald-100 cursor-pointer border border-slate-300 rounded-lg p-1"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRegisterEvent(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#059669] hover:bg-[#047857] text-white font-bold rounded-lg transition shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Submitting Pre-Form...' : 'Submit & Confirm Registration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}