import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base dimensions (Figma design frame or reference device)
const BASE_WIDTH = 390;
const BASE_HEIGHT = 844;

/**
 * Width percentage — converts a percentage of screen width to dp
 * wp(50) = 50% of screen width
 */
export const wp = (percentage: number): number => {
  return (SCREEN_WIDTH * percentage) / 100;
};

/**
 * Height percentage — converts a percentage of screen height to dp
 * hp(10) = 10% of screen height
 */
export const hp = (percentage: number): number => {
  return (SCREEN_HEIGHT * percentage) / 100;
};

/**
 * Normalize — scales a size value relative to the base design width
 * Ensures consistent sizing across different screen densities
 */
export const normalize = (size: number): number => {
  const scale = SCREEN_WIDTH / BASE_WIDTH;
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

/**
 * Normalize height — scales relative to base design height
 */
export const normalizeHeight = (size: number): number => {
  const scale = SCREEN_HEIGHT / BASE_HEIGHT;
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

export const SCREEN = {
  WIDTH: SCREEN_WIDTH,
  HEIGHT: SCREEN_HEIGHT,
  IS_SMALL: SCREEN_WIDTH < 360,
  IS_LARGE: SCREEN_WIDTH >= 414,
} as const;
