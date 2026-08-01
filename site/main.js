/**
 * Opens the device Messages app to the Artisan Connect Linq number
 * with a starter body so the booking chat can begin.
 */
const LINQ_E164 = "+14155680726";
const STARTER_BODY = "hi";

function buildSmsHref(phoneE164, body) {
  const digits = phoneE164.replace(/[^\d+]/g, "");
  const encoded = encodeURIComponent(body);
  const ua = navigator.userAgent || "";
  const iOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  // iOS uses &body= ; Android / others commonly use ?body=
  return iOS ? `sms:${digits}&body=${encoded}` : `sms:${digits}?body=${encoded}`;
}

function wireSmsLinks() {
  const href = buildSmsHref(LINQ_E164, STARTER_BODY);
  for (const el of document.querySelectorAll("[data-sms-link]")) {
    el.setAttribute("href", href);
  }
}

wireSmsLinks();
