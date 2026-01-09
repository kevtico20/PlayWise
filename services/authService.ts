/**
 * Auth Service
 * Servicio para operaciones de autenticación con el backend
 */

import { decode as base64Decode } from "base-64";
import * as Application from "expo-application";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { fetchAPI } from "./api";

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
    rememberDevice: boolean = false
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
        }
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
        }
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
        }
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
    deviceId: string
  ): Promise<{ message: string }> {
    try {
      const response = await fetchAPI<{ message: string }>(
        `/auth/devices/${encodeURIComponent(deviceId)}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
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
    accessToken: string
  ): Promise<{ message: string; count: number }> {
    try {
      const response = await fetchAPI<{ message: string; count: number }>(
        "/auth/devices",
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
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
