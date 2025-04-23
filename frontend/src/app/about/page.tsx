// Static page providing information about the Freelancer Tax Assistant.

import React from 'react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto py-10 px-4 prose dark:prose-invert">
      <h1>About PawaITs - Freelancer Tax Assistant</h1>

      <p>
        Welcome to the PawaITs Freelancer Tax Assistant! This tool is designed to help freelancers,
        especially those in Kenya, navigate common tax-related questions using advanced AI models.
      </p>

      <h2>What it Does</h2>
      <ul>
        <li>Answer your tax questions in a conversational format.</li>
        <li>Provide structured information on tax categories, deductions, and deadlines.</li>
        <li>Remember conversation context for follow-up questions.</li>
        <li>Allow selection between different powerful AI models (like Gemini, ChatGPT, Claude).</li>
        <li>Offer persistent chat history (device-specific for guests, cloud-synced for registered users).</li>
      </ul>

      <h2>How it Works</h2>
      <p>
        This application leverages Large Language Models (LLMs) to understand your questions and generate
        informative responses. We use Supabase for secure user authentication and data storage, ensuring your
        conversations are private and accessible only to you (when logged in).
      </p>
      <p>
        Token usage and estimated costs (for informational purposes) are displayed based on the selected AI model's
        pricing structure.
      </p>

      <h2>Important Disclaimer</h2>
      <p className="font-semibold text-red-600 dark:text-red-400">
        The information provided by this AI assistant is for general guidance only and does **not**
        constitute legal or financial advice. Tax laws are complex and vary based on individual
        circumstances. Always consult with a qualified tax professional or legal counsel for advice
        specific to your situation. PawaITs is not liable for any decisions made based on the
        information provided here.
      </p>

      <h2>Technology Stack</h2>
      <ul>
        <li>Frontend: Next.js, React, TypeScript, Tailwind CSS</li>
        <li>Backend Logic: FastAPI (Python)</li>
        <li>AI Models: Google Gemini, OpenAI GPT, Anthropic Claude (via API)</li>
        <li>Authentication & Database: Supabase</li>
      </ul>

      <hr />

      <p>
        Need help or have feedback? <Link href="/contact">Contact Us</Link> (Contact page not implemented).
      </p>
       <p>
        <Link href="/chat">Back to Chat</Link>
      </p>
    </div>
  );
} 