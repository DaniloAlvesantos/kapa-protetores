export type Especie = 'cao' | 'gato';
export type Sexo = 'macho' | 'femea';
export type Porte = 'pequeno' | 'medio' | 'grande';
export type CondicaoChegada = 'saudavel' | 'ferido' | 'debilitado';
export type TriState = 'sim' | 'nao' | 'nao_sei';
export type StatusAnimal = 'resgatado' | 'em_tratamento' | 'disponivel' | 'adotado';
export type NivelEnergia = 'baixo' | 'moderado' | 'alto';
export type Temperamento = 'docil' | 'medroso' | 'sociavel' | 'agressivo';
export type Humor = 'tranquilo' | 'brincalhao' | 'assustado';
export type DoseStatus = 'sim' | 'nao';

export interface DoseRecord {
  status: DoseStatus;
  data?: string;
}

export interface Animal {
  id: string;
  nome: string;
  raca?: string;
  especie: Especie;
  sexo: Sexo;
  porte: Porte;
  peso?: string;
  idadeAproximada: string;
  corPelagem: string;
  dataResgate: string;
  localResgate: string;
  condicaoChegada: CondicaoChegada;
  castrado: TriState;
  vacinado: TriState;
  vermifugado: TriState;
  v10PrimeiraDose?: DoseRecord;
  v10SegundaDose?: DoseRecord;
  vacinaRaiva?: DoseRecord;
  v10Doses?: DoseRecord[];
  vacinaRaivaDoses?: DoseRecord[];
  vermifugoDoses?: DoseRecord[];
  temperamento: Temperamento;
  nivelEnergia?: NivelEnergia;
  compativelCriancas?: TriState;
  compativelAnimais?: TriState;
  compativelApartamento?: TriState;
  humor?: Humor;
  publicacoes?: string;
  observacoes: string;
  fotoUri?: string;
  status: StatusAnimal;
  createdAt: string;
}

export type CreateAnimalInput = Omit<Animal, 'id' | 'createdAt'>;
