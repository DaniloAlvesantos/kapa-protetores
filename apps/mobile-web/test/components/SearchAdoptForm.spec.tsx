import React from 'react';
import { render, fireEvent, screen, act } from '@testing-library/react-native';
import { SearchAdoptForm } from '../../src/components/forms/searchAdopt';

describe('SearchAdoptForm with react-hook-form', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders default fields: breed input, species chips, and advanced toggle', async () => {
    await render(<SearchAdoptForm onSearch={jest.fn()} />);

    expect(
      screen.getByPlaceholderText('Buscar por raça'),
    ).toBeTruthy();
    expect(screen.getByText('Espécie')).toBeTruthy();
    expect(screen.getByText('Todos')).toBeTruthy();
    expect(screen.getByText('Cachorros')).toBeTruthy();
    expect(screen.getByText('Gatos')).toBeTruthy();
    expect(screen.getByText('Mais filtros (Sexo e Porte)')).toBeTruthy();
  });

  it('updates species filter and immediately triggers onSearch', async () => {
    const onSearchMock = jest.fn();

    await render(<SearchAdoptForm onSearch={onSearchMock} />);

    const dogsChip = screen.getByText('Cachorros');
    await act(async () => {
      await fireEvent.press(dogsChip);
    });

    expect(onSearchMock).toHaveBeenCalledWith(
      expect.objectContaining({
        specie: 'dog',
      }),
    );
  });

  it('debounces breed input text changes before triggering onSearch', async () => {
    const onSearchMock = jest.fn();

    await render(<SearchAdoptForm onSearch={onSearchMock} />);

    const breedInput = screen.getByPlaceholderText('Buscar por raça');
    await act(async () => {
      await fireEvent.changeText(breedInput, 'Golden');
    });

    // Not called immediately
    expect(onSearchMock).not.toHaveBeenCalledWith(
      expect.objectContaining({ breed: 'Golden' }),
    );

    // Fast-forward debounce timer (350ms)
    await act(async () => {
      jest.advanceTimersByTime(350);
    });

    expect(onSearchMock).toHaveBeenCalledWith(
      expect.objectContaining({
        breed: 'Golden',
      }),
    );
  });

  it('toggles advanced filters and updates gender and size with Controller', async () => {
    const onSearchMock = jest.fn();

    await render(<SearchAdoptForm onSearch={onSearchMock} />);

    const toggleBtn = screen.getByText('Mais filtros (Sexo e Porte)');
    await act(async () => {
      await fireEvent.press(toggleBtn);
    });

    expect(screen.getByText('Menos filtros')).toBeTruthy();
    expect(screen.getByText('Sexo')).toBeTruthy();
    expect(screen.getByText('Porte')).toBeTruthy();

    const femalesChip = screen.getByText('Fêmeas');
    await act(async () => {
      await fireEvent.press(femalesChip);
    });

    expect(onSearchMock).toHaveBeenCalledWith(
      expect.objectContaining({
        gender: 'female',
      }),
    );

    const smallChip = screen.getByText('Pequeno');
    await act(async () => {
      await fireEvent.press(smallChip);
    });

    expect(onSearchMock).toHaveBeenCalledWith(
      expect.objectContaining({
        size: 'small',
      }),
    );
  });

  it('resets all filters to defaults when clicking Limpar filtros', async () => {
    const onSearchMock = jest.fn();

    await render(
      <SearchAdoptForm
        onSearch={onSearchMock}
        initialFilters={{ specie: 'cat', breed: 'Siamês' }}
      />,
    );

    const clearButton = screen.getByLabelText('Limpar todos os filtros');
    expect(clearButton).toBeTruthy();

    await act(async () => {
      await fireEvent.press(clearButton);
    });

    expect(onSearchMock).toHaveBeenCalledWith({
      breed: '',
      specie: 'all',
      gender: 'all',
      size: 'all',
    });
  });
});
