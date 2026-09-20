import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Logo from '@/../assets/Logo 2.svg';
import { LoginForm } from '@/components/forms/login';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';

WebBrowser.maybeCompleteAuthSession();

export function LoginScreen() {
  const { handleGoogleLogin } = useAuth();

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;

      if (id_token) {
        handleGoogleLogin(id_token);
      }
    }
  }, [response]);

  return (
    <SafeAreaView
      edges={['left', 'right', 'bottom']}
      className="flex-1 bg-cream"
    >
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerClassName="px-4 py-8"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex items-center justify-center mx-auto gap-4">
            <Logo width={184} height={75} />
            <Text className="text-3xl font-bold text-ink text-center">
              Bem-vindo de volta
            </Text>
            <Text className="text-base text-ink-muted text-center w-[280px]">
              Entre para acompanhar suas adoções e favoritos.
            </Text>
          </View>

          <View className="w-full md:w-1/2 md:mx-auto mt-4">
            <LoginForm />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
