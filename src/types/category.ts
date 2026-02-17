import type { categTheme } from "./categTheme";

export type Category = {
    id: number;
    name: string;
    themes: categTheme[];
}