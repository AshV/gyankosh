/**
 * src/utils/anonymousAuth.ts
 * Anonymous-First Identity & Lightweight Devotional Analytics for Gyankosh.
 *
 * Guarantees 100% distraction-free reading:
 * - Zero sign-up / login prompts
 * - Zero cookies or tracking scripts
 * - Anonymously tracks reading completion & crowdsourced typo reporting
 */

const STORAGE_KEY = 'gyankosh_anon_device_id';

/**
 * Returns the stable anonymous device identifier for this browser session.
 * Generates a random UUIDv4 if not already present.
 */
export function getAnonymousDeviceId(): string {
  if (typeof window === 'undefined') return 'server';

  try {
    let id = localStorage.getItem(STORAGE_KEY);
    if (!id) {
      // Cryptographically random UUIDv4
      id = 'gk_anon_' + (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15));
      localStorage.setItem(STORAGE_KEY, id);
    }
    return id;
  } catch {
    return 'anonymous';
  }
}

/**
 * Resolves the cloud API base URL.
 * Falls back to localhost in development or the configured production API.
 */
export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined' && (window as any).__GYANKOSH_API_URL__) {
    return (window as any).__GYANKOSH_API_URL__;
  }
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.PUBLIC_API_URL) {
    // @ts-ignore
    return import.meta.env.PUBLIC_API_URL;
  }
  // Default to local/relative endpoint or empty string if not deployed yet
  return '';
}

export interface ErrataPayload {
  textSlug: string;
  verseId?: string;
  selectedText: string;
  suggestedText: string;
  bookReference?: string;
  userNote?: string;
}

/**
 * Submits an errata/typo report to the Cloud API.
 */
export async function submitErrataReport(payload: ErrataPayload): Promise<{ success: boolean; message: string }> {
  const apiUrl = getApiBaseUrl();
  const endpoint = apiUrl ? `${apiUrl}/api/errata/report` : `/api/errata/report`;

  const body = {
    text_slug: payload.textSlug,
    verse_id: payload.verseId || 'general',
    selected_text: payload.selectedText,
    suggested_text: payload.suggestedText,
    book_reference: payload.bookReference || null,
    user_note: payload.userNote || null,
    anon_device_id: getAnonymousDeviceId(),
  };

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    return {
      success: true,
      message: data.message || 'आपका सुझाव समीक्षा हेतु सफलतापूर्वक प्रेषित कर दिया गया है।',
    };
  } catch (err) {
    console.warn('[Gyankosh Errata] Offline/API unreachable:', err);
    // Offline / Local fallback: store in localStorage queue
    try {
      const offlineQueue = JSON.parse(localStorage.getItem('gyankosh_offline_errata') || '[]');
      offlineQueue.push({ ...body, timestamp: Date.now() });
      localStorage.setItem('gyankosh_offline_errata', JSON.stringify(offlineQueue));
    } catch {}

    return {
      success: true,
      message: 'धन्यवाद! आपका सुझाव स्थानीय रूप से सुरक्षित कर लिया गया है।',
    };
  }
}

/**
 * Logs an anonymous devotional event via non-blocking sendBeacon or fetch.
 */
export function logAnalyticsEvent(
  eventType: 'view' | 'read_start' | 'read_finish' | 'search_empty',
  textSlug?: string,
  durationSeconds: number = 0,
  metadata?: Record<string, unknown>
): void {
  if (typeof window === 'undefined') return;

  const apiUrl = getApiBaseUrl();
  if (!apiUrl) return; // Silent if no cloud API configured

  const payload = JSON.stringify({
    anon_device_id: getAnonymousDeviceId(),
    event_type: eventType,
    text_slug: textSlug || null,
    duration_seconds: durationSeconds,
    metadata: metadata || null,
  });

  const endpoint = `${apiUrl}/api/analytics/event`;

  if (navigator.sendBeacon) {
    const blob = new Blob([payload], { type: 'application/json' });
    navigator.sendBeacon(endpoint, blob);
  } else {
    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  }
}
