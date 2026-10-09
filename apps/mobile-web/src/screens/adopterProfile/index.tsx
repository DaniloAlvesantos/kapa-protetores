import { AdopterProfileForms } from '@/components/forms/adopterProfile';
import { AdopterProfileFormDataType } from '@/components/forms/adopterProfile/model';
import { useAdopterProfile } from '@/hooks/useAdopterProfile';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

export function AdopterProfileScreen() {
  const [current, setCurrent] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const mutation = useAdopterProfile();
  const { signOut } = useAuth();

  const handleNext = () => {
    setError(null);
    setCurrent((prev) => prev + 1);
  };

  const submit = (data: AdopterProfileFormDataType) => {
    setError(null);
    mutation.mutate(data, {
      onSuccess: () => {
        handleNext();
      },
      onError: (err) => {
        setError(
          err instanceof Error
            ? err.message
            : 'Não foi possível salvar o perfil. Tente novamente.',
        );
      },
    });
  };

  const handleBack = () => {
    setError(null);
    setCurrent((prev) => Math.max(0, prev - 1));
  };

  return (
    <ScrollView
      className="flex-1 bg-cream"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        padding: 16,
        paddingBottom: 48,
        gap: 20,
        minHeight: '100%',
      }}
    >
      <View className="flex-row justify-between items-center px-1 pt-2">
        <Text className="font-heading-bold text-xl text-ink">
          Perfil de Adoção
        </Text>
        <Pressable
          onPress={signOut}
          accessibilityRole="button"
          accessibilityLabel="Sair da conta"
          hitSlop={8}
          className="px-3 py-1.5 rounded-lg active:bg-cream-dark"
        >
          <Text className="font-body-medium text-sm text-ink-muted">Sair</Text>
        </Pressable>
      </View>

      {error ? (
        <View className="p-3 bg-red-100 border border-danger rounded-xl">
          <Text className="font-body-medium text-xs text-danger text-center">
            {error}
          </Text>
        </View>
      ) : null}

      <AdopterProfileForms
        currentField={current}
        onSubmit={submit}
        onBack={current > 0 ? handleBack : undefined}
        onNext={handleNext}
        isSubmitting={mutation.isPending}
      />
    </ScrollView>
  );
}
