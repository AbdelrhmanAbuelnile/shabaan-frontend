import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch, apiJson } from '@/lib/api';

interface Me {
  username: string;
}

export function useMe() {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async (): Promise<Me | null> => {
      const res = await apiFetch('/auth/me');
      if (res.status === 401) return null;
      if (!res.ok) throw new Error('Failed to check authentication');
      return res.json();
    },
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (credentials: { username: string; password: string }) =>
      apiJson<Me>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    onSuccess: (me) => {
      queryClient.setQueryData(['auth', 'me'], me);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await apiFetch('/auth/logout', { method: 'POST' });
    },
    onSuccess: () => {
      queryClient.setQueryData(['auth', 'me'], null);
    },
  });
}
