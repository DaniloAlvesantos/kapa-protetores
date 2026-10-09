import { AdopterProfileForms } from '@/components/forms/adopterProfile';
import { AdopterProfileFormDataType } from '@/components/forms/adopterProfile/model';
import { useAdopterProfile } from '@/hooks/useAdopterProfile';
import { useState } from 'react';
import { ScrollView } from 'react-native';

export function AdopterProfileScreen() {
  const [current, setCurrent] = useState<number>(0);
  const mutation = useAdopterProfile();

  const handleNext = () => {
    setCurrent((prev) => prev + 1);
  };

  const submit = (data: AdopterProfileFormDataType) => {
    mutation.mutate(data);
    handleNext();
  };

  const handleBack = () => {
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
        height: '100%',
      }}
    >
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
