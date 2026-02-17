import { create } from "zustand";
import { loadData, saveData } from "@/utils/storage";
import { getNextReviewDate } from "@/utils/cardHelper";
import type { Card } from "@/types/card";
import type { Category } from "@/types/category";
import type { categTheme } from "@/types/categTheme";

interface StoreState {
  cards: Card[];
  sessionsCards: Card[];
  currentCard: Card | null;
  recto: boolean;

  categories: Category[];
  currentCategory: Category | null;

  displayedThemes: categTheme[];
  currentTheme: categTheme | null;

  toggleRecto: () => void;
  addCard: (categoryId: number, themeId: number, card: Card) => void;
  modifyCard: (
    categoryId: number,
    themeId: number,
    cardId: number,
    updatedCard: Partial<Card>,
  ) => void;
  removeCard: (categoryId: number, themeId: number, cardId: number) => void;

  addCategory: (category: Category) => void;
  modifyCategory: (
    categoryId: number,
    updatedCategory: Partial<Category>,
  ) => void;
  setCurrentCategory: (category: Category) => void;
  removeCategory: (categoryId: number) => void;

  addTheme: (categoryId: number, theme: categTheme) => void;
  modifyTheme: (
    categoryId: number,
    themeId: number,
    updatedTheme: Partial<categTheme>,
  ) => void;
  removeTheme: (categoryId: number, themeId: number) => void;

  startSession: (categoryId: number, themeId: number) => void;
  answerCard: (isCorrect: boolean) => void;
  nextCard: () => void;
}

// Charger les données initiales depuis le localStorage
const initialData = loadData();

// Créer le store avec Zustand
export const useStore = create<StoreState>()((set, get) => ({
  cards: [],
  sessionsCards: [],
  currentCard: null,
  recto: true,

  categories: initialData?.categories || [], // Utiliser les données chargées ou un tableau vide
  currentCategory: null,

  displayedThemes: [],
  currentTheme: null,

  toggleRecto: () => {
    set((state) => ({ recto: !state.recto }));
  },
  addCard: (categoryId, themeId, card) => {
    set((state) => {
      const updatedCategories = state.categories.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              themes: category.themes.map((theme) =>
                theme.id === themeId
                  ? {
                      ...theme,
                      cards: [...theme.cards, card],
                    }
                  : theme,
              ),
            }
          : category,
      );

      saveData(updatedCategories);

      return { categories: updatedCategories };
    });
  },
  removeCard: (categoryId, themeId, cardId) => {
    set((state) => {
      const updatedCategories = state.categories.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              themes: category.themes.map((theme) =>
                theme.id === themeId
                  ? {
                      ...theme,
                      cards: theme.cards.filter((card) => card.id !== cardId),
                    }
                  : theme,
              ),
            }
          : category,
      );

      saveData(updatedCategories);

      return { categories: updatedCategories };
    });
  },

  modifyCard: (categoryId, themeId, cardId, updatedCard) => {
    set((state) => {
      const updatedCategories = state.categories.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              themes: category.themes.map((theme) =>
                theme.id === themeId
                  ? {
                      ...theme,
                      cards: theme.cards.map((card) =>
                        card.id === cardId ? { ...card, ...updatedCard } : card,
                      ),
                    }
                  : theme,
              ),
            }
          : category,
      );

      saveData(updatedCategories);

      return { categories: updatedCategories };
    });
  },

  addCategory: (category) => {
    set((state) => {
      const updatedCategories = [...state.categories, category];
      saveData(updatedCategories);
      return { categories: updatedCategories };
    });
  },
  modifyCategory: (categoryId, updatedCategory) => {
    set((state) => {
      const updatedCategories = state.categories.map((category) =>
        category.id === categoryId
          ? { ...category, ...updatedCategory }
          : category,
      );
      saveData(updatedCategories);
      return { categories: updatedCategories };
    });
  },
  removeCategory: (categoryId) => {
    set((state) => {
      const updatedCategories = state.categories.filter(
        (category) => category.id !== categoryId,
      );

      saveData(updatedCategories);

      return {
        categories: updatedCategories,
        currentCategory:
          state.currentCategory?.id === categoryId
            ? null
            : state.currentCategory,
      };
    });
  },
  setCurrentCategory: (category) => set({ currentCategory: category }),

  addTheme: (categoryId, theme) => {
    set((state) => {
      const updatedCategories = state.categories.map((category) =>
        category.id === categoryId
          ? { ...category, themes: [...category.themes, theme] }
          : category,
      );

      saveData(updatedCategories);

      return { categories: updatedCategories };
    });
  },

  modifyTheme: (categoryId, themeId, updatedTheme) => {
    set((state) => {
      const updatedCategories = state.categories.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              themes: category.themes.map((theme) =>
                theme.id === themeId ? { ...theme, ...updatedTheme } : theme,
              ),
            }
          : category,
      );
      saveData(updatedCategories);
      return { categories: updatedCategories };
    });
  },

  removeTheme: (categoryId, themeId) => {
    set((state) => {
      const updatedCategories = state.categories.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              themes: category.themes.filter((theme) => theme.id !== themeId),
            }
          : category,
      );

      saveData(updatedCategories);

      return { categories: updatedCategories };
    });
  },

  startSession: (categoryId, themeId) => {
    const now = Date.now();

    // Trouver le thème correspondant
    const theme = get()
      .categories.find((c) => c.id === categoryId)
      ?.themes.find((t) => t.id === themeId);

    if (!theme) return;

    // Filtrer les cartes dont la date de prochaine révision est passée
    const dueCards = theme.cards.filter((card) => card.nextReview <= now);

    set({
      sessionsCards: dueCards,
      currentCard: dueCards[0] ?? null,
      currentTheme: theme,
    });
  },

  answerCard: (isCorrect) => {
    const card = get().currentCard;
    const theme = get().currentTheme;
    const category = get().currentCategory;

    if (!card) return;

    if (isCorrect) {
      card.level += 1;
    } else {
      card.level = 0;
    }
    card.nextReview = getNextReviewDate(card.level);

    // Mettre à jour la carte dans le store et dans le localStorage
    const updatedCategories = get().categories.map((c) => {
      if (c.id === category?.id) {
        return {
          ...c,
          themes: c.themes.map((t) =>
            t.id === theme?.id
              ? {
                  ...t,
                  cards: t.cards.map((card_item) =>
                    card_item.id === card.id ? card : card_item,
                  ),
                }
              : t,
          ),
        };
      }
      return c;
    });

    saveData(updatedCategories);
    set({ categories: updatedCategories });

    // Retirer la carte de la session
    set((state) => ({
      sessionsCards: state.sessionsCards.filter((c) => c.id !== card.id),
    }));

    // Changer la carte actuelle par la suivante
    get().nextCard();
  },

  nextCard: () => {
    // Trouver l'index de la carte actuelle dans sessionsCards
    const currentIndex = get().sessionsCards.findIndex(
      (card) => card.id === get().currentCard?.id,
    );

    // Passer à la carte suivante ou mettre currentCard à null si c'était la dernière
    const nextCard = get().sessionsCards[currentIndex + 1] || null;
    set({ currentCard: nextCard });
  },
}));
