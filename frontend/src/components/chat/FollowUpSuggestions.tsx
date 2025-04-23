'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react'; // Example icon

interface FollowUpSuggestionsProps {
    suggestions: string[];
    onSelect: (question: string) => void; // Callback when a suggestion is clicked
}

export function FollowUpSuggestions({ suggestions, onSelect }: FollowUpSuggestionsProps) {
     if (!suggestions || suggestions.length === 0) {
        return null;
    }

    return (
        <div className="mt-3 pl-10"> {/* Indent slightly */}
             <p className="text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">Suggested follow-ups:</p>
             <div className="flex flex-wrap gap-2">
                {suggestions.map((q, index) => (
                     <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="text-xs bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => onSelect(q)}
                        title={q}
                    >
                        {q}
                        <ArrowRight className="h-3 w-3 ml-1 opacity-70"/>
                    </Button>
                ))}
            </div>
        </div>
    );
} 