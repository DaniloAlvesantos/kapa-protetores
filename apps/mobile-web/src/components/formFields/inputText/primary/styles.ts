import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';

export const primaryInputTextStyles = StyleSheet.create({
  wrap: {
    gap: 6,
  },
  label: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.ink,
    fontSize: 16,
  },
  multiline: {
    minHeight: 96,
    paddingTop: 12,
  },
  inputErro: {
    borderColor: colors.danger,
  },
  erro: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '600',
  },
});
