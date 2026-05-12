import { useRef, useState } from "react";
import { Upload, FileCheck2, X, AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Progress } from "@/app/components/ui/progress";
import { uploadInstaller } from "@/services/installer-upload";

interface InstallerUploadProps {
  initialUrl?: string;
  onUploadComplete: (url: string) => void;
  disabled?: boolean;
}

type UploadStatus = "idle" | "uploading" | "success" | "error";

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function InstallerUpload({
  initialUrl,
  onUploadComplete,
  disabled = false,
}: InstallerUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [showReplace, setShowReplace] = useState(false);

  const handleFile = async (file: File) => {
    setSelectedFile(file);
    setStatus("uploading");
    setProgress(0);
    setErrorMessage("");
    setShowReplace(false);

    try {
      const result = await uploadInstaller(file, setProgress);
      onUploadComplete(result.url);
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Erro desconhecido no upload");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const resetToIdle = () => {
    setSelectedFile(null);
    setStatus("idle");
    setProgress(0);
    setShowReplace(false);
  };

  // Modo leitura — versão bloqueada para edição
  if (disabled && initialUrl) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 border rounded-lg bg-slate-100 cursor-not-allowed">
        <FileCheck2 className="size-4 text-slate-400 shrink-0" />
        <span className="text-sm text-slate-500 truncate">{initialUrl}</span>
      </div>
    );
  }

  // URL existente (modo edição, antes de substituir)
  if (initialUrl && !showReplace && status === "idle") {
    return (
      <div className="flex items-center justify-between gap-3 px-4 py-3 border rounded-lg bg-slate-50">
        <div className="flex items-center gap-2 min-w-0">
          <FileCheck2 className="size-4 text-slate-400 shrink-0" />
          <span className="text-sm text-slate-600 truncate">{initialUrl}</span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 shrink-0 gap-1.5 text-xs"
          onClick={() => setShowReplace(true)}
        >
          <RefreshCw className="size-3" />
          Substituir
        </Button>
      </div>
    );
  }

  if (status === "uploading") {
    return (
      <div className="space-y-3 px-4 py-4 border rounded-lg bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <Loader2 className="size-4 text-slate-400 animate-spin shrink-0" />
            <span className="text-sm text-slate-700 truncate">{selectedFile?.name}</span>
          </div>
          <span className="text-xs text-slate-400 shrink-0">{formatBytes(selectedFile?.size ?? 0)}</span>
        </div>
        <Progress value={progress} className="h-1.5" />
        <p className="text-xs text-muted-foreground">{progress}% enviado</p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="flex items-center justify-between gap-3 px-4 py-3 border rounded-lg bg-emerald-50 border-emerald-200">
        <div className="flex items-center gap-2 min-w-0">
          <FileCheck2 className="size-4 text-emerald-600 shrink-0" />
          <span className="text-sm text-emerald-700 truncate">{selectedFile?.name}</span>
          <span className="text-xs text-emerald-400 shrink-0">{formatBytes(selectedFile?.size ?? 0)}</span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 text-slate-400 hover:text-slate-600 shrink-0"
          onClick={resetToIdle}
        >
          <X className="size-4" />
        </Button>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex items-center justify-between gap-3 px-4 py-3 border rounded-lg bg-red-50 border-red-200">
        <div className="flex items-center gap-2 min-w-0">
          <AlertCircle className="size-4 text-red-500 shrink-0" />
          <span className="text-sm text-red-700 truncate">{errorMessage}</span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 text-slate-400 hover:text-slate-600 shrink-0"
          onClick={resetToIdle}
        >
          <X className="size-4" />
        </Button>
      </div>
    );
  }

  // Idle — zona de drag-and-drop
  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept=".exe,.msi"
        className="hidden"
        onChange={handleInputChange}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={`w-full flex flex-col items-center gap-2 px-6 py-6 border-2 border-dashed rounded-lg transition-colors text-center cursor-pointer
          ${isDragOver
            ? "border-[#500d5b] bg-purple-50"
            : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 bg-white"
          }
        `}
      >
        <Upload className="size-5 text-slate-400" />
        <div>
          <p className="text-sm font-medium text-slate-700">
            Arraste o instalador aqui ou clique para selecionar
          </p>
          <p className="text-xs text-muted-foreground mt-1">Arquivos .exe e .msi</p>
        </div>
      </button>
      {showReplace && (
        <button
          type="button"
          className="mt-2 text-xs text-muted-foreground hover:underline"
          onClick={() => setShowReplace(false)}
        >
          Cancelar substituição
        </button>
      )}
    </div>
  );
}
