import { palette } from '@/theme';
import { HeartIcon } from 'phosphor-react-native';
import { Image, Text, TouchableOpacity, View } from 'react-native';

interface PetCardProps {
  name: string;
  isFavorited?: boolean;
  imgUrl: string;
  characteristics?: string[];
  onPress?: () => void;
  onToggleFavorite?: () => void;
  className?: string;
}

export const PetCard = ({
  name,
  characteristics = [],
  imgUrl,
  isFavorited = false,
  onPress,
  onToggleFavorite,
  className = '',
}: PetCardProps) => {
  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.8 : 1}
      onPress={onPress}
      className={`w-48 sm:w-60 bg-white rounded-xl overflow-hidden border border-line ${className} transition-all duration-300 ease active:scale-[0.98]`}
      style={{
        shadowColor: '#121212',
        shadowOffset: {
          width: 0,
          height: 3,
        },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      }}
    >
      <View className="w-full h-40 relative bg-peach">
        <Image
          source={{ uri: imgUrl }}
          accessibilityLabel={`Foto de ${name}`}
          resizeMode="cover"
          className="w-full h-full"
        />

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onToggleFavorite}
          className="absolute top-2.5 right-2.5 bg-peach size-8 rounded-full items-center justify-center shadow-sm"
        >
          <HeartIcon
            size={18}
            weight={isFavorited ? 'fill' : 'bold'}
            color={palette.orange}
          />
        </TouchableOpacity>
      </View>

      <View className="p-3">
        <Text
          numberOfLines={1}
          className="font-heading-bold text-base sm:text-lg text-ink"
        >
          {name}
        </Text>

        {characteristics.length > 0 && (
          <Text
            numberOfLines={1}
            className="font-body text-xs sm:text-sm text-ink-muted mt-0.5"
          >
            {characteristics.join(' • ')}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};
