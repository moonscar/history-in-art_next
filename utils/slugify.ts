// Utility function to convert strings to URL-friendly slugs
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    // Replace spaces with hyphens
    .replace(/\s+/g, '-')
    // Remove special characters except hyphens and alphanumeric
    .replace(/[^\w\-]+/g, '')
    // Replace multiple hyphens with single hyphen
    .replace(/\-\-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

// Generate a unique slug by appending a number if needed
export function generateUniqueSlug(baseSlug: string, existingSlugs: string[]): string {
  let slug = baseSlug;
  let counter = 1;
  
  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
}

// Extract slug from a combined id-slug string (for backward compatibility)
export function extractSlugFromIdSlug(idSlug: string): string {
  const parts = idSlug.split('-');
  if (parts.length > 1) {
    // Remove the first part (assumed to be UUID) and rejoin
    return parts.slice(1).join('-');
  }
  return idSlug;
}