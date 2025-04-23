'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react'; // Example icon

interface SuggestedQuestionsProps {
    suggestions: string[];
    onSelect: (question: string) => void; // Callback when a suggestion is clicked
}

export function SuggestedQuestions({ suggestions, onSelect }: SuggestedQuestionsProps) {
    if (!suggestions || suggestions.length === 0) {
        return null;
    }

    return (
        <div className="mb-8 p-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800">
             <h3 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300 flex items-center">
                 <Sparkles className="h-4 w-4 mr-2 text-purple-500"/>
                 Start with a suggestion:
             </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {suggestions.map((q, index) => (
                    <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="text-left h-auto whitespace-normal justify-start py-2 px-3 text-xs"
                        onClick={() => onSelect(q)}
                    >
                        {q}
                    </Button>
                ))}
            </div>
        </div>
    );
} 