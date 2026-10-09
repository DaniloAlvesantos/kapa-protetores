import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import { PrimaryCheckBox } from '../../src/components/checkboxs/primary';

describe('PrimaryCheckBox', () => {
  it('renders label and description correctly', async () => {
    await render(
      <PrimaryCheckBox
        label="Aceito os termos"
        description="Termos e condições de adoção responsável"
      />,
    );

    expect(screen.getByText('Aceito os termos')).toBeTruthy();
    expect(
      screen.getByText('Termos e condições de adoção responsável'),
    ).toBeTruthy();
  });

  it('toggles value and invokes callbacks in uncontrolled mode', async () => {
    const onChangeMock = jest.fn();
    const onValueChangeMock = jest.fn();
    const onClickMock = jest.fn();

    await render(
      <PrimaryCheckBox
        label="Mora em apartamento"
        defaultChecked={false}
        onChange={onChangeMock}
        onValueChange={onValueChangeMock}
        onClick={onClickMock}
      />,
    );

    const initialCheckbox = screen.getByRole('checkbox');
    expect(initialCheckbox.props.accessibilityState.checked).toBe(false);

    await fireEvent.press(initialCheckbox);

    expect(onChangeMock).toHaveBeenCalledWith(true);
    expect(onValueChangeMock).toHaveBeenCalledWith(true);
    expect(onClickMock).toHaveBeenCalledWith(true);

    const checkedCheckbox = screen.getByRole('checkbox');
    expect(checkedCheckbox.props.accessibilityState.checked).toBe(true);

    await fireEvent.press(checkedCheckbox);
    expect(onChangeMock).toHaveBeenCalledWith(false);

    const uncheckedCheckbox = screen.getByRole('checkbox');
    expect(uncheckedCheckbox.props.accessibilityState.checked).toBe(false);
  });

  it('respects controlled checked prop', async () => {
    const onChangeMock = jest.fn();

    const { rerender } = await render(
      <PrimaryCheckBox
        label="Possui outros pets"
        checked={false}
        onChange={onChangeMock}
      />,
    );

    const initialCheckbox = screen.getByRole('checkbox');
    expect(initialCheckbox.props.accessibilityState.checked).toBe(false);

    await fireEvent.press(initialCheckbox);
    expect(onChangeMock).toHaveBeenCalledWith(true);

    const unchangedCheckbox = screen.getByRole('checkbox');
    expect(unchangedCheckbox.props.accessibilityState.checked).toBe(false);

    await rerender(
      <PrimaryCheckBox
        label="Possui outros pets"
        checked={true}
        onChange={onChangeMock}
      />,
    );

    const updatedCheckbox = screen.getByRole('checkbox');
    expect(updatedCheckbox.props.accessibilityState.checked).toBe(true);
  });

  it('does not trigger press when disabled', async () => {
    const onChangeMock = jest.fn();

    await render(
      <PrimaryCheckBox
        label="Opção desabilitada"
        disabled
        onChange={onChangeMock}
      />,
    );

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox.props.accessibilityState.disabled).toBe(true);

    await fireEvent.press(checkbox);
    expect(onChangeMock).not.toHaveBeenCalled();
  });

  it('renders indeterminate state with mixed accessibility state', async () => {
    await render(<PrimaryCheckBox label="Seleção parcial" indeterminate />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox.props.accessibilityState.checked).toBe('mixed');
  });

  it('renders error message when error prop is provided', async () => {
    await render(
      <PrimaryCheckBox
        label="Consentimento obrigatório"
        error="Campo obrigatório"
      />,
    );

    expect(screen.getByText('Campo obrigatório')).toBeTruthy();
  });

  it('renders standalone checkbox with touch target when label is not provided', async () => {
    await render(<PrimaryCheckBox accessibilityLabel="Opção simples" />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox.props.accessibilityLabel).toBe('Opção simples');
  });
});
