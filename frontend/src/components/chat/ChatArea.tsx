'use client';

import React from 'react';
import { MessageBubble } from './MessageBubble'; // Assuming component exists
import { ChatInput } from './ChatInput';       // Assuming component exists
import { SuggestedQuestions } from './SuggestedQuestions'; // Assuming component exists
import { FollowUpSuggestions } from './FollowUpSuggestions'; // Assuming component exists
import { useChatStore } from '@/stores/chatStore'; // Assuming Zustand store
import { AppMessage } from '@/types/app';

interface ChatAreaProps {
    conversationId: string | undefined;
    isInitialLoadComplete: boolean;
}

export function ChatArea({ conversationId, isInitialLoadComplete }: ChatAreaProps) {
    const {
        messages,
        isLoading: isChatLoading, // Loading state specific to chat operations (e.g., LLM response)
        error: chatError,
        suggestedQuestions,
        followUpSuggestions,
        clearFollowUpSuggestions,
    } = useChatStore();

    const chatContainerRef = React.useRef<HTMLDivElement>(null);

    // Scroll to bottom when new messages arrive
    React.useEffect(() => {
        chatContainerRef.current?.scrollTo({
            top: chatContainerRef.current.scrollHeight,
            behavior: 'smooth',
        });
    }, [messages]);

    const handleSuggestionClick = (question: string) => {
        // TODO: Implement sending the clicked suggestion as a new message
        console.log("Selected suggestion:", question);
        // This would typically call the same logic as the ChatInput submit,
        // potentially via a shared function in the store or passed down.
        clearFollowUpSuggestions(); // Clear follow-ups once one is clicked
    };

    return (
        <div className="flex-1 flex flex-col overflow-hidden relative">
            {/* Header (Optional - Can be added here or in the parent page) */}
            {/* <ChatHeader conversationId={conversationId} /> */}

            {/* Message List */}
            <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600"
            >
                {!isInitialLoadComplete && !chatError && (
                     <div className="text-center text-gray-500">Loading chat...</div>
                )}
                {chatError && (
                    <div className="p-4 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded text-red-700 dark:text-red-200 text-center">
                        Error: {chatError}
                    </div>
                )}

                {isInitialLoadComplete && messages.length === 0 && !isChatLoading && !chatError && (
                    <SuggestedQuestions
                        suggestions={suggestedQuestions}
                        onSelect={handleSuggestionClick}
                    />
                )}

                {messages.map((msg) => (
                    <div key={msg.id}>
                        <MessageBubble message={msg} />
                        {/* Show follow-ups only after the *last* assistant message */}
                        {msg.role === 'assistant' && messages[messages.length - 1].id === msg.id && followUpSuggestions.length > 0 && (
                             <FollowUpSuggestions
                                suggestions={followUpSuggestions}
                                onSelect={handleSuggestionClick}
                             />
                        )}
                    </div>
                ))}

                {/* Typing Indicator (Placeholder) */}
                {isChatLoading && messages.length > 0 && (
                    <div className="flex justify-start">
                         <div className="bg-gray-200 dark:bg-gray-700 rounded-lg px-4 py-2 max-w-xs lg:max-w-md animate-pulse">
                            Assistant is typing...
                         </div>
                    </div>
                )}

            </div>

            {/* Chat Input Area */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                 <ChatInput conversationId={conversationId} />
            </div>

             {/* Disclaimer (Could be sticky or fixed) */}
             <div className="text-xs text-center text-gray-500 dark:text-gray-400 p-2 bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                 This information is provided for general guidance only and does not constitute legal or financial advice. Consult with a qualified tax professional.
             </div>
        </div>
    );
} 