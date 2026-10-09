import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import { AdopterProfileForms } from '../../src/components/forms/adopterProfile';

describe('AdopterProfileForms', () => {
  it('renders current step title, description, and progress indicator', async () => {
    await render(
      <AdopterProfileForms
        currentField={0}
        onSubmit={jest.fn()}
      />,
    );

    expect(
      screen.getByText('Qual espécie de animal você prefere?'),
    ).toBeTruthy();
    expect(
      screen.getByText('Escolha a espécie que melhor se adapta à sua família.'),
    ).toBeTruthy();
    expect(screen.getByText('Passo 1 de 9')).toBeTruthy();
  });

  it('allows selecting an option and submitting current step', async () => {
    const onSubmitMock = jest.fn();

    await render(
      <AdopterProfileForms
        currentField={0}
        onSubmit={onSubmitMock}
      />,
    );

    const dogOption = screen.getByText('Cão');
    await fireEvent.press(dogOption);

    const nextButton = screen.getByText('Avançar');
    await fireEvent.press(nextButton);

    expect(onSubmitMock).toHaveBeenCalledTimes(1);
    expect(onSubmitMock).toHaveBeenCalledWith(
      expect.objectContaining({
        preferredSpecies: 'dog',
      }),
    );
  });

  it('renders back button when currentField > 0 and onBack is provided', async () => {
    const onBackMock = jest.fn();

    await render(
      <AdopterProfileForms
        currentField={1}
        onSubmit={jest.fn()}
        onBack={onBackMock}
      />,
    );

    const backButton = screen.getByText('Voltar');
    expect(backButton).toBeTruthy();

    await fireEvent.press(backButton);
    expect(onBackMock).toHaveBeenCalledTimes(1);
  });

  it('renders chips with PrimaryChip and allows selection on chip steps', async () => {
    const onSubmitMock = jest.fn();

    await render(
      <AdopterProfileForms
        currentField={1}
        onSubmit={onSubmitMock}
      />,
    );

    expect(screen.getByText('Qual o sexo de preferência?')).toBeTruthy();
    const femaleChip = screen.getByText('Fêmea');
    await fireEvent.press(femaleChip);

    const nextButton = screen.getByText('Avançar');
    await fireEvent.press(nextButton);

    expect(onSubmitMock).toHaveBeenCalledWith(
      expect.objectContaining({
        preferredGender: 'female',
      }),
    );
  });

  it('renders conclusion text when step index is beyond total config steps', async () => {
    await render(
      <AdopterProfileForms
        currentField={99}
        onSubmit={jest.fn()}
      />,
    );

    expect(screen.getByText('Perfil Concluído!')).toBeTruthy();
  });
});
