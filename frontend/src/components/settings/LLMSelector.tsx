'use client';

import React from 'react';
// Assuming a store exists to manage LLM preference
// import { useSettingsStore } from '@/stores/settingsStore';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'; // Assuming shadcn/ui

// Placeholder store hook - Replace with your actual state management
const useSettingsStore = () => {
    const [llm, setLlm] = React.useState('gemini-1.5-pro'); // Default
    return { preferredLLM: llm, setPreferredLLM: setLlm };
}

export function LLMSelector() {
    const { preferredLLM, setPreferredLLM } = useSettingsStore();

    // TODO: Fetch available models dynamically if needed
    const availableLLMs = [
        { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' },
        { id: 'gpt-4o', name: 'ChatGPT 4o' },
        { id: 'claude-3-opus', name: 'Claude 3 Opus' },
        // Add other models supported by your backend
    ];

    const handleSelectionChange = (value: string) => {
        setPreferredLLM(value);
        console.log("LLM Selection Changed:", value);
        // TODO: Potentially notify backend or clear context if needed on change
    };

    return (
        <div className="space-y-1">
             <label htmlFor="llm-select" className="text-sm font-medium">Preferred AI Model</label>
             <Select value={preferredLLM} onValueChange={handleSelectionChange}>
                <SelectTrigger id="llm-select" className="w-full">
                    <SelectValue placeholder="Select AI Model" />
                </SelectTrigger>
                <SelectContent>
                    {availableLLMs.map(llm => (
                        <SelectItem key={llm.id} value={llm.id}>
                            {llm.name}
                        </SelectItem>
                    ))}
                </SelectContent>
             </Select>
             <p className="text-xs text-gray-500 dark:text-gray-400">
                 Affects new responses. May impact speed and cost.
             </p>
        </div>
    );
} 