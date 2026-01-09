/**
 * Hook para obtener datos del usuario actualmente autenticado
 */
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { User } from '../services/authService';
import storageService from '../services/storageService';

export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUser = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Loading user data from storage...');
      const userData = await storageService.getUserData();
      console.log('User data from storage:', userData);
      if (userData) {
        console.log('User data loaded successfully:', userData);
        setUser(userData);
      } else {
        console.log('No user data found in storage');
        setUser(null);
      }
      setError(null);
    } catch (err) {
      console.error('Error loading user:', err);
      setError(err instanceof Error ? err.message : 'Error loading user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar datos cuando la pantalla se enfoca
  useFocusEffect(
    useCallback(() => {
      loadUser();
    }, [loadUser])
  );

  /**
   * Obtener la inicial del nombre del usuario
   */
  const getUserInitial = (): string => {
    // Preferir username si existe
    if (user?.username && typeof user.username === 'string' && user.username.length) {
      return user.username.charAt(0).toUpperCase();
    }

    // Fallback: usar la parte local del email si está disponible
    if (user?.email && typeof user.email === 'string' && user.email.length) {
      const localPart = (user.email.split('@')[0] || '').trim();
      return localPart.charAt(0).toUpperCase() || 'U';
    }

    console.log('User data missing for initial:', user);
    return 'U';
  };

  return {
    user,
    loading,
    error,
    getUserInitial,
    refetchUser: loadUser,
  };
}

