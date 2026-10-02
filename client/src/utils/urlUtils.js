export const isValidGoogleMapsUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed) return true; // empty is allowed as optional
  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.toLowerCase();
    return (
      host.includes('maps.google.') ||
      host.includes('google.com') ||
      host.includes('goo.gl') ||
      host.includes('maps.app.goo.gl') ||
      parsed.protocol === 'http:' ||
      parsed.protocol === 'https:'
    );
  } catch (e) {
    return false;
  }
};

export const openInMaps = (url) => {
  if (!url || typeof url !== 'string') return;
  let targetUrl = url.trim();
  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    targetUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(targetUrl)}`;
  }
  window.open(targetUrl, '_blank', 'noopener,noreferrer');
};
