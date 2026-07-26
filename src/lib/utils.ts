import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export function now(): string {
  return new Date().toISOString();
}

export async function withRetry<T>(
  fn: () => Promise<T>, 
  options: { maxRetries?: number, delay?: number, onRetry?: (attempt: number, error: any) => void } = {}
): Promise<T> {
  const { maxRetries = 3, delay = 1000, onRetry } = options;
  try {
    return await fn();
  } catch (error) {
    if (maxRetries <= 0) throw error;
    if (onRetry) onRetry(1, error);
    await new Promise((res) => setTimeout(res, delay));
    return withRetry(fn, { maxRetries: maxRetries - 1, delay: delay * 2, onRetry });
  }
}

export async function measureTime<T>(name: string, fn: () => Promise<T>): Promise<T> {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  console.log(`[Timer] ${name} took ${Math.round(end - start)}ms`);
  return result;
}

export function wordCount(text: string): number {
  return text.trim().split(/\s+/).length;
}
