import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { useTheme } from '../../../providers/ThemeProvider';
import { useGuardStore } from '../../../store/useGuardStore';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { getTable, DBIncident } from '../../../services/db';
import { NavIcon } from '../../../components/NavIcon';

export const IncidentScreen: React.FC = () => {
  const { colors, spacing, borderRadius } = useTheme();
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const { guardName, guardId, assignedSite } = useGuardStore();

  const [incidents, setIncidents] = useState<DBIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Open' | 'Under Review' | 'Resolved' | 'High / Critical'>('All');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    if (isFocused) {
      loadIncidents();
    }
  }, [isFocused, guardId]);

  const loadIncidents = async () => {
    setLoading(true);
    try {
      const all = await getTable<DBIncident>('incidents');
      // Filter for logged-in guard only
      const myIncidents = (all || []).filter((item) => {
        if (!item) return false;
        const matchesId = guardId && item.reportedById && item.reportedById === guardId;
        const matchesName = guardName && item.reportedBy && item.reportedBy.toLowerCase() === guardName.toLowerCase();
        const isDefault = !item.reportedById || item.reportedById === 'guard-1' || item.reportedBy === 'Khushi Rani';
        return matchesId || matchesName || isDefault;
      });

      setIncidents(myIncidents);
    } catch (err) {
      console.error('Failed to load incidents', err);
    } finally {
      setLoading(false);
    }
  };

  const filterOptions = [
    'All Statuses',
    'Open',
    'Under Review',
    'Resolved',
    'High / Critical',
  ] as const;

  const filteredIncidents = incidents.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    const titleMatch = (item.title || '').toLowerCase().includes(q);
    const codeMatch = (item.incidentCode || item.id || '').toLowerCase().includes(q);
    const siteMatch = (item.site || '').toLowerCase().includes(q);
    const categoryMatch = (item.category || '').toLowerCase().includes(q);

    const matchesSearch = !q || titleMatch || codeMatch || siteMatch || categoryMatch;

    let matchesStatus = true;
    const st = (item.status || '').toLowerCase();
    if (statusFilter === 'Open') {
      matchesStatus = st === 'open';
    } else if (statusFilter === 'Under Review') {
      matchesStatus = st === 'under review' || st === 'under_review';
    } else if (statusFilter === 'Resolved') {
      matchesStatus = st === 'resolved';
    } else if (statusFilter === 'High / Critical') {
      const s = (item.severity || '').toLowerCase();
      matchesStatus = s === 'high' || s === 'critical';
    }

    return matchesSearch && matchesStatus;
  });

  const getSeverityBadgeStyle = (sev?: string) => {
    switch (sev) {
      case 'Critical':
        return { bg: '#FEE2E2', text: '#DC2626' };
      case 'High':
        return { bg: '#FFEDD5', text: '#D97706' };
      case 'Medium':
        return { bg: '#FEF3C7', text: '#CA8A04' };
      case 'Low':
      default:
        return { bg: '#ECFDF5', text: '#047857' };
    }
  };

  const getStatusBadgeStyle = (status?: string) => {
    switch (status) {
      case 'Resolved':
        return { bg: '#D1FAE5', text: '#059669' };
      case 'Under Review':
        return { bg: '#EEF2FF', text: '#4F46E5' };
      case 'Open':
      default:
        return { bg: '#FEF3C7', text: '#D97706' };
    }
  };

  return (
    <ScreenLayout activeRoute="Incident">
      <PageHeader title="My Incident Reports" showBack />

      <View style={styles.mainWrapper}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

          {/* Header Block */}
          <View style={styles.headerBlock}>
            <Heading level="h2" color="primary">My Incident Reports</Heading>
            <AppText size="xs" color="secondary" style={{ marginTop: 2 }}>
              Official security incident logs filed for {assignedSite || 'Ahmedabad Plant'}.
            </AppText>
          </View>

          {/* Search & Dropdown Filter Row */}
          <View style={styles.searchFilterRow}>
            <View style={styles.searchInputWrapper}>
              <View style={{ marginRight: 8 }}>
                <NavIcon name="search" size={16} color="#64748B" />
              </View>
              <TextInput
                style={styles.searchInput}
                placeholder="Search by title, ID, site..."
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery ? (
                <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 4 }}>
                  <AppText size="xs" weight="bold" style={{ color: '#64748B' }}>✕</AppText>
                </TouchableOpacity>
              ) : null}
            </View>

            {/* Dropdown Filter Trigger */}
            <TouchableOpacity
              style={styles.dropdownTrigger}
              onPress={() => setDropdownOpen(!dropdownOpen)}
              activeOpacity={0.8}
            >
              <AppText size="xs" weight="bold" style={{ color: '#475569', marginRight: 4 }}>
                {statusFilter === 'All' ? 'Filter: All' : statusFilter}
              </AppText>
              <AppText size="xs" color="secondary">{dropdownOpen ? '▲' : '▼'}</AppText>
            </TouchableOpacity>
          </View>

          {/* Dropdown Menu Options */}
          {dropdownOpen && (
            <View style={styles.dropdownMenuContainer}>
              {filterOptions.map((opt) => {
                const valueKey = opt === 'All Statuses' ? 'All' : opt;
                const isSel = statusFilter === valueKey;
                return (
                  <TouchableOpacity
                    key={opt}
                    style={[styles.dropdownMenuItem, isSel && styles.dropdownMenuItemActive]}
                    onPress={() => {
                      setStatusFilter(valueKey as any);
                      setDropdownOpen(false);
                    }}
                  >
                    <AppText
                      size="xs"
                      weight={isSel ? 'bold' : 'medium'}
                      style={{ color: isSel ? '#4F46E5' : '#334155' }}
                    >
                      {isSel ? `✓ ${opt}` : opt}
                    </AppText>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Incidents List */}
          {loading ? (
            <View style={styles.centerBox}>
              <ActivityIndicator size="large" color="#4F46E5" />
              <AppText size="sm" color="secondary" style={{ marginTop: 10 }}>Loading incident logs...</AppText>
            </View>
          ) : filteredIncidents.length === 0 ? (
            <Card style={{ padding: 24, alignItems: 'center' }}>
              <NavIcon name="incidents" size={36} color="#94A3B8" />
              <AppText size="sm" color="secondary" style={{ marginTop: 10, textAlign: 'center' }}>
                {searchQuery || statusFilter !== 'All'
                  ? 'No incident reports match your search or filter.'
                  : 'No incidents reported by your account yet.'}
              </AppText>
            </Card>
          ) : (
            filteredIncidents.map((item) => {
              const severityColors = getSeverityBadgeStyle(item.severity);
              const statusColors = getStatusBadgeStyle(item.status);

              return (
                <Card key={item.id} style={styles.incidentCard}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate('IncidentDetails', { incidentId: item.id })}
                  >
                    <View style={styles.cardHeaderRow}>
                      <View style={{ flex: 1 }}>
                        <Heading level="h4" color="primary">
                          {item.title}
                        </Heading>
                        <AppText size="xs" color="secondary" style={{ marginTop: 2 }}>
                          ID: {item.incidentCode || item.id} • {item.site || 'Ahmedabad Plant'}
                        </AppText>
                      </View>

                      <TouchableOpacity
                        style={styles.viewIconButton}
                        onPress={() => navigation.navigate('FileIncident', { incidentId: item.id })}
                        activeOpacity={0.7}
                      >
                        <NavIcon name="edit" size={18} color="#4F46E5" />
                      </TouchableOpacity>
                    </View>

                    {/* Status & Severity Badges Row */}
                    <View style={styles.badgesRow}>
                      <View style={[styles.badge, { backgroundColor: statusColors.bg }]}>
                        <AppText size="xs" weight="bold" style={{ color: statusColors.text }}>
                          ● {item.status}
                        </AppText>
                      </View>

                      <View style={[styles.badge, { backgroundColor: severityColors.bg }]}>
                        <AppText size="xs" weight="bold" style={{ color: severityColors.text }}>
                          {item.severity} Severity
                        </AppText>
                      </View>

                      {item.category ? (
                        <View style={[styles.badge, { backgroundColor: '#F1F5F9' }]}>
                          <AppText size="xs" weight="bold" style={{ color: '#475569' }}>
                            {item.category}
                          </AppText>
                        </View>
                      ) : null}
                    </View>

                    <View style={styles.cardFooterRow}>
                      <AppText size="xs" color="secondary">
                        Reported: {item.date} {item.exactTime ? `at ${item.exactTime}` : ''}
                      </AppText>
                      {item.assignedTo ? (
                        <AppText size="xs" weight="semibold" style={{ color: '#4F46E5' }}>
                          Assigned: {item.assignedTo}
                        </AppText>
                      ) : null}
                    </View>
                  </TouchableOpacity>
                </Card>
              );
            })
          )}

        </ScrollView>

        {/* Fixed Bottom Glove-Friendly Action Button */}
        <View style={styles.bottomBar}>
          <Button
            title="FILE INCIDENT REPORT"
            variant="primary"
            size="large"
            fullWidth
            onPress={() => navigation.navigate('FileIncident')}
            style={{ height: 54, backgroundColor: '#4F46E5' }}
          />
        </View>
      </View>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  mainWrapper: {
    flex: 1,
  },
  container: {
    padding: 16,
    paddingBottom: 90,
  },
  centerBox: {
    padding: 40,
    alignItems: 'center',
  },
  headerBlock: {
    marginBottom: 10,
  },
  searchFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    paddingVertical: 0,
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    height: 44,
    paddingHorizontal: 12,
  },
  dropdownMenuContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 4,
    marginBottom: 14,
    elevation: 3,
  },
  dropdownMenuItem: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  dropdownMenuItemActive: {
    backgroundColor: '#EEF2FF',
  },
  incidentCard: {
    padding: 16,
    marginBottom: 12,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  viewIconButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  cardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
});
