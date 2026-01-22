/**
 * API Configuration
 * Configuración central para todas las peticiones HTTP al backend
 */

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
 */
export async function fetchAuthAPI<T>(
  endpoint: string,
  token: string,
  options: RequestInit = {},
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
