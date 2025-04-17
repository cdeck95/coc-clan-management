import React from "react";
import { AlertCircle } from "lucide-react";
import { BannedMember } from "@/types/clash";

interface BanStatusAlertProps {
  bannedMember: BannedMember;
  className?: string;
}

export function BanStatusAlert({
  bannedMember,
  className = "",
}: BanStatusAlertProps) {
  return (
    <div
      className={`p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md ${className}`}
    >
      <div className="flex gap-2 items-start">
        <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-red-800 dark:text-red-200">
            This member is on the banned list
          </p>
          <p className="text-xs mt-1">Reason: {bannedMember.reason}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Banned on: {new Date(bannedMember.date).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
