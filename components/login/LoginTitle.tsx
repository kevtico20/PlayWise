import { Text, View } from 'react-native';

export default function LoginTitle() {
  return (
    <View className="mb-8">
      <Text className="text-3xl font-bold text-center mb-2">
        <Text style={{ color: '#DB0000' }}>READY </Text>
        <Text className="text-white">TO PLAY?</Text>
      </Text>
      <View className="w-24 h-1 self-center" style={{ backgroundColor: '#DB0000' }} />
    </View>
  );
}
