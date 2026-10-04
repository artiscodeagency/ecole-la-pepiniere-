const CAMEROON_PREFIX = "237";

/** International number for a local Cameroonian number such as "694 090 919". */
function toInternational(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits.length === 9 ? `${CAMEROON_PREFIX}${digits}` : digits;
}

/** `tel:` link for a local Cameroonian number. */
export function telUrl(phone: string) {
  return `tel:+${toInternational(phone)}`;
}

/** `wa.me` link to a local Cameroonian number, with an optional pre-filled message. */
export function whatsappUrl(phone: string, text?: string) {
  const query = text ? `?text=${encodeURIComponent(text)}` : "";
  return `https://wa.me/${toInternational(phone)}${query}`;
}

/** A bold title, then each filled field as a bold label followed by its value. */
export function formatWhatsAppMessage(
  title: string,
  fields: readonly (readonly [label: string, value: string])[],
) {
  const blocks = fields
    .filter(([, value]) => value.trim())
    .map(([label, value]) => `*${label}*\n${value.trim()}`);
  return [`*${title}*`, ...blocks].join("\n\n");
}

/** Opens WhatsApp in a new tab, or in the current one when pop-ups are blocked. */
export function openWhatsApp(url: string) {
  const opened = window.open(url, "_blank");
  if (opened) {
    opened.opener = null;
  } else {
    window.location.href = url;
  }
}
