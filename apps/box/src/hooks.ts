import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";

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

// CRUD hooks
export const useCreateUser = () => {
  return useTauriCommand<User>('create_user');
};

export const useGetUser = () => {
  return useTauriCommand<User>('get_user');
};

export const useGetAllUsers = () => {
  return useTauriCommand<User[]>('get_all_users');
};

export const useUpdateUser = () => {
  return useTauriCommand<User>('update_user');
};

export const useDeleteUser = () => {
  return useTauriCommand<void>('delete_user');
};

export const useInitDb = () => {
  return useTauriCommand<string>('init_db');
};