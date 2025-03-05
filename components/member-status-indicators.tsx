import { FileText, AlertCircle } from "lucide-react";
import { AdaptiveTooltip } from "@/components/ui/adaptive-tooltip";
import { StrikeIndicator } from "@/components/ui/strike-indicator";

interface MemberStatusIndicatorsProps {
  hasNotes: boolean;
  notesCount?: number;
  hasStrikes: boolean;
  strikesCount?: number;
}

export function MemberStatusIndicators({
  hasNotes,
  notesCount = 0,
  hasStrikes,
  strikesCount = 0,
}: MemberStatusIndicatorsProps) {
  return (
    <div className="flex space-x-1.5 items-center">
      {hasNotes && (
        <AdaptiveTooltip
          content={`${notesCount} note${notesCount !== 1 ? "s" : ""} available`}
        >
          <FileText className="h-3 w-3 text-blue-500" />
        </AdaptiveTooltip>
      )}

      {hasStrikes && (
        <AdaptiveTooltip
          content={`${strikesCount} strike${
            strikesCount !== 1 ? "s" : ""
          } recorded`}
        >
          <div className="flex items-center space-x-1">
            <AlertCircle className="h-3 w-3 text-red-500 mr-0.5" />
            <StrikeIndicator strikes={strikesCount} />
          </div>
        </AdaptiveTooltip>
      )}
    </div>
  );
}
