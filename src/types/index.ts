/**
 * Shared type definitions
 */

export type SearchParams =
  | Record<string, string | string[] | undefined>
  | Promise<Record<string, string | string[] | undefined>>
  | undefined;

