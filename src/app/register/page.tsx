'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/useAuthStore';
import Link from 'next/link';
import Head from 'next/head';
import dynamic from 'next/dynamic';

// Dynamically import ToastContainer with ssr: false
const ToastContainer = dynamic(() => import('react-toastify').then(mod => mod.ToastContainer), {
  ssr: false
});
import 'react-toastify/dist/ReactToastify.css'; 
import { toast } from 'react-toastify';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const login = useAuthStore((state) => state.login);
  const router = useRouter();

  const handleRegister = async () => {
    setError(null);
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      login(data.token);  // Save token to Zustand store
      toast.success('Registration successful! Redirecting to login...');  // Show success toast
      setTimeout(() => {
        router.push('/login');  // Redirect to the dashboard after successful registration
      }, 2000);  // Delay redirection to allow toast to be visible
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);  // Show error toast
    }
  };

  return (
    <>
      <Head>
        <title>Register</title>
      </Head>
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow">
          <h2 className="text-2xl font-bold text-center text-gray-900">Register</h2>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button
              onClick={handleRegister}
              className="w-full py-2 font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600"
            >
              Register
            </button>
            <p className="text-sm text-center text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-500 hover:underline">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </>
  );
}
