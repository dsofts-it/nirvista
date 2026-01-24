import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = "https://nirv-ico.onrender.com";

const REQUIRED_DOCS = [
    { key: 'aadhaar_front', label: 'Aadhaar Front' },
    { key: 'aadhaar_back', label: 'Aadhaar Back' },
    { key: 'pan', label: 'PAN Card' },
    { key: 'selfie', label: 'Selfie / Face' },
];

const KYC = () => {
    const navigate = useNavigate();
    const [token, setToken] = useState('');
    const [docs, setDocs] = useState(() =>
        REQUIRED_DOCS.reduce((acc, doc) => {
            acc[doc.key] = { file: null, url: '', uploading: false, message: '' };
            return acc;
        }, {})
    );

    const [metadata, setMetadata] = useState({ panName: '' });
    const [status, setStatus] = useState('');
    const [statusType, setStatusType] = useState('info');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const storedToken = localStorage.getItem("authToken");
        if (!storedToken) {
            navigate('/');
            return;
        }
        setToken(storedToken);
    }, [navigate]);

    const handleFileChange = (key, file) => {
        setDocs(prev => ({
            ...prev,
            [key]: {
                ...prev[key],
                file: file ?? null,
                message: file ? 'Ready to upload' : '',
                url: file ? '' : prev[key].url,
            }
        }));
    };

    const uploadDocument = async (key) => {
        const doc = docs[key];
        if (!doc.file) {
            setDocs(prev => ({
                ...prev,
                [key]: { ...prev[key], message: 'Choose a file first.' }
            }));
            return;
        }

        setDocs(prev => ({
            ...prev,
            [key]: { ...prev[key], uploading: true, message: 'Uploading...' }
        }));

        try {
            const formData = new FormData();
            formData.append('file', doc.file);
            formData.append('documentType', key);

            const response = await fetch(`${API_BASE_URL}/api/kyc/upload?documentType=${encodeURIComponent(key)}`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Upload failed');
            }

            setDocs(prev => ({
                ...prev,
                [key]: {
                    ...prev[key],
                    uploading: false,
                    url: data.documentUrl || data.url || '',
                    message: data.status ? `Status: ${data.status}` : 'Uploaded successfully',
                }
            }));
        } catch (error) {
            console.error("KYC upload error:", error);
            setDocs(prev => ({
                ...prev,
                [key]: {
                    ...prev[key],
                    uploading: false,
                    message: error.message || 'Upload failed',
                }
            }));
        }
    };

    const readyToSubmit = REQUIRED_DOCS.every(doc => docs[doc.key].url);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!readyToSubmit) {
            setStatusType('error');
            setStatus('Please upload all documents before submitting.');
            return;
        }

        if (!token) {
            navigate('/');
            return;
        }

        const payload = {
            aadhaarFrontUrl: docs.aadhaar_front.url,
            aadhaarBackUrl: docs.aadhaar_back.url,
            panUrl: docs.pan.url,
            selfieUrl: docs.selfie.url,
            metadata: {}
        };

        if (metadata.panName.trim()) {
            payload.metadata.panName = metadata.panName.trim();
        }

        setLoading(true);
        setStatus('');
        setStatusType('info');

        try {
            const response = await fetch(`${API_BASE_URL}/api/kyc/submit`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'KYC submission failed');
            }

            setStatusType('success');
            setStatus('KYC submitted. Redirecting...');
            navigate('/success');
        } catch (error) {
            console.error("KYC submit error:", error);
            setStatusType('error');
            setStatus(error.message || 'Could not submit KYC.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-start py-6 px-4">
            <div className="w-full max-w-5xl space-y-6">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-semibold text-gray-900">KYC Documents</h1>
                    <p className="text-gray-500">
                        Upload the required documents. Once uploaded, submit to start verification.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    {REQUIRED_DOCS.map(doc => {
                        const state = docs[doc.key];
                        return (
                            <div key={doc.key} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm space-y-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-lg font-medium text-gray-900">{doc.label}</p>
                                        <p className="text-xs text-gray-500">{doc.key}</p>
                                    </div>
                                    {state.url && (
                                        <span className="text-xs text-green-600">Uploaded</span>
                                    )}
                                </div>

                                <input
                                    type="file"
                                    accept="image/*,application/pdf"
                                    onChange={(event) => handleFileChange(doc.key, event.target.files?.[0])}
                                    className="text-sm text-gray-600"
                                />

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => uploadDocument(doc.key)}
                                        className="flex-1 rounded-lg border border-primary py-2 text-sm font-medium text-primary transition hover:bg-primary hover:text-white"
                                        disabled={state.uploading || !state.file || !token}
                                    >
                                        {state.uploading ? 'Uploading...' : (state.url ? 'Re-upload' : 'Upload')}
                                    </button>
                                    {state.file && (
                                        <span className="text-xs text-gray-500">{state.file.name}</span>
                                    )}
                                </div>

                                {state.message && (
                                    <p className="text-xs text-gray-600">{state.message}</p>
                                )}
                            </div>
                        );
                    })}
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm space-y-4">
                    <h2 className="text-lg font-semibold text-gray-900">Submit documents</h2>
                    <div>
                        <label className="text-sm font-medium text-gray-700">PAN holder name (optional)</label>
                        <input
                            type="text"
                            value={metadata.panName}
                            onChange={(e) => setMetadata(prev => ({ ...prev, panName: e.target.value }))}
                            className="w-full mt-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/30 outline-none transition"
                            placeholder="Name on PAN card"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !readyToSubmit}
                        className="w-full rounded-lg py-3 text-white font-semibold transition disabled:opacity-50"
                        style={{ backgroundColor: '#046a32' }}
                    >
                        {loading ? 'Submitting...' : 'Submit KYC'}
                    </button>

                    {status && (
                        <p className={`text-sm ${statusType === 'error' ? 'text-red-600' : 'text-green-600'}`}>
                            {status}
                        </p>
                    )}
                </form>
            </div>
        </div>
    );
};

export default KYC;
