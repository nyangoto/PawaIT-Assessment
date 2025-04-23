import { Database } from './supabase'; // Import generated types

// Base types from Supabase schema (assuming table names 'conversations' and 'messages')
export type DbConversation = Database['public']['Tables']['conversations']['Row'];
export type DbMessage = Database['public']['Tables']['messages']['Row'];
export type DbMessageMetadata = DbMessage['metadata']; // JSONB type

// Application-specific interfaces extending or simplifying DB types

export interface AppConversation extends DbConversation {
    // Add any frontend-specific properties if needed
    message_count?: number; // Example
    last_message_at?: string; // Example
}

export interface AppMessage extends Omit<DbMessage, 'metadata'> {
    // Parse metadata into structured fields for frontend use
    metadata: {
        token_usage?: {
            prompt_tokens?: number;
            completion_tokens?: number;
            total_tokens?: number;
        } | null;
        follow_up_questions?: string[] | null;
        llm_provider?: string | null;
        error?: string | null; // Example: Store error info if message failed
    } | null; // Allow metadata itself to be null
}

// Interface for the response from the backend /message endpoint
export interface BackendConversationResponse {
    conversation_id: string;
    user_message_id: string;
    assistant_message_id: string;
    answer: string;
    follow_up_questions: string[] | null;
    token_usage: {
        prompt_tokens?: number;
        completion_tokens?: number;
        total_tokens?: number;
    } | null;
    disclaimer: string;
}

// Interface for the payload sent to the backend /message endpoint
export interface BackendMessagePayload {
    message: string;
    conversation_id?: string | null; // Optional for the first message
}


// Interface for the response from the backend /conversations endpoint
export interface BackendConversationListResponse {
    id: string;
    title: string | null;
    created_at: string;
    updated_at: string | null; // Match Supabase schema if it has updated_at
} 