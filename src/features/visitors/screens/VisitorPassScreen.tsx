import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Share,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { Button } from '../../../components/Button';
import { useTheme } from '../../../providers/ThemeProvider';
import { useNavigation, useRoute } from '@react-navigation/native';
import { visitorService } from '../services/visitor.service';
import { VisitorRecord } from '../types/visitor.types';
import {
  Share2,
  Download,
  Shield,
  Building2,
  Calendar,
  Clock,
  CheckCircle2,
  MapPin,
  QrCode as QrIcon,
} from 'lucide-react-native';

export const VisitorPassScreen: React.FC = () => {
  const { colors, borderRadius } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { visitorId } = route.params || {};

  const [visitor, setVisitor] = useState<VisitorRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!visitorId) return;
      setLoading(true);
      const data = await visitorService.getVisitorById(visitorId);
      setVisitor(data);
      setLoading(false);
    }
    load();
  }, [visitorId]);

  const handleShare = async () => {
    if (!visitor) return;
    try {
      await Share.share({
        title: 'Priority One Security Visitor Pass',
        message: `Official Security Pass\nPass Ref: ${visitor.referenceNumber}\nName: ${visitor.visitorName}\nCompany: ${visitor.visitorCompany || 'Guest'}\nAuthorized Site: ${visitor.siteName}\nHost: ${visitor.hostName} (${visitor.hostDepartment || 'Acme'})\nBadge Number: ${visitor.badgeNumber || 'N/A'}\nVerification Code: ${visitor.qrPassCode}`,
      });
    } catch (e) {
      // Ignored
    }
  };

  if (loading) {
    return (
      <ScreenLayout activeRoute="VisitorPassScreen">
        <PageHeader title="Security Pass" showBack={true} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary[600]} />
        </View>
      </ScreenLayout>
    );
  }

  if (!visitor) {
    return (
      <ScreenLayout activeRoute="VisitorPassScreen">
        <PageHeader title="Security Pass" showBack={true} />
        <View style={styles.centerContainer}>
          <AppText size="base" style={{ color: colors.textSecondary }}>
            Pass details could not be found.
          </AppText>
        </View>
      </ScreenLayout>
    );
  }

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(visitor.qrPassCode)}`;

  return (
    <ScreenLayout activeRoute="VisitorPassScreen">
      <PageHeader
        title="Official Visitor Pass"
        showBack={true}
        rightComponent={
          <TouchableOpacity onPress={handleShare} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Share2 size={20} color={colors.text} />
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Pass Card Container */}
        <View style={[styles.passContainer, { borderRadius: borderRadius.lg }]}>
          {/* Official Pass Header */}
          <View style={styles.passHeader}>
            <Shield size={24} color="#FFFFFF" strokeWidth={2.2} />
            <AppText size="sm" weight="bold" style={styles.passBrandTitle}>
              PRIORITY ONE SECURITY
            </AppText>
            <AppText size="xs" style={styles.passSubHeader}>
              OFFICIAL VISITOR SECURITY PASS
            </AppText>
          </View>

          {/* Visitor Name & Info */}
          <View style={styles.visitorSection}>
            <Heading level="h3" style={styles.visitorName}>
              {visitor.visitorName.toUpperCase()}
            </Heading>
            <AppText size="sm" weight="medium" style={styles.visitorCompany}>
              {visitor.visitorCompany || 'Guest / Independent'}
            </AppText>
            <View style={styles.typeBadge}>
              <AppText size="xs" weight="bold" style={styles.typeBadgeText}>
                {visitor.category}
              </AppText>
            </View>
          </View>

          {/* Pass ID & Badge Number Strip */}
          <View style={styles.badgeStrip}>
            <View style={styles.badgeCol}>
              <AppText size="xs" style={styles.badgeLabel}>PASS ID</AppText>
              <AppText size="sm" weight="bold" style={styles.badgeValue}>
                {visitor.referenceNumber}
              </AppText>
            </View>
            <View style={styles.stripDivider} />
            <View style={styles.badgeCol}>
              <AppText size="xs" style={styles.badgeLabel}>BADGE NUMBER</AppText>
              <AppText size="sm" weight="bold" style={styles.badgeValue}>
                {visitor.badgeNumber || 'TMP-GATE'}
              </AppText>
            </View>
          </View>

          {/* QR Code Graphic Box */}
          <View style={styles.qrContainer}>
            <Image
              source={{ uri: qrImageUrl }}
              style={styles.qrImage}
              resizeMode="contain"
            />
            <AppText size="xs" style={styles.qrHint}>
              Scan at gate terminal or barrier scanner
            </AppText>
            <AppText size="xs" weight="bold" style={styles.qrCodeString}>
              {visitor.qrPassCode}
            </AppText>
          </View>

          {/* Pass Metadata List */}
          <View style={styles.metadataContainer}>
            <View style={styles.metaRow}>
              <MapPin size={16} color="#64748B" />
              <View style={styles.metaTextCol}>
                <AppText size="xs" style={styles.metaLabel}>Authorized Site</AppText>
                <AppText size="sm" weight="bold" style={styles.metaValue}>
                  {visitor.siteName}
                </AppText>
              </View>
            </View>

            <View style={styles.metaRow}>
              <Building2 size={16} color="#64748B" />
              <View style={styles.metaTextCol}>
                <AppText size="xs" style={styles.metaLabel}>Host Contact</AppText>
                <AppText size="sm" weight="bold" style={styles.metaValue}>
                  {visitor.hostName} ({visitor.hostDepartment || 'Acme'})
                </AppText>
              </View>
            </View>

            <View style={styles.metaRow}>
              <Clock size={16} color="#64748B" />
              <View style={styles.metaTextCol}>
                <AppText size="xs" style={styles.metaLabel}>Pass Timeframe</AppText>
                <AppText size="sm" weight="bold" style={styles.metaValue}>
                  {new Date(visitor.expectedArrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {' — '}
                  {new Date(visitor.expectedDeparture).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </AppText>
              </View>
            </View>
          </View>

          {/* Pass Footer Security Stamp */}
          <View style={styles.passFooter}>
            <CheckCircle2 size={14} color="#16A34A" />
            <AppText size="xs" weight="bold" style={styles.footerStamp}>
              VERIFIED & AUTHORIZED BY PRIORITY ONE GATE CONTROL
            </AppText>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.bottomButtons}>
          <Button
            title="SHARE DIGITAL PASS"
            onPress={handleShare}
            style={{ backgroundColor: colors.primary[600], marginBottom: 10, height: 48 }}
          />
          <Button
            title="RETURN TO GATE DASHBOARD"
            variant="outline"
            onPress={() => navigation.navigate('Visitors')}
            style={{ height: 48 }}
          />
        </View>
      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
  },
  passContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#0F172A',
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  passHeader: {
    backgroundColor: '#0F172A',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  passBrandTitle: {
    color: '#FFFFFF',
    marginTop: 6,
    letterSpacing: 1.2,
  },
  passSubHeader: {
    color: '#94A3B8',
    marginTop: 2,
    fontSize: 10,
    letterSpacing: 0.8,
  },
  visitorSection: {
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  visitorName: {
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  visitorCompany: {
    color: '#64748B',
    marginTop: 2,
  },
  typeBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  typeBadgeText: {
    color: '#1D4ED8',
    fontSize: 11,
  },
  badgeStrip: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  badgeCol: {
    flex: 1,
    alignItems: 'center',
  },
  stripDivider: {
    width: 1,
    backgroundColor: '#CBD5E1',
  },
  badgeLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: 'bold',
  },
  badgeValue: {
    color: '#0F172A',
    marginTop: 2,
  },
  qrContainer: {
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  qrImage: {
    width: 180,
    height: 180,
  },
  qrHint: {
    color: '#94A3B8',
    fontSize: 10,
    marginTop: 8,
  },
  qrCodeString: {
    color: '#334155',
    marginTop: 4,
    fontSize: 11,
    letterSpacing: 0.5,
  },
  metadataContainer: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  metaTextCol: {
    marginLeft: 10,
    flex: 1,
  },
  metaLabel: {
    color: '#94A3B8',
    fontSize: 10,
  },
  metaValue: {
    color: '#0F172A',
    marginTop: 1,
  },
  passFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0FDF4',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: '#BBF7D0',
  },
  footerStamp: {
    color: '#15803D',
    fontSize: 9,
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  bottomButtons: {
    marginTop: 18,
  },
});
