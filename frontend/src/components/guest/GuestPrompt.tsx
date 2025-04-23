// Component to display a prompt for guest users to sign up/link their account.
// Uses the useAuth hook and triggers the anonymous user linking flow.

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthError } from '@supabase/supabase-js';
// Assuming you have Modal, Input, Button components
// import { Modal, Input, Button, Alert } from '@/components/ui'; // Example import

// --- Mock UI Components (Replace with your actual components) ---
const Modal = ({ isOpen, onClose, children }: { isOpen: boolean, onClose: () => void, children: React.ReactNode }) => isOpen ? <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}><div className="bg-white p-6 rounded-lg w-full max-w-md" onClick={e => e.stopPropagation()}>{children}</div></div> : null;
const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} className={`w-full p-2 border rounded ${props.className}`} />;
const Button = (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => <button {...props} className={`px-4 py-2 rounded disabled:opacity-50 ${props.className}`} />;
const Alert = ({ children, type }: { children: React.ReactNode, type: 'error' | 'success' }) => <div className={`p-3 rounded mb-4 ${type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{children}</div>;
// --- End Mock UI Components ---


export const GuestPrompt: React.FC = () => {
  const { isGuest, updateUserCredentials, isLoading } = useAuth();
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Don't show anything while loading auth state or if user is not a guest
  if (isLoading || !isGuest) {
      return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Clear previous errors
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
    }
    setIsSubmitting(true);

    try {
      const { error: linkError } = await updateUserCredentials(formData.email, formData.password);

      if (linkError) {
        console.error("Error linking anonymous user:", linkError);
        // Provide user-friendly error messages
        if (linkError.message.includes("unique constraint") || linkError.message.includes("already registered")) {
            setError("This email is already registered. Please log in instead.");
        } else if (linkError.message.includes("Password should be at least 6 characters")) {
             setError("Password must be at least 6 characters long.");
        }
        else {
            setError(linkError.message || 'Failed to create account. Please try again.');
        }
      } else {
        // Success! The onAuthStateChange listener in AuthContext should handle the state update.
        console.log("Anonymous user linked successfully.");
        setIsSignupModalOpen(false); // Close modal on success
      }
    } catch (err: any) {
       // Catch any unexpected errors during the process
       console.error("Unexpected error during account linking:", err);
       setError('An unexpected error occurred. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <>
      <div className="guest-banner bg-yellow-100 border border-yellow-300 p-3 text-center text-sm sticky top-0 z-40 shadow-sm">
        <span>
          You're using PawaIT as a guest (history is device-specific).{' '}
        </span>
        <button
          onClick={() => setIsSignupModalOpen(true)}
          className="text-blue-600 hover:underline font-medium"
        >
          Sign up
        </button>
        <span>
          {' '}to save your chats across devices!
        </span>
      </div>

      <Modal isOpen={isSignupModalOpen} onClose={() => setIsSignupModalOpen(false)}>
          <h2 className="text-xl font-semibold mb-4">Create Your Account</h2>
          <p className="mb-4 text-gray-600 text-sm">
              Enter your email and create a password to save your current chat history and access it anywhere.
          </p>
          {error && (
            <Alert type="error">{error}</Alert>
          )}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="email">Email</label>
              <Input
                type="email" required
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="you@example.com"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="password">Password</label>
              <Input
                type="password" required
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="•••••••• (min. 6 characters)"
                minLength={6}
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="confirmPassword">Confirm Password</label>
              <Input
                type="password" required
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="••••••••"
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                onClick={() => setIsSignupModalOpen(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSubmitting ? 'Creating Account...' : 'Create Account & Save History'}
              </Button>
            </div>
          </form>
      </Modal>
    </>
  );
}; 