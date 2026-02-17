const REVIEW_STEPS = [1, 3, 7, 14, 30]; // jours

export function getNextReviewDate(level: number) {
  const now = Date.now();
  const days = REVIEW_STEPS[level] ?? 60;
  return now + days * 24 * 60 * 60 * 1000;
}
