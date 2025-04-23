// Axios client for interacting with the FastAPI backend.
// Automatically attaches the Supabase Auth token to requests.

import axios from 'axios';
import { supabase } from '@/lib/supabaseClient'; // Import Supabase client

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api/v1', // Adjust if FastAPI is hosted separately
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to inject the Supabase access token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // Get the current session from Supabase
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Error getting Supabase session for API request:", error);
        // Don't attach token if session fetch fails
        return config;
      }

      if (session?.access_token) {
        // If a token exists, add it to the Authorization header
        config.headers.Authorization = `Bearer ${session.access_token}`;
        console.debug("Attached Supabase token to API request.");
      } else {
        // Handle cases where there's no session (e.g., public endpoints if any)
        // For this app, most endpoints likely require auth (even anonymous)
        console.debug("No active Supabase session found for API request.");
        // Depending on backend, requests without token might be rejected (401)
      }
    } catch (e) {
       console.error("Exception while getting Supabase session:", e);
       // Proceed without token if error occurs during session retrieval
    }
    return config;
  },
  (error) => {
    // Handle request errors
    console.error("API Client Request Error:", error);
    return Promise.reject(error);
  }
);

// Optional: Add response interceptor for global error handling (e.g., 401 redirects)
apiClient.interceptors.response.use(
  (response) => response, // Pass through successful responses
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized errors globally if needed
      console.warn("Received 401 Unauthorized from API.");
      // Example: Redirect to login page or trigger logout
      // import { useAuth } from '@/contexts/AuthContext'; // Can't use hooks here
      // Consider event bus or state management action to signal logout
      // supabase.auth.signOut(); // Could potentially sign out here
    }
    return Promise.reject(error);
  }
);


export { apiClient }; 