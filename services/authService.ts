/**
 * Auth Service
 * Servicio para operaciones de autenticación con el backend
 */

import { decode as base64Decode } from "base-64";
import * as Application from "expo-application";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { fetchAPI } from "./api";
import storageService from "./storageService";

// ==================== INTERFACES ====================
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  age?: string;
  gender?: string;
}

export interface LoginRequest {
  username: string; // En realidad es email, pero FastAPI OAuth2 lo espera como "username"
  password: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  age?: string;
  gender?: string;
  role: string;
  profile_picture?: string;
  is_active: boolean;
  is_verified: boolean;
  auth_provider: string;
  created_at: string;
}

export interface RegisterResponse {
  message: string;
  user: User;
}

export interface LoginResponse {
  access_token?: string;
  refresh_token?: string;
  token_type?: string;
  otp_required?: boolean;
  message?: string;
  user?: User;
}

export interface OTPVerifyRequest {
  email: string;
  otp_code: string;
  device_id: string;
  device_name?: string;
  device_type?: string;
  remember_device: boolean;
}

export interface TrustedDevice {
  id: number;
  device_id: string;
  device_name?: string;
  device_type?: string;
  created_at: string;
  last_used_at: string;
}

export interface APIError {
  status: number;
  message: string;
  data?: any;
}

// ==================== DEVICE UTILS ====================
/**
 * Obtener ID único del dispositivo
 */
