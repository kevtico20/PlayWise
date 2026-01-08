import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LogBox } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import '../i18n'; // Inicializar i18n
import './global.css';

// Temporary: suppress a known internal React error that is breaking the UI while
// we bisect the root cause. This filters the specific message so the app keeps running.
// IMPORTANT: keep this temporary and remove once the underlying issue is fixed.
try {
  const IGNORED_MESSAGE = 'Expected static flag was missing';
  // Suppress LogBox warnings/errors that match
  LogBox.ignoreLogs([IGNORED_MESSAGE]);

  // Wrap console.error to avoid noisy RedBox for this specific internal message
  const originalConsoleError = console.error.bind(console);
  console.error = (...args: any[]) => {
    try {
      const first = args[0];
      if (typeof first === 'string' && first.includes(IGNORED_MESSAGE)) {
        // Log as warn locally but prevent RedBox
        console.warn('[suppressed React internal error]', first);
        return;
      }
    } catch (e) {
      // ignore
    }
    originalConsoleError(...args);
  };

  // Set a global error handler that swallows the specific internal React error
  const globalAny: any = global;
  if (globalAny?.ErrorUtils && typeof globalAny.ErrorUtils.getGlobalHandler === 'function') {
    const prevHandler = globalAny.ErrorUtils.getGlobalHandler();
    globalAny.ErrorUtils.setGlobalHandler((error: any, isFatal?: boolean) => {
      if (error && error.message && typeof error.message === 'string' && error.message.includes(IGNORED_MESSAGE)) {
        // eslint-disable-next-line no-console
        console.warn('[suppressed React internal error - global handler]', error.message);
        return;
      }
      if (prevHandler) return prevHandler(error, isFatal);
    });
  }
} catch (e) {
  // If any of the above APIs are unavailable, skip silently.
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="light" />
      </>
    </GestureHandlerRootView>
  );
}
