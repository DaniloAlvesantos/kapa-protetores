import { z } from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Text, View } from 'react-native';
import { SecondaryInputText } from '@/components/inputText/secondary';
import { EnvelopeSimpleIcon, LockIcon } from 'phosphor-react-native';
import { PrimaryButton } from '@/components/buttons/primary';
import GoogleSvg from '@/../assets/google.svg';
import { useAuth } from '@/hooks/useAuth';

import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { useEffect, useState } from 'react';

WebBrowser.maybeCompleteAuthSession();

const loginSchema = z.object({
  email: z.string().email('Formato de e-mail inválido'),
  password: z.string().min(1, 'A senha é obrigatória'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { signIn, handleGoogleLogin } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  });

  const { control, handleSubmit, formState } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setErrorMessage(null);
      await signIn(data.email, data.password);
    } catch (err: unknown) {
      const axiosError = err as {
        response?: {
          data?: {
            message?: string;
            error?: string;
          };
        };
      };
      const message =
        axiosError?.response?.data?.message ||
        axiosError?.response?.data?.error ||
        'E-mail ou senha incorretos. Verifique suas credenciais.';
      setErrorMessage(message);
    }
  };

  useEffect(() => {
    if (response?.type === 'success') {
      const idToken =
        response.params?.id_token ??
        response.authentication?.idToken ??
        response.params?.access_token;

      if (idToken) {
        handleGoogleLogin(idToken).catch((err: unknown) => {
          const axiosError = err as {
            response?: {
              data?: {
                message?: string;
                error?: string;
              };
            };
          };
          const message =
            axiosError?.response?.data?.message ||
            axiosError?.response?.data?.error ||
            'Falha na autenticação com o Google.';
          setErrorMessage(message);
        });
      }
    }
  }, [response, handleGoogleLogin]);

  const googleAuthError =
    response?.type === 'error' ? 'Falha ao autenticar com o Google.' : null;
  const activeErrorMessage = errorMessage || googleAuthError;

  const googleSignIn = async () => {
    setErrorMessage(null);
    await promptAsync();
  };

  return (
    <View className="px-4">
      <View className="flex flex-col items-center gap-5 w-full">
        {activeErrorMessage && (
          <View className="w-full p-3 rounded-lg bg-[#FFDAD6] border border-[#BA1A1A]/30">
            <Text className="text-xs font-semibold text-[#93000A] text-center">
              {activeErrorMessage}
            </Text>
          </View>
        )}
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <>
              <SecondaryInputText
                label="Email"
                icon={<EnvelopeSimpleIcon size={28} color="#57423B50" />}
                value={value}
                onChangeText={onChange}
                placeholder="kapa@gmail.com"
              />

              {error && (
                <Text className="w-full mt-[-12px] text-xs font-medium text-red-500">
                  {error.message}
                </Text>
              )}
            </>
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <>
              <SecondaryInputText
                label="Senha"
                icon={<LockIcon size={28} color="#57423B50" />}
                value={value}
                onChangeText={onChange}
                placeholder={'•'.repeat(8)}
                isPassword
              />

              {error && (
                <Text className="w-full mt-[-12px] text-xs font-medium text-red-500">
                  {error.message}
                </Text>
              )}
            </>
          )}
        />
        <Text className="w-full text-sm font-semibold text-right text-orange cursor-pointer">
          Esqueceu a senha?
        </Text>
        <PrimaryButton
          title="Entrar"
          className="mt-1"
          loading={formState.isSubmitting}
          onPress={handleSubmit(onSubmit)}
        />
      </View>

      <View className="flex-row items-center w-full px-5 my-5">
        <View className="flex-1 h-[1px] bg-border my-3" />
        <Text className="text-sm font-semibold text-ink-muted mx-4">
          ou continue com
        </Text>
        <View className="flex-1 h-[1px] bg-border my-3" />
      </View>

      <PrimaryButton
        title="Google"
        color="#ffffff"
        pressedColor="#f7f7f7"
        textColor="#1C1C19"
        className="border-2 border-border"
        icon={<GoogleSvg width={24} height={24} />}
        onPress={googleSignIn}
        disabled={!request}
      />

      <Text className="text-center my-6 text-sm text-ink-muted">
        Não tenho uma conta?{' '}
        <Text className="text-orange font-bold">Cadastre-se</Text>
      </Text>
    </View>
  );
}
