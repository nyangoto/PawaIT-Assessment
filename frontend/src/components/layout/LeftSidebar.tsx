'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/services/apiClient';
import { BackendConversationListResponse } from '@/types/app';
import { Button } from '@/components/ui/button';
import { UserCircle, LogIn, LogOut, PlusCircle, Settings, Info, MessageSquare, Trash2 } from 'lucide-react'; // Example icons
import { Separator } from '@/components/ui/separator'; // Assuming shadcn/ui
import { ScrollArea } from '@/components/ui/scroll-area'; // Assuming shadcn/ui

export function LeftSidebar() {
  const { user, isGuest, isAuthenticated, signOut, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<BackendConversationListResponse[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  // Fetch conversations when user logs in
  useEffect(() => {
    const fetchConversations = async () => {
      if (isAuthenticated && user) { // Only fetch if fully authenticated
        setIsLoadingHistory(true);
        setHistoryError(null);
        try {
          console.log("Fetching conversations for user:", user.id);
          const response = await apiClient.get<BackendConversationListResponse[]>('/conversations');
          setConversations(response.data);
        } catch (err: any) {
          console.error("Error fetching conversations:", err);
          setHistoryError("Failed to load chat history.");
        } finally {
          setIsLoadingHistory(false);
        }
      } else {
        // Clear history if user logs out or is guest
        setConversations([]);
      }
    };

    if (!isAuthLoading) { // Only run after initial auth check
        fetchConversations();
    }
  }, [isAuthenticated, user, isAuthLoading]); // Rerun when auth state changes

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (!error) {
      router.push('/'); // Redirect to home after sign out
    } else {
        alert(`Sign out failed: ${error.message}`); // Simple error feedback
    }
  };

  const handleNewChat = () => {
      router.push('/chat'); // Navigate to the base chat URL for a new chat
  }

  const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent navigation when clicking delete icon
      if (!confirm("Are you sure you want to delete this conversation?")) return;

      // TODO: Implement backend DELETE /conversations/{id} endpoint
       alert(`Deletion for ${id} not implemented yet.`);
      // try {
      //     await apiClient.delete(`/conversations/${id}`);
      //     setConversations(prev => prev.filter(c => c.id !== id));
      //     // If deleting the current chat, navigate to new chat
      //     // if (currentConversationId === id) { router.push('/chat'); }
      // } catch (err) {
      //     console.error("Failed to delete conversation:", err);
      //     alert("Failed to delete conversation.");
      // }
  }

  return (
    <aside className="w-64 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col p-4">
      {/* User Profile/Auth Section */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <UserCircle className="w-8 h-8 text-gray-500" />
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium truncate">
                {isAuthLoading ? "Loading..." : isAuthenticated ? (user?.email ?? "User") : isGuest ? "Guest User" : "Not Logged In"}
            </p>
            <p className="text-xs text-gray-500">
                {isAuthenticated ? "Authenticated" : "Guest Session"}
            </p>
          </div>
        </div>
        {isAuthLoading ? null : isAuthenticated ? (
          <Button variant="outline" size="sm" className="w-full" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </Button>
        ) : (
          <div className="flex flex-col gap-2">
            <Button variant="default" size="sm" className="w-full" onClick={() => router.push('/login')}>
              <LogIn className="mr-2 h-4 w-4" /> Sign In
            </Button>
             <Button variant="outline" size="sm" className="w-full" onClick={() => router.push('/register')}>
               Register
             </Button>
          </div>
        )}
      </div>

      <Separator className="my-2" />

      {/* New Chat Button */}
      <Button variant="ghost" className="w-full justify-start mb-2" onClick={handleNewChat}>
         <PlusCircle className="mr-2 h-4 w-4" /> New Chat
      </Button>

      {/* Chat History */}
      <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">History</h3>
      <ScrollArea className="flex-1 -mr-4 pr-4"> {/* Negative margin + padding trick for scrollbar */}
        <div className="space-y-1">
            {isLoadingHistory && <p className="text-xs text-gray-500">Loading history...</p>}
            {historyError && <p className="text-xs text-red-500">{historyError}</p>}
            {!isGuest && !isLoadingHistory && conversations.length === 0 && !historyError && (
                <p className="text-xs text-gray-500 italic">No saved conversations.</p>
            )}
            {isGuest && (
                 <p className="text-xs text-gray-500 italic">Sign in to save history.</p>
                 // TODO: Implement local storage display for guest history
            )}
            {conversations.map((conv) => (
            <Link
                href={`/chat/${conv.id}`}
                key={conv.id}
                className="group flex items-center justify-between gap-2 p-2 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
            >
                <MessageSquare className="h-4 w-4 flex-shrink-0 text-gray-500" />
                <span className="flex-1 truncate" title={conv.title || `Chat from ${new Date(conv.created_at).toLocaleDateString()}`}>
                {conv.title || `Chat from ${new Date(conv.created_at).toLocaleDateString()}`}
                </span>
                 <Button
                     variant="ghost"
                     size="icon"
                     className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                     onClick={(e) => handleDeleteConversation(conv.id, e)}
                     title="Delete Conversation"
                 >
                     <Trash2 className="h-4 w-4 text-red-500"/>
                 </Button>
            </Link>
            ))}
        </div>
      </ScrollArea>

      <Separator className="my-2" />

      {/* App Navigation */}
       <nav className="space-y-1">
            <Link href="/settings" className="flex items-center gap-2 p-2 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-700">
                <Settings className="h-4 w-4" /> Settings
            </Link>
             <Link href="/about" className="flex items-center gap-2 p-2 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-700">
                 <Info className="h-4 w-4" /> About
             </Link>
       </nav>

    </aside>
  );
} 