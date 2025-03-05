"use client";

import { useState } from "react";
import { AlertCircle, X } from "lucide-react";
import { Button } from "./ui/button";

interface ApiStatusBannerProps {
  isUsingMockData: boolean;
}

export function ApiStatusBanner({ isUsingMockData }: ApiStatusBannerProps) {
  const [isVisible, setIsVisible] = useState(isUsingMockData);

  if (!isVisible) return null;

  return (
    <div className="bg-yellow-100 dark:bg-yellow-900 border-l-4 border-yellow-500 text-yellow-700 dark:text-yellow-200 p-4 mb-4 relative">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 mr-2" />
        </div>
        <div className="flex-1">
          <p className="font-medium">API Connection Issue</p>
          <p className="text-sm mt-1">
            Using mock data because the Clash of Clans API token is invalid or
            missing. Check your environment variables and make sure your API
            token is correctly configured.
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="flex-shrink-0"
          onClick={() => setIsVisible(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
