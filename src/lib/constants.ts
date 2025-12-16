/**
 * Application constants
 */

export const INITIAL_COCKTAIL_COUNT = 10;
export const COCKTAILS_PER_PAGE = 10;
export const MAX_VISIBLE_INGREDIENTS = 6;
export const CARD_HEIGHT = 220;
export const IMAGE_SIZE_PERCENTAGE = 35; // Percentage of card width

export const DEFAULT_CSV_URL =
  process.env.NEXT_PUBLIC_COCKTAIL_CSV_URL ??
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTtZHO_uzgYX6J6sG-V7ZB2qzaJ1sD4x4RwKA0Oz5AsVqGZxngXsbj4WpB4wrUdvBm5PLmmy553GTR7/pub?gid=1079554725&single=true&output=csv";

export const FILTER_OPTIONS_CSV_URL =
  process.env.NEXT_PUBLIC_FILTER_OPTIONS_CSV_URL ??
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTtZHO_uzgYX6J6sG-V7ZB2qzaJ1sD4x4RwKA0Oz5AsVqGZxngXsbj4WpB4wrUdvBm5PLmmy553GTR7/pub?gid=183619488&single=true&output=csv";

