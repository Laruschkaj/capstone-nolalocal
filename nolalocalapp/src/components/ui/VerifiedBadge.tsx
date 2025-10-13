interface VerifiedBadgeProps {
  size?: 'small' | 'medium' | 'large';
  position?: 'top-right' | 'inline';
}

export default function VerifiedBadge({ size = 'small', position = 'top-right' }: VerifiedBadgeProps) {
  const positionClasses = {
    'top-right': 'absolute top-5 right-5 z-10',
    'inline': 'inline-flex'
  };

  const iconSizes = {
    small: '24px',
    medium: '28px',
    large: '32px'
  };

  return (
    <span 
      className={`${positionClasses[position]} material-symbols-outlined drop-shadow-lg`}
      style={{ 
        fontSize: iconSizes[size],
        color: '#FFFFFF',
        fontVariationSettings: "'FILL' 1, 'wght' 600, 'GRAD' 0, 'opsz' 24"
      }}
      title="NolaLocal Verified"
      aria-label="NolaLocal Verified"
    >
      verified
    </span>
  );
}