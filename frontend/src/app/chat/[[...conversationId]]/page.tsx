// Page component for the main chat interface.
// Handles fetching conversation data based on ID (or new chat).
// Integrates LeftSidebar, ChatArea, and RightSidebar components.
// Uses AuthContext to manage user state and data fetching logic.

'use client'; // This page requires client-side interactivity

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext'; // Adjust path if needed
import { LeftSidebar } from '@/components/layout/LeftSidebar'; // Assuming component exists
import { ChatArea } from '@/components/chat/ChatArea';       // Assuming component exists
import { RightSidebar } from '@/components/layout/RightSidebar'; // Assuming component exists
import { AppConversation, AppMessage } from '@/types/app'; // Assuming types exist
import { apiClient } from '@/services/apiClient'; // Assuming API client exists
import { useChatStore } from '@/stores/chatStore'; // Assuming Zustand store for chat state

export default function ChatPage() {
  const params = useParams();
  const conversationIdParam = params?.conversationId; // Can be array or string
  const currentConversationId = Array.isArray(conversationIdParam)
    ? conversationIdParam[0]
    : conversationIdParam;

  const { user, isGuest, isLoading: isAuthLoading } = useAuth();
  const {
    messages,
    setMessages,
    currentConversation,
    setCurrentConversation,
    addMessage,
    updateMessage,
    setLoading: setChatLoading,
    setError: setChatError,
    isLoading: isChatLoading,
    error: chatError,
  } = useChatStore(); // Use Zustand store

  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);

  // Effect to load conversation data when ID changes or user logs in/out
  useEffect(() => {
    const loadConversation = async () => {
        setChatLoading(true);
        setChatError(null);
        setMessages([]); // Clear previous messages
        setCurrentConversation(null);
        setIsInitialLoadComplete(false);

        if (isAuthLoading) return; // Wait for auth state to settle

        try {
            if (currentConversationId) {
                console.log(`Loading conversation: ${currentConversationId}`);
                if (isGuest) {
                    // TODO: Implement local storage fetching for guest history
                    console.warn("Guest history loading from local storage not implemented.");
                    setChatError("Guest history is not yet supported."); // Placeholder
                    setCurrentConversation({ id: currentConversationId, user_id: null, title: "Local Chat", created_at: new Date().toISOString() });
                    setMessages([]); // Load local messages here
                } else if (user) {
                    // Fetch conversation details and messages from backend for authenticated user
                    // TODO: Implement backend endpoint /conversations/{id}/messages
                    // const convResponse = await apiClient.get(`/conversations/${currentConversationId}`);
                    // const messagesResponse = await apiClient.get(`/conversations/${currentConversationId}/messages`);
                    // setCurrentConversation(convResponse.data);
                    // setMessages(messagesResponse.data);
                    console.warn("Backend fetching for specific conversation not implemented.");
                    setChatError("Loading existing chats not yet implemented."); // Placeholder
                     // Mock loading for now
                    setCurrentConversation({ id: currentConversationId, user_id: user.id, title: `Chat ${currentConversationId.substring(0,4)}`, created_at: new Date().toISOString() });
                    setMessages([]);

                }
            } else {
                console.log("Starting new conversation.");
                // Handle new conversation state (already cleared above)
            }
        } catch (err: any) {
            console.error("Error loading conversation:", err);
            setChatError(err.response?.data?.detail || "Failed to load conversation.");
        } finally {
            setChatLoading(false);
            setIsInitialLoadComplete(true);
        }
    };

    loadConversation();

  }, [currentConversationId, user, isGuest, isAuthLoading, setMessages, setCurrentConversation, setChatLoading, setChatError]);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Left Sidebar */}
      <LeftSidebar />

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {isAuthLoading ? (
            <div className="flex-1 flex items-center justify-center">Loading User...</div>
        ) : (
            <ChatArea
                conversationId={currentConversationId}
                isInitialLoadComplete={isInitialLoadComplete}
            />
        )}
      </main>

      {/* Right Sidebar */}
      <RightSidebar conversationId={currentConversationId} />
    </div>
  );
} 