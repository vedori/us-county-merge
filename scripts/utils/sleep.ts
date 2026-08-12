/**
 * Pauses execution for a specified number of milliseconds.
 * @param ms Milliseconds to wait.
 */
export async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
