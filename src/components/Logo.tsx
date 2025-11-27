interface LogoProps {
  className?: string;
  textClassName?: string;
  imageClassName?: string;
  align?: 'start' | 'center';
}

export function Logo({
  className = '',
  textClassName = '',
  imageClassName = '',
  align = 'start',
}: LogoProps) {
  return (
    <div
      className={`inline-flex items-center gap-3 ${
        align === 'center' ? 'justify-center' : ''
      } ${className}`}
    >
      <img
        src="/zackry-logo.png"
        alt="Zackry logo"
        className={`h-12 w-auto drop-shadow-sm ${imageClassName}`}
      />
      <span className={`font-bold text-slate-900 ${textClassName}`}>Zackry</span>
    </div>
  );
}
