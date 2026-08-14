import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Card } from '../../../components/Card';
import { AppText } from '../../../components/typography/Text';
import { useTheme } from '../../../providers/ThemeProvider';
import { useGuardStore } from '../../../store/useGuardStore';

export const IncidentHistory: React.FC = () => {
  const { colors, spacing, borderRadius } = useTheme();
  const incidents = useGuardStore((state) => state.incidents);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Resolved': return colors.success;
      case 'Under Review': return colors.warning;
      default: return colors.primary[500];
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'Resolved': return colors.successLight;
      case 'Under Review': return colors.surfaceSecondary;
      default: return colors.primary[50];
    }
  };
  
  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'Critical': return '#991b1b'; // Dark red
      case 'High': return colors.error;
      case 'Medium': return colors.warning;
      default: return colors.success;
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {[...incidents].sort((a, b) => new Date(b.reportedDate).getTime() - new Date(a.reportedDate).getTime()).map((incident) => (
        <Card key={incident.id} variant="elevated" style={styles.card}>
          <View style={styles.cardContent}>
            <View style={[styles.thumbnail, { backgroundColor: colors.surfaceSecondary, borderRadius: borderRadius.md }]}>
              <AppText size="xl">📸</AppText>
            </View>
            <View style={styles.infoContainer}>
              <View style={styles.headerRow}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <AppText size="base" weight="semibold" numberOfLines={1}>{incident.title}</AppText>
                  <AppText size="xs" color="secondary">{incident.type}</AppText>
                </View>
                <View style={[styles.badge, { backgroundColor: getStatusBg(incident.status), borderRadius: borderRadius.full }]}>
                  <AppText size="xs" weight="medium" color={getStatusColor(incident.status)}>{incident.status}</AppText>
                </View>
              </View>
              
              <View style={[styles.detailRow, { marginTop: spacing.xs }]}>
                <AppText size="xs" color="secondary" style={{flex: 1}} numberOfLines={1}>📍 {incident.location}</AppText>
                <View style={[styles.badge, { backgroundColor: getSeverityColor(incident.severity), borderRadius: borderRadius.sm, paddingVertical: 2, paddingHorizontal: 6 }]}>
                  <AppText size="xs" weight="bold" color="surface">
                    {incident.severity}
                  </AppText>
                </View>
              </View>
              
              <View style={{ marginTop: 4 }}>
                <AppText size="xs" color="secondary">Reported: {new Date(incident.reportedDate).toLocaleString()}</AppText>
              </View>
            </View>
          </View>
        </Card>
      ))}
      {incidents.length === 0 && (
        <AppText size="base" color="secondary" style={styles.empty}>No incidents reported.</AppText>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  empty: {
    textAlign: 'center',
    marginTop: 32,
  },
  cardContent: {
    flexDirection: 'row',
  },
  thumbnail: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'space-between',
  }
});
