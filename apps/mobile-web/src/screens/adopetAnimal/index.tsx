import { PhotoCarousel } from '@/components/carousels/photo';
import { useAnimal } from '@/hooks/useAnimal';
import { useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';

export function EditAnimalScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <AnimalDetails id={id} />;
}

const AnimalDetails = ({ id }: { id: string }) => {
  const { animal, isLoading, error } = useAnimal(id);

  return (
    <View className="flex-1">
      <PhotoCarousel
        photos={[
          {
            id: '1',
            photoUrl:
              'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80',
          },
          {
            id: '2',
            photoUrl:
              'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80',
          },
          {
            id: '3',
            photoUrl:
              'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80',
          },
        ]}
      />
      <View className="p-4">
        <Text className="font-heading-bold text-lg md:text-xl text-denim">
          {animal?.name}
        </Text>
        <View className="flex-row items-center space-x-4 divide-x-2">
          <View className="text-center p-2">
            <Text className="font-heading-medium">Idade</Text>
            <Text className="font-bold text-denim"> {animal?.age} </Text>
          </View>
          <View className="text-center p-2">
            <Text className="font-heading-medium">Porte</Text>
            <Text className="font-bold text-denim"> {animal?.size} </Text>
          </View>
          <View className="text-center p-2">
            <Text className="font-heading-medium">Sexo</Text>
            <Text className="font-bold text-denim"> {animal?.gender} </Text>
          </View>
        </View>
      </View>
    </View>
  );
};
