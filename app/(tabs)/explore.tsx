import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GradientBackground from '../../components/GradientBackground';
import { useTranslation } from '../../hooks/use-translation';

export default function ExploreScreen() {
  const { t } = useTranslation();

  return (
    <GradientBackground>
      <SafeAreaView className="flex-1">
        <View className="flex-1 items-center justify-center">
          <Text className="text-2xl font-bold text-white">
            {t('tabs.explore')}
          </Text>
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}

