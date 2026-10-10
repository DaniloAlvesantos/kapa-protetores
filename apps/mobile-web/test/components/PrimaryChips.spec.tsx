// import { render, fireEvent, screen } from '@testing-library/react-native';
// import { PrimaryChip } from '@/components/chips/primaryChip';

// describe('PrimaryChip', () => {
//   const voidFunction = jest.fn();
//   it('renders label', async () => {
//     await render(
//       <PrimaryChip label="Dog" selected={false} onPress={voidFunction} />,
//     );

//     const chip = screen.getByText('Dog');
//     expect(chip).toBeOnTheScreen();
//     expect(chip).toBeVisible();
//   });

//   it('toggles the value to checked', async () => {
//       let selected = false;
//       const onPress = () => selected = true;

//     await render(
//       <PrimaryChip label="Dog" onPress={onPress} selected={selected} />,
//     );

//     const initialChip = screen.getByRole('radio');
//     expect(initialChip.props.accessibilityState.selected).toBe(false);

//     await fireEvent.press(initialChip);

//     expect(onPress).toHaveBeenCalled();

//     const selectedChip = screen.getByRole('radio');
//     expect(selectedChip.props.accessibilityState.selected).toBe(true);

    
//   });
// });
