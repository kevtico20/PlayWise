# Integración API Wishlist - PlayWise

## Resumen de cambios realizados

### 1. Servicios actualizados (`services/wishlistService.ts`)
- ✅ Añadido campo `api_rating` a interfaces `GameCreate` y `GameRead` (requerido por tu API)
- ✅ Implementado `mapRawgToGameCreate()`: mapea datos de RAWG al schema de tu backend
- ✅ Implementado `addGameToBackend()`: POST a `/api/games/` con toda la info del juego
- ✅ Implementado `toggleWishlist()`: función principal que:
  1. Obtiene detalles completos desde RAWG API (descripción, plataformas, desarrollador, etc.)
  2. Mapea los campos al formato de tu API
  3. Envía POST a `https://playwise.azurewebsites.net/api/games/`
  4. Retorna el juego creado y el nuevo estado del wishlist

### 2. Componente actualizado (`components/main/GameCard.tsx`)
- ✅ Importado `wishlistService`
- ✅ Añadido estado `loading` para mostrar spinner durante la petición
- ✅ Actualizado `handleWishlist()` para ser async y llamar a `wishlistService.toggleWishlist()`
- ✅ Añadido `ActivityIndicator` mientras se procesa la petición
- ✅ Manejo de errores con console.error (puedes añadir toast/alert más adelante)

### 3. Configuración de entorno (`.env`)
- ✅ Actualizado `EXPO_PUBLIC_API_URL` a `https://playwise.azurewebsites.net/api`
- ✅ Mantenida la `RAWG_KEY` para obtener detalles completos de juegos

## Mapeo de campos RAWG → API Backend

```typescript
{
  name: string           // RAWG: details.name
  genre: string          // RAWG: details.genres[0].name
  api_id: string         // RAWG: game ID (ej: "3498")
  description: string    // RAWG: details.description_raw (sin HTML)
  api_rating: string     // RAWG: details.rating (ej: "4.5")
  cover_image: string    // RAWG: details.background_image (URL)
  release_date: string   // RAWG: details.released (ej: "2020-03-20")
  platforms: string      // RAWG: details.platforms (CSV: "PC, PS4, Xbox")
  developer: string      // RAWG: details.developers[0].name
  publisher: string      // RAWG: details.publishers[0].name
}
```

## Flujo de ejecución

1. **Usuario pulsa el corazón en GameCard**
2. `handleWishlist()` se ejecuta (estado loading = true)
3. `wishlistService.toggleWishlist()` recibe:
   - `apiId`: ID del juego en RAWG (ej: "3498")
   - `partialData`: datos básicos ya disponibles (título, género, imagen, rating)
   - `currentState`: estado actual del wishlist (true/false)
4. **Fetch detalles completos desde RAWG**:
   - Llamada a `getGameDetails(apiId)` → obtiene descripción, plataformas, dev, publisher
5. **Mapeo a schema del backend**:
   - `mapRawgToGameCreate()` transforma datos RAWG a formato API
6. **POST a Azure API**:
   - `addGameToBackend()` → POST `/api/games/` con payload completo
7. **Respuesta**:
   - Backend crea o actualiza el registro del juego
   - Retorna el juego con su ID de base de datos
8. **UI actualiza**:
   - Estado `wishlisted` cambia
   - Corazón cambia de color
   - Loading desaparece

## Cómo probar

### Paso 1: Reiniciar Metro con nuevas variables de entorno
```bash
cd /Users/kevin/Documents/ProyectoGlobalizacion/PlayWise
npx expo start --clear
```

### Paso 2: Abrir en emulador/dispositivo
- iOS: presiona `i`
- Android: presiona `a`
- Expo Go: escanea QR

### Paso 3: Navegar a Main y probar
1. Ve a la pantalla principal (Main)
2. Verás tarjetas de juegos con corazones
3. Pulsa un corazón → verás spinner breve
4. El corazón cambiará a rojo (filled) si se agregó
5. En consola Metro verás: `[GameCard] Wishlist toggled: <nombre del juego> - wishlisted: true`

### Paso 4: Verificar en backend
Revisa tu base de datos en Azure o llama a:
```bash
curl -X 'GET' 'https://playwise.azurewebsites.net/api/games/' -H 'accept: application/json'
```

## Debugging

### Ver logs en Metro
```bash
# En la terminal donde corre Metro, busca:
[GameCard] Wishlist toggled: <game_name> - wishlisted: true/false
[WishlistService] Error fetching RAWG details... # Si falla fetch RAWG
[GameCard] Error toggling wishlist: ... # Si falla POST a backend
```

