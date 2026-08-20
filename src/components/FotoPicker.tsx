import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../theme/colors';

type Props = {
  uri?: string;
  onChange: (uri: string) => void;
};

export function FotoPicker({ uri, onChange }: Props) {
  async function escolher(from: 'camera' | 'gallery') {
    const permission =
      from === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Permissão necessária', 'Libere o acesso para fotografar o animal.');
      return;
    }

    const result =
      from === 'camera'
        ? await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          });

    if (!result.canceled && result.assets[0]?.uri) {
      onChange(result.assets[0].uri);
    }
  }

  function abrirOpcoes() {
    Alert.alert('Foto do animal', 'Como você quer adicionar a foto?', [
      { text: 'Câmera', onPress: () => void escolher('camera') },
      { text: 'Galeria', onPress: () => void escolher('gallery') },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  }

  return (
    <Pressable onPress={abrirOpcoes} style={styles.wrap}>
      {uri ? (
        <Image source={{ uri }} style={styles.photo} />
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.plus}>+</Text>
          <Text style={styles.caption}>Adicionar foto</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'center',
  },
  photo: {
    width: 132,
    height: 132,
    borderRadius: 66,
    borderWidth: 3,
    borderColor: colors.terracotta,
  },
  placeholder: {
    width: 132,
    height: 132,
    borderRadius: 66,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.terracotta,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  plus: {
    color: colors.terracotta,
    fontSize: 36,
    lineHeight: 40,
    fontWeight: '300',
  },
  caption: {
    color: colors.terracottaDark,
    fontSize: 12,
    fontWeight: '700',
  },
});
