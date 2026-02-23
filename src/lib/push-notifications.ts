// ============================================================================
// Push Notifications Client Library
// Handles Web Push API subscription lifecycle and Supabase persistence
// ============================================================================

import { createClient } from '@/lib/supabase/client';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Converts a base64-encoded VAPID public key to a Uint8Array
 * required by the PushManager.subscribe() method.
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Extracts the p256dh and auth keys from a PushSubscription.
 */
function getSubscriptionKeys(subscription: PushSubscription): { p256dh: string; auth: string } {
  const p256dhKey = subscription.getKey('p256dh');
  const authKey = subscription.getKey('auth');

  if (!p256dhKey || !authKey) {
    throw new Error('Push subscription keys not available');
  }

  const p256dhArray = Array.from(new Uint8Array(p256dhKey));
  const authArray = Array.from(new Uint8Array(authKey));

  return {
    p256dh: btoa(String.fromCharCode.apply(null, p256dhArray)),
    auth: btoa(String.fromCharCode.apply(null, authArray)),
  };
}

// ---------------------------------------------------------------------------
// Push Notifications API
// ---------------------------------------------------------------------------

export const pushNotifications = {
  /**
   * Checks whether the Push API and Service Workers are supported in this browser.
   */
  isSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    );
  },

  /**
   * Returns the current Notification permission state.
   * Falls back to 'denied' when not supported.
   */
  getPermission(): NotificationPermission {
    if (!this.isSupported()) return 'denied';
    return Notification.permission;
  },

  /**
   * Requests notification permission from the user.
   * Returns the resulting permission state.
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) return 'denied';
    const permission = await Notification.requestPermission();
    return permission;
  },

  /**
   * Subscribes the user to push notifications.
   *
   * 1. Ensures the service worker is registered and ready.
   * 2. Requests notification permission if not yet granted.
   * 3. Creates a PushSubscription using the VAPID public key.
   * 4. Persists the subscription to Supabase `push_subscriptions` table.
   * 5. Updates the user's `push_enabled` flag in `profiles`.
   *
   * Returns the PushSubscription on success, or null on failure.
   */
  async subscribe(): Promise<PushSubscription | null> {
    if (!this.isSupported()) return null;

    try {
      // Ensure permission
      const permission = await this.requestPermission();
      if (permission !== 'granted') return null;

      // Get the VAPID public key
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        console.warn('[PushNotifications] NEXT_PUBLIC_VAPID_PUBLIC_KEY not set');
        return null;
      }

      // Register / get service worker
      const registration = await navigator.serviceWorker.ready;

      // Check for existing subscription
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        // Already subscribed - ensure it's saved in DB
        await this.saveSubscription(existingSubscription);
        return existingSubscription;
      }

      // Create new subscription
      const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey.buffer as ArrayBuffer,
      });

      // Save to database
      await this.saveSubscription(subscription);

      return subscription;
    } catch (error) {
      console.error('[PushNotifications] Subscribe failed:', error);
      return null;
    }
  },

  /**
   * Unsubscribes the user from push notifications.
   *
   * 1. Retrieves the current PushSubscription.
   * 2. Calls unsubscribe() on it.
   * 3. Removes the subscription from Supabase.
   * 4. Updates the user's `push_enabled` flag.
   */
  async unsubscribe(): Promise<void> {
    if (!this.isSupported()) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        const endpoint = subscription.endpoint;

        // Unsubscribe from browser
        await subscription.unsubscribe();

        // Remove from database
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          await supabase
            .from('push_subscriptions')
            .delete()
            .eq('user_id', user.id)
            .eq('endpoint', endpoint);

          // Update push_enabled flag
          await supabase
            .from('profiles')
            .update({ push_enabled: false, updated_at: new Date().toISOString() })
            .eq('id', user.id);
        }
      }
    } catch (error) {
      console.error('[PushNotifications] Unsubscribe failed:', error);
    }
  },

  /**
   * Returns the current PushSubscription if one exists.
   */
  async getSubscription(): Promise<PushSubscription | null> {
    if (!this.isSupported()) return null;

    try {
      const registration = await navigator.serviceWorker.ready;
      return await registration.pushManager.getSubscription();
    } catch {
      return null;
    }
  },

  /**
   * Persists a PushSubscription to the Supabase database.
   * Also updates the user's `push_enabled` profile flag.
   */
  async saveSubscription(subscription: PushSubscription): Promise<void> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.warn('[PushNotifications] No authenticated user, cannot save subscription');
      return;
    }

    const { p256dh, auth } = getSubscriptionKeys(subscription);

    // Upsert subscription (unique on user_id + endpoint)
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert(
        {
          user_id: user.id,
          endpoint: subscription.endpoint,
          p256dh,
          auth,
        },
        { onConflict: 'user_id,endpoint' }
      );

    if (error) {
      console.error('[PushNotifications] Failed to save subscription:', error);
      return;
    }

    // Update push_enabled flag on profile
    await supabase
      .from('profiles')
      .update({ push_enabled: true, updated_at: new Date().toISOString() })
      .eq('id', user.id);
  },

  /**
   * Sends a test notification via the service worker (local only, no server push).
   * Useful for verifying that the notification system works.
   */
  async sendTestNotification(): Promise<void> {
    if (!this.isSupported()) return;

    const permission = this.getPermission();
    if (permission !== 'granted') return;

    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification('EventSwap - Teste', {
      body: 'Suas notificacoes estao funcionando! Voce sera avisado sobre novas ofertas e mensagens.',
      icon: '/icons/icon.svg',
      badge: '/icons/icon.svg',
      tag: 'test-notification',
      data: { url: '/settings/notifications' },
    } as NotificationOptions);
  },
};
