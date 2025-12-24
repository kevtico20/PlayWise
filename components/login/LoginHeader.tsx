import { Image, View } from 'react-native';

export default function LoginHeader() {
  return (
    <View className="h-64 w-full overflow-hidden relative">
      <Image
        source={{ uri: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&q=80' }}
        className="w-full h-full"
        resizeMode="cover"
      />
      {/* Overlay con gradiente */}
      <View 
        className="absolute inset-0"
        style={{
          backgroundColor: 'rgba(219, 0, 0, 0.15)',
        }}
      />
      {/* Efecto de diagonal */}
      <View 
        className="absolute bottom-0 left-0 right-0 h-24"
        style={{
          backgroundColor: 'transparent',
        }}
      >
        <View 
          className="absolute bottom-0 w-full h-full"
          style={{
            backgroundColor: '#010009',
            transform: [{ skewY: '-2deg' }],
          }}
        />
      </View>
    </View>
  );
}
