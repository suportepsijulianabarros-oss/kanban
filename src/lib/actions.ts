/**
 * Client-side helper to invoke "Server Actions"
 */

export async function invokeAction<T>(action: string, args: any = {}, userId: string = 'mock-user-id'): Promise<T> {
  const response = await fetch(`/api/rpc/${action}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ args, userId }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to invoke action');
  }

  const { data } = await response.json();
  return data as T;
}
