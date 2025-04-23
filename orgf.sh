#!/bin/bash

# Exit on error
set -e

echo "Starting frontend file restructuring..."

# Create base directories
mkdir -p frontend/src/{app/{chat/\[\[...conversationId\]\],login,register,settings,about},components/{chat,layout,settings,guest,ui},contexts,hooks,lib,services,stores,types}

# Function to safely move a file
move_file() {
    SOURCE=$1
    DEST=$2
    
    # Check if source exists
    if [ -f "$SOURCE" ]; then
        # Create destination directory if it doesn't exist
        mkdir -p "$(dirname "$DEST")"
        
        # Move the file
        mv "$SOURCE" "$DEST"
        echo "Moved: $SOURCE -> $DEST"
    else
        echo "Warning: Source file not found: $SOURCE"
    fi
}

# Create empty .env.local.example if it doesn't exist
if [ ! -f ".env.local.example" ]; then
    touch "frontend/.env.local.example"
    echo "Created empty frontend/.env.local.example"
else
    move_file ".env.local.example" "frontend/.env.local.example"
fi

# Move src files
move_file "src/lib/supabaseClient.ts" "frontend/src/lib/supabaseClient.ts"
move_file "src/contexts/AuthContext.tsx" "frontend/src/contexts/AuthContext.tsx"
move_file "src/services/apiClient.ts" "frontend/src/services/apiClient.ts"
move_file "src/components/GuestPrompt.tsx" "frontend/src/components/guest/GuestPrompt.tsx"
move_file "src/types/supabase.ts" "frontend/src/types/supabase.ts"
move_file "src/types/app.ts" "frontend/src/types/app.ts"
move_file "src/components/chat/ChatArea.tsx" "frontend/src/components/chat/ChatArea.tsx"
move_file "src/components/chat/ChatInput.tsx" "frontend/src/components/chat/ChatInput.tsx"
move_file "src/stores/chatStore.ts" "frontend/src/stores/chatStore.ts"
move_file "src/components/layout/LeftSidebar.tsx" "frontend/src/components/layout/LeftSidebar.tsx"
move_file "src/components/layout/RightSidebar.tsx" "frontend/src/components/layout/RightSidebar.tsx"
move_file "src/components/settings/ThemeToggle.tsx" "frontend/src/components/settings/ThemeToggle.tsx"
move_file "src/components/settings/LLMSelector.tsx" "frontend/src/components/settings/LLMSelector.tsx"
move_file "src/components/chat/MessageBubble.tsx" "frontend/src/components/chat/MessageBubble.tsx"
move_file "src/components/chat/SuggestedQuestions.tsx" "frontend/src/components/chat/SuggestedQuestions.tsx"
move_file "src/components/chat/FollowUpSuggestions.tsx" "frontend/src/components/chat/FollowUpSuggestions.tsx"
move_file "src/hooks/useLocalHistory.ts" "frontend/src/hooks/useLocalHistory.ts"
move_file "src/stores/settingsStore.ts" "frontend/src/stores/settingsStore.ts"

# Move app pages
move_file "app/chat/[[...conversationId]]/page.tsx" "frontend/src/app/chat/[[...conversationId]]/page.tsx"
move_file "app/login/page.tsx" "frontend/src/app/login/page.tsx"
move_file "app/register/page.tsx" "frontend/src/app/register/page.tsx"
move_file "app/settings/page.tsx" "frontend/src/app/settings/page.tsx"
move_file "app/about/page.tsx" "frontend/src/app/about/page.tsx"

# Move Next.js config files if they exist
move_file "next.config.js" "frontend/next.config.js"
move_file "package.json" "frontend/package.json"
move_file "package-lock.json" "frontend/package-lock.json"
move_file "yarn.lock" "frontend/yarn.lock"
move_file "tsconfig.json" "frontend/tsconfig.json"
move_file "tailwind.config.ts" "frontend/tailwind.config.ts"
move_file "tailwind.config.js" "frontend/tailwind.config.js"
move_file "postcss.config.js" "frontend/postcss.config.js"
move_file "postcss.config.js" "frontend/postcss.config.js"

echo "Frontend file restructuring completed!"