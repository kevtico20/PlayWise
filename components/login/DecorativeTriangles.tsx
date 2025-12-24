import { View } from 'react-native';

export default function DecorativeTriangles() {
  return (
    <View className="absolute bottom-0 left-0 right-0 h-40 flex-row justify-between items-end pb-4 px-4">
      {/* Triángulo izquierdo - triple capa */}
      <View className="relative">
        {/* Capa exterior más grande */}
        <View 
          className="w-0 h-0 border-l-[80px] border-r-[80px] border-b-[140px]"
          style={{
            borderLeftColor: 'transparent',
            borderRightColor: 'transparent',
            borderBottomColor: '#2a3a8f',
            opacity: 0.3,
          }}
        />
        {/* Capa media */}
        <View 
          className="absolute bottom-0 w-0 h-0 border-l-[65px] border-r-[65px] border-b-[110px]"
          style={{
            borderLeftColor: 'transparent',
            borderRightColor: 'transparent',
            borderBottomColor: '#1a2f7f',
            opacity: 0.4,
            left: 7,
          }}
        />
        {/* Capa interior */}
        <View 
          className="absolute bottom-0 w-0 h-0 border-l-[50px] border-r-[50px] border-b-[85px]"
          style={{
            borderLeftColor: 'transparent',
            borderRightColor: 'transparent',
            borderBottomColor: '#3a4f9f',
            opacity: 0.5,
            left: 15,
          }}
        />
      </View>

      {/* Triángulo derecho - triple capa */}
      <View className="relative">
        {/* Capa exterior más grande */}
        <View 
          className="w-0 h-0 border-l-[80px] border-r-[80px] border-b-[140px]"
          style={{
            borderLeftColor: 'transparent',
            borderRightColor: 'transparent',
            borderBottomColor: '#2a3a8f',
            opacity: 0.3,
          }}
        />
        {/* Capa media */}
        <View 
          className="absolute bottom-0 w-0 h-0 border-l-[65px] border-r-[65px] border-b-[110px]"
          style={{
            borderLeftColor: 'transparent',
            borderRightColor: 'transparent',
            borderBottomColor: '#1a2f7f',
            opacity: 0.4,
            right: 7,
          }}
        />
        {/* Capa interior */}
        <View 
          className="absolute bottom-0 w-0 h-0 border-l-[50px] border-r-[50px] border-b-[85px]"
          style={{
            borderLeftColor: 'transparent',
            borderRightColor: 'transparent',
            borderBottomColor: '#3a4f9f',
            opacity: 0.5,
            right: 15,
          }}
        />
      </View>
    </View>
  );
}
