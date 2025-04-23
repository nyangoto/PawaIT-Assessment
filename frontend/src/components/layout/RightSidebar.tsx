'use client';

import React from 'react';
import { useChatStore } from '@/stores/chatStore'; // Assuming Zustand store
import { LLMSelector } from '@/components/settings/LLMSelector'; // Assuming component exists
import { ThemeToggle } from '@/components/settings/ThemeToggle'; // Assuming component exists
import { Separator } from '@/components/ui/separator'; // Assuming shadcn/ui
import { ScrollArea } from '@/components/ui/scroll-area'; // Assuming shadcn/ui
import { Info } from 'lucide-react'; // Example icon

interface RightSidebarProps {
    conversationId: string | undefined; // To potentially scope info to current chat
}

// --- Mock Token Cost Calculation (Replace with actual logic/data) ---
const MOCK_TOKEN_COSTS = {
    "gpt-4o": { input: 0.005 / 1000, output: 0.015 / 1000 }, // $ per token
    "claude-3-opus": { input: 0.015 / 1000, output: 0.075 / 1000 },
    "gemini-1.5-pro": { input: 0.0035 / 1000, output: 0.0105 / 1000 }, // Prices are illustrative examples
    "default": { input: 0.001 / 1000, output: 0.002 / 1000 } // Fallback cost
};

type LlmProviderKey = keyof typeof MOCK_TOKEN_COSTS;

function calculateCost(tokenUsage: any, provider: string | null): number {
    if (!tokenUsage || !provider) return 0;

    const providerKey = (provider.toLowerCase().includes("openai") ? "gpt-4o" : // Rough mapping
                         provider.toLowerCase().includes("anthropic") ? "claude-3-opus" :
                         provider.toLowerCase().includes("google") ? "gemini-1.5-pro" : "default") as LlmProviderKey;

    const costs = MOCK_TOKEN_COSTS[providerKey] || MOCK_TOKEN_COSTS.default;
    const promptCost = (tokenUsage.prompt_tokens || 0) * costs.input;
    const completionCost = (tokenUsage.completion_tokens || 0) * costs.output;
    return promptCost + completionCost;
}
// --- End Mock Calculation ---


export function RightSidebar({ conversationId }: RightSidebarProps) {
    const { messages } = useChatStore();

    // Calculate total tokens and estimated cost for the current session/conversation
    const sessionTotals = React.useMemo(() => {
        let totalPromptTokens = 0;
        let totalCompletionTokens = 0;
        let totalCost = 0;

        messages.forEach(msg => {
            if (msg.role === 'assistant' && msg.metadata?.token_usage) {
                 const usage = msg.metadata.token_usage;
                 totalPromptTokens += usage.prompt_tokens || 0;
                 totalCompletionTokens += usage.completion_tokens || 0;
                 totalCost += calculateCost(usage, msg.metadata.llm_provider || null);
            }
        });

        return {
            promptTokens: totalPromptTokens,
            completionTokens: totalCompletionTokens,
            totalTokens: totalPromptTokens + totalCompletionTokens,
            estimatedCost: totalCost,
        };
    }, [messages]);

    return (
        <aside className="w-72 bg-gray-50 dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex-col p-4 hidden lg:flex"> {/* Hide on smaller screens */}
            <h2 className="text-lg font-semibold mb-4">Session Overview</h2>

            {/* Theme Toggle */}
            <div className="mb-4 flex justify-between items-center">
                <span className="text-sm font-medium">Theme</span>
                <ThemeToggle />
            </div>

            <Separator className="my-2" />

            {/* LLM Selector */}
            <div className="mb-4">
                <LLMSelector />
            </div>

             <Separator className="my-2" />


            {/* Token Usage & Cost */}
             <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Usage</h3>
              <div className="space-y-2 text-sm mb-4">
                 <div className="flex justify-between">
                     <span>Prompt Tokens:</span>
                     <span className="font-mono">{sessionTotals.promptTokens.toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between">
                     <span>Completion Tokens:</span>
                     <span className="font-mono">{sessionTotals.completionTokens.toLocaleString()}</span>
                 </div>
                  <div className="flex justify-between font-medium">
                     <span>Total Tokens:</span>
                     <span className="font-mono">{sessionTotals.totalTokens.toLocaleString()}</span>
                 </div>
                  <div className="flex justify-between font-medium text-green-600 dark:text-green-400">
                     <span>Estimated Cost:</span>
                     <span className="font-mono">${sessionTotals.estimatedCost.toFixed(4)}</span>
                 </div>
              </div>

             <div className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 p-2 rounded">
                 <Info className="h-4 w-4 mt-0.5 flex-shrink-0"/>
                 <span>Costs are estimates based on selected models and may vary. Token counts are approximate.</span>
             </div>


            {/* Future Placeholders */}
            {/* <Separator className="my-4" />
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Sources</h3>
            <div className="text-sm text-gray-500 italic">Citations will appear here.</div>

            <Separator className="my-4" />
             <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Export</h3>
             <Button variant="outline" size="sm" className="w-full" disabled>Export Chat (PDF)</Button> */}

            {/* Add more sections as needed */}

             <div className="flex-grow"></div> {/* Pushes content up */}

        </aside>
    );
} 