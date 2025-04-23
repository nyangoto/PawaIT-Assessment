// Component for the chat input field and send button.
// Handles message submission to the backend API.
// Uses the chat store to add messages and manage loading state.

'use client';

import React, { useState, useRef } from 'react';
import { apiClient } from '@/services/apiClient';
import { useChatStore } from '@/stores/chatStore'; // Assuming Zustand store
import { BackendMessagePayload, BackendConversationResponse, AppMessage } from '@/types/app';
import { Button } from '@/components/ui/button'; // Assuming shadcn/ui or similar Button
import { Textarea } from '@/components/ui/textarea'; // Assuming shadcn/ui or similar Textarea
import { SendHorizonal } from 'lucide-react'; // Example icon
import { useAuth } from '@/contexts/AuthContext'; // To know if user is logged in

export function ChatInput({ conversationId }: { conversationId: string | undefined }) {
    const [inputMessage, setInputMessage] = useState('');
    const { user } = useAuth(); // Get user for potential user-specific logic
    const {
        addOptimisticMessage,
        updateOptimisticMessage,
        removeOptimisticMessage,
        addMessage,
        setLoading: setChatLoading,
        setError: setChatError,
        clearFollowUpSuggestions,
        setFollowUpSuggestions,
        setCurrentConversation // To update conversation ID after first message
    } = useChatStore();
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSendMessage = async () => {
        const messageToSend = inputMessage.trim();
        if (!messageToSend || !user) {
            // Optionally show error if message empty or user not loaded (shouldn't happen if page loaded)
            return;
        }

        // Clear suggestions from previous turn
        clearFollowUpSuggestions();

        const optimisticUserId = `optimistic-user-${Date.now()}`;
        const optimisticAssistantId = `optimistic-assistant-${Date.now()}`;

        // 1. Add optimistic user message
        const userMessage: AppMessage = {
            id: optimisticUserId,
            conversation_id: conversationId || 'new', // Use 'new' or similar placeholder if no ID yet
            user_id: user.id,
            role: 'user',
            content: messageToSend,
            metadata: null, // Optimistic messages have no metadata initially
            created_at: new Date().toISOString(),
        };
        addOptimisticMessage(userMessage);

        // 2. Add optimistic assistant placeholder/typing indicator
        const assistantPlaceholder: AppMessage = {
            id: optimisticAssistantId,
            conversation_id: conversationId || 'new',
            user_id: user.id, // Associate with user for consistency
            role: 'assistant',
            content: '...', // Placeholder content
            metadata: { llm_provider: "loading" }, // Indicate loading state
            created_at: new Date().toISOString(),
        };
        addOptimisticMessage(assistantPlaceholder);
        setChatLoading(true); // Show loading state in store
        setInputMessage(''); // Clear input field
        textareaRef.current?.focus(); // Keep focus on textarea

        try {
            // 3. Send request to backend
            const payload: BackendMessagePayload = {
                message: messageToSend,
                conversation_id: conversationId, // Send current ID, backend handles new if null/undefined
            };
            const response = await apiClient.post<BackendConversationResponse>('/message', payload);
            const data = response.data;

            // Update the current conversation ID if it was new
            if (!conversationId && data.conversation_id) {
                 setCurrentConversation({
                     id: data.conversation_id,
                     user_id: user.id,
                     title: messageToSend.substring(0, 60), // Example title update
                     created_at: new Date().toISOString() // Or use backend time if available
                 });
                 // TODO: Update URL without full page reload (using next/navigation)
                 // router.push(`/chat/${data.conversation_id}`, { scroll: false });
            }


            // 4. Replace optimistic user message with actual data (optional, if backend returns it)
            // If backend confirms user message saved, update its ID if needed, otherwise just remove optimistic flag
            // For simplicity, we might just rely on the optimistic one unless confirmation is critical
            updateOptimisticMessage(optimisticUserId, { /* backend confirmed data if needed */ });

            // 5. Replace optimistic assistant message with actual response
             updateOptimisticMessage(optimisticAssistantId, {
                id: data.assistant_message_id, // Use actual ID from backend
                conversation_id: data.conversation_id,
                content: data.answer,
                metadata: {
                    token_usage: data.token_usage,
                    follow_up_questions: data.follow_up_questions,
                    llm_provider: assistantPlaceholder.metadata?.llm_provider // Or get from backend if available
                },
                created_at: new Date().toISOString(), // Or use backend time
            });

            // Set follow-up suggestions if any
             if (data.follow_up_questions && data.follow_up_questions.length > 0) {
                 setFollowUpSuggestions(data.follow_up_questions);
             }

            setChatError(null); // Clear any previous error

        } catch (err: any) {
            console.error("Error sending message:", err);
            const errorDetail = err.response?.data?.detail || "Failed to send message. Please try again.";
            setChatError(errorDetail);
            // Remove optimistic assistant message on error
            removeOptimisticMessage(optimisticAssistantId);
            // Optionally restore user input or mark user message as failed
             updateOptimisticMessage(optimisticUserId, {
                 metadata: { error: errorDetail } // Mark user message with error
             });
        } finally {
            setChatLoading(false); // Hide loading state
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); // Prevent newline on Enter
            handleSendMessage();
        }
    };

    // Adjust textarea height dynamically
    const adjustTextareaHeight = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto'; // Reset height
            textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`; // Set new height, max 200px
        }
    };

    React.useEffect(() => {
        adjustTextareaHeight();
    }, [inputMessage]);


    return (
        <div className="flex items-end gap-2">
            <Textarea
                ref={textareaRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask any tax-related question..."
                className="flex-1 resize-none overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 max-h-[200px]"
                rows={1} // Start with 1 row
                disabled={isChatLoading} // Disable input while waiting for response
            />
            <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isChatLoading} // Disable if no message or loading
                size="icon"
            >
                <SendHorizonal className="h-4 w-4" />
            </Button>
        </div>
    );
} 