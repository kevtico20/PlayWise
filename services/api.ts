/**
 * API Configuration
 * Configuración central para todas las peticiones HTTP al backend
 */

import { router } from "expo-router";
import { Alert } from "react-native";
import storageService from "./storageService";

// Obtener URL de la API desde variables de entorno
const API_BASE_URL = __DEV__
  ? process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000/api"
  : process.env.EXPO_PUBLIC_API_URL_PROD ||
    "https://your-production-api.com/api";

/**
 * Configuración por defecto para las peticiones
 */
export const API_CONFIG = {
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 segundos
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
};

/**
 * Función helper para realizar peticiones HTTP
 */
export async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {},
  silentErrors: number[] = [], // Status codes que no deben loguearse como error
): Promise<T> {
  const url = `${API_CONFIG.baseURL}${endpoint}`;
  const method = options.method || "GET";

  console.log(`📡 [${method}] ${endpoint} → ${url}`);

  const config: RequestInit = {
    ...options,
    headers: {
      ...API_CONFIG.headers,
      ...options.headers,
    },
  };

  try {
    console.log(`⏳ Enviando request...`);
    const response = await fetch(url, config);

    console.log(
      `📩 Response status: ${response.status} ${response.statusText}`,
    );

    // Intentar parsear la respuesta como JSON
    let data: any;
    try {
      data = await response.json();
      console.log(`📦 Response data:`, JSON.stringify(data).substring(0, 200));
    } catch (parseErr) {
      console.log(`⚠️ No se pudo parsear JSON de respuesta`);
      data = {};
    }

    if (!response.ok) {
      // Manejar errores HTTP
      const errorPayload = {
        status: response.status,
        message: data.detail || data.message || `HTTP ${response.status} Error`,
        data,
      };

      // Solo loguear como error si no está en silentErrors
      if (!silentErrors.includes(response.status)) {
        console.error(`❌ HTTP Error:`, JSON.stringify(errorPayload, null, 2));
      }

      throw errorPayload;
    }

    console.log(`✅ Request exitoso`);
    return data as T;
  } catch (error: any) {
    // Si es un error silencioso, no loguear
    if (error.status && silentErrors.includes(error.status)) {
      throw error;
    }

    console.error(`❌ Exception caught:`, error);

    // Si es un error de red o timeout
    if (error.message === "Network request failed") {
      const networkError = {
        status: 0,
        message: "No se pudo conectar al servidor. Verifica tu conexión.",
      };
      console.error(`❌ Network Error:`, networkError);
      throw networkError;
    }

    // Si es un error que ya tiene estructura
    if (error.status) {
      console.error(`❌ Throwing structured error:`, error);
      throw error;
    }

    // Error genérico
    const genericError = {
      status: -1,
      message: error?.message || "Unknown error",
    };
    console.error(`❌ Generic error:`, genericError);
    throw genericError;
  }
}

/**
 * Función helper para peticiones con autenticación
 * Intenta renovar el token automáticamente si recibe 401
 */
export async function fetchAuthAPI<T>(
  endpoint: string,
  token: string,
  options: RequestInit = {},
  silentErrors: number[] = [],
): Promise<T> {
  try {
    return await fetchAPI<T>(
      endpoint,
      {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${token}`,
        },
      },
      silentErrors,
    );
  } catch (error: any) {
    // Si es 401, intentar renovar token
    if (error.status === 401 && !silentErrors.includes(401)) {
      console.log("🔄 Token expirado, intentando renovar...");

      try {
        const refreshToken = await storageService.getRefreshToken();
        if (refreshToken) {
          // Importar authService dinámicamente para evitar circular dependency
          const authService = (await import("./authService")).default;
          const response = await authService.refreshAccessToken(refreshToken);

          if (response.access_token && response.refresh_token) {
            // Guardar nuevos tokens
            await storageService.saveTokens(
              response.access_token,
              response.refresh_token,
            );

            // Reintentar la petición original con el nuevo token
            console.log("✅ Token renovado, reintentando petición...");
            // Important: use fetchAuthAPI again so 401 can trigger refresh flow recursively.
            // Also, make sure we don't reuse a stale Authorization header from options.
            const { headers, ...restOptions } = options as any;
            return await fetchAuthAPI<T>(
              endpoint,
              response.access_token,
              {
                ...restOptions,
                headers: {
                  ...headers,
                },
              },
              silentErrors,
            );
          }
        }
      } catch (refreshError: any) {
        console.error("❌ Error renovando token:", refreshError);
        // Si falla la renovación, limpiar el storage para evitar loops y forzar login
        try {
          await storageService.clear();
        } catch (e) {
          /* ignore */
        }

        try {
          // Mostrar alerta al usuario y redirigir a login
          Alert.alert(
            "Sesión expirada",
            "Tu sesión ha caducado. Por favor inicia sesión nuevamente.",
            [
              {
                text: "Aceptar",
                onPress: () => {
                  try {
                    router.replace("/login");
                  } catch (e) {
                    // ignore navigation errors
                  }
                },
              },
            ],
            { cancelable: false },
          );
        } catch (e) {
          // ignore alert/navigation errors
        }

        // Luego lanzar el error original para que los callers puedan manejarlo si lo desean
      }
    }

    // Si no es 401 o falló la renovación, lanzar el error
    throw error;
  }
}

export default API_CONFIG;
