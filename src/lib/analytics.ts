// Simple analytics wrapper - can be swapped for Google Analytics, Mixpanel, PostHog, etc.

type EventName =
  | 'page_view'
  | 'listing_view'
  | 'listing_create'
  | 'purchase_start'
  | 'purchase_complete'
  | 'message_send'
  | 'review_submit'
  | 'search'
  | 'filter_change'
  | 'sign_up'
  | 'sign_in'
  | 'sign_out';

interface AnalyticsEvent {
  name: EventName;
  properties?: Record<string, string | number | boolean>;
}

class Analytics {
  private enabled: boolean;

  constructor() {
    this.enabled = typeof window !== 'undefined' && process.env.NODE_ENV === 'production';
  }

  track(event: AnalyticsEvent) {
    if (!this.enabled) {
      // In dev, just log
      if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
        console.debug('[Analytics]', event.name, event.properties);
      }
      return;
    }

    // Send to Google Analytics if available
    if (typeof window !== 'undefined' && (window as unknown as Record<string, unknown>).gtag) {
      (window as unknown as { gtag: (...args: unknown[]) => void }).gtag('event', event.name, event.properties);
    }
  }

  pageView(path: string) {
    this.track({ name: 'page_view', properties: { path } });
  }
}

export const analytics = new Analytics();
