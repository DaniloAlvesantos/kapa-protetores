import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CadastroAnimalScreen } from './src/screens/CadastroAnimalScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <CadastroAnimalScreen />
    </SafeAreaProvider>
  );
}
