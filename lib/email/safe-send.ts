/**
 * Safe Email Sending Wrapper
 * Prevents hard bounces by verifying emails before sending
 */

import { verifyEmail, shouldRetryEmail, recordFailedEmail, recordSuccessfulEmail, maskEmail } from '@/lib/email-verification';

interface SafeSendResult {
  success: boolean;
  sent: boolean;
  reason?: string;
  error?: string;
}

/**
 * Safely send email with verification
 * Use this wrapper around all email sending functions
 * 
 * @example
 * const result = await safeSendEmail(
 *   'user@example.com',
 *   async (email) => await sendPasswordResetEmail(email, token)
 * );
 */
export async function safeSendEmail(
  recipientEmail: string,
  sendFunction: (email: string) => Promise<any>,
  options: {
    skipVerification?: boolean;
    logFailures?: boolean;
  } = {}
): Promise<SafeSendResult> {
  const { skipVerification = false, logFailures = true } = options;
  
  try {
    // Check if we should retry this email
    if (!shouldRetryEmail(recipientEmail)) {
      console.warn(`[Email] Skipping ${maskEmail(recipientEmail)} - too many recent failures`);
      return {
        success: false,
        sent: false,
        reason: 'Too many recent failed attempts. Please verify your email address.',
      };
    }
    
    // Verify email before sending (unless skipped)
    if (!skipVerification) {
      console.log(`[Email] Verifying ${maskEmail(recipientEmail)}...`);
      const verification = await verifyEmail(recipientEmail);
      
      if (!verification.shouldSend) {
        console.warn(`[Email] Verification failed for ${maskEmail(recipientEmail)}: ${verification.reason}`);
        recordFailedEmail(recipientEmail);
        
        return {
          success: false,
          sent: false,
          reason: verification.reason || 'Email verification failed',
        };
      }
      
      console.log(`[Email] Verification passed for ${maskEmail(recipientEmail)}`);
    }
    
    // Send the email
    console.log(`[Email] Sending to ${maskEmail(recipientEmail)}...`);
    await sendFunction(recipientEmail);
    
    // Record success
    recordSuccessfulEmail(recipientEmail);
    console.log(`[Email] Successfully sent to ${maskEmail(recipientEmail)}`);
    
    return {
      success: true,
      sent: true,
    };
    
  } catch (error) {
    // Record failure
    recordFailedEmail(recipientEmail);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[Email] Failed to send to ${maskEmail(recipientEmail)}:`, errorMessage);
    
    if (logFailures) {
      // Log to your error tracking service (Sentry, etc.)
      console.error('[Email] Send error details:', {
        recipient: maskEmail(recipientEmail),
        error: errorMessage,
        timestamp: new Date().toISOString(),
      });
    }
    
    return {
      success: false,
      sent: false,
      error: 'Failed to send email. Please try again later.',
    };
  }
}

/**
 * Batch send emails with verification
 * Filters out invalid emails before sending
 */
export async function safeBatchSendEmail(
  recipients: string[],
  sendFunction: (emails: string[]) => Promise<any>,
  options: {
    skipVerification?: boolean;
    maxBatchSize?: number;
  } = {}
): Promise<{
  sent: string[];
  failed: string[];
  skipped: Array<{ email: string; reason: string }>;
}> {
  const { skipVerification = false, maxBatchSize = 100 } = options;
  
  const sent: string[] = [];
  const failed: string[] = [];
  const skipped: Array<{ email: string; reason: string }> = [];
  
  // Verify all emails first
  const validEmails: string[] = [];
  
  for (const email of recipients) {
    if (!shouldRetryEmail(email)) {
      skipped.push({
        email: maskEmail(email),
        reason: 'Too many recent failures',
      });
      continue;
    }
    
    if (!skipVerification) {
      const verification = await verifyEmail(email);
      if (!verification.shouldSend) {
        skipped.push({
          email: maskEmail(email),
          reason: verification.reason || 'Verification failed',
        });
        recordFailedEmail(email);
        continue;
      }
    }
    
    validEmails.push(email);
  }
  
  // Send in batches
  for (let i = 0; i < validEmails.length; i += maxBatchSize) {
    const batch = validEmails.slice(i, i + maxBatchSize);
    
    try {
      await sendFunction(batch);
      sent.push(...batch);
      batch.forEach(email => recordSuccessfulEmail(email));
    } catch (error) {
      failed.push(...batch);
      batch.forEach(email => recordFailedEmail(email));
      console.error('[Email] Batch send failed:', error);
    }
  }
  
  return { sent, failed, skipped };
}
