import { useState } from "react";
import { DemoLayout } from "../DemoLayout";
import { FileBlock } from "../FileBlock";
import { cn } from "@/lib/utils";
import { Upload, FileText, FileSpreadsheet, File, Check } from "lucide-react";

interface StepUploadProps {
  onComplete: (file: { name: string; size: string }) => void;
  selectedFile?: { name: string; size: string };
}

const demoFiles = [
  { name: "confidential-report.pdf", size: "2.4 MB", icon: FileText },
  { name: "financial-data.xlsx", size: "1.8 MB", icon: FileSpreadsheet },
  { name: "legal-contract.docx", size: "856 KB", icon: File },
];

export const StepUpload = ({ onComplete, selectedFile }: StepUploadProps) => {
  const [hoveredFile, setHoveredFile] = useState<string | null>(null);

  return (
    <DemoLayout
      title="Select a File to Protect"
      description={
        <>
          <p>
            Choose a file to encrypt. In the real BlockDrive app, you'd drag and drop 
            any file from your computer. For this demo, select one of the sample files.
          </p>
          <div className="p-4 mt-4 rounded-lg bg-primary/10 border border-primary/30">
            <p className="text-sm">
              <strong className="text-primary">Important:</strong> Your file is encrypted 
              in your browser <em>before</em> any data leaves your device. We never see 
              your unencrypted files.
            </p>
          </div>
        </>
      }
    >
      <div className="space-y-6">
        {/* Drag and drop zone (decorative) */}
        <div className="rounded-xl border-2 border-dashed border-border/50 bg-card/20 p-8 text-center">
          <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            Drag & drop your file here
          </p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            or select a demo file below
          </p>
        </div>

        {/* Demo file selection */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground">Demo Files:</p>
          {demoFiles.map((file) => {
            const isSelected = selectedFile?.name === file.name;
            const FileIcon = file.icon;
            
            return (
              <button
                key={file.name}
                onClick={() => onComplete(file)}
                onMouseEnter={() => setHoveredFile(file.name)}
                onMouseLeave={() => setHoveredFile(null)}
                className={cn(
                  "w-full p-4 rounded-xl border transition-all duration-300 text-left",
                  "flex items-center gap-4",
                  isSelected
                    ? "border-primary bg-primary/10 glow-primary"
                    : hoveredFile === file.name
                    ? "border-primary/50 bg-card/50"
                    : "border-border/50 bg-card/30 hover:bg-card/50"
                )}
              >
                <div
                  className={cn(
                    "p-3 rounded-lg transition-colors duration-300",
                    isSelected ? "bg-primary/20" : "bg-secondary/50"
                  )}
                >
                  <FileIcon
                    className={cn(
                      "h-6 w-6 transition-colors duration-300",
                      isSelected ? "text-primary" : "text-muted-foreground"
                    )}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{file.name}</p>
                  <p className="text-sm text-muted-foreground">{file.size}</p>
                </div>
                {isSelected && (
                  <div className="p-1.5 rounded-full bg-primary/20">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Selected file preview */}
        {selectedFile && (
          <div className="pt-4 animate-fade-in">
            <p className="text-sm text-muted-foreground mb-2">Selected:</p>
            <FileBlock fileName={selectedFile.name} fileSize={selectedFile.size} />
          </div>
        )}
      </div>
    </DemoLayout>
  );
};
