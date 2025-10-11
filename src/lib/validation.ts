/**
 * Input validation utilities for security and data integrity
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHtml(input: string): string {
  if (typeof input !== "string") {
    return "";
  }

  // Remove potentially dangerous HTML tags and attributes
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "")
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, "")
    .replace(/<link\b[^<]*(?:(?!<\/link>)<[^<]*)*<\/link>/gi, "")
    .replace(/<meta\b[^<]*(?:(?!<\/meta>)<[^<]*)*<\/meta>/gi, "")
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/vbscript:/gi, "")
    .replace(/data:/gi, "");
}

/**
 * Validate email format
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || typeof email !== "string") {
    return { isValid: false, error: "Email is required" };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { isValid: false, error: "Invalid email format" };
  }

  if (email.length > 254) {
    return { isValid: false, error: "Email is too long" };
  }

  return { isValid: true };
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): ValidationResult {
  if (!password || typeof password !== "string") {
    return { isValid: false, error: "Password is required" };
  }

  if (password.length < 6) {
    return { isValid: false, error: "Password must be at least 6 characters" };
  }

  if (password.length > 128) {
    return { isValid: false, error: "Password is too long" };
  }

  return { isValid: true };
}

/**
 * Validate note title
 */
export function validateNoteTitle(title: string): ValidationResult {
  if (!title || typeof title !== "string") {
    return { isValid: false, error: "Title is required" };
  }

  const trimmedTitle = title.trim();
  if (trimmedTitle.length === 0) {
    return { isValid: false, error: "Title cannot be empty" };
  }

  if (trimmedTitle.length > 255) {
    return { isValid: false, error: "Title is too long" };
  }

  return { isValid: true };
}

/**
 * Validate folder name
 */
export function validateFolderName(name: string): ValidationResult {
  if (!name || typeof name !== "string") {
    return { isValid: false, error: "Folder name is required" };
  }

  const trimmedName = name.trim();
  if (trimmedName.length === 0) {
    return { isValid: false, error: "Folder name cannot be empty" };
  }

  if (trimmedName.length > 100) {
    return { isValid: false, error: "Folder name is too long" };
  }

  // Check for potentially dangerous characters
  const dangerousChars = /[<>:"/\\|?*]/;
  if (dangerousChars.test(trimmedName)) {
    return { isValid: false, error: "Folder name contains invalid characters" };
  }

  return { isValid: true };
}

/**
 * Validate content for XSS prevention
 */
export function validateContent(content: string): ValidationResult {
  if (typeof content !== "string") {
    return { isValid: false, error: "Content must be a string" };
  }

  if (content.length > 100000) {
    return { isValid: false, error: "Content is too long" };
  }

  // Check for potential XSS patterns
  const xssPatterns = [
    /<script/i,
    /javascript:/i,
    /vbscript:/i,
    /onload/i,
    /onerror/i,
    /onclick/i,
    /onmouseover/i,
  ];

  for (const pattern of xssPatterns) {
    if (pattern.test(content)) {
      return {
        isValid: false,
        error: "Content contains potentially dangerous code",
      };
    }
  }

  return { isValid: true };
}

/**
 * Sanitize user input for safe display
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== "string") {
    return "";
  }

  return sanitizeHtml(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/**
 * Validate UUID format
 */
export function validateUUID(uuid: string): ValidationResult {
  if (!uuid || typeof uuid !== "string") {
    return { isValid: false, error: "UUID is required" };
  }

  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(uuid)) {
    return { isValid: false, error: "Invalid UUID format" };
  }

  return { isValid: true };
}


