import { cn } from "@/lib/utils";
import { File, FileText, FileSpreadsheet, Lock } from "lucide-react";

interface FileBlockProps {
  fileName?: string;
  fileSize?: string;
  isEncrypted?: boolean;
  isIncomplete?: boolean;
  className?: string;
  showLabel?: boolean;
  label?: string;
}

const getFileIcon = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf':
      return FileText;
    case 'xlsx':
    case 'xls':
    case 'csv':
      return FileSpreadsheet;
    default:
      return File;
  }
};

export const FileBlock = ({
  fileName = "document.pdf",
  fileSize = "2.4 MB",
  isEncrypted = false,
  isIncomplete = false,
  className,
  showLabel = false,
  label,
}: FileBlockProps) => {
  const FileIcon = getFileIcon(fileName);

  return (
    <div className={cn("relative", className)}>
      <div
        className={cn(
          "relative p-6 rounded-xl border transition-all duration-500",
          "bg-card/50 backdrop-blur-sm",
          isEncrypted && "border-primary/50 glow-primary",
          isIncomplete && "border-dashed border-yellow-500/50",
          !isEncrypted && !isIncomplete && "border-border/50"
        )}
      >
        {/* Encryption overlay */}
        {isEncrypted && (
          <div className="absolute inset-0 rounded-xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
            <div className="absolute top-2 right-2">
              <Lock className="h-4 w-4 text-primary animate-pulse" />
            </div>
          </div>
        )}

        {/* Incomplete indicator */}
        {isIncomplete && (
          <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-yellow-500/20 border border-yellow-500/50 rounded text-xs text-yellow-500 font-medium">
            Incomplete
          </div>
        )}

        <div className="relative flex items-center gap-4">
          <div
            className={cn(
              "p-3 rounded-lg",
              isEncrypted ? "bg-primary/20" : "bg-secondary/50"
            )}
          >
            <FileIcon
              className={cn(
                "h-8 w-8",
                isEncrypted ? "text-primary" : "text-muted-foreground"
              )}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground truncate">{fileName}</p>
            <p className="text-sm text-muted-foreground">{fileSize}</p>
          </div>
        </div>
      </div>

      {/* Label below */}
      {showLabel && label && (
        <p className="mt-2 text-center text-xs text-muted-foreground">{label}</p>
      )}
    </div>
  );
};
