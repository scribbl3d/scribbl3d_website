import { NextRequest } from 'next/server';
import { ZodSchema, ZodError } from 'zod';
import { rateLimit, createRateLimitResponse, getRateLimitHeaders } from './rate-limit';

/**
 * Get client identifier for rate limiting
 * Uses IP address or fallback to a header
 */
export function getClientIdentifier(req: NextRequest): string {
  // Try to get real IP from headers (Vercel, Cloudflare, etc.)
  const forwarded = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }
  
  // Fallback to a combination of headers
  return req.headers.get('user-agent') || 'unknown';
}

/**
 * Validate request body against Zod schema
 * Returns parsed data or throws validation error
 */
export async function validateRequest<T>(
  req: NextRequest,
  schema: ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; error: Response }> {
  try {
    const body = await req.json();
    const data = schema.parse(body);
    return { success: true, data };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        error: new Response(
          JSON.stringify({
            error: 'Validation failed',
            details: error.errors.map(err => ({
              field: err.path.join('.'),
              message: err.message,
            })),
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        ),
      };
    }
    
    return {
      success: false,
      error: new Response(
        JSON.stringify({ error: 'Invalid request body' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      ),
    };
  }
}

/**
 * Apply rate limiting to a request
 * Returns rate limit result
 */
export async function applyRateLimit(
  req: NextRequest,
  limit: number,
  windowMs: number
) {
  const identifier = getClientIdentifier(req);
  return await rateLimit(identifier, limit, windowMs);
}

/**
 * Wrapper for API routes with validation and rate limiting
 * 
 * @example
 * export const POST = withApiProtection(
 *   async (req, validatedData) => {
 *     // Your handler logic with validated data
 *     return Response.json({ success: true });
 *   },
 *   {
 *     schema: contactFormSchema,
 *     rateLimit: RateLimits.CONTACT,
 *   }
 * );
 */
export function withApiProtection<T>(
  handler: (req: NextRequest, data: T) => Promise<Response>,
  options: {
    schema: ZodSchema<T>;
    rateLimit: { limit: number; windowMs: number };
    requireAuth?: boolean;
  }
) {
  return async (req: NextRequest) => {
    try {
      // 1. Apply rate limiting
      const rateLimitResult = await applyRateLimit(
        req,
        options.rateLimit.limit,
        options.rateLimit.windowMs
      );

      if (!rateLimitResult.success) {
        return createRateLimitResponse(rateLimitResult);
      }

      // 2. Validate request body
      const validation = await validateRequest(req, options.schema);
      if (!validation.success) {
        return validation.error;
      }

      // 3. Check authentication if required
      if (options.requireAuth) {
        // Add your auth check here
        // const session = await getServerSession();
        // if (!session) {
        //   return new Response('Unauthorized', { status: 401 });
        // }
      }

      // 4. Call handler with validated data
      const response = await handler(req, validation.data);

      // 5. Add rate limit headers to successful responses
      const headers = new Headers(response.headers);
      Object.entries(getRateLimitHeaders(rateLimitResult)).forEach(([key, value]) => {
        headers.set(key, value);
      });

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    } catch (error) {
      console.error('API Error:', error);
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  };
}

/**
 * Create standardized success response
 */
export function successResponse<T>(data: T, status: number = 200): Response {
  return new Response(
    JSON.stringify({ success: true, data }),
    {
      status,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

/**
 * Create standardized error response
 */
export function errorResponse(message: string, status: number = 400, details?: any): Response {
  return new Response(
    JSON.stringify({ 
      success: false, 
      error: message,
      ...(details && { details })
    }),
    {
      status,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}
