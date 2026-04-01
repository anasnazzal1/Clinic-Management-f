import { useRef, useState } from 'react';
import { usersApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Camera, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const BASE = 'http://localhost:3000';

interface Props {
  userId: string;           // User._id (not linkedId)
  currentImage?: string;    // existing profileImage URL
  name: string;             // for initials fallback
  size?: 'sm' | 'md' | 'lg';
  onUpdate?: (newUrl: string | null) => void;
  readOnly?: boolean;       // hide edit controls
}

const SIZES = {
  sm:  'w-12 h-12 text-sm',
  md:  'w-20 h-20 text-xl',
  lg:  'w-28 h-28 text-3xl',
};

const AvatarUpload = ({ userId, currentImage, name, size = 'md', onUpdate, readOnly = false }: Props) => {
  const [preview, setPreview]   = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);
  const inputRef                = useRef<HTMLInputElement>(null);

  const initials = name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  const displaySrc = preview ?? (currentImage ? `${BASE}${currentImage}?t=${Date.now()}` : null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) { toast.error('Only JPG and PNG files are allowed.'); return; }
    if (file.size > 2 * 1024 * 1024) { toast.error('File must be under 2 MB.'); return; }
    // Show preview immediately
    const reader = new FileReader();
    reader.onload = ev => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    // Upload
    upload(file);
  };

  const upload = async (file: File) => {
    setLoading(true);
    try {
      const { data } = await usersApi.uploadImage(userId, file);
      setPreview(null);
      onUpdate?.(data.profileImage ?? null);
      toast.success('Profile image updated.');
    } catch (e: any) {
      setPreview(null);
      toast.error(e.response?.data?.message || 'Upload failed.');
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await usersApi.deleteImage(userId);
      setPreview(null);
      onUpdate?.(null);
      toast.success('Profile image removed.');
    } catch { toast.error('Failed to remove image.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Avatar circle */}
      <div className={`relative ${SIZES[size]} rounded-full shrink-0`}>
        {displaySrc ? (
          <img src={displaySrc} alt={name} className="w-full h-full rounded-full object-cover border-2 border-border" />
        ) : (
          <div className={`w-full h-full rounded-full gradient-primary flex items-center justify-center border-2 border-border`}>
            <span className="font-bold text-primary-foreground">{initials}</span>
          </div>
        )}
        {loading && (
          <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-white animate-spin" />
          </div>
        )}
        {!readOnly && !loading && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors"
            title="Change photo"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Action buttons */}
      {!readOnly && (
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()} disabled={loading} className="gap-1 text-xs">
            <Camera className="w-3 h-3" /> {currentImage || preview ? 'Change' : 'Upload'}
          </Button>
          {(currentImage || preview) && (
            <Button type="button" variant="ghost" size="sm" onClick={handleDelete} disabled={loading} className="gap-1 text-xs text-destructive hover:text-destructive">
              <Trash2 className="w-3 h-3" /> Remove
            </Button>
          )}
        </div>
      )}

      <input ref={inputRef} type="file" accept="image/jpeg,image/jpg,image/png" className="hidden" onChange={handleFile} />
    </div>
  );
};

export default AvatarUpload;
