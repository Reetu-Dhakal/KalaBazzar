import { useRef, useState } from 'react';
import { Upload, X, ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface ImageFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  error?: string;
  helperText?: string;
  aspectClass?: string;
}

export default function ImageField({
  label,
  value,
  onChange,
  error,
  helperText,
  aspectClass = 'aspect-video',
}: ImageFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post('/upload/single', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const url = data.data?.url || data.data?.file?.url;
      if (url) {
        onChange(url);
        toast.success('Image uploaded');
      } else {
        toast.error('Upload failed — no URL returned');
      }
    } catch {
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1.5">{label}</label>

      <div
        className={cn(
          'rounded-lg border border-dashed border-border relative overflow-hidden group',
          aspectClass,
        )}
      >
        {value ? (
          <>
            <img
              src={value}
              alt={label}
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute top-2 right-2 rounded-full bg-black/60 text-white p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Remove image"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
          >
            {uploading ? (
              <span className="text-sm animate-pulse">Uploading...</span>
            ) : (
              <>
                <ImageIcon className="h-6 w-6" />
                <span className="text-xs">Click to upload or paste URL below</span>
              </>
            )}
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>

      <div className="mt-2 flex gap-2">
        <div className="flex-1">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="...or paste image URL"
            className="h-9 text-xs"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          <Upload className="h-4 w-4" />
          {uploading ? 'Uploading' : 'Upload'}
        </Button>
      </div>

      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
      {!error && helperText && (
        <p className="mt-1.5 text-xs text-muted-foreground">{helperText}</p>
      )}
    </div>
  );
}