// Zustand store for managing chat UI state including messages,
// loading indicators, errors, and suggestions.

import { create } from 'zustand';
import { AppMessage, AppConversation } from '@/types/app';

interface ChatState {
  messages: AppMessage[];
  currentConversation: AppConversation | null;
  isLoading: boolean; // Loading state for LLM responses
  error: string | null;
  suggestedQuestions: string[]; // Initial suggestions for new chats
  followUpSuggestions: string[]; // Suggestions after an AI response

  setMessages: (messages: AppMessage[]) => void;
  addMessage: (message: AppMessage) => void;
  addOptimisticMessage: (message: AppMessage) => void; // Add message flagged as optimistic
  updateOptimisticMessage: (optimisticId: string, confirmedMessage: Partial<AppMessage>) => void; // Replace optimistic with confirmed
  removeOptimisticMessage: (optimisticId: string) => void; // Remove if request fails
  setCurrentConversation: (conversation: AppConversation | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSuggestedQuestions: (questions: string[]) => void;
  setFollowUpSuggestions: (questions: string[]) => void;
  clearFollowUpSuggestions: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  currentConversation: null,
  isLoading: false,
  error: null,
  suggestedQuestions: [ // Default initial suggestions
    "What taxes do I pay as a freelancer in Kenya?",
    "How do I file my income tax returns?",
    "What expenses can I deduct?",
  ],
  followUpSuggestions: [],

  setMessages: (messages) => set({ messages }),

  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),

  addOptimisticMessage: (message) => set((state) => ({
    messages: [...state.messages, { ...message, isOptimistic: true }] // Add flag
  })),

  updateOptimisticMessage: (optimisticId, confirmedMessage) => set((state) => ({
    messages: state.messages.map((msg) =>
      msg.id === optimisticId
        // Merge confirmed data, ensure ID is updated, remove optimistic flag
        ? { ...msg, ...confirmedMessage, id: confirmedMessage.id ?? optimisticId, isOptimistic: false }
        : msg
    ),
  })),

  removeOptimisticMessage: (optimisticId) => set((state) => ({
    messages: state.messages.filter((msg) => msg.id !== optimisticId),
  })),

  setCurrentConversation: (conversation) => set({ currentConversation: conversation }),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error: error }),

  setSuggestedQuestions: (questions) => set({ suggestedQuestions: questions }),

  setFollowUpSuggestions: (questions) => set({ followUpSuggestions: questions }),

  clearFollowUpSuggestions: () => set({ followUpSuggestions: [] }),

}));

// Extend AppMessage type definition locally if needed (or in types/app.ts)
declare module '@/types/app' {
  interface AppMessage {
    isOptimistic?: boolean;
  }
} 