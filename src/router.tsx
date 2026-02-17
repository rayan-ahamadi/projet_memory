import { createBrowserRouter } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";

import HomePage from "@/pages/Homepage";
import CategoriesPage from "@/pages/Categories";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "categories", element: <CategoriesPage /> },
    ],
  },
]);
