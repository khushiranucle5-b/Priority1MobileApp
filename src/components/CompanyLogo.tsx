import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../providers/ThemeProvider';
import { Heading } from './typography/Heading';
import { AppText } from './typography/Text';
import { normalize } from '../utils/responsive';
import { a11yImage } from '../utils/accessibility';

interface CompanyLogoProps {
  appName?: string;
  tagline?: string;
}

export const CompanyLogo: React.FC<CompanyLogoProps> = ({
  appName = 'PriorityOne',
  tagline = 'Enterprise Security Platform',
}) => {
  const { colors, spacing, borderRadius } = useTheme();

  const logoSize = normalize(56);
  const iconInnerSize = normalize(28);

  return (
    <View style={styles.container} {...a11yImage(`${appName} logo`)}>
      <View
        style={[
          styles.logoBadge,
          {
            width: logoSize,
            height: logoSize,
            borderRadius: borderRadius.lg,
            backgroundColor: colors.primary[600],
            marginBottom: spacing.sm,
          },
        ]}
      >
        {/* Shield Icon emblem */}
        <View
          style={[
            styles.shieldShape,
            {
              width: iconInnerSize,
              height: iconInnerSize,
              borderColor: colors.textInverse,
            },
          ]}
        >
          <View
            style={[
              styles.shieldCheck,
              {
                borderColor: colors.textInverse,
              },
            ]}
          />
        </View>
      </View>

      <Heading level="h3" style={{ color: colors.text }}>
        {appName}
      </Heading>
      <AppText size="xs" color="tertiary" weight="medium">
        {tagline}
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  logoBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  shieldShape: {
    borderWidth: 2.5,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '45deg' }],
  },
  shieldCheck: {
    width: 8,
    height: 14,
    borderRightWidth: 2.5,
    borderBottomWidth: 2.5,
    transform: [{ rotate: '-45deg' }, { translateY: -2 }],
  },
});
