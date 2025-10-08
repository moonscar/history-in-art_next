export const normalizeTags = (raw: unknown): string[] => {
  if (Array.isArray(raw)) {
    return raw.filter((tag): tag is string => typeof tag === 'string' && tag.trim().length > 0);
  }

  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) {
      return [];
    }

    try {
      const parsed = JSON.parse(trimmed);

      if (Array.isArray(parsed)) {
        return normalizeTags(parsed);
      }

      if (typeof parsed === 'string' && parsed !== trimmed) {
        return normalizeTags(parsed);
      }
    } catch {
      // Swallow JSON parse errors and fall back to returning an empty array.
    }
  }

  return [];
};
