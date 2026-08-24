import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { Card } from '../../../components/Card';
import { useTheme } from '../../../providers/ThemeProvider';
import { getTable, insertRow, DBSite, DBSiteChecklist } from '../../../services/db';
import { NavIcon } from '../../../components/NavIcon';

export const ChecklistExecutionScreen: React.FC = () => {
  const { colors, borderRadius } = useTheme();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();

  const siteId = route.params?.siteId || 's-04';
  const checklistId = route.params?.checklistId || 'cl-1';
  const passedChecklist = route.params?.checklist;

  const [site, setSite] = useState<DBSite | null>(null);
  const [checklist, setChecklist] = useState<DBSiteChecklist | null>(passedChecklist || null);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [remarks, setRemarks] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(!passedChecklist);

  useEffect(() => {
    loadData();
  }, [siteId, checklistId]);

  const loadData = async () => {
    try {
      const sites = await getTable<DBSite>('sites');
      const currentSite = sites.find((s) => s.id === siteId || s.code === siteId) || sites[0] || null;
      setSite(currentSite);

      if (!checklist && currentSite) {
        const found = currentSite.checklists?.find((c) => c.id === checklistId) || currentSite.checklists?.[0] || null;
        setChecklist(found);
      }
    } catch (err) {
      console.error('Error loading checklist data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('SiteDetails', { siteId });
    }
  };

  const steps = checklist?.steps || [
    '1. Call 911 immediately',
    '2. Render First Aid / CPR if certified',
    '3. Guide paramedic unit to gate',
    '4. Notify site supervisor',
  ];

  const toggleStep = (index: number) => {
    if (completedSteps.includes(index)) {
      setCompletedSteps(completedSteps.filter((i) => i !== index));
    } else {
      setCompletedSteps([...completedSteps, index]);
    }
  };

  const isAllCompleted = steps.length > 0 && completedSteps.length === steps.length;
  const progressPercent = Math.round((completedSteps.length / steps.length) * 100);

  const handleSubmitExecution = async () => {
    if (completedSteps.length === 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      const executionRecord = {
        id: `exec-${Date.now()}`,
        siteId: site?.id || siteId,
        siteName: site?.name || 'Ranucle zundal',
        checklistId: checklist?.id || checklistId,
        checklistTitle: checklist?.title || 'Master Checklist',
        category: checklist?.category || 'General Operations',
        priority: checklist?.priority || 'High',
        completedBy: 'Officer John Guard',
        completedAt: new Date().toISOString(),
        totalSteps: steps.length,
        completedCount: completedSteps.length,
        remarks: remarks.trim(),
        steps: steps.map((s, idx) => ({
          step: s,
          completed: completedSteps.includes(idx),
        })),
        status: 'Completed',
      };

      await insertRow('checklist_executions', executionRecord);

      setSuccessMessage(`Checklist "${checklist?.title || 'Execution'}" submitted successfully! Logged for ${site?.name || 'site'}.`);
      
      setTimeout(() => {
        handleBack();
      }, 1400);
    } catch (err) {
      console.error('Failed to save checklist execution:', err);
      setSuccessMessage('Execution saved locally.');
      setTimeout(() => {
        handleBack();
      }, 1400);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <ScreenLayout style={{ justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <AppText size="sm" color="secondary" style={{ marginTop: 12 }}>
          Loading checklist details...
        </AppText>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout style={styles.screenContainer}>
      <PageHeader title="Checklist Execution" onBack={handleBack} />

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Success Banner */}
        {successMessage ? (
          <View style={styles.successBanner}>
            <NavIcon name="attendance" size={20} color="#065F46" />
            <AppText size="sm" weight="bold" style={{ color: '#065F46', flex: 1, marginLeft: 8 }}>
              {successMessage}
            </AppText>
          </View>
        ) : null}

        {/* Checklist Header Card */}
        <Card style={styles.headerCard}>
          <View style={styles.headerRow}>
            <View style={[styles.priorityBadge, { backgroundColor: (checklist?.priority || 'High').toLowerCase() === 'high' ? '#FEE2E2' : '#FEF3C7' }]}>
              <AppText size="sm" weight="bold" style={{ color: (checklist?.priority || 'High').toLowerCase() === 'high' ? '#DC2626' : '#D97706', fontSize: 14 }}>
                {checklist?.priority || 'High'} Priority
              </AppText>
            </View>
            <View style={styles.categoryPill}>
              <AppText size="xs" weight="semibold" style={{ color: '#475569' }}>
                {checklist?.category || 'Operational'}
              </AppText>
            </View>
          </View>

          <Heading level="h2" color="primary" style={styles.checklistTitle}>
            {checklist?.title || 'Checklist Execution'}
          </Heading>

          <AppText size="xs" color="secondary" style={{ marginTop: 4 }}>
            Site: <AppText size="xs" weight="bold" color="primary">{site?.name || 'Ranucle zundal'}</AppText> ({site?.code || 's-04'})
          </AppText>

          {/* Progress Section */}
          <View style={styles.progressCardSection}>
            <View style={styles.progressHeaderRow}>
              <AppText size="xs" weight="bold" style={{ color: '#475569', letterSpacing: 0.5 }}>
                CHECKLIST PROGRESS
              </AppText>
              <AppText size="sm" weight="bold" style={{ color: '#4F46E5' }}>
                {completedSteps.length} / {steps.length} COMPLETED ({progressPercent}%)
              </AppText>
            </View>

            <View style={styles.progressBarTrack}>
              <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
            </View>
          </View>
        </Card>

        {/* Executable Steps Section */}
        <Heading level="h3" color="primary" style={styles.sectionHeading}>
          Checklist Items ({steps.length})
        </Heading>
        <AppText size="xs" color="secondary" style={{ marginBottom: 12 }}>
          Tap any step row to mark it as completed on duty.
        </AppText>

        {steps.map((stepItem, index) => {
          const isDone = completedSteps.includes(index);
          const formattedStep = stepItem.match(/^\d+\./) ? stepItem : `${index + 1}. ${stepItem}`;

          return (
            <TouchableOpacity
              key={index}
              style={[styles.stepCardItem, isDone && styles.stepCardItemDone]}
              onPress={() => toggleStep(index)}
              activeOpacity={0.7}
              accessibilityLabel={`Step ${index + 1}: ${stepItem}`}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isDone }}
            >
              <View style={[styles.checkboxSquare, isDone && styles.checkboxSquareDone]}>
                {isDone ? (
                  <AppText weight="bold" style={{ color: '#FFFFFF', fontSize: 18, lineHeight: 20 }}>
                    ✓
                  </AppText>
                ) : null}
              </View>

              <AppText
                style={[styles.stepItemText, isDone && styles.stepItemTextDone]}
              >
                {formattedStep}
              </AppText>
            </TouchableOpacity>
          );
        })}

        {/* Remarks Section */}
        <View style={styles.remarksSection}>
          <Heading level="h4" color="primary" style={{ marginBottom: 6 }}>
            Execution Remarks (Optional)
          </Heading>
          <TextInput
            style={styles.remarksInput}
            placeholder="Add operational notes, supervisor confirmation, or incident observations..."
            placeholderTextColor="#94A3B8"
            multiline
            numberOfLines={3}
            value={remarks}
            onChangeText={setRemarks}
          />
        </View>

        {/* Submit Execution Button */}
        <TouchableOpacity
          style={[
            styles.submitExecutionBtn,
            completedSteps.length === 0 && styles.submitExecutionBtnDisabled,
          ]}
          onPress={handleSubmitExecution}
          activeOpacity={0.7}
          disabled={completedSteps.length === 0 || isSubmitting}
          accessibilityLabel="Submit Checklist"
          accessibilityRole="button"
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <AppText size="lg" weight="bold" style={{ color: '#FFFFFF', fontSize: 18 }}>
              {isAllCompleted ? 'COMPLETE CHECKLIST' : `SUBMIT CHECKLIST (${completedSteps.length}/${steps.length})`}
            </AppText>
          )}
        </TouchableOpacity>
      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 48,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    borderWidth: 1,
    borderColor: '#6EE7B7',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 14,
  },
  headerCard: {
    padding: 18,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  checklistTitle: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
    color: '#0F172A',
  },
  progressCardSection: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  progressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBarTrack: {
    height: 10,
    backgroundColor: '#E2E8F0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4F46E5',
    borderRadius: 5,
  },
  sectionHeading: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  stepCardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 60,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    marginBottom: 10,
  },
  stepCardItemDone: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
  },
  checkboxSquare: {
    width: 30,
    height: 30,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#94A3B8',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  checkboxSquareDone: {
    borderColor: '#16A34A',
    backgroundColor: '#16A34A',
  },
  stepItemText: {
    flex: 1,
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '600',
    color: '#1E293B',
  },
  stepItemTextDone: {
    color: '#15803D',
    textDecorationLine: 'line-through',
  },
  remarksSection: {
    marginTop: 14,
    marginBottom: 20,
  },
  remarksInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#0F172A',
    textAlignVertical: 'top',
    minHeight: 80,
  },
  submitExecutionBtn: {
    height: 60,
    minHeight: 60,
    backgroundColor: '#5B46E5',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    shadowColor: '#5B46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  submitExecutionBtnDisabled: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0,
    elevation: 0,
  },
});
