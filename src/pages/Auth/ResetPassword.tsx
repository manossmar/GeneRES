import React, { useState } from 'react';
import { Link } from 'react-router';

export default function ResetPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (!email) {
            setError('Email is required.');
            return;
        }

        // TODO: Implement password reset functionality
        setMessage('If an account exists with this email, you will receive password reset instructions.');
    };

    return (
        <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
            <div className="relative flex flex-col justify-center w-full h-screen dark:bg-gray-900 sm:p-0 lg:flex-row">
                {/* Form */}
                <div className="flex flex-col flex-1 w-full lg:w-1/2">
                    <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
                        <div>
                            <div className="mb-5 sm:mb-8">
                                <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
                                    Reset Password
                                </h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Enter your email to receive password reset instructions
                                </p>
                            </div>
                            <div>
                                {error && (
                                    <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
                                        {error}
                                    </div>
                                )}
                                {message && (
                                    <div className="p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400" role="alert">
                                        {message}
                                    </div>
                                )}
                                <form onSubmit={handleSubmit}>
                                    <div className="space-y-5">
                                        {/* Email */}
                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                                Email<span className="text-error-500">*</span>
                                            </label>
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="info@gmail.com"
                                                className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                                            />
                                        </div>
                                        {/* Button */}
                                        <div>
                                            <button
                                                type="submit"
                                                className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600"
                                            >
                                                Send Reset Link
                                            </button>
                                        </div>
                                    </div>
                                </form>
                                <div className="mt-5">
                                    <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                                        Remember your password?{' '}
                                        <Link to="/signin" className="text-brand-500 hover:text-brand-600 dark:text-brand-400">
                                            Sign In
                                        </Link>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel */}
                <div className="relative items-center hidden w-full h-full bg-brand-950 dark:bg-white/5 lg:grid lg:w-1/2">
                    <div className="flex items-center justify-center z-1">
                        <div className="flex flex-col items-center max-w-xs">
                            <Link to="/" className="block mb-4">
                                <img className="dark:hidden" src="/images/logo/logo.svg" alt="Logo" width={150} />
                                <img className="hidden dark:block" src="/images/logo/logo-dark.svg" alt="Logo" width={150} />
                            </Link>
                            <p className="text-center text-gray-400 dark:text-white/60">
                                Free and Open-Source Tailwind CSS Admin Dashboard Template
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
