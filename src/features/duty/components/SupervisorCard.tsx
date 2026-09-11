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
    <Card variant="outlined" style={[styles.card, { backgroundColor: colors.surface, borderRadius: borderRadius.lg, borderColor: colors.border }]}>
      <Heading level="h3" color="primary" style={styles.title}>SUPERVISOR CONTACT</Heading>
      
      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <View style={styles.row}>
        <Image 
          source={{ uri: 'https://i.pravatar.cc/150?img=12' }} 
          style={[styles.photo, { borderRadius: borderRadius.full, backgroundColor: colors.surfaceSecondary, borderColor: colors.primary[600] }]} 
        />
        <View style={styles.info}>
          <AppText style={[styles.nameText, { color: colors.text }]}>Jane Smith</AppText>
          <AppText style={[styles.roleText, { color: colors.textSecondary }]}>Field Operations Officer</AppText>
          <AppText style={[styles.phoneText, { color: colors.primary[600] }]}>
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
    marginVertical: 10,
    padding: 20,
    borderWidth: 1.5,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  title: {
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  divider: {
    height: 1.5,
    marginVertical: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  photo: {
    width: 66,
    height: 66,
    marginRight: 18,
    borderWidth: 2,
  },
  info: {
    flex: 1,
  },
  nameText: {
    fontSize: 19,
    fontWeight: '700',
  },
  roleText: {
    fontSize: 15.5,
    fontWeight: '500',
    marginTop: 2,
  },
  phoneText: {
    fontSize: 16.5,
    fontWeight: '700',
    marginTop: 4,
  },
  callBtn: {
    height: 52,
  },
});
