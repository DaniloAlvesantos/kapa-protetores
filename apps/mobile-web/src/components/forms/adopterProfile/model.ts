import { z } from 'zod';
import type { Genders, Species, Option } from '@kapa/shared';
import { ESPECIE_OPTIONS, SEXO_OPTIONS, PORTE_OPTIONS } from '@kapa/shared';
import { type Icon, BirdIcon, CatIcon, DogIcon } from 'phosphor-react-native';

type OptionWithIcon<T> = Option<T> & {
  icon?: Icon;
};

export const adopterProfileSpeciesOptions: OptionWithIcon<Species>[] = [
  { ...ESPECIE_OPTIONS[0], icon: DogIcon },
  { ...ESPECIE_OPTIONS[1], icon: CatIcon },
  { ...ESPECIE_OPTIONS[2], icon: BirdIcon },
];

export const adopterProfileGenderOptions: OptionWithIcon<Genders>[] =
  SEXO_OPTIONS;
export const adopterProfileSizeOptions: OptionWithIcon<number>[] =
  PORTE_OPTIONS;

export const adopterProfileEnergyOptions: OptionWithIcon<number>[] = [
  { value: 1, label: 'Muito Calmo' },
  { value: 2, label: 'Calmo' },
  { value: 3, label: 'Moderado' },
  { value: 4, label: 'Ativo' },
  { value: 5, label: 'Muito Enérgico' },
];

export const adopterProfileKidFriendlyOptions: OptionWithIcon<number>[] = [
  { value: 1, label: 'Não tolera' },
  { value: 2, label: 'Pouca tolerância' },
  { value: 3, label: 'Moderada' },
  { value: 4, label: 'Boa convivência' },
  { value: 5, label: 'Excelente com crianças' },
];

export const adopterProfileNoiseOptions: OptionWithIcon<number>[] = [
  { value: 1, label: 'Muito Silencioso' },
  { value: 2, label: 'Silencioso' },
  { value: 3, label: 'Moderado' },
  { value: 4, label: 'Aceita latidos/miados' },
  { value: 5, label: 'Muito tolerante a barulho' },
];

export const adopterProfileAgeStageOptions: OptionWithIcon<number>[] = [
  { value: 1, label: 'Filhote' },
  { value: 2, label: 'Jovem' },
  { value: 3, label: 'Adulto' },
  { value: 4, label: 'Idoso / Sênior' },
];

export const adopterProfileLivesInApartmentOptions: OptionWithIcon<boolean>[] =
  [
    { value: true, label: 'Sim' },
    { value: false, label: 'Não' },
  ];

export const adopterProfileHasOtherPetsOptions: OptionWithIcon<boolean>[] = [
  { value: true, label: 'Sim' },
  { value: false, label: 'Não' },
];

export type FormStepConfig = {
  title: string;
  description?: string;
  options: OptionWithIcon<any>[];
  name: keyof AdopterProfileFormDataType;
  comp: 'checkbox' | 'chip' | 'card' | 'button';
};

export const adopterProfileFormsConfig: FormStepConfig[] = [
  {
    title: 'Qual espécie de animal você prefere?',
    description: 'Escolha a espécie que melhor se adapta à sua família.',
    options: adopterProfileSpeciesOptions,
    name: 'preferredSpecies',
    comp: 'card',
  },
  {
    title: 'Qual o sexo de preferência?',
    description: 'Selecione se prefere macho, fêmea ou se não tem preferência.',
    options: adopterProfileGenderOptions,
    name: 'preferredGender',
    comp: 'chip',
  },
  {
    title: 'Qual porte de animal você busca?',
    description: 'Considere o espaço disponível na sua residência.',
    options: adopterProfileSizeOptions,
    name: 'preferredSize',
    comp: 'chip',
  },
  {
    title: 'Qual a faixa etária ideal?',
    description: 'Filhotes demandam mais treino, enquanto adultos são mais previsíveis.',
    options: adopterProfileAgeStageOptions,
    name: 'preferredAgeStage',
    comp: 'chip',
  },
  {
    title: 'Qual o nível de energia desejado?',
    description: 'Escolha um pet compatível com o seu estilo de vida diário.',
    options: adopterProfileEnergyOptions,
    name: 'preferredEnergy',
    comp: 'checkbox',
  },
  {
    title: 'Como deve ser a relação com crianças?',
    description: 'Importante se você convive ou recebe visitas de crianças.',
    options: adopterProfileKidFriendlyOptions,
    name: 'preferredKidFriendly',
    comp: 'checkbox',
  },
  {
    title: 'Qual a sua tolerância a latidos e ruídos?',
    description: 'Especialmente relevante para quem reside em condomínios.',
    options: adopterProfileNoiseOptions,
    name: 'preferredNoise',
    comp: 'checkbox',
  },
  {
    title: 'Você mora em apartamento?',
    description: 'Ajuda a indicar pets que se adaptam melhor a apartamentos.',
    options: adopterProfileLivesInApartmentOptions,
    name: 'livesInApartment',
    comp: 'chip',
  },
  {
    title: 'Você já possui outros animais em casa?',
    description: 'Filtra animais com histórico positivo de convivência com outros pets.',
    options: adopterProfileHasOtherPetsOptions,
    name: 'hasOtherPets',
    comp: 'chip',
  },
];

export const adopterProfileSchema = z.object({
  preferredSpecies: z.enum(['dog', 'cat', 'other']).nullable().optional(),
  preferredGender: z.enum(['male', 'female']).nullable().optional(),
  preferredSize: z.number().int().min(1).max(5).nullable().optional(),
  preferredEnergy: z.number().int().min(1).max(5).nullable().optional(),
  preferredKidFriendly: z.number().int().min(1).max(5).nullable().optional(),
  preferredNoise: z.number().int().min(1).max(5).nullable().optional(),
  preferredAgeStage: z.number().int().min(1).max(5).nullable().optional(),
  livesInApartment: z.boolean().nullable().optional(),
  hasOtherPets: z.boolean().nullable().optional(),
});

export type AdopterProfileFormDataType = z.infer<typeof adopterProfileSchema>;
