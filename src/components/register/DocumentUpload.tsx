import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Upload, FileText } from "lucide-react";

interface DocumentUploadProps {
  documents: {
    diploma: File | null;
    license: File | null;
    others: File[];
  };
  handleFileChange: (type: 'diploma' | 'license' | 'others', files: FileList | null) => void;
  removeFile: (type: 'diploma' | 'license' | 'others', index?: number) => void;
}

export const DocumentUpload = ({ documents, handleFileChange, removeFile }: DocumentUploadProps) => {
  return (
    <div className="space-y-4 border-t pt-4">
      <h3 className="text-lg font-semibold">Documents justificatifs</h3>
      <p className="text-sm text-muted-foreground">
        Veuillez télécharger vos documents pour faciliter le traitement de votre demande (optionnel)
      </p>

      {/* Diploma */}
      <div>
        <Label htmlFor="diploma">Diplôme médical</Label>
        {documents.diploma ? (
          <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/50">
            <FileText className="h-4 w-4" />
            <span className="text-sm flex-1">{documents.diploma.name}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeFile('diploma')}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="relative">
            <Input
              id="diploma"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleFileChange('diploma', e.target.files)}
              className="cursor-pointer"
            />
            <Upload className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
        )}
      </div>

      {/* License */}
      <div>
        <Label htmlFor="license">Licence d'exercice</Label>
        {documents.license ? (
          <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/50">
            <FileText className="h-4 w-4" />
            <span className="text-sm flex-1">{documents.license.name}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeFile('license')}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="relative">
            <Input
              id="license"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleFileChange('license', e.target.files)}
              className="cursor-pointer"
            />
            <Upload className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
        )}
      </div>

      {/* Other documents */}
      <div>
        <Label htmlFor="others">Autres documents (optionnel)</Label>
        {documents.others.length > 0 && (
          <div className="space-y-2 mb-2">
            {documents.others.map((file, index) => (
              <div key={index} className="flex items-center gap-2 p-2 border rounded-md bg-muted/50">
                <FileText className="h-4 w-4" />
                <span className="text-sm flex-1">{file.name}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile('others', index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
        <div className="relative">
          <Input
            id="others"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            multiple
            onChange={(e) => handleFileChange('others', e.target.files)}
            className="cursor-pointer"
          />
          <Upload className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        </div>
      </div>
    </div>
  );
};
