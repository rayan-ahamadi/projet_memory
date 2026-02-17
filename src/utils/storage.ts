import type { Category } from "@/types/category";

const STORAGE_KEY = "spaced-repetition-data";

export const loadData = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Erreur loadData", error);
    return null;
  }
};

export const saveData = (data: Category[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Erreur saveData", error);
  }
};
