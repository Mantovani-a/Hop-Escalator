const PROFILE_CATEGORIES = new Set(['operators', 'leadership']);

export const slugifyProfileName = (name = '') => name
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '');

export const getProfilePhotoPath = (name, category = 'operators') => {
  const safeCategory = PROFILE_CATEGORIES.has(category) ? category : 'operators';
  return `/assets/profiles/${safeCategory}/${slugifyProfileName(name)}.png`;
};

export const getProfileInitials = (name = '') => name
  .trim()
  .split(/\s+/)
  .filter(Boolean)
  .slice(0, 2)
  .map((part) => part[0])
  .join('')
  .toUpperCase();
