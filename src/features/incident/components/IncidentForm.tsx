import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Button } from '../../../components/Button';
import { AppText } from '../../../components/typography/Text';
import { useTheme } from '../../../providers/ThemeProvider';
import { useGuardStore } from '../../../store/useGuardStore';

import { Input } from '../../../components/Input';

export const IncidentForm: React.FC = () => {
  const { colors, spacing, borderRadius } = useTheme();
  const reportIncident = useGuardStore((state) => state.reportIncident);
  
  const [type, setType] = useState('Theft');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [severity, setSeverity] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Low');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);

  const incidentTypes = ['Theft', 'Fire', 'Medical', 'Visitor', 'Equipment Damage', 'Safety Hazard', 'Other'];

  const handleSubmit = async () => {
    await reportIncident({
      type,
      title,
      description,
      location,
      severity,
    });
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setTitle('');
      setDescription('');
      setLocation('');
    }, 3000);
  };

  return (
    <View style={styles.container}>
      {/* Mock Type Dropdown */}
      <View style={styles.field}>
        <AppText
          size="sm"
          weight="medium"
          style={[styles.label, { color: colors.text, marginBottom: spacing.xs }]}
        >
          Incident Type
        </AppText>
        <TouchableOpacity 
          style={[
            styles.dropdownTrigger, 
            { 
              borderColor: colors.border, 
              borderRadius: borderRadius.md,
              backgroundColor: colors.surface,
              paddingHorizontal: spacing.md,
            }
          ]}
          onPress={() => setShowTypeDropdown(!showTypeDropdown)}
        >
          <AppText color="text" size="base">{type}</AppText>
          <AppText color="secondary" size="xs">▼</AppText>
        </TouchableOpacity>
        {showTypeDropdown && (
          <View style={[styles.dropdown, { borderColor: colors.border, backgroundColor: colors.surface }]}>
            {incidentTypes.map((t) => (
              <TouchableOpacity 
                key={t} 
                style={[styles.dropdownItem, { borderBottomColor: colors.border }]} 
                onPress={() => { setType(t); setShowTypeDropdown(false); }}
              >
                <AppText color="text" size="base">{t}</AppText>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <Input
        label="Incident Title"
        value={title}
        onChangeText={setTitle}
        placeholder="Enter title..."
      />

      <Input
        label="Location"
        value={location}
        onChangeText={setLocation}
        placeholder="Enter specific location..."
      />

      <Input
        label="Description"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
        placeholder="Provide details..."
        style={styles.textArea}
      />

      <View style={styles.field}>
        <AppText
          size="sm"
          weight="medium"
          style={[styles.label, { color: colors.text, marginBottom: spacing.xs }]}
        >
          Severity
        </AppText>
        <View style={styles.severityRow}>
          {['Low', 'Medium', 'High', 'Critical'].map((level) => (
            <TouchableOpacity 
              key={level} 
              style={[
                styles.severityBtn, 
                severity === level ? { backgroundColor: colors.primary[600], borderColor: colors.primary[600] } : { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
                { borderRadius: borderRadius.md }
              ]}
              onPress={() => setSeverity(level as any)}
            >
              <AppText size="sm" weight="semibold" color={severity === level ? 'surface' : 'text'}>{level}</AppText>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.field}>
        <AppText
          size="sm"
          weight="medium"
          style={[styles.label, { color: colors.text, marginBottom: spacing.xs }]}
        >
          Photo Evidence
        </AppText>
        <TouchableOpacity 
          style={[
            styles.attachmentBox, 
            { 
              borderColor: colors.border, 
              borderRadius: borderRadius.md, 
              borderStyle: 'dashed',
              backgroundColor: colors.surfaceSecondary,
            }
          ]}
          activeOpacity={0.7}
        >
          <AppText style={{fontSize: 20, marginBottom: 4}}>📸</AppText>
          <AppText size="sm" color="primary" weight="medium">Tap to capture photo</AppText>
        </TouchableOpacity>
      </View>

      <Button title="Submit Report" variant="primary" size="medium" fullWidth onPress={handleSubmit} style={styles.btn} />

      {showSuccess && (
        <View style={[styles.snackbar, { backgroundColor: colors.success }]}>
          <AppText color="surface" weight="semibold">Incident Reported Successfully!</AppText>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 4,
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    minHeight: 48,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  dropdown: {
    borderWidth: 1,
    borderTopWidth: 0,
    position: 'absolute',
    top: 76, // height of label + trigger + margins
    left: 0,
    right: 0,
    zIndex: 10,
    elevation: 5,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
  },
  severityRow: {
    flexDirection: 'row',
    gap: 8,
  },
  severityBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  attachmentBox: {
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btn: {
    marginTop: 8,
  },
  snackbar: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  }
});
