/**
 * Auth Service
 * Servicio para operaciones de autenticación con el backend
 */

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
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface APIError {
  status: number;
  message: string;
  data?: any;
}

// ==================== AUTH SERVICE ====================
class AuthService {
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
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      // FastAPI OAuth2 espera el formato form-data
      const formData = new URLSearchParams();
      formData.append("username", email); // OAuth2 usa "username" pero enviamos email
      formData.append("password", password);

      const response = await fetchAPI<LoginResponse>("/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
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
