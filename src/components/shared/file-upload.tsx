"use client";

import {
  useState,
  useCallback,
  useRef,
  useEffect,
  type DragEvent,
  type ChangeEvent,
} from "react";
import {
  Upload,
  X,
  ImageIcon,
  AlertCircle,
  CheckCircle2,
  Loader2,
  GripVertical,
} from "lucide-react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { cn } from "@/lib/utils";
import { uploadFile, deleteFile } from "@/lib/storage";

type BucketName = "listings" | "avatars" | "contracts" | "chat";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp"];

interface FileUploadProps {
  bucket: BucketName;
  path: string;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSizeMB?: number;
  onUpload: (urls: string[]) => void;
  onError?: (error: string) => void;
  existingFiles?: string[];
  className?: string;
  label?: string;
  description?: string;
}

interface FileItem {
  id: string;
  file: File | null;
  preview: string | null;
  url: string | null;
  name: string;
  size: number;
  status: "pending" | "uploading" | "done" | "error";
  progress: number;
  errorMessage?: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function getFileNameFromUrl(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    return pathname.split("/").pop() || "imagem";
  } catch {
    return "imagem";
  }
}

function isValidImageType(file: File): boolean {
  if (ALLOWED_IMAGE_TYPES.includes(file.type)) return true;
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  return ALLOWED_IMAGE_EXTENSIONS.includes(ext);
}

