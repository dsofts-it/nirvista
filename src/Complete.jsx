import React from 'react';
import { useNavigate } from 'react-router-dom';

const Complete = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 space-y-6">
            <div className="bg-white border border-gray-200 rounded-2xl shadow-lg w-full max-w-md p-8 text-center space-y-4">
                <h1 className="text-2xl font-semibold text-gray-900">You're done!</h1>
                <p className="text-gray-500">
                    KYC submitted successfully. You can download your credentials below.
                </p>
                <button
                    className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium shadow hover:bg-emerald-500 transition"
                    onClick={() => alert('Download action placeholder')}
                >
                    Download
                </button>
                <button
                    className="text-sm text-gray-500 underline"
                    onClick={() => navigate('/')}
                >
                    Back to signup
                </button>
            </div>
        </div>
    );
};

export default Complete;
