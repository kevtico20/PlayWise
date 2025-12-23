import { Pressable, ScrollView, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-6">
        {/* Hero Section */}
        <View className="bg-blue-600 rounded-3xl p-8 mb-6">
          <Text className="text-4xl font-bold text-white mb-3">
            🎮 PlayWise
          </Text>
          <Text className="text-lg text-white mb-6">
            Descubre, juega y comparte tus juegos favoritos
          </Text>
          <View className="flex-row gap-3">
            <View className="bg-blue-500 px-4 py-2 rounded-full">
              <Text className="text-white font-semibold">🎯 Acción</Text>
            </View>
            <View className="bg-blue-500 px-4 py-2 rounded-full">
              <Text className="text-white font-semibold">🏆 RPG</Text>
            </View>
            <View className="bg-blue-500 px-4 py-2 rounded-full">
              <Text className="text-white font-semibold">🎨 Indie</Text>
            </View>
          </View>
        </View>

        {/* Stats Cards */}
        <View className="flex-row gap-3 mb-6">
          <View className="flex-1 bg-white rounded-2xl p-5 border border-gray-200">
            <Text className="text-3xl font-bold text-blue-600 mb-1">1.2K</Text>
            <Text className="text-gray-600 text-sm">Juegos</Text>
          </View>
          <View className="flex-1 bg-white rounded-2xl p-5 border border-gray-200">
            <Text className="text-3xl font-bold text-purple-600 mb-1">856</Text>
            <Text className="text-gray-600 text-sm">Usuarios</Text>
          </View>
          <View className="flex-1 bg-white rounded-2xl p-5 border border-gray-200">
            <Text className="text-3xl font-bold text-pink-600 mb-1">342</Text>
            <Text className="text-gray-600 text-sm">Reseñas</Text>
          </View>
        </View>

        {/* Featured Games */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-800 mb-4">
            Juegos Destacados
          </Text>
          
          {/* Game Card 1 */}
          <Pressable className="bg-white rounded-2xl mb-4 overflow-hidden border border-gray-200">
            <View className="bg-orange-500 h-32 justify-end p-4">
              <Text className="text-2xl font-bold text-white">🔥 Cyberpunk 2077</Text>
            </View>
            <View className="p-4">
              <View className="flex-row items-center gap-2 mb-2">
                <Text className="text-yellow-500 text-lg">★★★★☆</Text>
                <Text className="text-gray-600 font-semibold">4.5</Text>
              </View>
              <Text className="text-gray-600 mb-3">
                Explora Night City en este RPG futurista de mundo abierto
              </Text>
              <View className="flex-row gap-2">
                <View className="bg-orange-100 px-3 py-1 rounded-full">
                  <Text className="text-orange-700 text-xs font-semibold">RPG</Text>
                </View>
                <View className="bg-red-100 px-3 py-1 rounded-full">
                  <Text className="text-red-700 text-xs font-semibold">Acción</Text>
                </View>
              </View>
            </View>
          </Pressable>

          {/* Game Card 2 */}
          <Pressable className="bg-white rounded-2xl mb-4 overflow-hidden border border-gray-200">
            <View className="bg-green-500 h-32 justify-end p-4">
              <Text className="text-2xl font-bold text-white">🌿 Zelda: TOTK</Text>
            </View>
            <View className="p-4">
              <View className="flex-row items-center gap-2 mb-2">
                <Text className="text-yellow-500 text-lg">★★★★★</Text>
                <Text className="text-gray-600 font-semibold">5.0</Text>
              </View>
              <Text className="text-gray-600 mb-3">
                Aventura épica en el reino de Hyrule con nuevas mecánicas
              </Text>
              <View className="flex-row gap-2">
                <View className="bg-green-100 px-3 py-1 rounded-full">
                  <Text className="text-green-700 text-xs font-semibold">Aventura</Text>
                </View>
                <View className="bg-blue-100 px-3 py-1 rounded-full">
                  <Text className="text-blue-700 text-xs font-semibold">Exploración</Text>
                </View>
              </View>
            </View>
          </Pressable>

          {/* Game Card 3 */}
          <Pressable className="bg-white rounded-2xl overflow-hidden border border-gray-200">
            <View className="bg-purple-500 h-32 justify-end p-4">
              <Text className="text-2xl font-bold text-white">🎭 Hollow Knight</Text>
            </View>
            <View className="p-4">
              <View className="flex-row items-center gap-2 mb-2">
                <Text className="text-yellow-500 text-lg">★★★★★</Text>
                <Text className="text-gray-600 font-semibold">4.9</Text>
              </View>
              <Text className="text-gray-600 mb-3">
                Metroidvania desafiante con arte cautivador y combate preciso
              </Text>
              <View className="flex-row gap-2">
                <View className="bg-purple-100 px-3 py-1 rounded-full">
                  <Text className="text-purple-700 text-xs font-semibold">Indie</Text>
                </View>
                <View className="bg-pink-100 px-3 py-1 rounded-full">
                  <Text className="text-pink-700 text-xs font-semibold">Plataformas</Text>
                </View>
              </View>
            </View>
          </Pressable>
        </View>

        {/* Action Buttons */}
        <View className="gap-3 mb-6">
          <Pressable className="bg-blue-600 py-5 rounded-2xl">
            <Text className="text-white font-bold text-center text-lg">
              🎮 Explorar Todos los Juegos
            </Text>
          </Pressable>
          <Pressable className="bg-white border-2 border-blue-600 py-5 rounded-2xl">
            <Text className="text-blue-600 font-bold text-center text-lg">
              ⭐ Mi Lista de Deseos
            </Text>
          </Pressable>
        </View>

        {/* Success Badge */}
        <View className="bg-green-500 rounded-2xl p-6 items-center">
          <Text className="text-4xl mb-2">✅</Text>
          <Text className="text-xl font-bold text-white text-center mb-1">
            NativeWind Funcionando
          </Text>
          <Text className="text-white text-center text-sm">
            Todos los estilos de Tailwind CSS están activos
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
