import { useState, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X, Upload, FileText, Eye, Image, File } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DocumentUploadProps {
  documents: {
    diploma: File | null;
    license: File | null;
    others: File[];
  };
  handleFileChange: (type: 'diploma' | 'license' | 'others', files: FileList | null) => void;
  removeFile: (type: 'diploma' | 'license' | 'others', index?: number) => void;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const isImageFile = (file: File): boolean => {
  return file.type.startsWith('image/');
};

const isPDFFile = (file: File): boolean => {
  return file.type === 'application/pdf';
};

interface FilePreviewCardProps {
  file: File;
  onRemove: () => void;
  label: string;
}

const FilePreviewCard = ({ file, onRemove, label }: FilePreviewCardProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useState(() => {
    if (isImageFile(file)) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  });

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        className="group relative border rounded-xl overflow-hidden bg-card hover:shadow-md transition-all duration-200"
      >
        {/* Preview thumbnail */}
        <div className="relative h-32 bg-muted/50 flex items-center justify-center overflow-hidden">
          {isImageFile(file) && previewUrl ? (
            <img
              src={previewUrl}
              alt={file.name}
              className="w-full h-full object-cover"
            />
          ) : isPDFFile(file) ? (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <FileText className="h-12 w-12" />
              <span className="text-xs">PDF</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <File className="h-12 w-12" />
              <span className="text-xs">{file.name.split('.').pop()?.toUpperCase()}</span>
            </div>
          )}
          
          {/* Overlay with actions */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            {isImageFile(file) && previewUrl && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setShowPreview(true)}
                className="h-8 w-8 p-0"
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={onRemove}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* File info */}
        <div className="p-3">
          <p className="text-sm font-medium truncate" title={file.name}>
            {file.name}
          </p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-muted-foreground">
              {formatFileSize(file.size)}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
              {label}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Full preview dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{file.name}</DialogTitle>
          </DialogHeader>
          {previewUrl && (
            <div className="flex items-center justify-center max-h-[70vh] overflow-auto">
              <img
                src={previewUrl}
                alt={file.name}
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

interface DropZoneProps {
  id: string;
  label: string;
  description: string;
  accept: string;
  multiple?: boolean;
  onFileSelect: (files: FileList | null) => void;
  icon?: React.ReactNode;
}

const DropZone = ({ id, label, description, accept, multiple, onFileSelect, icon }: DropZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    onFileSelect(e.dataTransfer.files);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`
        relative cursor-pointer border-2 border-dashed rounded-xl p-6
        transition-all duration-200 text-center
        ${isDragging 
          ? 'border-primary bg-primary/5 scale-[1.02]' 
          : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
        }
      `}
    >
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={(e) => onFileSelect(e.target.files)}
        className="hidden"
      />
      <div className="flex flex-col items-center gap-2">
        <div className={`
          p-3 rounded-full transition-colors
          ${isDragging ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}
        `}>
          {icon || <Upload className="h-6 w-6" />}
        </div>
        <div>
          <p className="font-medium text-sm">{label}</p>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </div>
      </div>
    </div>
  );
};

export const DocumentUpload = ({ documents, handleFileChange, removeFile }: DocumentUploadProps) => {
  const totalRequired = 2;
  const uploadedCount = (documents.diploma ? 1 : 0) + (documents.license ? 1 : 0);
  const progressPercentage = (uploadedCount / totalRequired) * 100;

  return (
    <div className="space-y-6 border-t pt-6">
      {/* Header with progress */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Documents justificatifs</h3>
            <p className="text-sm text-muted-foreground">
              Téléchargez vos documents pour accélérer le traitement
            </p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-primary">{uploadedCount}</span>
            <span className="text-muted-foreground">/{totalRequired}</span>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="relative h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={`
              absolute inset-y-0 left-0 rounded-full transition-colors
              ${progressPercentage === 100 
                ? 'bg-green-500' 
                : 'bg-primary'
              }
            `}
          />
        </div>
        
        {progressPercentage === 100 && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-green-600 font-medium flex items-center gap-1"
          >
            ✓ Tous les documents requis ont été téléchargés
          </motion.p>
        )}
      </div>

      {/* Uploaded files preview grid */}
      <AnimatePresence mode="popLayout">
        {(documents.diploma || documents.license || documents.others.length > 0) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-2 sm:grid-cols-3 gap-3"
          >
            {documents.diploma && (
              <FilePreviewCard
                file={documents.diploma}
                onRemove={() => removeFile('diploma')}
                label="Diplôme"
              />
            )}
            {documents.license && (
              <FilePreviewCard
                file={documents.license}
                onRemove={() => removeFile('license')}
                label="Licence"
              />
            )}
            {documents.others.map((file, index) => (
              <FilePreviewCard
                key={`other-${index}`}
                file={file}
                onRemove={() => removeFile('others', index)}
                label="Autre"
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload zones */}
      <div className="grid gap-4">
        {!documents.diploma && (
          <DropZone
            id="diploma"
            label="Diplôme médical"
            description="PDF, JPG ou PNG (max 10MB)"
            accept=".pdf,.jpg,.jpeg,.png"
            onFileSelect={(files) => handleFileChange('diploma', files)}
            icon={<Image className="h-6 w-6" />}
          />
        )}

        {!documents.license && (
          <DropZone
            id="license"
            label="Licence d'exercice"
            description="PDF, JPG ou PNG (max 10MB)"
            accept=".pdf,.jpg,.jpeg,.png"
            onFileSelect={(files) => handleFileChange('license', files)}
            icon={<FileText className="h-6 w-6" />}
          />
        )}

        <DropZone
          id="others"
          label="Autres documents (optionnel)"
          description="Ajoutez d'autres justificatifs si nécessaire"
          accept=".pdf,.jpg,.jpeg,.png"
          multiple
          onFileSelect={(files) => handleFileChange('others', files)}
          icon={<Upload className="h-6 w-6" />}
        />
      </div>

      {/* Help text */}
      <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-sm">
        <div className="p-1 rounded bg-primary/10 text-primary mt-0.5">
          <FileText className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground">
          <p className="font-medium text-foreground mb-1">Formats acceptés</p>
          <p>PDF, JPG, JPEG, PNG • Taille maximale : 10 MB par fichier</p>
        </div>
      </div>
    </div>
  );
};
