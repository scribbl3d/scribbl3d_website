/**
 * Email Verification Utility
 * Prevents hard bounces by validating email addresses before sending
 */

import dns from 'dns';
import { promisify } from 'util';

const resolveMx = promisify(dns.resolveMx);

interface EmailVerificationResult {
  isValid: boolean;
  reason?: string;
  shouldSend: boolean;
}

/**
 * Disposable/temporary email domains to block
 */
const DISPOSABLE_DOMAINS = new Set([
  'tempmail.com',
  'guerrillamail.com',
  'mailinator.com',
  '10minutemail.com',
  'throwaway.email',
  'temp-mail.org',
  'fakeinbox.com',
  'yopmail.com',
  'trashmail.com',
  'getnada.com',
]);

/**
 * Check if email domain has valid MX records
 */
async function hasMxRecords(domain: string): Promise<boolean> {
  try {
    const addresses = await resolveMx(domain);
    return addresses && addresses.length > 0;
  } catch (error) {
    return false;
  }
}

/**
 * Check if email is from a disposable/temporary email service
 */
function isDisposableEmail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase();
  return DISPOSABLE_DOMAINS.has(domain);
}

/**
 * Basic email format validation
 */
function isValidEmailFormat(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Check for common typos in popular domains
 */
function hasCommonTypo(email: string): { hasTypo: boolean; suggestion?: string } {
  const domain = email.split('@')[1]?.toLowerCase();
  const localPart = email.split('@')[0];
  
  const typoMap: Record<string, string> = {
    'gmial.com': 'gmail.com',
    'gmai.com': 'gmail.com',
    'gmil.com': 'gmail.com',
    'yahooo.com': 'yahoo.com',
    'yaho.com': 'yahoo.com',
    'hotmial.com': 'hotmail.com',
    'hotmai.com': 'hotmail.com',
    'outlok.com': 'outlook.com',
    'outloo.com': 'outlook.com',
  };
  
  if (typoMap[domain]) {
    return {
      hasTypo: true,
      suggestion: `${localPart}@${typoMap[domain]}`,
    };
  }
  
  return { hasTypo: false };
}

/**
 * SMTP verification - Check if specific email account exists
 * WARNING: This is slow (2-5 seconds) and some servers block it
 * Use sparingly and only for critical flows
 */
async function verifySMTP(email: string): Promise<boolean> {
  // Note: SMTP verification requires a mail server connection
  // This is a placeholder - actual implementation would use net.Socket
  // For production, consider using a service like:
  // - ZeroBounce API
  // - NeverBounce API
  // - EmailListVerify API
  // These services do real SMTP verification at scale
  
  // For now, return true (skip SMTP check)
  // Uncomment and implement if you need this level of verification
  return true;
}

/**
 * Comprehensive email verification
 * Use this before sending emails to prevent hard bounces
 */
export async function verifyEmail(
  email: string,
  options: {
    skipSMTP?: boolean; // Skip slow SMTP verification (default: true)
  } = {}
): Promise<EmailVerificationResult> {
  const { skipSMTP = true } = options;
  
  // 1. Basic format validation
  if (!isValidEmailFormat(email)) {
    return {
      isValid: false,
      reason: 'Invalid email format',
      shouldSend: false,
    };
  }
  
  // 2. Check for disposable emails
  if (isDisposableEmail(email)) {
    return {
      isValid: false,
      reason: 'Disposable email address not allowed',
      shouldSend: false,
    };
  }
  
  // 3. Check for common typos
  const typoCheck = hasCommonTypo(email);
  if (typoCheck.hasTypo) {
    return {
      isValid: false,
      reason: `Possible typo detected. Did you mean ${typoCheck.suggestion}?`,
      shouldSend: false,
    };
  }
  
  // 4. Verify domain has MX records (DNS check)
  const domain = email.split('@')[1];
  const hasMx = await hasMxRecords(domain);
  
  if (!hasMx) {
    return {
      isValid: false,
      reason: 'Email domain does not exist or cannot receive emails',
      shouldSend: false,
    };
  }
  
  // 5. SMTP verification (optional, slow)
  if (!skipSMTP) {
    const smtpValid = await verifySMTP(email);
    if (!smtpValid) {
      return {
        isValid: false,
        reason: 'Email account does not exist',
        shouldSend: false,
      };
    }
  }
  
  // All checks passed
  return {
    isValid: true,
    shouldSend: true,
  };
}

/**
 * Quick synchronous validation (no DNS check)
 * Use for real-time form validation
 */
export function quickValidateEmail(email: string): EmailVerificationResult {
  if (!isValidEmailFormat(email)) {
    return {
      isValid: false,
      reason: 'Invalid email format',
      shouldSend: false,
    };
  }
  
  if (isDisposableEmail(email)) {
    return {
      isValid: false,
      reason: 'Disposable email address not allowed',
      shouldSend: false,
    };
  }
  
  const typoCheck = hasCommonTypo(email);
  if (typoCheck.hasTypo) {
    return {
      isValid: false,
      reason: `Possible typo detected. Did you mean ${typoCheck.suggestion}?`,
      shouldSend: false,
    };
  }
  
  return {
    isValid: true,
    shouldSend: true,
  };
}

/**
 * Sanitize email for logging (mask middle part)
 */
export function maskEmail(email: string): string {
  const [localPart, domain] = email.split('@');
  if (localPart.length <= 2) {
    return `${localPart[0]}***@${domain}`;
  }
  return `${localPart[0]}${'*'.repeat(localPart.length - 2)}${localPart[localPart.length - 1]}@${domain}`;
}

/**
 * Track failed email attempts to prevent repeated sends
 */
const failedEmailCache = new Map<string, { count: number; lastAttempt: number }>();

export function shouldRetryEmail(email: string): boolean {
  const cached = failedEmailCache.get(email);
  if (!cached) return true;
  
  const hoursSinceLastAttempt = (Date.now() - cached.lastAttempt) / (1000 * 60 * 60);
  
  // Don't retry if failed 3+ times in last 24 hours
  if (cached.count >= 3 && hoursSinceLastAttempt < 24) {
    return false;
  }
  
  // Reset count after 24 hours
  if (hoursSinceLastAttempt >= 24) {
    failedEmailCache.delete(email);
    return true;
  }
  
  return true;
}

export function recordFailedEmail(email: string): void {
  const cached = failedEmailCache.get(email);
  if (cached) {
    cached.count++;
    cached.lastAttempt = Date.now();
  } else {
    failedEmailCache.set(email, { count: 1, lastAttempt: Date.now() });
  }
}

export function recordSuccessfulEmail(email: string): void {
  failedEmailCache.delete(email);
}
