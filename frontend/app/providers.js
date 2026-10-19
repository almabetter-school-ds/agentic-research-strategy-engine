"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Provider, useDispatch } from "react-redux";
import { api } from "../lib/api";
import { setUser, clearUser, store } from "../redux/store";

function AuthHydrator({ children }) {
  const dispatch = useDispatch();
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      dispatch(clearUser());
      return;
    }
    const cachedUser = localStorage.getItem("currentUser");
    if (cachedUser) {
      try {
        dispatch(setUser(JSON.parse(cachedUser)));
      } catch {
        localStorage.removeItem("currentUser");
      }
    }
    api.get("/auth/me", { timeout: 2500 })
      .then(res => {
        localStorage.setItem("currentUser", JSON.stringify(res.data.user));
        dispatch(setUser(res.data.user));
      })
      .catch(() => {
        localStorage.removeItem("currentUser");
        dispatch(clearUser());
      });
  }, [dispatch]);
  return children;
}

export default function Providers({ children }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        gcTime: 10 * 60 * 1000,
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchOnWindowFocus: false,
        retry: 1,
        staleTime: 60 * 1000
      }
    }
  }));
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AuthHydrator>{children}</AuthHydrator>
      </QueryClientProvider>
    </Provider>
  );
}
