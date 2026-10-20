import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import { PixScreen, PIX_CONFIG } from '../../src/screens/pix';
import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';

jest.mock('expo-router', () => ({
  router: {
    back: jest.fn(),
    push: jest.fn(),
    replace: jest.fn(),
    canGoBack: jest.fn(() => true),
  },
}));

jest.mock('expo-clipboard', () => ({
  setStringAsync: jest.fn().mockResolvedValue(true),
}));

describe('PixScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders title, key and recipient details correctly', async () => {
    await render(<PixScreen />);

    expect(screen.getByText('Doar via PIX')).toBeTruthy();
    expect(screen.getAllByText(PIX_CONFIG.keyValue).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(PIX_CONFIG.recipientName)).toBeTruthy();
    expect(screen.getByText(PIX_CONFIG.bankName)).toBeTruthy();
  });

  it('renders all suggested donation amount chips', async () => {
    await render(<PixScreen />);

    for (const amount of PIX_CONFIG.suggestedAmounts) {
      expect(screen.getByText(`R$ ${amount}`)).toBeTruthy();
    }
  });

  it('allows selecting and toggling donation amount chips', async () => {
    await render(<PixScreen />);

    const chip50 = screen.getByText('R$ 50');
    await fireEvent.press(chip50);

    expect(screen.getByText(/Com R\$ 50, você ajuda a alimentar até 10 animais/i)).toBeTruthy();
  });

  it('copies PIX key to clipboard and changes button state to copied', async () => {
    await render(<PixScreen />);

    const copyButton = screen.getByRole('button', {
      name: 'Copiar chave PIX para a área de transferência',
    });
    await fireEvent.press(copyButton);

    expect(Clipboard.setStringAsync).toHaveBeenCalledWith(PIX_CONFIG.keyValue);
    expect(screen.getByText('Chave Copiada com Sucesso!')).toBeTruthy();
  });

  it('navigates back when back button is pressed', async () => {
    await render(<PixScreen />);

    const backButton = screen.getByLabelText('Voltar para a tela anterior');
    await fireEvent.press(backButton);

    expect(router.back).toHaveBeenCalledTimes(1);
  });
});
