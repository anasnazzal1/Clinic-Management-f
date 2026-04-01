import { useRef, useState } from 'react';
import { usersApi } from '@/lib/api';
import { Camera, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const BASE = 'http://localhost:3000';

interface Props {
  userId: string;          // User._id to upload against
  currentImage?: string | null;
  name: string;
  onUpdate: (newUrl: string | null) => void;
}

const InlineAvatarUpload = ({ userId, currentImage, name, onUpdate }: Props) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading]  = useState(false);
  const inputRef               = useRef<HTMLInputElement>(null);

  const initials = name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  const displaySrc = preview ?? (currentImage ? `${BASE}${currentImage}` : null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) { toast.error('Only JPG and PNG files are allowed.'); return; }
    if (file.size > 2 * 1024 * 1024) { toast.error('File must be under 2 MB.'); return; }
    const reader = new FileReader();
    reader.onload = ev => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    upload(file);
  };

  const upload = async (file: File) => {
    setLoading(true);
    try {
      const { data } = await usersApi.uploadImage(userId, file);
      setPreview(null);
      onUpdate(data.profileImage ?? null);
      toast.success('Image updated.');
    } catch (err: any) {
      setPreview(null);
      toast.error(err.response?.data?.message || 'Upload failed.');
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="relative w-8 h-8 shrink-0 group">
      {/* Avatar */}
      {displaySrc ? (
        <img src={displaySrc} alt={name} className="w-8 h-8 rounded-full object-cover border border-border" />
      ) : (
        <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
          <span className="text-xs font-bold text-primary-foreground leading-none">{initials}</span>
        </div>
      )}

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
          <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
        </div>
      )}

      {/* Camera button — appears on hover */}
      {!loading && userId && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          title="Upload photo"
          className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition-colors"
        >
          <Camera className="w-3.5 h-3.5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
};

export default InlineAvatarUpload;
