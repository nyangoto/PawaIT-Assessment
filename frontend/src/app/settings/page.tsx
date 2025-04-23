'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from '@/components/settings/ThemeToggle';
import { LLMSelector } from '@/components/settings/LLMSelector';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'; // Assuming shadcn/ui

export default function SettingsPage() {
    const { user, isGuest, isLoading, isAuthenticated } = useAuth();
    const router = useRouter();

    // Protect route: Redirect guest or unauthenticated users
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
             console.log("Settings Page: User not authenticated, redirecting to login.");
             router.replace('/login?redirect=/settings'); // Redirect to login, asking to come back here
        }
    }, [isLoading, isAuthenticated, router]);

    const handleDeleteAccount = async () => {
         if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
            return;
         }
         // TODO: Implement account deletion logic
         // This usually involves calling a backend endpoint or a Supabase function
         // that handles data cleanup (e.g., deleting conversations, user data)
         // and potentially calling supabase.auth.admin.deleteUser() from a secure context.
         alert("Account deletion is not implemented yet.");
         // Example: await apiClient.post('/users/delete-account');
         // Handle success/error (e.g., sign out user, redirect)
    }

    // Show loading or nothing if redirecting
    if (isLoading || !isAuthenticated) {
        return <div className="flex items-center justify-center min-h-screen">Loading settings...</div>;
    }

    return (
        <div className="max-w-2xl mx-auto py-10 px-4">
            <h1 className="text-3xl font-bold mb-6">Settings</h1>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Profile</CardTitle>
                    <CardDescription>Your account information.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                     <p><strong>Email:</strong> {user?.email}</p>
                     {/* Add other profile info if available */}
                     <p><strong>User ID:</strong> <span className="text-xs font-mono">{user?.id}</span></p>
                     <p><strong>Role:</strong> <span className="capitalize">{user?.role}</span></p>
                </CardContent>
            </Card>

             <Card className="mb-6">
                 <CardHeader>
                    <CardTitle>Preferences</CardTitle>
                    <CardDescription>Customize your experience.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="flex items-center justify-between">
                        <Label className="font-medium">Theme</Label>
                        <ThemeToggle />
                     </div>
                      <Separator />
                     <div>
                        <LLMSelector />
                     </div>
                </CardContent>
             </Card>


             <Card className="border-red-500 dark:border-red-700">
                 <CardHeader>
                     <CardTitle className="text-red-600 dark:text-red-500">Danger Zone</CardTitle>
                     <CardDescription>Irreversible account actions.</CardDescription>
                 </CardHeader>
                 <CardContent>
                      <Button
                         variant="destructive"
                         onClick={handleDeleteAccount}
                         className="w-full sm:w-auto"
                      >
                          Delete My Account
                      </Button>
                       <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                           This will permanently delete your account and all associated chat history.
                       </p>
                 </CardContent>
             </Card>

        </div>
    );
}

// Add necessary Label component if not globally available or imported from shadcn/ui
const Label = (props: React.LabelHTMLAttributes<HTMLLabelElement>) => <label {...props} />; 