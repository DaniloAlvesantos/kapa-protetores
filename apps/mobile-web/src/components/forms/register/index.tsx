import { z } from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Text, View } from 'react-native';
import { SecondaryInputText } from '@/components/inputText/secondary';
import { EnvelopeSimpleIcon, LockIcon, UserIcon } from 'phosphor-react-native';
import { PrimaryButton } from '@/components/buttons/primary';
import GoogleSvg from '@/../assets/google.svg';
import { useAuth } from '@/hooks/useAuth';
import { router } from 'expo-router';

import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { useEffect, useState } from 'react';

WebBrowser.maybeCompleteAuthSession();

const registerFormSchema = z
  .object({
    username: z
      .string({ required_error: 'Nome de usuário é obrigatório' })
      .trim()
      .min(3, 'Nome de usuário deve ter no mínimo 3 caracteres')
      .max(50, 'Nome de usuário muito longo'),
    email: z
      .string({ required_error: 'E-mail é obrigatório' })
      .trim()
      .toLowerCase()
      .email('Formato de e-mail inválido'),
    password: z
      .string({ required_error: 'Senha é obrigatória' })
      .min(6, 'A senha deve ter no mínimo 6 caracteres')
      .max(128, 'A senha deve ter no máximo 128 caracteres'),
    confirmPassword: z
      .string({ required_error: 'Confirmação de senha é obrigatória' })
      .min(1, 'Confirme sua senha'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerFormSchema>;

export function RegisterForm() {
  const { signUp, handleGoogleLogin } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  });

  const { control, handleSubmit, formState } = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setErrorMessage(null);
      await signUp({
        username: data.username,
        email: data.email,
        password: data.password,
      });
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
        'Não foi possível realizar o cadastro. Tente novamente.';
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
          name="username"
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <>
              <SecondaryInputText
                label="Nome de usuário"
                icon={<UserIcon size={28} color="#57423B50" />}
                value={value}
                onChangeText={onChange}
                placeholder="Ex: Fulano da Silva"
                autoCapitalize="words"
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
          name="email"
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <>
              <SecondaryInputText
                label="E-mail"
                icon={<EnvelopeSimpleIcon size={28} color="#57423B50" />}
                value={value}
                onChangeText={onChange}
                placeholder="fulano.silva@kapa.com"
                keyboardType="email-address"
                autoCapitalize="none"
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
                placeholder="Mínimo 6 caracteres"
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

        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <>
              <SecondaryInputText
                label="Confirmar senha"
                icon={<LockIcon size={28} color="#57423B50" />}
                value={value}
                onChangeText={onChange}
                placeholder="Repita sua senha"
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

        <PrimaryButton
          title="Cadastrar"
          className="mt-2"
          loading={formState.isSubmitting}
          onPress={handleSubmit(onSubmit)}
        />
      </View>

      <View className="flex-row items-center w-full px-5 my-5">
        <View className="flex-1 h-[1px] bg-border my-3" />
        <Text className="text-sm font-semibold text-ink-muted mx-4">
          ou cadastre-se com
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
        Já tem uma conta?{' '}
        <Text
          className="text-orange font-bold cursor-pointer"
          onPress={() => router.push('/signIn')}
        >
          Entrar
        </Text>
      </Text>
    </View>
  );
}