export function FileUpload({
  bucket,
  path,
  accept = "image/jpeg,image/png,image/webp",
  multiple = true,
  maxFiles = 10,
  maxSizeMB = 5,
  onUpload,
  onError,
  existingFiles = [],
  className,
  label = "Arraste suas fotos aqui",
  description,
}: FileUploadProps) {
  const [files, setFiles] = useState<FileItem[]>(() =>
    existingFiles.map((url) => ({
      id: generateId(),
      file: null,
      preview: url,
      url,
      name: getFileNameFromUrl(url),
      size: 0,
      status: "done" as const,
      progress: 100,
    }))
  );
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync existingFiles prop when it changes externally
  const existingFilesKey = existingFiles.join(",");
  useEffect(() => {
    if (existingFiles.length > 0 && files.length === 0) {
      setFiles(
        existingFiles.map((url) => ({
          id: generateId(),
          file: null,
          preview: url,
          url,
          name: getFileNameFromUrl(url),
          size: 0,
          status: "done" as const,
          progress: 100,
        }))
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingFilesKey]);

  const emitUrls = useCallback(
    (items: FileItem[]) => {
      const urls = items
        .filter((f) => f.status === "done" && f.url)
        .map((f) => f.url as string);
      onUpload(urls);
    },
    [onUpload]
  );

  const uploadSingleFile = useCallback(
    async (item: FileItem, allItems: FileItem[]): Promise<FileItem[]> => {
      if (!item.file) return allItems;

      const updated = allItems.map((f) =>
        f.id === item.id ? { ...f, status: "uploading" as const, progress: 30 } : f
      );

      try {
        const url = await uploadFile(bucket, item.file, path);
        return updated.map((f) =>
          f.id === item.id
            ? {
                ...f,
                status: "done" as const,
                url,
                preview: url,
                progress: 100,
              }
            : f
        );
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Erro ao enviar arquivo";
        onError?.(message);
        return updated.map((f) =>
          f.id === item.id
            ? {
                ...f,
                status: "error" as const,
                errorMessage: message,
                progress: 0,
              }
            : f
        );
      }
    },
    [bucket, path, onError]
  );

  const processFiles = useCallback(
    async (newFiles: FileList | File[]) => {
      setError(null);
      const fileArray = Array.from(newFiles);

      // Validate file types
      const invalidFile = fileArray.find((f) => !isValidImageType(f));
      if (invalidFile) {
        const msg = `"${invalidFile.name}" nao e um formato aceito. Use JPG, PNG ou WebP.`;
        setError(msg);
        onError?.(msg);
        return;
      }

      // Validate max files
      const currentCount = files.filter(
        (f) =>
          f.status === "done" ||
          f.status === "uploading" ||
          f.status === "pending"
      ).length;
      if (currentCount + fileArray.length > maxFiles) {
        const msg = `Maximo de ${maxFiles} imagem${maxFiles > 1 ? "ns" : ""} permitida${maxFiles > 1 ? "s" : ""}`;
        setError(msg);
        onError?.(msg);
        return;
      }

      // Validate file sizes
      const oversized = fileArray.find(
        (f) => f.size > maxSizeMB * 1024 * 1024
      );
      if (oversized) {
        const msg = `"${oversized.name}" excede o limite de ${maxSizeMB}MB`;
        setError(msg);
        onError?.(msg);
        return;
      }

      const newItems: FileItem[] = fileArray.map((file) => ({
        id: generateId(),
        file,
        preview: URL.createObjectURL(file),
        url: null,
        name: file.name,
        size: file.size,
        status: "pending" as const,
        progress: 0,
      }));

      let allItems = [...files, ...newItems];
      setFiles(allItems);

      // Upload each new file sequentially
      for (const item of newItems) {
        allItems = await uploadSingleFile(item, allItems);
        setFiles([...allItems]);
      }

      emitUrls(allItems);
    },
    [files, maxFiles, maxSizeMB, onError, uploadSingleFile, emitUrls]
  );

  const removeFile = useCallback(
    async (itemId: string) => {
      const fileToRemove = files.find((f) => f.id === itemId);
      if (!fileToRemove) return;

      // Revoke local preview blob
      if (fileToRemove.preview && fileToRemove.file) {
        URL.revokeObjectURL(fileToRemove.preview);
      }

      // Delete from storage if it was uploaded
      if (fileToRemove.url && fileToRemove.status === "done") {
        try {
          await deleteFile(bucket, fileToRemove.url);
        } catch {
          // Silently fail on delete - file may already be gone
        }
      }

      const updated = files.filter((f) => f.id !== itemId);
      setFiles(updated);
      setError(null);
      emitUrls(updated);
    },
    [files, bucket, emitUrls]
  );

  const handleReorder = useCallback(
    (reordered: FileItem[]) => {
      setFiles(reordered);
      emitUrls(reordered);
    },
    [emitUrls]
  );

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragActive(false);

      if (e.dataTransfer.files.length > 0) {
        processFiles(e.dataTransfer.files);
      }
    },
    [processFiles]
  );

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        processFiles(e.target.files);
      }
      // Reset input so the same file can be selected again
      e.target.value = "";
    },
    [processFiles]
  );

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleClick();
      }
    },
    [handleClick]
  );

  const isUploading = files.some(
    (f) => f.status === "uploading" || f.status === "pending"
  );
  const uploadingCount = files.filter(
    (f) => f.status === "uploading" || f.status === "pending"
  ).length;
  const doneCount = files.filter((f) => f.status === "done").length;

  return (
    <div className={cn("w-full", className)}>
      {/* Drop zone */}
      <div
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        aria-label={label}
        className={cn(
          "relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-all duration-200 cursor-pointer",
          isDragActive
            ? "border-[#6C3CE1] bg-[#6C3CE1]/5 scale-[1.01]"
            : "border-gray-200 bg-gray-50/50 hover:border-[#6C3CE1]/50 hover:bg-[#6C3CE1]/[0.02] dark:border-gray-700 dark:bg-gray-900/50 dark:hover:border-[#6C3CE1]/50",
          error &&
            "border-red-300 bg-red-50/50 dark:border-red-800 dark:bg-red-950/30"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple && maxFiles > 1}
          onChange={handleInputChange}
          className="hidden"
          aria-hidden="true"
          tabIndex={-1}
        />

        <motion.div
          animate={
            isDragActive ? { scale: 1.1, y: -4 } : { scale: 1, y: 0 }
          }
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className={cn(
            "mb-4 flex h-14 w-14 items-center justify-center rounded-2xl transition-colors",
            isDragActive
              ? "bg-[#6C3CE1]/15 text-[#6C3CE1]"
              : "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500"
          )}
        >
          <Upload className="h-6 w-6" strokeWidth={1.5} />
        </motion.div>

        <p className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
          {isDragActive ? "Solte as imagens aqui" : label}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {description ||
            `Arraste e solte ou clique para selecionar. JPG, PNG ou WebP. Max ${maxSizeMB}MB cada.`}
        </p>

        {isUploading && (
          <div className="mt-3 flex items-center gap-2 text-xs text-[#6C3CE1]">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Enviando {uploadingCount} imagem{uploadingCount > 1 ? "ns" : ""}...
          </div>
        )}

        {doneCount > 0 && !isUploading && (
          <div className="mt-3 text-xs text-gray-400 dark:text-gray-500">
            {doneCount}/{maxFiles} imagem{doneCount !== 1 ? "ns" : ""}
          </div>
        )}
      </div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 flex items-center gap-1.5 text-sm text-red-600 dark:text-red-400"
          >
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reorderable image grid */}
      {files.length > 0 && (
        <div className="mt-4">
          {files.length > 1 && (
            <p className="mb-2 text-xs text-gray-400 dark:text-gray-500">
              Arraste para reordenar. A primeira imagem sera a capa.
            </p>
          )}
          <Reorder.Group
            axis="x"
            values={files}
            onReorder={handleReorder}
            className="flex flex-wrap gap-3"
          >
            {files.map((fileItem, index) => (
              <Reorder.Item
                key={fileItem.id}
                value={fileItem}
                className="relative group"
                whileDrag={{ scale: 1.05, zIndex: 50 }}
              >
                <div
                  className={cn(
                    "relative w-24 h-24 sm:w-28 sm:h-28 rounded-lg overflow-hidden border-2 transition-all",
                    index === 0
                      ? "border-[#6C3CE1] ring-2 ring-[#6C3CE1]/20"
                      : "border-gray-200 dark:border-gray-700",
                    fileItem.status === "error" &&
                      "border-red-400 dark:border-red-600"
                  )}
                >
                  {/* Image preview */}
                  {fileItem.preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={fileItem.preview}
                      alt={fileItem.name}
                      className="h-full w-full object-cover"
                      draggable={false}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-100 dark:bg-gray-800">
                      <ImageIcon
                        className="h-8 w-8 text-gray-400"
                        strokeWidth={1.5}
                      />
                    </div>
                  )}

                  {/* Cover label */}
                  {index === 0 && fileItem.status === "done" && (
                    <div className="absolute bottom-0 inset-x-0 bg-[#6C3CE1]/90 text-white text-[10px] font-medium text-center py-0.5">
                      Capa
                    </div>
                  )}

                  {/* Status overlays */}
                  {fileItem.status === "uploading" && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
                      <Loader2 className="h-6 w-6 animate-spin text-white" />
                      <span className="text-[10px] text-white mt-1">
                        Enviando...
                      </span>
                    </div>
                  )}
                  {fileItem.status === "pending" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <Loader2 className="h-5 w-5 animate-spin text-white" />
                    </div>
                  )}
                  {fileItem.status === "error" && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-500/30">
                      <AlertCircle className="h-5 w-5 text-white" />
                      <span className="text-[9px] text-white mt-0.5 px-1 text-center">
                        {fileItem.errorMessage || "Erro"}
                      </span>
                    </div>
                  )}
                  {fileItem.status === "done" && (
                    <div className="absolute top-1 left-1">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 drop-shadow" />
                    </div>
                  )}

                  {/* Progress bar */}
                  {(fileItem.status === "uploading" ||
                    fileItem.status === "pending") && (
                    <div className="absolute bottom-0 inset-x-0 h-1 bg-black/20">
                      <div
                        className="h-full bg-[#6C3CE1] transition-all duration-500"
                        style={{ width: `${fileItem.progress}%` }}
                      />
                    </div>
                  )}

                  {/* Drag handle */}
                  <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
                    <div className="flex h-5 w-5 items-center justify-center rounded bg-black/50 text-white">
                      <GripVertical className="h-3 w-3" />
                    </div>
                  </div>

                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      removeFile(fileItem.id);
                    }}
                    className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    aria-label={`Remover ${fileItem.name}`}
                  >
                    <X className="h-3 w-3" />
                  </button>

                  {/* Size label */}
                  {fileItem.size > 0 && fileItem.status === "done" && (
                    <div className="absolute bottom-0 right-0 bg-black/50 text-white text-[9px] px-1 py-0.5 rounded-tl">
                      {formatFileSize(fileItem.size)}
                    </div>
                  )}
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </div>
      )}
    </div>
  );
}
