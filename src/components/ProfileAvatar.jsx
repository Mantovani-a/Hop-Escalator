import { useState } from 'react';
import { getProfileInitials, getProfilePhotoPath } from '../utils/profileAvatar';

export default function ProfileAvatar({
  name,
  src,
  category = 'operators',
  size = 'md',
  className = '',
  decorative = false,
}) {
  const resolvedSrc = src || getProfilePhotoPath(name, category);
  const [failedSrc, setFailedSrc] = useState(null);
  const showImage = resolvedSrc && failedSrc !== resolvedSrc;

  return (
    <span
      className={`profile-avatar profile-avatar--${size}${className ? ` ${className}` : ''}`}
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : `Foto de ${name}`}
      aria-hidden={decorative || undefined}
    >
      <span className="profile-avatar__initials">{getProfileInitials(name)}</span>
      {showImage && (
        <img
          src={resolvedSrc}
          alt=""
          aria-hidden="true"
          onError={() => setFailedSrc(resolvedSrc)}
        />
      )}
    </span>
  );
}
