import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import { PrimaryChip, PrimaryChipGroup } from '../../src/components/chips/primaryChip';

describe('PrimaryChip', () => {
  it('renders label correctly', async () => {
    await render(<PrimaryChip label="Cachorro" selected={false} onPress={jest.fn()} />);
    expect(screen.getByText('Cachorro')).toBeTruthy();
  });

  it('triggers onPress when pressed', async () => {
    const onPressMock = jest.fn();
    await render(<PrimaryChip label="Cachorro" selected={false} onPress={onPressMock} />);
    await fireEvent.press(screen.getByText('Cachorro'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('does not trigger onPress when disabled', async () => {
    const onPressMock = jest.fn();
    await render(<PrimaryChip label="Cachorro" selected={false} disabled onPress={onPressMock} />);
    await fireEvent.press(screen.getByRole('radio'));
    expect(onPressMock).not.toHaveBeenCalled();
  });

  it('reflects selected state via accessibilityState', async () => {
    await render(<PrimaryChip label="Gato" selected={true} onPress={jest.fn()} />);
    const chip = screen.getByRole('radio');
    expect(chip.props.accessibilityState.selected).toBe(true);
  });
});

describe('PrimaryChipGroup', () => {
  const options = [
    { label: 'Cachorro', value: 'dog' },
    { label: 'Gato', value: 'cat' },
  ];

  it('renders all options in the group', async () => {
    await render(<PrimaryChipGroup options={options} value="dog" onChange={jest.fn()} />);
    expect(screen.getByText('Cachorro')).toBeTruthy();
    expect(screen.getByText('Gato')).toBeTruthy();
  });

  it('calls onChange with the selected option value', async () => {
    const onChangeMock = jest.fn();
    await render(<PrimaryChipGroup options={options} value="dog" onChange={onChangeMock} />);
    await fireEvent.press(screen.getByText('Gato'));
    expect(onChangeMock).toHaveBeenCalledTimes(1);
    expect(onChangeMock).toHaveBeenCalledWith('cat');
  });
});
