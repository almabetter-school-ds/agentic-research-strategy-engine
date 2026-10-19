"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

export function useApiQuery(queryKey, url, options = {}) {
  return useQuery({
    queryKey: Array.isArray(queryKey) ? queryKey : [queryKey],
    queryFn: async () => (await api.get(url, { params: options.params })).data,
    ...options
  });
}
