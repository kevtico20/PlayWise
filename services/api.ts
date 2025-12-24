/**
 * API Configuration
 * Configuración central para todas las peticiones HTTP al backend
 */

// Obtener URL de la API desde variables de entorno
const API_BASE_URL = __DEV__
  ? process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000/api"
  : process.env.EXPO_PUBLIC_API_URL_PROD || "https://your-production-api.com/api";

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
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_CONFIG.baseURL}${endpoint}`;

  const config: RequestInit = {
    ...options,
    headers: {
      ...API_CONFIG.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    // Intentar parsear la respuesta como JSON
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      // Manejar errores HTTP
      throw {
        status: response.status,
        message: data.detail || data.message || "An error occurred",
        data,
      };
    }

    return data as T;
  } catch (error: any) {
    // Si es un error de red o timeout
    if (error.message === "Network request failed") {
      throw {
        status: 0,
        message: "No se pudo conectar al servidor. Verifica tu conexión.",
      };
    }

    // Re-lanzar el error si ya está formateado
    throw error;
  }
}

/**
 * Función helper para peticiones con autenticación
 */
export async function fetchAuthAPI<T>(
  endpoint: string,
  token: string,
  options: RequestInit = {}
): Promise<T> {
  return fetchAPI<T>(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });
}

export default API_CONFIG;
