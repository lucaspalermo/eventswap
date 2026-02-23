"use client";

import { useState, useCallback, useRef, type DragEvent, type ChangeEvent } from "react";
import { Upload, X, FileText, ImageIcon, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { uploadFile, deleteFile } from "@/lib/storage";

type BucketName = 'listings' | 'avatars' | 'contracts' | 'chat';

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
  file: File | null;
  preview: string | null;
  url: string | null;
  type: "image" | "pdf" | "other";
  name: string;
  size: number;
  status: "pending" | "uploading" | "done" | "error";
  errorMessage?: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileTypeFromUrl(url: string): "image" | "pdf" | "other" {
  const lower = url.toLowerCase();
  if (lower.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp)(\?|$)/)) return "image";
  if (lower.match(/\.pdf(\?|$)/)) return "pdf";
  return "other";
}

function getFileNameFromUrl(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    return pathname.split("/").pop() || "arquivo";
  } catch {
    return "arquivo";
  }
}

export function FileUpload({
  bucket,
  path,
  accept = "image/*,.pdf",
  multiple = true,
  maxFiles = 5,
  maxSizeMB = 5,
  onUpload,
  onError,
  existingFiles = [],
  className,
  label = "Enviar arquivos",
  description,
}: FileUploadProps) {
  const [files, setFiles] = useState<FileItem[]>(() =>
    existingFiles.map((url) => ({
      file: null,
      preview: getFileTypeFromUrl(url) === "image" ? url : null,
      url,
      type: getFileTypeFromUrl(url),
      name: getFileNameFromUrl(url),
      size: 0,
      status: "done" as const,
    }))
  );
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
    async (item: FileItem, index: number, allItems: FileItem[]): Promise<FileItem[]> => {
      if (!item.file) return allItems;

      const updated = [...allItems];
      updated[index] = { ...updated[index], status: "uploading" };

      try {
        const url = await uploadFile(bucket, item.file, path);
        updated[index] = {
          ...updated[index],
          status: "done",
          url,
          preview: updated[index].type === "image" ? url : updated[index].preview,
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erro ao enviar arquivo";
        updated[index] = {
          ...updated[index],
          status: "error",
          errorMessage: message,
        };
        onError?.(message);
      }

      return updated;
    },
    [bucket, path, onError]
  );

  const processFiles = useCallback(
    async (newFiles: FileList | File[]) => {
      setError(null);
      const fileArray = Array.from(newFiles);

      const doneCount = files.filter((f) => f.status === "done" || f.status === "uploading" || f.status === "pending").length;
      if (doneCount + fileArray.length > maxFiles) {
        const msg = `Maximo de ${maxFiles} arquivo${maxFiles > 1 ? "s" : ""} permitido${maxFiles > 1 ? "s" : ""}`;
        setError(msg);
        onError?.(msg);
        return;
      }

      const oversized = fileArray.find(
        (f) => f.size > maxSizeMB * 1024 * 1024
      );
      if (oversized) {
        const msg = `"${oversized.name}" excede o limite de ${maxSizeMB}MB`;
        setError(msg);
        onError?.(msg);
        return;
      }

      const newItems: FileItem[] = fileArray.map((file) => {
        const isImage = file.type.startsWith("image/");
        const isPdf = file.type === "application/pdf";

        return {
          file,
          preview: isImage ? URL.createObjectURL(file) : null,
          url: null,
          type: isImage ? "image" : isPdf ? "pdf" : "other",
          name: file.name,
          size: file.size,
          status: "pending" as const,
        };
      });

      let allItems = [...files, ...newItems];
      setFiles(allItems);

      // Upload each new file
      for (let i = 0; i < newItems.length; i++) {
        const globalIndex = files.length + i;
        allItems = await uploadSingleFile(allItems[globalIndex], globalIndex, allItems);
        setFiles([...allItems]);
      }

      emitUrls(allItems);
    },
    [files, maxFiles, maxSizeMB, onError, uploadSingleFile, emitUrls]
  );

  const removeFile = useCallback(
    async (index: number) => {
      const fileToRemove = files[index];

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

      const updated = files.filter((_, i) => i !== index);
      setFiles(updated);
      setError(null);
      emitUrls(updated);
    },
    [files, bucket, emitUrls]
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

  const isUploading = files.some((f) => f.status === "uploading" || f.status === "pending");

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
          error && "border-red-300 bg-red-50/50 dark:border-red-800 dark:bg-red-950/30"
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
          animate={isDragActive ? { scale: 1.1, y: -4 } : { scale: 1, y: 0 }}
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
          {isDragActive ? "Solte os arquivos aqui" : label}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {description ||
            `Arraste e solte ou clique para selecionar. Max ${maxSizeMB}MB por arquivo.`}
        </p>

        {isUploading && (
          <div className="mt-3 flex items-center gap-2 text-xs text-[#6C3CE1]">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Enviando...
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

      {/* File previews - Image grid for image-only uploads */}
      <AnimatePresence>
        {files.length > 0 && files.every((f) => f.type === "image") && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3"
          >
            {files.map((fileItem, index) => (
              <motion.div
                key={`${fileItem.name}-${index}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                className="relative group rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 aspect-square bg-gray-100 dark:bg-gray-800"
              >
                {fileItem.preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={fileItem.preview}
                    alt={fileItem.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-gray-400" strokeWidth={1.5} />
                  </div>
                )}

                {/* Status overlay */}
                {fileItem.status === "uploading" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <Loader2 className="h-6 w-6 animate-spin text-white" />
                  </div>
                )}
                {fileItem.status === "pending" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Loader2 className="h-5 w-5 animate-spin text-white" />
                  </div>
                )}
                {fileItem.status === "error" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-red-500/30">
                    <AlertCircle className="h-6 w-6 text-white" />
                  </div>
                )}
                {fileItem.status === "done" && (
                  <div className="absolute top-1.5 left-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 drop-shadow" />
                  </div>
                )}

                {/* Remove button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label={`Remover ${fileItem.name}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* File list for mixed file types */}
      <AnimatePresence>
        {files.length > 0 && !files.every((f) => f.type === "image") && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 space-y-2"
          >
            {files.map((fileItem, index) => (
              <motion.div
                key={`${fileItem.name}-${index}`}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ delay: index * 0.05 }}
                className="group flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-900"
              >
                {/* Thumbnail */}
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                  {fileItem.type === "image" && fileItem.preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={fileItem.preview}
                      alt={fileItem.name}
                      className="h-full w-full object-cover"
                    />
                  ) : fileItem.type === "pdf" ? (
                    <FileText
                      className="h-6 w-6 text-red-500"
                      strokeWidth={1.5}
                    />
                  ) : (
                    <ImageIcon
                      className="h-6 w-6 text-gray-400"
                      strokeWidth={1.5}
                    />
                  )}
                </div>

                {/* File info */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                    {fileItem.name}
                  </p>
                  <div className="flex items-center gap-2">
                    {fileItem.size > 0 && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatFileSize(fileItem.size)}
                      </p>
                    )}
                    {fileItem.status === "uploading" && (
                      <span className="flex items-center gap-1 text-xs text-[#6C3CE1]">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Enviando...
                      </span>
                    )}
                    {fileItem.status === "pending" && (
                      <span className="text-xs text-gray-400">Aguardando...</span>
                    )}
                    {fileItem.status === "done" && (
                      <span className="flex items-center gap-1 text-xs text-emerald-600">
                        <CheckCircle2 className="h-3 w-3" />
                        Enviado
                      </span>
                    )}
                    {fileItem.status === "error" && (
                      <span className="flex items-center gap-1 text-xs text-red-500">
                        <AlertCircle className="h-3 w-3" />
                        {fileItem.errorMessage || "Erro"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Remove button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-500/50 dark:hover:bg-red-950 dark:hover:text-red-400"
                  aria-label={`Remover ${fileItem.name}`}
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
