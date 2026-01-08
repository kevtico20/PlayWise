# Game Details Screen (Explore Tab)

## Descripción
Pantalla de detalles de juego que muestra información completa del juego, precios en diferentes tiendas y una sección de comentarios interactiva.

## Componentes

### StoreCard
Muestra la información de precio de un juego en una tienda específica.

**Props:**
- `storeLogo`: URI o recurso local de la imagen del logo de la tienda
- `storeName`: Nombre de la tienda
- `price`: Precio actual del juego
- `originalPrice` (opcional): Precio original antes del descuento
- `discount` (opcional): Porcentaje de descuento

### CommentSection
Sección de comentarios con funcionalidad de agregar comentarios, dar like y responder.

**Props:**
- `comments`: Array de comentarios a mostrar
- `onAddComment`: Callback cuando se agrega un comentario
- `onLikeComment`: Callback cuando se da like a un comentario

**Tipo Comment:**
```typescript
interface Comment {
  id: string;
  userName: string;
  avatar?: string;
  text: string;
  likes: number;
  timeAgo: string;
}
```

## API Integration

### CheapShark API
Se utiliza la API de CheapShark para obtener precios de juegos en diferentes tiendas.

**Función utilizada:**
- `searchDealsByTitle(title: string, pageSize: number)`: Busca ofertas por título del juego

**Tiendas soportadas:**
- Steam (ID: 1)
- GamersGate (ID: 2)
- GreenManGaming (ID: 3)
- GOG (ID: 7)
- Origin (ID: 8)
- Humble Store (ID: 11)
- Uplay (ID: 13)
- Fanatical (ID: 15)
- Epic Games (ID: 25)

## Características

### Visuales
- Fondo con gradiente siguiendo el diseño de la app
- Header reutilizable (MainHeader)
- Cover del juego prominente
- Rating con estrellas
- Descripción del juego
- Cards de tiendas con precios y descuentos
- Sección de comentarios con diseño moderno

### Funcionalidades
- ✅ Carga dinámica de precios desde CheapShark
- ✅ Sistema de comentarios (mock data por ahora)
- ✅ Like en comentarios
- ✅ Agregar comentarios
- ✅ Input con emojis, imágenes y voz (UI implementada)
- ✅ Scroll infinito en comentarios

## Próximos pasos
1. Conectar con backend real para comentarios
2. Implementar sistema de autenticación para comentarios
3. Agregar funcionalidad de responder comentarios
4. Implementar subida de imágenes en comentarios
5. Agregar funcionalidad de búsqueda de juegos
6. Conectar con RAWG API para detalles del juego
