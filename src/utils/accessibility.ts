import { AccessibilityRole } from 'react-native';

interface A11yLabelProps {
  accessibilityLabel: string;
  accessibilityHint?: string;
}

interface A11yButtonProps extends A11yLabelProps {
  accessibilityRole: AccessibilityRole;
  accessibilityState?: {
    disabled?: boolean;
    selected?: boolean;
    checked?: boolean | 'mixed';
    busy?: boolean;
    expanded?: boolean;
  };
}

/**
 * Builds accessibility label and hint props for any component
 */
export const a11yLabel = (label: string, hint?: string): A11yLabelProps => ({
  accessibilityLabel: label,
  ...(hint ? { accessibilityHint: hint } : {}),
});

/**
 * Builds full accessibility props for interactive elements (buttons, links)
 */
export const a11yButton = (
  label: string,
  hint?: string,
  disabled?: boolean,
): A11yButtonProps => ({
  accessibilityRole: 'button',
  accessibilityLabel: label,
  ...(hint ? { accessibilityHint: hint } : {}),
  ...(disabled !== undefined ? { accessibilityState: { disabled } } : {}),
});

/**
 * Builds accessibility props for form inputs
 */
export const a11yInput = (label: string, hint?: string) => ({
  accessibilityRole: 'text' as AccessibilityRole,
  accessibilityLabel: label,
  ...(hint ? { accessibilityHint: hint } : {}),
});

/**
 * Builds accessibility props for images
 */
export const a11yImage = (label: string) => ({
  accessibilityRole: 'image' as AccessibilityRole,
  accessibilityLabel: label,
  accessible: true,
});

/**
 * Marks a component as hidden from screen readers (decorative elements)
 */
export const a11yHidden = () => ({
  accessible: false,
  importantForAccessibility: 'no-hide-descendants' as const,
});
