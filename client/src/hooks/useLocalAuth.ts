import { useQuery } from "@tanstack/react-query";

export function useLocalAuth() {
  const { data: user, isLoading } = useQuery({
    queryKey: ['/api/local-auth/user'],
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}