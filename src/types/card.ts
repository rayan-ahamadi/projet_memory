export type Card = {
  id: number;
  image: string | null;
  recto: string; // La question ou le terme à apprendre
  verso: string; // La réponse ou la définition
  level: number;
  nextReview: number;
};
