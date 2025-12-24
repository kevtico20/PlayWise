import { Tabs } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useTranslation } from '../../hooks/use-translation';

export default function TabLayout() {
  const { t } = useTranslation();

  return (
    <SafeAreaProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: t('tabs.home'),
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: t('tabs.explore'),
          }}
        />
      </Tabs>
    </SafeAreaProvider>
  );
}
