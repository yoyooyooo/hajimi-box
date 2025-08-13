import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const appWindow = getCurrentWindow();
    
    const updateSize = async () => {
      const size = await appWindow.innerSize();
      setWindowSize({ width: size.width, height: size.height });
    };

    updateSize();
    const unlisten = appWindow.listen('tauri://resize', updateSize);

    return () => {
      unlisten.then(fn => fn());
    };
  }, []);

  return windowSize;
};

export const useTauriCommand = <T,>(command: string, initialData?: T) => {
  const [data, setData] = useState<T | undefined>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = async (args?: Record<string, any>): Promise<T> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await invoke<T>(command, args);
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, execute };
};

// User types
export interface User {
  id: number;
  name: string;
  email: string;
  age?: number | undefined;
  created_at: string;
  updated_at: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  age?: number | undefined;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  age?: number | undefined;
}

// TanStack Query keys
const usersQueryKey = ["users"] as const;

// Users query with auto-init fallback
export const useUsersQuery = () => {
  return useQuery<User[]>({
    queryKey: usersQueryKey,
    queryFn: async () => {
      try {
        return await invoke<User[]>("get_all_users");
      } catch (err) {
        // 若表未初始化，则尝试初始化后再读取
        try {
          await invoke<string>("init_db");
          return await invoke<User[]>("get_all_users");
        } catch (e) {
          throw err || e;
        }
      }
    },
    staleTime: 5_000,
  });
};

// CRUD mutations with invalidation
export const useCreateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ request }: { request: CreateUserRequest }) =>
      invoke<User>("create_user", { request }),
    onSuccess: () => qc.invalidateQueries({ queryKey: usersQueryKey }),
  });
};

export const useUpdateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, request }: { id: number; request: UpdateUserRequest }) =>
      invoke<User>("update_user", { id, request }),
    onSuccess: () => qc.invalidateQueries({ queryKey: usersQueryKey }),
  });
};

export const useDeleteUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: number }) =>
      invoke<void>("delete_user", { id }),
    onSuccess: () => qc.invalidateQueries({ queryKey: usersQueryKey }),
  });
};

export const useInitDb = () => {
  return useMutation({
    mutationFn: async () => invoke<string>("init_db"),
  });
};
