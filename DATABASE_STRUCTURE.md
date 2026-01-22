# 📊 Estructura de Base de Datos - PlayWise

## 🎮 Tabla: `games`

### Propósito

Almacena información de los juegos únicos en el sistema.

### Estructura

```typescript
{
  id: number              // PRIMARY KEY - Auto-generado
  name: string            // Nombre del juego (ej: "Elden Ring")
  api_id: string          // UNIQUE - ID de RAWG API (ej: "5646")
  genre?: string          // Género (ej: "Action RPG")
  description?: string    // Descripción larga
  cover_image?: string    // URL de la imagen de portada
  release_date?: string   // Fecha de lanzamiento
  platforms?: string      // Plataformas soportadas
  developer?: string      // Desarrollador
  publisher?: string      // Editorial
  created_at: timestamp   // Creado en (auto)
  updated_at: timestamp   // Actualizado en (auto)
}
```

### Endpoints

- `GET /games/by-api-id/{api_id}` - Obtener juego por API ID
- `POST /games` - Crear nuevo juego
- `GET /games/{id}` - Obtener juego por ID

---

## ❤️ Tabla: `wishlists`

### Propósito

Almacena la relación entre usuarios y los juegos que han guardado en su wishlist.

### Estructura

```typescript
{
  id: number              // PRIMARY KEY - Auto-generado
  user_id: number         // FOREIGN KEY → users.id
  game_id: number         // FOREIGN KEY → games.id
  url?: string            // URL de compra (opcional, ej: Steam link)
  created_at: timestamp   // Agregado a wishlist en
  updated_at: timestamp   // Actualizado en
}
```

### Endpoints

- `POST /wishlists` - Agregar juego a wishlist (requiere auth)
- `GET /wishlists` - Listar wishlist del usuario actual
- `GET /wishlists?game_id={id}` - Filtrar por juego
- `DELETE /wishlists/{id}` - Remover de wishlist

---

## 👤 Tabla: `users`

### Propósito

Almacena información de los usuarios del sistema.

### Estructura

```typescript
{
  id: number              // PRIMARY KEY - Auto-generado
  username: string        // Nombre de usuario
  email: string           // Email único
  password_hash: string   // Hash de contraseña (bcrypt)
  age?: string            // Edad
  gender?: string         // Género
  profile_picture?: string // URL de foto de perfil
  role: string            // Rol (admin, user, etc)
  is_active: boolean      // Activo/Inactivo
  is_verified: boolean    // Email verificado
  auth_provider: string   // Proveedor de auth (local, google, etc)
  created_at: timestamp   // Registrado en
  updated_at: timestamp   // Actualizado en
}
```

---

## 📝 Request/Response Examples

### Crear Juego

```json
POST /api/games
Content-Type: application/json

{
  "name": "Elden Ring",
  "api_id": "5646",
  "genre": "Action RPG",
  "cover_image": "https://...",
  "description": "Descripción...",
  "developer": "FromSoftware",
  "publisher": "Bandai Namco"
}

Response: 200 OK
{
  "id": 1,
  "name": "Elden Ring",
  "api_id": "5646",
  ...
}
```

### Agregar a Wishlist

```json
POST /api/wishlists
Authorization: Bearer {token}
Content-Type: application/json

{
  "game_id": 1,
  "url": "https://store.steampowered.com/app/570940/"
}

Response: 201 Created
{
  "id": 1,
  "user_id": 1,
  "game_id": 1,
  "url": "https://store.steampowered.com/app/570940/",
  "created_at": "2026-01-21T..."
}
```

### Listar Wishlist

```json
GET /api/wishlists
Authorization: Bearer {token}

Response: 200 OK
[
  {
    "id": 1,
    "user_id": 1,
    "game_id": 1,
    "game": {
      "id": 1,
      "name": "Elden Ring",
      "cover_image": "https://...",
      ...
    },
    "created_at": "2026-01-21T..."
  }
]
```

---

## 🔍 Flujo de Guardado en Wishlist

```
Usuario toca corazón
    ↓
[Frontend] Valida datos del juego
    ↓
[Frontend] Llama wishlistService.addByApiId()
    ↓
Paso 1: ensureGameRecord()
  → GET /api/games/by-api-id/{api_id}
  ↓ 200 OK → Juego existe, retorna
  ↓ 404 NOT FOUND → POST /api/games (crear juego nuevo)
    ↓
Paso 2: addToWishlist(gameId)
  → POST /api/wishlists con { game_id: 1, url: null }
  ↓ 201 CREATED → Éxito!
  ↓ 400/401/500 → Error
    ↓
[Frontend] Actualiza UI y muestra alert
```

---

## 🚨 Errores Comunes

| Error                     | Causa                      | Solución                      |
| ------------------------- | -------------------------- | ----------------------------- |
| 401 Unauthorized          | Token no valido o expirado | Re-login                      |
| 404 Not Found             | API endpoint incorrecto    | Revisar URL base              |
| 400 Bad Request           | Payload incorrecto         | Verificar estructura de datos |
| Network Error             | Sin conexión al servidor   | Verificar servidor backend    |
| 500 Internal Server Error | Error en el servidor       | Ver logs del backend          |

---

## 💡 Debugging Tips

### En el Frontend (Console)

Busca logs como:

```
🎮 ========== WISHLIST PROCESS STARTED ==========
📝 Game Payload: {...}
❤️ Agregando a wishlist. GameID: 1
📤 POST /wishlists con body: {...}
✅ ÉXITO! Guardado en BD
```

### En el Backend

- Revisa los logs de uvicorn/FastAPI
- Busca requests POST a `/api/games` y `/api/wishlists`
- Verifica que el token JWT sea válido
- Confirma que la BD está ejecutándose

### Test en Postman

```
1. Login y obtener token
2. POST /api/games con payload
3. POST /api/wishlists con game_id del paso 2
4. GET /api/wishlists para confirmar
```
