'use client';

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';

interface EmailTemplate {
    id: number;
    status_key: string;
    template_name: string;
    subject: string;
    body_content: string;
    updated_at: string;
}

export default function EmailTemplatesAdminPage() {
    const [templates, setTemplates] = useState<EmailTemplate[]>([]);
    const [selectedKey, setSelectedKey] = useState<string>('');
    const [currentTemplate, setCurrentTemplate] = useState<EmailTemplate>({
        id: 0,
        status_key: '',
        template_name: '',
        subject: '',
        body_content: '',
        updated_at: ''
    });
    const [loading, setLoading] = useState<boolean>(true);
    const [saving, setSaving] = useState<boolean>(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Fetch templates on load
    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            const token = localStorage.getItem('peso_token') || localStorage.getItem('token') || '';
            const res = await fetch('http://localhost:5000/api/email-templates', {
                headers: {
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                }
            });
            const data = await res.json();
            if (data.status === 'success' && data.templates.length > 0) {
                setTemplates(data.templates);
                setSelectedKey(data.templates[0].status_key);
                setCurrentTemplate(data.templates[0]);
            }
        } catch (err) {
            console.error('Error fetching templates:', err);
        } finally {
            setLoading(false);
        }
    };

    // Switch active template when dropdown changes
    const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const key = e.target.value;
        setSelectedKey(key);
        const found = templates.find((t) => t.status_key === key);
        if (found) {
            setCurrentTemplate(found);
        }
        setMessage(null);
    };

    // Save changes to backend database via PUT request
    const handleSave = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            const token = localStorage.getItem('peso_token') || localStorage.getItem('token') || '';
            const res = await fetch(`http://localhost:5000/api/email-templates/${selectedKey}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    subject: currentTemplate.subject,
                    body_content: currentTemplate.body_content,
                    template_name: currentTemplate.template_name
                })
            });

            const data = await res.json();
            if (res.ok && data.status === 'success') {
                setMessage({ type: 'success', text: 'Template successfully updated!' });
                setTemplates(templates.map(t => t.status_key === selectedKey ? data.template : t));
            } else {
                setMessage({ type: 'error', text: data.message || 'Failed to update template.' });
            }
        } catch (err) {
            console.error('Error saving template:', err);
            setMessage({ type: 'error', text: 'Network error occurred while saving.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-600">Loading email templates...</div>;

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md mt-6">
            <h1 className="text-2xl font-bold text-[#0B1F3B] mb-2">Email Templates Settings</h1>
            <p className="text-sm text-gray-500 mb-6">
                Manage automated email notifications sent to applicants when their application status updates. You can modify subjects and HTML layout formatting directly.
            </p>

            {message && (
                <div className={`p-4 mb-4 rounded text-sm font-medium ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            {/* Template Selector Dropdown */}
            <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Select Application Status Template:</label>
                <select 
                    value={selectedKey} 
                    onChange={handleSelectChange}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm text-slate-800 bg-white focus:ring-2 focus:ring-[#059669] focus:outline-none"
                >
                    {templates.map((t) => (
                        <option key={t.status_key} value={t.status_key}>
                            {t.template_name} ({t.status_key})
                        </option>
                    ))}
                </select>
            </div>

            {/* Edit Form */}
            <form onSubmit={handleSave} className="space-y-4">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Template Label Name:</label>
                    <input 
                        type="text" 
                        value={currentTemplate.template_name}
                        onChange={(e) => setCurrentTemplate({ ...currentTemplate, template_name: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm text-slate-800 bg-white focus:ring-2 focus:ring-[#059669] focus:outline-none"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Email Subject Line:</label>
                    <input 
                        type="text" 
                        value={currentTemplate.subject}
                        onChange={(e) => setCurrentTemplate({ ...currentTemplate, subject: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm text-slate-800 bg-white focus:ring-2 focus:ring-[#059669] focus:outline-none"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                        HTML Body Content:
                    </label>
                    <textarea 
                        rows={10}
                        onInput={(e) => {
                            const target = e.target as HTMLTextAreaElement;
                            target.style.height = 'auto';
                            target.style.height = `${target.scrollHeight}px`;
                        }}
                        value={currentTemplate.body_content}
                        onChange={(e) => setCurrentTemplate({ ...currentTemplate, body_content: e.target.value })}
                        className="w-full p-3 font-mono text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-[#059669] focus:outline-none bg-gray-50 text-slate-800 resize-none overflow-hidden"
                        required
                    />
                </div>

                <div className="flex justify-end pt-4">
                    <button 
                        type="submit"
                        disabled={saving}
                        className="bg-[#059669] text-white px-6 py-2.5 rounded-md font-semibold hover:bg-emerald-700 transition disabled:opacity-50"
                    >
                        {saving ? 'Saving Changes...' : 'Save Template Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}