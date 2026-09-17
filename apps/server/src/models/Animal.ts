import type {
  Animal as IAnimal,
  Especie,
  Sexo,
  Porte,
  CondicaoChegada,
  TriState,
  StatusAnimal,
  Temperamento,
  DoseRecord,
} from '@kapa/shared';

export class Animal implements IAnimal {
  public readonly id: string;
  public nome: string;
  public especie: Especie;
  public sexo: Sexo;
  public porte: Porte;
  public idadeAproximada: string;
  public corPelagem: string;
  public dataResgate: string;
  public localResgate: string;
  public condicaoChegada: CondicaoChegada;
  public castrado: TriState;
  public vacinado: TriState;
  public vermifugado: TriState;
  public v10PrimeiraDose?: DoseRecord;
  public v10SegundaDose?: DoseRecord;
  public vacinaRaiva?: DoseRecord;
  public v10Doses?: DoseRecord[];
  public vacinaRaivaDoses?: DoseRecord[];
  public vermifugoDoses?: DoseRecord[];
  public temperamento: Temperamento;
  public observacoes: string;
  public fotoUri?: string;
  public status: StatusAnimal;
  public readonly createdAt: string;

  constructor(data: Omit<IAnimal, 'id' | 'createdAt'> & { id?: string; createdAt?: string }) {
    this.id = data.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    this.nome = data.nome;
    this.especie = data.especie;
    this.sexo = data.sexo;
    this.porte = data.porte;
    this.idadeAproximada = data.idadeAproximada;
    this.corPelagem = data.corPelagem;
    this.dataResgate = data.dataResgate;
    this.localResgate = data.localResgate;
    this.condicaoChegada = data.condicaoChegada;
    this.castrado = data.castrado;
    this.vacinado = data.vacinado;
    this.vermifugado = data.vermifugado;
    this.v10PrimeiraDose = data.v10PrimeiraDose;
    this.v10SegundaDose = data.v10SegundaDose;
    this.vacinaRaiva = data.vacinaRaiva;
    this.v10Doses = data.v10Doses;
    this.vacinaRaivaDoses = data.vacinaRaivaDoses;
    this.vermifugoDoses = data.vermifugoDoses;
    this.temperamento = data.temperamento;
    this.observacoes = data.observacoes;
    this.fotoUri = data.fotoUri;
    this.status = data.status || 'resgatado';
    this.createdAt = data.createdAt || new Date().toISOString();
  }
}
