import { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CampoTexto } from '../components/CampoTexto';
import { ChipGroup } from '../components/ChipGroup';
import { FotoPicker } from '../components/FotoPicker';
import { saveAnimal } from '../storage/animals';
import { colors } from '../theme/colors';
import type {
  CondicaoChegada,
  Especie,
  Porte,
  Sexo,
  TriState,
} from '../types/animal';

function hojeBr(): string {
  const now = new Date();
  const dia = String(now.getDate()).padStart(2, '0');
  const mes = String(now.getMonth() + 1).padStart(2, '0');
  return `${dia}/${mes}/${now.getFullYear()}`;
}

function novoId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function CadastroAnimalScreen() {
  const [fotoUri, setFotoUri] = useState<string>();
  const [nome, setNome] = useState('');
  const [especie, setEspecie] = useState<Especie>('cao');
  const [sexo, setSexo] = useState<Sexo>('nao_sei');
  const [porte, setPorte] = useState<Porte>('medio');
  const [idadeAproximada, setIdadeAproximada] = useState('');
  const [corPelagem, setCorPelagem] = useState('');
  const [dataResgate, setDataResgate] = useState(hojeBr);
  const [localResgate, setLocalResgate] = useState('');
  const [condicaoChegada, setCondicaoChegada] = useState<CondicaoChegada>('saudavel');
  const [castrado, setCastrado] = useState<TriState>('nao_sei');
  const [vacinado, setVacinado] = useState<TriState>('nao_sei');
  const [vermifugado, setVermifugado] = useState<TriState>('nao_sei');
  const [temperamento, setTemperamento] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [salvando, setSalvando] = useState(false);

  const podeSalvar = useMemo(
    () => Boolean(fotoUri || nome.trim()) && Boolean(especie),
    [fotoUri, nome, especie],
  );

  function limpar() {
    setFotoUri(undefined);
    setNome('');
    setEspecie('cao');
    setSexo('nao_sei');
    setPorte('medio');
    setIdadeAproximada('');
    setCorPelagem('');
    setDataResgate(hojeBr());
    setLocalResgate('');
    setCondicaoChegada('saudavel');
    setCastrado('nao_sei');
    setVacinado('nao_sei');
    setVermifugado('nao_sei');
    setTemperamento('');
    setObservacoes('');
  }

  async function onSalvar() {
    if (!podeSalvar) {
      Alert.alert('Falta informação', 'Coloque o nome ou uma foto, e escolha a espécie.');
      return;
    }

    setSalvando(true);
    try {
      await saveAnimal({
        id: novoId(),
        nome: nome.trim() || 'Sem nome',
        especie,
        sexo,
        porte,
        idadeAproximada: idadeAproximada.trim(),
        corPelagem: corPelagem.trim(),
        dataResgate: dataResgate.trim() || hojeBr(),
        localResgate: localResgate.trim(),
        condicaoChegada,
        castrado,
        vacinado,
        vermifugado,
        temperamento: temperamento.trim(),
        observacoes: observacoes.trim(),
        fotoUri,
        status: 'resgatado',
        createdAt: new Date().toISOString(),
      });

      Alert.alert('Animal cadastrado', `${nome.trim() || 'O animal'} foi registrado no app.`);
      limpar();
    } catch {
      Alert.alert('Não deu para salvar', 'Tente novamente em instantes.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.kicker}>Kapa Protetores</Text>
            <Text style={styles.title}>Cadastro de animal</Text>
            <Text style={styles.subtitle}>
              Registre um resgate agora, ainda no campo ou no abrigo.
            </Text>
          </View>

          <FotoPicker uri={fotoUri} onChange={setFotoUri} />

          <View style={styles.card}>
            <Text style={styles.section}>Quem é</Text>
            <CampoTexto
              label="Nome"
              value={nome}
              onChangeText={setNome}
              placeholder="Se ainda não tem, pode deixar em branco"
            />
            <Text style={styles.fieldLabel}>Espécie</Text>
            <ChipGroup
              value={especie}
              onChange={setEspecie}
              options={[
                { value: 'cao', label: 'Cão' },
                { value: 'gato', label: 'Gato' },
                { value: 'outro', label: 'Outro' },
              ]}
            />
            <Text style={styles.fieldLabel}>Sexo</Text>
            <ChipGroup
              value={sexo}
              onChange={setSexo}
              options={[
                { value: 'macho', label: 'Macho' },
                { value: 'femea', label: 'Fêmea' },
                { value: 'nao_sei', label: 'Não sei' },
              ]}
            />
            <Text style={styles.fieldLabel}>Porte</Text>
            <ChipGroup
              value={porte}
              onChange={setPorte}
              options={[
                { value: 'pequeno', label: 'Pequeno' },
                { value: 'medio', label: 'Médio' },
                { value: 'grande', label: 'Grande' },
              ]}
            />
            <CampoTexto
              label="Idade aproximada"
              value={idadeAproximada}
              onChangeText={setIdadeAproximada}
              placeholder="Ex.: filhote, 2 anos, idoso"
            />
            <CampoTexto
              label="Cor / pelagem"
              value={corPelagem}
              onChangeText={setCorPelagem}
              placeholder="Ex.: caramelo, preto e branco"
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.section}>Resgate</Text>
            <CampoTexto
              label="Data do resgate"
              value={dataResgate}
              onChangeText={setDataResgate}
              placeholder="DD/MM/AAAA"
            />
            <CampoTexto
              label="Local do resgate"
              value={localResgate}
              onChangeText={setLocalResgate}
              placeholder="Rua, bairro ou ponto de referência"
            />
            <Text style={styles.fieldLabel}>Condição na chegada</Text>
            <ChipGroup
              value={condicaoChegada}
              onChange={setCondicaoChegada}
              options={[
                { value: 'saudavel', label: 'Saudável' },
                { value: 'ferido', label: 'Ferido' },
                { value: 'debilitado', label: 'Debilitado' },
              ]}
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.section}>Saúde</Text>
            <Text style={styles.fieldLabel}>Castrado</Text>
            <ChipGroup
              value={castrado}
              onChange={setCastrado}
              options={[
                { value: 'sim', label: 'Sim' },
                { value: 'nao', label: 'Não' },
                { value: 'nao_sei', label: 'Não sei' },
              ]}
            />
            <Text style={styles.fieldLabel}>Vacinado</Text>
            <ChipGroup
              value={vacinado}
              onChange={setVacinado}
              options={[
                { value: 'sim', label: 'Sim' },
                { value: 'nao', label: 'Não' },
                { value: 'nao_sei', label: 'Não sei' },
              ]}
            />
            <Text style={styles.fieldLabel}>Vermifugado</Text>
            <ChipGroup
              value={vermifugado}
              onChange={setVermifugado}
              options={[
                { value: 'sim', label: 'Sim' },
                { value: 'nao', label: 'Não' },
                { value: 'nao_sei', label: 'Não sei' },
              ]}
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.section}>Temperamento</Text>
            <CampoTexto
              label="Como o animal está"
              value={temperamento}
              onChangeText={setTemperamento}
              placeholder="Dócil, medroso, sociável com outros animais..."
              multiline
            />
            <CampoTexto
              label="Observações"
              value={observacoes}
              onChangeText={setObservacoes}
              placeholder="Ferimentos, coleira, algo que a equipe precise saber"
              multiline
            />
          </View>

          <Pressable
            onPress={() => void onSalvar()}
            disabled={salvando}
            style={[styles.save, (!podeSalvar || salvando) && styles.saveDisabled]}
          >
            <Text style={styles.saveText}>{salvando ? 'Salvando...' : 'Salvar cadastro'}</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 18,
  },
  header: {
    paddingTop: 8,
    gap: 6,
  },
  kicker: {
    color: colors.terracotta,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.ink,
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.inkMuted,
    fontSize: 15,
    lineHeight: 22,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.line,
  },
  section: {
    color: colors.forest,
    fontSize: 16,
    fontWeight: '800',
  },
  fieldLabel: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '700',
  },
  save: {
    backgroundColor: colors.terracotta,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveDisabled: {
    opacity: 0.55,
  },
  saveText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '800',
  },
});
