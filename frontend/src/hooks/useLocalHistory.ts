// Hook for managing chat conversation history in localStorage for guest users.
// Provides functions to load, save, add messages, and clear history.

import { useState, useEffect, useCallback } from 'react';
import { AppConversation, AppMessage } from '@/types/app';

const LOCAL_STORAGE_KEY = 'pawaits_guest_history';

interface LocalHistory {
    conversations: { [id: string]: AppConversation }; // Store conversations by ID
    messages: { [conversationId: string]: AppMessage[] }; // Store messages grouped by convo ID
}

export function useLocalHistory() {
    const [localHistory, setLocalHistory] = useState<LocalHistory>({ conversations: {}, messages: {} });
    const [isLoading, setIsLoading] = useState(true);

    // Load history from localStorage on initial mount
    useEffect(() => {
        setIsLoading(true);
        try {
            const storedHistory = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (storedHistory) {
                const parsedHistory: LocalHistory = JSON.parse(storedHistory);
                // Basic validation
                if (parsedHistory.conversations && parsedHistory.messages) {
                    setLocalHistory(parsedHistory);
                    console.log("Loaded guest history from localStorage.");
                } else {
                     console.warn("Invalid history format found in localStorage.");
                     localStorage.removeItem(LOCAL_STORAGE_KEY); // Clear invalid data
                     setLocalHistory({ conversations: {}, messages: {} });
                }

            } else {
                 setLocalHistory({ conversations: {}, messages: {} });
            }
        } catch (error) {
            console.error("Error loading guest history from localStorage:", error);
             setLocalHistory({ conversations: {}, messages: {} }); // Reset on error
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Save history to localStorage whenever it changes
    const saveHistory = useCallback((history: LocalHistory) => {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(history));
        } catch (error) {
            console.error("Error saving guest history to localStorage:", error);
            // Handle potential storage limits or errors
        }
    }, []);

    // Function to get a specific conversation and its messages
    const getLocalConversation = useCallback((conversationId: string): { conversation: AppConversation | null, messages: AppMessage[] } => {
        const conversation = localHistory.conversations[conversationId] || null;
        const messages = localHistory.messages[conversationId] || [];
        return { conversation, messages };
    }, [localHistory]);

     // Function to get all conversation summaries
    const getLocalConversationList = useCallback((): AppConversation[] => {
        return Object.values(localHistory.conversations).sort(
             (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    }, [localHistory]);


    // Function to save or update a conversation (metadata only)
    const saveLocalConversation = useCallback((conversation: AppConversation) => {
        setLocalHistory(prev => {
            const newHistory = {
                ...prev,
                conversations: {
                    ...prev.conversations,
                    [conversation.id]: { ...prev.conversations[conversation.id], ...conversation } // Merge updates
                }
            };
            saveHistory(newHistory);
            return newHistory;
        });
    }, [saveHistory]);

     // Function to add a message to a specific conversation
    const addLocalMessage = useCallback((conversationId: string, message: AppMessage) => {
        setLocalHistory(prev => {
             const currentMessages = prev.messages[conversationId] || [];
             // Ensure conversation exists in metadata
             let currentConversation = prev.conversations[conversationId];
             if (!currentConversation) {
                 currentConversation = {
                     id: conversationId,
                     title: message.role === 'user' ? message.content.substring(0, 60) : "New Chat", // Example title
                     user_id: null, // Guest user
                     created_at: new Date().toISOString(),
                 };
             } else {
                  // Optionally update conversation's updated_at timestamp
                  // currentConversation.updated_at = new Date().toISOString();
             }

            const newHistory: LocalHistory = {
                conversations: {
                    ...prev.conversations,
                    [conversationId]: currentConversation
                },
                messages: {
                    ...prev.messages,
                    [conversationId]: [...currentMessages, message]
                }
            };
            saveHistory(newHistory);
            return newHistory;
        });
    }, [saveHistory]);

    // Function to delete a conversation
    const deleteLocalConversation = useCallback((conversationId: string) => {
         setLocalHistory(prev => {
             const newConversations = { ...prev.conversations };
             delete newConversations[conversationId];
             const newMessages = { ...prev.messages };
             delete newMessages[conversationId];
             const newHistory = { conversations: newConversations, messages: newMessages };
             saveHistory(newHistory);
             console.log(`Deleted local conversation ${conversationId}`);
             return newHistory;
         });
    }, [saveHistory]);


    // Function to clear all local history (e.g., on explicit user action or logout)
    const clearLocalHistory = useCallback(() => {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        setLocalHistory({ conversations: {}, messages: {} });
        console.log("Cleared guest history from localStorage.");
    }, []);

     // Function to retrieve all history for potential migration on login
    const getAllLocalHistory = useCallback((): LocalHistory => {
        return localHistory;
    }, [localHistory]);


    return {
        isLoadingHistory: isLoading,
        getLocalConversation,
        getLocalConversationList,
        saveLocalConversation,
        addLocalMessage,
        deleteLocalConversation,
        clearLocalHistory,
        getAllLocalHistory, // Needed for migration
    };
} 