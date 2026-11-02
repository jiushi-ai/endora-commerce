/**
 * The `./migrations` subpath — every migration class this module owns.
 *
 * Batch C seeds roles only; campaign / receipt tables arrive in Batch D, so
 * the array is empty today (`admin_search` uses the same shape).
 */

export const migrations = [];