async function getDeviceId(): Promise<string> {
  try {
    if (Platform.OS === "android") {
      return Application.getAndroidId() || `android-${Date.now()}`;
    } else if (Platform.OS === "ios") {
      const iosId = await Application.getIosIdForVendorAsync();
      return iosId || `ios-${Date.now()}`;
    }
    return `web-${Date.now()}`;
  } catch {
    return `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Obtener nombre descriptivo del dispositivo
 */
function getDeviceName(): string {
  const brand = Device.brand || "Unknown";
  const modelName = Device.modelName || "Device";
  return `${brand} ${modelName}`;
}

/**
 * Obtener tipo de dispositivo
 */
function getDeviceType(): string {
  if (Platform.OS === "android") return "android";
  if (Platform.OS === "ios") return "ios";
  return "web";
}

/**
 * Decodificar JWT token
 */
function base64UrlToUtf8(input: string): string {
  // Convert base64url -> base64
  let base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  // Pad to multiple of 4
  const pad = base64.length % 4;
  if (pad) base64 += "=".repeat(4 - pad);
  // Decode to ASCII/UTF-8 string
  return base64Decode(base64);
}

function decodeToken(token: string): any {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payloadJson = base64UrlToUtf8(parts[1]);
    const decoded = JSON.parse(payloadJson);
    return decoded;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
}

/**
 * Extraer datos básicos del usuario desde el access token si el backend
 * incluye los claims (p.ej. username, email, sub, preferred_username).
 * Devuelve un objeto parcial de User con la información disponible.
 */
export function extractUserFromToken(token: string): Partial<User> | null {
  const claims = decodeToken(token);
  if (!claims || typeof claims !== "object") return null;

  const candidateUsername =
    claims.username || claims.preferred_username || claims.name || null;
  const candidateEmail = claims.email || null;
  const subject = claims.sub || null;

  const username =
    (typeof candidateUsername === "string" && candidateUsername.trim()) ||
    (typeof subject === "string" && subject.includes("@")
      ? subject.split("@")[0]
      : typeof subject === "string"
        ? subject
        : null);

  const email =
    (typeof candidateEmail === "string" && candidateEmail.trim()) ||
    (typeof subject === "string" && subject.includes("@") ? subject : null);

  if (!username && !email) return null;

  return {
    username: username || (email ? email.split("@")[0] : ""),
    email: email || undefined,
  } as Partial<User>;
}

// ==================== AUTH SERVICE ====================
class AuthService {
  private pendingLoginEmail: string | null = null;
  private cachedDeviceId: string | null = null;

  /**
   * Obtener o generar ID de dispositivo (cacheado)
   */
  async getOrCreateDeviceId(): Promise<string> {
    if (!this.cachedDeviceId) {
      this.cachedDeviceId = await getDeviceId();
    }
    return this.cachedDeviceId;
  }

  /**
   * Registrar nuevo usuario
   */
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    try {
      const response = await fetchAPI<RegisterResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      });

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Login con email y contraseña
   * Puede requerir OTP si es el primer login o dispositivo no confiable
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const deviceId = await this.getOrCreateDeviceId();

      // FastAPI OAuth2 espera el formato form-data
      const formData = new URLSearchParams();
      formData.append("username", email); // OAuth2 usa "username" pero enviamos email
      formData.append("password", password);

      const response = await fetchAPI<LoginResponse>("/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "X-Device-ID": deviceId,
        },
        body: formData.toString(),
      });

      // Guardar email si requiere OTP
      if (response.otp_required) {
        this.pendingLoginEmail = email;
      }

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Verificar código OTP para completar login
   */
  async verifyOTP(
    otpCode: string,
    rememberDevice: boolean = false,
  ): Promise<LoginResponse> {
    try {
      if (!this.pendingLoginEmail) {
        throw { status: 400, message: "No pending login. Please login first." };
      }

      const deviceId = await this.getOrCreateDeviceId();

      const otpData: OTPVerifyRequest = {
        email: this.pendingLoginEmail,
        otp_code: otpCode,
        device_id: deviceId,
        device_name: getDeviceName(),
        device_type: getDeviceType(),
        remember_device: rememberDevice,
      };

      const response = await fetchAPI<LoginResponse>("/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify(otpData),
      });

      // Limpiar email pendiente
      this.pendingLoginEmail = null;

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Reenviar código OTP
   */
  async resendOTP(email?: string): Promise<{ message: string }> {
    try {
      const targetEmail = email || this.pendingLoginEmail;

      if (!targetEmail) {
        throw { status: 400, message: "No email provided." };
      }

      const response = await fetchAPI<{ message: string }>(
        `/auth/resend-otp?email=${encodeURIComponent(targetEmail)}`,
        {
          method: "POST",
        },
      );

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Activar cuenta con token
   */
  async activateAccount(token: string): Promise<{ message: string }> {
    try {
      const response = await fetchAPI<{ message: string }>(
        `/auth/verify-email?token=${encodeURIComponent(token)}`,
        {
          method: "POST",
        },
      );

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Reenviar email de activación
   */
  async resendActivationEmail(email: string): Promise<{ message: string }> {
    try {
      const response = await fetchAPI<{ message: string }>(
        `/auth/resend-activation?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        },
      );

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Obtener dispositivos de confianza (requiere autenticación)
   */
  async getTrustedDevices(accessToken: string): Promise<TrustedDevice[]> {
    try {
      const response = await fetchAPI<TrustedDevice[]>("/auth/devices", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Obtener datos del usuario actual (requiere autenticación)
   */
  async getCurrentUser(accessToken: string): Promise<User> {
    try {
      const response = await fetchAPI<User>("/users/me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Eliminar dispositivo de confianza (requiere autenticación)
   */
  async removeTrustedDevice(
    accessToken: string,
    deviceId: string,
  ): Promise<{ message: string }> {
    try {
      const response = await fetchAPI<{ message: string }>(
        `/auth/devices/${encodeURIComponent(deviceId)}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Eliminar todos los dispositivos de confianza (requiere autenticación)
   */
  async removeAllTrustedDevices(
    accessToken: string,
  ): Promise<{ message: string; count: number }> {
    try {
      const response = await fetchAPI<{ message: string; count: number }>(
        "/auth/devices",
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Renovar access token usando refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<LoginResponse> {
    try {
      console.log("🔄 Renovando access token...");
      // Some backends expect a user_id query parameter when refreshing tokens.
      // Try to include it if we have stored user data to satisfy such backends.
      let endpoint = "/auth/refresh";
      try {
        // Prefer to derive the exact user identifier the backend expects.
        // Try multiple sources (access token claims, refresh token claims, stored user) in that order.
        const user = await storageService.getUserData();
        let userIdToUse: any = null;

        try {
          // 1) Try access token claims (even if expired, it often contains sub/claims)
          const accessToken = await storageService.getAccessToken();
          if (accessToken) {
            const decodedAccess = decodeToken(accessToken);
            userIdToUse =
              decodedAccess?.sub ||
              decodedAccess?.user_id ||
              decodedAccess?.id ||
              null;
            if (userIdToUse) {
              console.log(
                "🔎 user_id extraído del access token (claims):",
                String(userIdToUse).slice(-8),
              );
            }
          }
        } catch (e) {
          // ignore
        }

        // 2) If not found, try refresh token claims (if JWT)
        if (!userIdToUse && typeof refreshToken === "string") {
          try {
            const decoded = decodeToken(refreshToken);
            userIdToUse =
              decoded?.sub || decoded?.user_id || decoded?.id || null;
            if (userIdToUse) {
              console.log(
                "🔎 user_id extraído del refresh token (claims):",
                String(userIdToUse).slice(-8),
              );
            }
          } catch (e) {
            // ignore decoding errors
          }
        }

        // 3) If still not found, fall back to stored user.id
        if (!userIdToUse && user && user.id) {
          userIdToUse = user.id;
          console.log(
            "🔎 user_id extraído de storage.user.id:",
            String(userIdToUse).slice(-8),
          );
        }

        // 4) As last resort try username or email if available
        if (!userIdToUse && user) {
          userIdToUse = user.username || user.email || null;
          if (userIdToUse) {
            console.log(
              "🔎 user identifier fallback (username/email):",
              String(userIdToUse),
            );
          }
        }

        if (userIdToUse) {
          endpoint = `/auth/refresh?user_id=${encodeURIComponent(String(userIdToUse))}`;
        }
      } catch (e) {
        // ignore storage/decoding errors and proceed without user id
      }

      // Helper to mask token when logging (avoid full token leaks)
      const mask = (s: string) =>
        s && s.length > 8 ? `***${s.slice(-6)}` : "***";

      console.log("🔍 Intentando refresh con user_id endpoint:", endpoint);

      // First attempt: JSON body with refresh_token (existing behavior)
      try {
        const response = await fetchAPI<LoginResponse>(endpoint, {
          method: "POST",
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
        console.log("✅ Token renovado exitosamente (json body)");
        return response;
      } catch (firstErr: any) {
        console.warn(
          "⚠️ Primer intento de refresh falló:",
          firstErr?.message || firstErr,
        );

        // If server says invalid user, try alternative payloads before giving up
        if (firstErr && firstErr.status === 401) {
          console.log(
            "🔁 Intentando formatos alternativos de refresh (falló json body)",
          );

          // Attempt 2: no user_id in query (some backends reject mismatched user_id)
          try {
            const resp2 = await fetchAPI<LoginResponse>("/auth/refresh", {
              method: "POST",
              body: JSON.stringify({ refresh_token: refreshToken }),
            });
            console.log("✅ Token renovado exitosamente (sin user_id)");
            return resp2;
          } catch (err2: any) {
            console.warn(
              "⚠️ Intento sin user_id falló:",
              err2?.message || err2,
            );
          }

          // Attempt 3: form-urlencoded body
          try {
            const form = new URLSearchParams();
            form.append("refresh_token", refreshToken);
            const resp3 = await fetchAPI<LoginResponse>("/auth/refresh", {
              method: "POST",
              headers: { "Content-Type": "application/x-www-form-urlencoded" },
              body: form.toString(),
            });
            console.log("✅ Token renovado exitosamente (form-urlencoded)");
            return resp3;
          } catch (err3: any) {
            console.warn(
              "⚠️ Intento form-urlencoded falló:",
              err3?.message || err3,
            );
          }

          // Attempt 4: send refresh token in Authorization header
          try {
            const resp4 = await fetchAPI<LoginResponse>("/auth/refresh", {
              method: "POST",
              headers: { Authorization: `Bearer ${refreshToken}` },
            });
            console.log(
              "✅ Token renovado exitosamente (Authorization header)",
            );
            return resp4;
          } catch (err4: any) {
            console.warn(
              "⚠️ Intento con Authorization header falló:",
              err4?.message || err4,
            );
          }
        }

        // If we reach here, all attempts failed — rethrow original first error
        throw firstErr;
      }
    } catch (error: any) {
      console.error("❌ Error renovando token:", error);

      // If the refresh failed with 401/Invalid user, clear local storage to prevent loops
      try {
        if (error && error.status === 401) {
          console.log(
            "🧹 Refresh failed with 401 — clearing local storage and requiring login",
          );
          await storageService.clear();
          // Provide a clear message to upstream
          throw {
            status: 401,
            message:
              "Refresh failed: invalid user or expired refresh token. Please login again.",
            data: (error as any)?.data,
          };
        }
      } catch (e) {
        // ignore clear errors
      }

      throw this.handleError(error);
    }
  }

  /**
   * Solicitar reset de contraseña
   * Envía un email con el link para resetear la contraseña
   */
  async requestPasswordReset(email: string): Promise<{ message: string }> {
    try {
      const response = await fetchAPI<{ message: string }>(
        `/auth/request-password-reset?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        },
      );

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Resetear contraseña con token
   * @param token - Token recibido por email
   * @param newPassword - Nueva contraseña
   */
  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    try {
      const response = await fetchAPI<{ message: string }>(
        "/auth/reset-password",
        {
          method: "POST",
          body: JSON.stringify({
            token,
            new_password: newPassword,
          }),
        },
      );

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Obtener email pendiente de verificación OTP
   */
  getPendingLoginEmail(): string | null {
    return this.pendingLoginEmail;
  }

  /**
   * Limpiar estado pendiente
   */
  clearPendingLogin(): void {
    this.pendingLoginEmail = null;
  }

  /**
   * Manejar errores de la API
   */
  private handleError(error: any): APIError {
    if (error.status !== undefined) {
      return error as APIError;
    }

    // Error desconocido
    return {
      status: 500,
      message: "Error desconocido. Por favor intenta de nuevo.",
    };
  }
}

export default new AuthService();
