import { useQuery } from "@tanstack/react-query";

interface Config {
  TOMTOM_API_KEY: string;
}

export function useConfig() {
  return useQuery<Config>({
    queryKey: ['config'],
    queryFn: async () => {
      const response = await fetch('/api/config');
      if (!response.ok) {
        throw new Error('Failed to load configuration');
      }
      return response.json();
    },
    staleTime: Infinity,
    retry: false,
  });
}
