const ABSOLUTE_URL_PROTOCOL = /^[a-zA-Z][a-zA-Z\d+.-]*:/;

function hasControlChars(value: string): boolean {
  for (let i = 0; i < value.length; i += 1) {
    const code = value.charCodeAt(i);
    if (code <= 31 || code === 127) return true;
  }
  return /\s/.test(value);
}

function normalizeUrlInput(raw: string): string {
  return raw.trim();
}

function isRelativeUrl(value: string): boolean {
  return value.startsWith("/") || value.startsWith("./") || value.startsWith("../") || value.startsWith("#");
}

export function sanitizeLinkHref(raw?: string): string {
  if (!raw) return "#";
  const value = normalizeUrlInput(raw);
  if (!value || hasControlChars(value)) return "#";
  if (isRelativeUrl(value)) return value;

  if (!ABSOLUTE_URL_PROTOCOL.test(value)) return "#";

  try {
    const protocol = new URL(value).protocol.toLowerCase();
    if (protocol === "http:" || protocol === "https:" || protocol === "mailto:" || protocol === "tel:") {
      return value;
    }
  } catch {
    return "#";
  }

  return "#";
}

export function sanitizeImageSrc(raw?: string): string {
  if (!raw) return "";
  const value = normalizeUrlInput(raw);
  if (!value || hasControlChars(value)) return "";
  if (isRelativeUrl(value)) return value;

  if (!ABSOLUTE_URL_PROTOCOL.test(value)) return "";

  try {
    const protocol = new URL(value).protocol.toLowerCase();
    if (protocol === "http:" || protocol === "https:" || protocol === "blob:" || protocol === "data:") {
      return value;
    }
  } catch {
    return "";
  }

  return "";
}
