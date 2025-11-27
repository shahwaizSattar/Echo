import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from './firebase';
import Constants from 'expo-constants';

/**
 * Send a Firebase password reset email to the provided address.
 * If Dynamic Links / deep link config is provided via `expo Constants.extra`,
 * the function will pass `actionCodeSettings` so the sent link opens inside the app.
 *
 * Expected `extra` keys (set these in `app.json` or `app.config.js`):
 * - PASSWORD_RESET_REDIRECT: fallback HTTPS url used by the action link (e.g. https://yourdomain.com/reset)
 * - DYNAMIC_LINK_DOMAIN: (optional) your Firebase Dynamic Links domain (e.g. xyz.page.link)
 * - IOS_BUNDLE_ID, ANDROID_PACKAGE_NAME
 */
export async function sendResetLink(email: string) {
  const extra = (Constants.expoConfig && (Constants.expoConfig as any).extra) || (Constants.manifest && (Constants.manifest as any).extra) || {};

  const actionCodeSettings: any = {
    url: extra.PASSWORD_RESET_REDIRECT || 'https://your-frontend.example/reset-password',
    handleCodeInApp: true
  };

  if (extra.IOS_BUNDLE_ID) actionCodeSettings.iOS = { bundleId: extra.IOS_BUNDLE_ID };
  if (extra.ANDROID_PACKAGE_NAME) actionCodeSettings.android = { packageName: extra.ANDROID_PACKAGE_NAME, installApp: true };
  if (extra.DYNAMIC_LINK_DOMAIN) actionCodeSettings.dynamicLinkDomain = extra.DYNAMIC_LINK_DOMAIN;

  // If no useful config provided, fall back to default (will open web flow)
  const hasConfig = !!(extra.PASSWORD_RESET_REDIRECT || extra.DYNAMIC_LINK_DOMAIN || extra.IOS_BUNDLE_ID || extra.ANDROID_PACKAGE_NAME);

  if (hasConfig) {
    return sendPasswordResetEmail(auth, email, actionCodeSettings as any);
  }

  // No actionCodeSettings - use default Firebase email (web flow)
  return sendPasswordResetEmail(auth, email);
}
