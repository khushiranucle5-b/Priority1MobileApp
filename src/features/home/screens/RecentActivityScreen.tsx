import React, { useState, useMemo } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, TextInput, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../../../types/navigation.types';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { useTheme } from '../../../providers/ThemeProvider';
import { useGuardStore, ActivityItem } from '../../../store/useGuardStore';
import { NavIcon, NavIconName } from '../../../components/NavIcon';
import { Card } from '../../../components/Card';

type Props = NativeStackScreenProps<HomeStackParamList, 'RecentActivity'>;

export const RecentActivityScreen: React.FC<Props> = ({ navigation }) => {
  const { colors, spacing, borderRadius } = useTheme();
  const { activities, clearActivities } = useGuardStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Attendance', 'Patrol', 'Leave', 'Incident', 'Safety'];

  const filteredActivities = useMemo(() => {
    let result = activities;

    if (selectedCategory !== 'All') {
      result = result.filter(
        a => (a.type || '').toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        a =>
          (a.title || '').toLowerCase().includes(q) ||
          (a.description || '').toLowerCase().includes(q) ||
          (a.type || '').toLowerCase().includes(q)
      );
    }

    return [...result].sort((a, b) => b.timestamp - a.timestamp);
  }, [activities, selectedCategory, searchQuery]);

  const handleClearAll = () => {
    Alert.alert(
      'Clear Activity Log',
      'Are you sure you want to clear your recent activity log? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear Log', style: 'destructive', onPress: () => clearActivities() },
      ]
    );
  };

  const getActivityIcon = (type: string, title: string): NavIconName => {
    const t = (type || title || '').toLowerCase();
    if (t.includes('attendance') || t.includes('clock') || t.includes('shift')) return 'attendance';
    if (t.includes('patrol') || t.includes('checkpoint')) return 'patrol';
    if (t.includes('leave')) return 'leaves';
    if (t.includes('incident')) return 'incidents';
    if (t.includes('safety') || t.includes('lone')) return 'loneworker';
    return 'messages';
  };

  const getBadgeColor = (type: string) => {
    const t = (type || '').toLowerCase();
    if (t.includes('attendance')) return { bg: colors.infoLight, text: colors.info, border: colors.infoBorder };
    if (t.includes('patrol')) return { bg: colors.successLight, text: colors.successDark, border: colors.successBorder };
    if (t.includes('leave')) return { bg: colors.warningLight, text: colors.warningDark, border: colors.warningBorder };
    if (t.includes('incident')) return { bg: colors.errorLight, text: colors.errorDark, border: colors.errorBorder };
    if (t.includes('safety')) return { bg: colors.primary[50], text: colors.primary[700], border: colors.primary[200] };
    return { bg: colors.surfaceSecondary, text: colors.textSecondary, border: colors.border };
  };

  const renderActivityItem = ({ item }: { item: ActivityItem }) => {
    const badgeStyle = getBadgeColor(item.type);
    const iconName = getActivityIcon(item.type, item.title);

    return (
      <Card variant="elevated" style={styles.activityCard}>
        <View style={styles.cardHeaderRow}>
          <View style={[styles.iconBox, { backgroundColor: badgeStyle.bg, borderColor: badgeStyle.border }]}>
            <NavIcon name={iconName} size={20} color={badgeStyle.text} />
          </View>
          <View style={styles.cardMainInfo}>
            <View style={styles.titleRow}>
              <AppText style={[styles.itemTitle, { color: colors.text }]} numberOfLines={1}>
                {item.title}
              </AppText>
              <View style={[styles.categoryBadge, { backgroundColor: badgeStyle.bg, borderColor: badgeStyle.border }]}>
                <AppText style={[styles.categoryBadgeText, { color: badgeStyle.text }]}>
                  {item.type}
                </AppText>
              </View>
            </View>

            <AppText style={[styles.itemDesc, { color: colors.textSecondary }]}>{item.description}</AppText>

            <View style={styles.timeRow}>
              <NavIcon name="shifts" size={12} color={colors.textTertiary} />
              <AppText style={[styles.timeText, { color: colors.textTertiary }]}>
                {item.time} {item.date ? `• ${item.date}` : ''}
              </AppText>
            </View>
          </View>
        </View>
      </Card>
    );
  };

  return (
    <ScreenLayout>
      <PageHeader
        title="Recent Activity"
        showBack
        onBack={() => navigation.goBack()}
      />

      {/* Search Input */}
      <View style={[styles.searchRow, { paddingHorizontal: spacing.base }]}>
        <View style={[styles.searchInputWrapper, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius.md }]}>
          <View style={{ marginRight: 8 }}>
            <NavIcon name="search" size={18} color={colors.textTertiary} />
          </View>
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search activity..."
            placeholderTextColor={colors.secondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchBtn}>
              <AppText style={[styles.clearSearchText, { color: colors.textTertiary }]}>✕</AppText>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Category Pills horizontal scroll */}
      <View style={styles.categoriesWrapper}>
        <FlatList
          horizontal
          data={categories}
          keyExtractor={(cat) => cat}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: spacing.base }}
          renderItem={({ item: cat }) => {
            const isSelected = selectedCategory === cat;
            return (
              <TouchableOpacity
                onPress={() => setSelectedCategory(cat)}
                activeOpacity={0.7}
                style={[
                  styles.categoryPill,
                  isSelected ? [styles.categoryPillActive, { backgroundColor: colors.primary[600], borderColor: colors.primary[600] }] : [styles.categoryPillInactive, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }],
                ]}
              >
                <AppText
                  style={[
                    styles.categoryPillText,
                    { color: isSelected ? colors.textInverse : colors.textSecondary, fontWeight: isSelected ? '700' : '600' },
                  ]}
                >
                  {cat}
                </AppText>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Action Bar */}
      <View style={[styles.actionBar, { paddingHorizontal: spacing.base }]}>
        <AppText style={[styles.countText, { color: colors.textTertiary }]}>
          {filteredActivities.length} {filteredActivities.length === 1 ? 'Activity Record' : 'Activity Records'}
        </AppText>

        {activities.length > 0 && (
          <TouchableOpacity onPress={handleClearAll} activeOpacity={0.7}>
            <AppText style={[styles.clearAllText, { color: colors.error }]}>Clear History</AppText>
          </TouchableOpacity>
        )}
      </View>

      {/* Main Activity List */}
      <FlatList
        data={filteredActivities}
        keyExtractor={(item) => item.id}
        renderItem={renderActivityItem}
        contentContainerStyle={[
          styles.listContent,
          filteredActivities.length === 0 && styles.emptyContentContainer,
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconBg, { backgroundColor: colors.surfaceSecondary }]}>
              <NavIcon name="shifts" size={32} color={colors.textTertiary} />
            </View>
            <Heading level="h4" style={[styles.emptyTitle, { color: colors.text }]}>
              No Recent Activity
            </Heading>
            <AppText style={[styles.emptySubtitle, { color: colors.textTertiary }]}>
              {searchQuery || selectedCategory !== 'All'
                ? 'No activities match your search or filter.'
                : 'Your clock ins, clock outs, patrols, and logs will appear here.'}
            </AppText>
          </View>
        }
      />
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  searchRow: {
    marginBottom: 10,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    paddingHorizontal: 12,
    height: 48,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  clearSearchBtn: {
    padding: 4,
  },
  clearSearchText: {
    fontSize: 14,
    fontWeight: '700',
  },
  categoriesWrapper: {
    marginBottom: 12,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  categoryPillActive: {},
  categoryPillInactive: {},
  categoryPillText: {
    fontSize: 13.5,
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  countText: {
    fontSize: 14,
    fontWeight: '700',
  },
  clearAllText: {
    fontSize: 14,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  activityCard: {
    marginBottom: 10,
    padding: 14,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardMainInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemTitle: {
    flex: 1,
    fontSize: 15.5,
    fontWeight: '700',
    marginRight: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  itemDesc: {
    fontSize: 14,
    lineHeight: 19,
    marginBottom: 6,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyContentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  emptyIconBg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
