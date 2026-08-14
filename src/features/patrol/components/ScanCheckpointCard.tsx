import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { useTheme } from '../../../providers/ThemeProvider';

export const ScanCheckpointCard: React.FC = () => {
  const { spacing, colors, borderRadius } = useTheme();

  const handleQRScan = () => {
    console.log('handleQRScan called');
  };

  const handleNFCScan = () => {
    console.log('handleNFCScan called');
  };

  return (
    <Card variant="elevated" style={styles.card}>
      <Heading level="h4" style={styles.title}>Scan Checkpoint</Heading>
      
      <View style={styles.btnRow}>
        <View style={styles.btnWrapper}>
          <Button 
            title="QR Scan" 
            variant="primary" 
            leftIcon={<AppText style={styles.icon}>📷</AppText>}
            onPress={handleQRScan}
            fullWidth
          />
        </View>
        <View style={styles.btnWrapper}>
          <Button 
            title="NFC Scan" 
            variant="secondary" 
            leftIcon={<AppText style={styles.icon}>📱</AppText>}
            onPress={handleNFCScan}
            fullWidth
          />
        </View>
      </View>

      <View style={[styles.infoBox, { backgroundColor: colors.surfaceSecondary, borderRadius: borderRadius.md, marginTop: spacing.md }]}>
        <AppText size="xs" color="secondary" style={styles.infoText}>
          QR and NFC scanning will be enabled in a future update.
        </AppText>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  title: {
    marginBottom: 12,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  btnWrapper: {
    flex: 1,
  },
  icon: {
    fontSize: 16,
  },
  infoBox: {
    padding: 12,
  },
  infoText: {
    textAlign: 'center',
    fontStyle: 'italic',
  }
});
