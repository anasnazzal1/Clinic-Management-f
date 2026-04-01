const BASE = 'http://localhost:3000';

interface Props {
  name: string;
  image?: string | null;
  size?: 'xs' | 'sm' | 'md';
}

const SIZES = {
  xs: 'w-7 h-7 text-xs',
  sm: 'w-9 h-9 text-sm',
  md: 'w-11 h-11 text-base',
};

const Avatar = ({ name, image, size = 'sm' }: Props) => {
  const initials = name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  const src = image ? `${BASE}${image}` : null;

  return src ? (
    <img
      src={src}
      alt={name}
      className={`${SIZES[size]} rounded-full object-cover shrink-0 border border-border`}
    />
  ) : (
    <div className={`${SIZES[size]} rounded-full gradient-primary flex items-center justify-center shrink-0`}>
      <span className="font-bold text-primary-foreground leading-none">{initials}</span>
    </div>
  );
};

export default Avatar;