### Errores comunes

#### Error: "Network request failed"
- Verifica que tu dispositivo/emulador tenga internet
- Confirma que `https://playwise.azurewebsites.net` esté accesible
- Prueba con curl manual:
```bash
curl -X 'POST' \
  'https://playwise.azurewebsites.net/api/games/' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "name": "Test Game",
  "genre": "Action",
  "api_id": "12345",
  "description": "Test description",
  "api_rating": "4.5",
  "cover_image": "https://example.com/image.jpg",
  "release_date": "2024-01-01",
  "platforms": "PC, PS5",
  "developer": "Test Dev",
  "publisher": "Test Pub"
}'
```

#### Error: 422 Unprocessable Entity
- Revisa que todos los campos requeridos estén presentes
- Verifica que `api_rating` sea string (no number)
- Confirma formato de fecha `release_date` (YYYY-MM-DD o string simple)

#### Error: RAWG API key missing
- Asegúrate de que `.env` tenga `EXPO_PUBLIC_RAWG_KEY` con valor válido
- Reinicia Metro después de cambiar `.env`

## Próximas mejoras sugeridas

### 1. Persistir estado del wishlist
Actualmente, el estado del corazón se resetea al recargar la app. Para persistir:
- Guardar lista de IDs wishlisted en `AsyncStorage` o backend
- Al montar `GameCard`, consultar si ese ID está en wishlist
- Implementar endpoint GET en backend: `/api/wishlists?user_id=X`

### 2. Gestión de usuario/autenticación
Si tu backend requiere autenticación:
- Actualizar `addGameToBackend()` para incluir token de usuario
- Usar `fetchAuthAPI()` en lugar de `fetchAPI()`
- Ejemplo:
```typescript
const token = await storageService.getAccessToken();
const created = await fetchAuthAPI<GameRead>('/games/', token, {
  method: 'POST',
  body: JSON.stringify(payload),
});
```

### 3. Toast/Alert de feedback
Añadir feedback visual al usuario:
```typescript
import { Alert } from 'react-native';

// En handleWishlist:
try {
  const result = await wishlistService.toggleWishlist(...);
  Alert.alert('Éxito', `${result.game.name} ${result.wishlisted ? 'añadido a' : 'eliminado de'} favoritos`);
} catch (err) {
  Alert.alert('Error', 'No se pudo actualizar favoritos. Intenta de nuevo.');
}
```

### 4. Optimistic UI
Para mejor UX:
```typescript
// Cambiar estado inmediatamente antes de llamar API
setWishlisted(!wishlisted);
try {
  await wishlistService.toggleWishlist(...);
} catch (err) {
  // Revertir en caso de error
  setWishlisted(wishlisted);
  Alert.alert('Error', 'No se pudo actualizar');
}
```

## Testing manual rápido

Ejecuta este comando para probar el endpoint manualmente:
```bash
curl -X 'POST' \
  'https://playwise.azurewebsites.net/api/games/' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "name": "The Witcher 3: Wild Hunt",
  "genre": "RPG",
  "api_id": "3328",
  "description": "The Witcher: Wild Hunt is a story-driven, next-generation open world role-playing game.",
  "api_rating": "4.66",
  "cover_image": "https://media.rawg.io/media/games/618/618c2031a07bbff6b4f611f10b6bcdbc.jpg",
  "release_date": "2015-05-18",
  "platforms": "PC, PlayStation 4, Xbox One, Nintendo Switch",
  "developer": "CD PROJEKT RED",
  "publisher": "CD PROJEKT RED"
}'
```

Si recibes un 200/201 con el juego creado, la integración funcionará correctamente en la app.

## Archivos modificados

- ✅ `services/wishlistService.ts` - Lógica de integración con API
- ✅ `components/main/GameCard.tsx` - UI con toggle del corazón
- ✅ `.env` - Configuración de URLs

## Comandos útiles

```bash
# Ver logs en tiempo real
npx expo start

# Limpiar caché y reiniciar
npx expo start --clear

# Ver errores de compilación
npx tsc --noEmit

# Probar conexión a API
curl https://playwise.azurewebsites.net/api/games/

# Ver variables de entorno cargadas
node -e "console.log(process.env.EXPO_PUBLIC_API_URL)"
```

---

**Nota importante**: Asegúrate de reiniciar Metro (`npx expo start --clear`) después de cambiar `.env` para que las nuevas variables de entorno se carguen correctamente.
