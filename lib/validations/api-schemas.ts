import { z } from 'zod';

// Contact Form Validation
export const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  email: z.string().email('Invalid email address'),
  phone: z.string()
    .regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number')
    .optional()
    .or(z.literal('')),
  subject: z.string().min(5, 'Subject must be at least 5 characters').max(200, 'Subject too long'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000, 'Message too long'),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

// Personalise/Custom Quote Form Validation
export const personaliseFormSchema = z.object({
  name: z.string().min(2, 'Name required').max(100),
  email: z.string().email('Invalid email'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid phone number'),
  quantity: z.number().int().min(1, 'Minimum 1 piece').max(10000, 'Maximum 10,000 pieces'),
  material: z.enum(['PLA', 'PLA+', 'PETG', 'ABS', 'TPU', 'Nylon', 'Resin', 'Other']),
  finishType: z.enum(['Standard', 'Smooth', 'Matte', 'Glossy', 'Textured', 'Other']).optional(),
  color: z.string().max(50).optional(),
  notes: z.string().max(1000, 'Notes too long').optional(),
  fileUrl: z.string().url('Invalid file URL').optional(),
  fileName: z.string().max(255).optional(),
  urgency: z.enum(['Standard', 'Express', 'Rush']).default('Standard'),
});

export type PersonaliseFormData = z.infer<typeof personaliseFormSchema>;

// Newsletter Subscription
export const newsletterSchema = z.object({
  email: z.string().email('Invalid email address'),
  source: z.string().max(50).optional(),
});

export type NewsletterData = z.infer<typeof newsletterSchema>;

// Stock Notification Request
export const stockNotificationSchema = z.object({
  email: z.string().email('Invalid email address'),
  productId: z.string().min(1, 'Product ID required'),
  productType: z.enum(['filament', 'printer', 'resin', 'prebuilt']),
  variantId: z.string().optional(),
});

export type StockNotificationData = z.infer<typeof stockNotificationSchema>;

// Coupon Validation
export const couponValidationSchema = z.object({
  code: z.string()
    .min(3, 'Coupon code too short')
    .max(50, 'Coupon code too long')
    .regex(/^[A-Z0-9-_]+$/, 'Invalid coupon format'),
  cartTotal: z.number().min(0, 'Invalid cart total'),
});

export type CouponValidationData = z.infer<typeof couponValidationSchema>;

// Review Submission
export const reviewSchema = z.object({
  productId: z.string().min(1, 'Product ID required'),
  productType: z.enum(['filament', 'printer', 'resin', 'prebuilt']),
  rating: z.number().int().min(1, 'Minimum rating 1').max(5, 'Maximum rating 5'),
  title: z.string().min(5, 'Title too short').max(100, 'Title too long'),
  comment: z.string().min(10, 'Review too short').max(1000, 'Review too long'),
  images: z.array(z.string().url()).max(5, 'Maximum 5 images').optional(),
  verified: z.boolean().default(false),
});

export type ReviewData = z.infer<typeof reviewSchema>;

// Address Validation
export const addressSchema = z.object({
  fullName: z.string().min(2, 'Name required').max(100),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid phone number'),
  addressLine1: z.string().min(5, 'Address required').max(200),
  addressLine2: z.string().max(200).optional(),
  city: z.string().min(2, 'City required').max(100),
  state: z.string().min(2, 'State required').max(100),
  pincode: z.string().regex(/^\d{6}$/, 'Invalid pincode'),
  landmark: z.string().max(200).optional(),
  isDefault: z.boolean().default(false),
  addressType: z.enum(['Home', 'Work', 'Other']).default('Home'),
});

export type AddressData = z.infer<typeof addressSchema>;

// Cart Item Validation
export const cartItemSchema = z.object({
  productId: z.string().min(1, 'Product ID required'),
  productType: z.enum(['filament', 'printer', 'resin', 'prebuilt']),
  variantId: z.string().optional(),
  quantity: z.number().int().min(1, 'Minimum 1').max(100, 'Maximum 100 per item'),
});

export type CartItemData = z.infer<typeof cartItemSchema>;

// Order Creation Validation
export const orderCreateSchema = z.object({
  addressId: z.string().min(1, 'Shipping address required'),
  paymentMethod: z.enum(['razorpay', 'cod', 'upi']),
  couponCode: z.string().max(50).optional(),
  notes: z.string().max(500).optional(),
});

export type OrderCreateData = z.infer<typeof orderCreateSchema>;

// File Upload Validation (metadata only, actual file validated server-side)
export const fileUploadSchema = z.object({
  fileName: z.string().min(1).max(255),
  fileSize: z.number().max(52428800, 'File too large (max 50MB)'), // 50MB
  fileType: z.string().regex(/^(stl|obj|3mf|step|stp)$/i, 'Invalid file type'),
  folder: z.string().max(100).optional(),
});

export type FileUploadData = z.infer<typeof fileUploadSchema>;

// Auth Validation
export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name required').max(100),
  email: z.string().email('Invalid email'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid phone number'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain uppercase letter')
    .regex(/[a-z]/, 'Password must contain lowercase letter')
    .regex(/[0-9]/, 'Password must contain number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token required'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain uppercase letter')
    .regex(/[a-z]/, 'Password must contain lowercase letter')
    .regex(/[0-9]/, 'Password must contain number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
export type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordData = z.infer<typeof resetPasswordSchema>;
