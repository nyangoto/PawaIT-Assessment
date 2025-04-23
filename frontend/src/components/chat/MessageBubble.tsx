// Component to display a single chat message bubble.
// Differentiates styling for user vs. assistant roles.
// Renders message content using react-markdown.
// Optionally displays token usage and feedback buttons.

'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'; // For GitHub Flavored Markdown (tables, strikethrough, etc.)
import { ThumbsUp, ThumbsDown, User, Bot } from 'lucide-react'; // Example icons
import { AppMessage } from '@/types/app';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'; // Assuming shadcn/ui

interface MessageBubbleProps {
    message: AppMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
    const isUser = message.role === 'user';
    const isAssistant = message.role === 'assistant';
    const isLoading = message.isOptimistic && message.content === '...'; // Simple loading check
    const hasError = !!message.metadata?.error;

    const handleFeedback = (feedback: 'up' | 'down') => {
        // TODO: Implement feedback submission logic
        console.log(`Feedback for message ${message.id}: ${feedback}`);
        alert(`Feedback (${feedback}) submitted! (Not implemented)`);
    };

    const tokenUsage = message.metadata?.token_usage;
    const totalTokens = tokenUsage?.total_tokens;

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} group`}>
            <div
                className={`relative flex flex-col max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-lg shadow-sm ${
                isUser
                    ? 'bg-blue-500 text-white rounded-br-none'
                    : hasError
                    ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border border-red-300 dark:border-red-600 rounded-bl-none'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none'
                } ${isLoading ? 'animate-pulse' : ''}`}
            >
                {/* Icon indicating sender */}
                <div className={`absolute top-1 ${isUser ? 'right-full -mr-3' : 'left-full -ml-3'} opacity-50 group-hover:opacity-100 transition-opacity`}>
                     {isUser ? <User className="h-4 w-4 text-blue-300"/> : <Bot className="h-4 w-4 text-gray-400"/>}
                </div>

                {/* Message Content */}
                {isLoading ? (
                    <span className="italic text-sm">Generating response...</span>
                ) : hasError ? (
                    <div className="text-sm">
                        <p className="font-medium mb-1">Error generating response:</p>
                        <p>{message.metadata?.error}</p>
                    </div>
                ) : (
                    <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-blockquote:my-2 prose-pre:my-2">
                        {/* Use ReactMarkdown for rendering */}
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {message.content}
                        </ReactMarkdown>
                    </div>
                )}

                 {/* Timestamp and Token Usage */}
                 <div className="flex justify-end items-center mt-1 pt-1 border-t border-gray-300 dark:border-gray-600 border-opacity-50">
                    <span className="text-xs opacity-70 mr-2">
                        {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {isAssistant && totalTokens && !isLoading && !hasError && (
                        <TooltipProvider delayDuration={100}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span className="text-xs font-mono opacity-70 cursor-default">
                                        {totalTokens} tokens
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" className="text-xs">
                                    Prompt: {tokenUsage?.prompt_tokens || 0} | Completion: {tokenUsage?.completion_tokens || 0}
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                 </div>

                 {/* Feedback Buttons (Only for non-optimistic, non-error assistant messages) */}
                 {isAssistant && !message.isOptimistic && !hasError && (
                     <div className="absolute bottom-0 right-0 transform translate-x-full flex gap-1 p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                         <Button
                             variant="ghost" size="icon"
                             className="h-6 w-6 text-gray-500 hover:text-green-600 hover:bg-green-100 dark:hover:bg-green-900"
                             onClick={() => handleFeedback('up')}
                             title="Good response"
                         >
                             <ThumbsUp className="h-4 w-4" />
                         </Button>
                         <Button
                             variant="ghost" size="icon"
                             className="h-6 w-6 text-gray-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900"
                             onClick={() => handleFeedback('down')}
                             title="Bad response"
                         >
                             <ThumbsDown className="h-4 w-4" />
                         </Button>
                     </div>
                 )}

            </div>
        </div>
    );
} 