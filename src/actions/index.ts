'use server';

import { revalidatePath } from 'next/cache';

export async function refreshData(path: string = '/dashboard') {
  revalidatePath(path);
}

export async function serverAction<T>(action: () => Promise<T>): Promise<{ data?: T; error?: string }> {
  try {
    const data = await action();
    return { data };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'An error occurred' };
  }
}
