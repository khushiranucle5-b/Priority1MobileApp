import React from 'react';
import { StyleSheet, View, Image, Alert, Linking } from 'react-native';
import { Card } from '../../../components/Card';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { Button } from '../../../components/Button';
import { useTheme } from '../../../providers/ThemeProvider';

export const SupervisorCard: React.FC = () => {
  const { borderRadius, colors } = useTheme();

  const handleCall = () => {
    const phone = '+19876543210';
    Linking.openURL(`tel:${phone}`).catch(() => {
      Alert.alert('Call Supervisor', 'Calling Field Officer Jane Smith (+1 987-654-3210)...');
    });
  };

  return (
    <Card variant="outlined" style={[styles.card, { backgroundColor: colors.surface, borderRadius: borderRadius.lg }]}>
      <Heading level="h3" color="primary" style={styles.title}>SUPERVISOR CONTACT</Heading>
      
      <View style={styles.divider} />

      <View style={styles.row}>
        <Image 
          source={{ uri: 'https://i.pravatar.cc/150?img=12' }} 
          style={[styles.photo, { borderRadius: borderRadius.full, backgroundColor: colors.surfaceSecondary }]} 
        />
        <View style={styles.info}>
          <AppText size="lg" weight="bold" color="primary" style={styles.nameText}>Jane Smith</AppText>
          <AppText size="sm" weight="semibold" color="secondary" style={styles.roleText}>Field Operations Officer</AppText>
          <AppText size="md" weight="bold" style={[styles.phoneText, { color: colors.primary[600] || '#2563EB' }]}>
            +1 987-654-3210
          </AppText>
        </View>
      </View>

      <Button
        title="CALL SUPERVISOR"
        variant="primary"
        size="large"
        fullWidth
        onPress={handleCall}
        style={styles.callBtn}
      />
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  divider: {
    height: 1.5,
    backgroundColor: '#E2E8F0',
    marginVertical: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  photo: {
    width: 60,
    height: 60,
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#2563EB',
  },
  info: {
    flex: 1,
  },
  nameText: {
    fontSize: 17,
    fontWeight: '700',
  },
  roleText: {
    fontSize: 13.5,
    color: '#64748B',
    marginTop: 2,
  },
  phoneText: {
    fontSize: 15.5,
    fontWeight: '700',
    marginTop: 4,
  },
  callBtn: {
    height: 48,
  },
});
