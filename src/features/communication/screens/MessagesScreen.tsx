import React, { useState, useEffect, useRef, useMemo } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Modal, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { Card } from '../../../components/Card';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { useTheme } from '../../../providers/ThemeProvider';
import { useGuardStore } from '../../../store/useGuardStore';
import { getTable, DBEmployee, DBSite } from '../../../services/db';
import { NavIcon } from '../../../components/NavIcon';

interface ChatTarget {
  id: string; // receiverId for direct, siteId for site
  name: string;
  type: 'site' | 'direct';
  conversationId: string;
  isReadOnly?: boolean;
  readOnlyReason?: string;
}

export const MessagesScreen: React.FC = () => {
  const { colors, spacing, borderRadius } = useTheme();
  const { guardId, guardName, assignedSite, assignedSiteId, supervisor, messages, sendMessage } = useGuardStore();

  const [contacts, setContacts] = useState<DBEmployee[]>([]);
  const [pastContacts, setPastContacts] = useState<DBEmployee[]>([]);
  const [allSitesList, setAllSitesList] = useState<DBSite[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatTarget | null>(null);
  const [inputText, setInputText] = useState('');
  const [activeTab, setActiveTab] = useState<'direct' | 'sites'>('direct');

  const scrollViewRef = useRef<ScrollView>(null);

  // Safe arrays fallback
  const safeContacts = Array.isArray(contacts) ? contacts : [];
  const safePastContacts = Array.isArray(pastContacts) ? pastContacts : [];
  const safeAllSitesList = Array.isArray(allSitesList) ? allSitesList : [];
  const safeMessages = Array.isArray(messages) ? messages : [];

  // Load contacts and site lists dynamically
  useEffect(() => {
    let isMounted = true;
    const loadMessagingData = async () => {
      try {
        // Fetch Employees
        const allEmployees = await getTable<DBEmployee>('employees');
        const safeEmployees = Array.isArray(allEmployees) ? allEmployees : [];
        
        // Active site guards (excluding current user and supervisor)
        const sameSiteGuards = safeEmployees.filter(
          e => e && e.siteId === assignedSiteId && e.id !== guardId && !String(e.designation || '').toLowerCase().includes('supervisor')
        );

        // Past / Other site guards
        let otherSiteGuards = safeEmployees.filter(
          e => e && e.siteId !== assignedSiteId && e.id !== guardId && !String(e.designation || '').toLowerCase().includes('supervisor')
        );

        // Fallback seed past guards if none exist
        if (otherSiteGuards.length === 0) {
          otherSiteGuards = [
            {
              id: 'emp-201',
              companyId: 'c-1',
              name: 'Robert Fox',
              email: 'robert.f@priority-one.io',
              phone: '+1 415 555 0192',
              designation: 'Security Officer',
              department: 'Security Operations',
              status: 'inactive',
              joinedDate: '2025-01-10',
              site: 'HQ Corporate Tower',
              siteId: 's-02',
            },
            {
              id: 'emp-202',
              companyId: 'c-1',
              name: 'David Davis',
              email: 'david.d@priority-one.io',
              phone: '+1 415 555 0193',
              designation: 'Patrol Officer',
              department: 'Security Operations',
              status: 'inactive',
              joinedDate: '2025-03-12',
              site: 'Harbor Terminal 3',
              siteId: 's-03',
            }
          ];
        }

        // Fetch Sites
        const fetchedSites = await getTable<DBSite>('sites');
        const safeFetchedSites = Array.isArray(fetchedSites) ? fetchedSites : [];
        const fallbackSites: DBSite[] = [
          {
            id: 's-01',
            companyId: 'c-1',
            name: 'Ahmedabad Plant',
            code: 's-01',
            clientName: 'Priority One',
            branch: 'West Zone',
            facilityType: 'Industrial Plant',
            supervisorName: 'Jane Smith',
            guardsCount: 10,
            riskLevel: 'Medium',
            contractEnd: '2027-12-31',
            status: 'active',
            addressLine1: 'Ahmedabad Industrial Zone',
            city: 'Ahmedabad',
            state: 'Gujarat',
            postalCode: '380001',
            country: 'India',
            coordinates: { latitude: 23.0225, longitude: 72.5714, radiusMeters: 100 }
          },
          {
            id: 's-02',
            companyId: 'c-1',
            name: 'HQ Corporate Tower',
            code: 's-02',
            clientName: 'Corporate Inc',
            branch: 'Main Branch',
            facilityType: 'Corporate Office',
            supervisorName: 'Marcus Bell',
            guardsCount: 8,
            riskLevel: 'Low',
            contractEnd: '2027-06-30',
            status: 'active',
            addressLine1: '100 Financial District, SF',
            city: 'San Francisco',
            state: 'CA',
            postalCode: '94104',
            country: 'USA',
            coordinates: { latitude: 37.7749, longitude: -122.4194, radiusMeters: 100 }
          },
          {
            id: 's-03',
            companyId: 'c-1',
            name: 'Harbor Terminal 3',
            code: 's-03',
            clientName: 'Global Shipping Ltd',
            branch: 'Port Branch',
            facilityType: 'Shipping Dock',
            supervisorName: 'Elena Ruiz',
            guardsCount: 12,
            riskLevel: 'High',
            contractEnd: '2026-12-31',
            status: 'active',
            addressLine1: 'Pier 39 Harbor Bay',
            city: 'San Francisco',
            state: 'CA',
            postalCode: '94133',
            country: 'USA',
            coordinates: { latitude: 37.8080, longitude: -122.4098, radiusMeters: 200 }
          }
        ];

        if (isMounted) {
          setContacts(sameSiteGuards);
          setPastContacts(otherSiteGuards);
          setAllSitesList(safeFetchedSites.length > 0 ? safeFetchedSites : fallbackSites);
        }
      } catch (err) {
        console.error('Failed to load messaging data:', err);
      }
    };

    loadMessagingData();
    return () => { isMounted = false; };
  }, [assignedSiteId, guardId]);

  // Determine conversation ID for direct chats
  const getDirectConversationId = (contactId: string) => {
    if (!guardId || !contactId) return '';
    const sortedIds = [guardId, contactId].sort();
    return `direct:${sortedIds[0]}:${sortedIds[1]}`;
  };

  const handleSend = async () => {
    if (!inputText.trim() || !selectedChat) return;

    if (selectedChat.isReadOnly) {
      Alert.alert('Messaging Disabled', 'You are no longer assigned to this site/contact.');
      return;
    }

    const { type, conversationId, id: receiverId } = selectedChat;
    
    await sendMessage(type, conversationId, type === 'direct' ? receiverId : null, inputText.trim());
    setInputText('');

    // Scroll to end of messages
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  // Get messages for currently selected chat thread
  const activeChatMessages = safeMessages.filter(
    msg => msg && msg.conversationId === selectedChat?.conversationId
  );

  const getLastMessage = (convoId: string) => {
    if (!convoId) return null;
    const threadMsgs = safeMessages.filter(m => m && m.conversationId === convoId);
    if (threadMsgs.length === 0) return null;
    const sorted = [...threadMsgs].sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime() || 0;
      const timeB = new Date(b.timestamp).getTime() || 0;
      return timeB - timeA;
    });
    return sorted[0];
  };

  const getLastMessageTimestamp = (convoId: string): number => {
    const last = getLastMessage(convoId);
    if (!last) return 0;
    const t = new Date(last.timestamp).getTime();
    return isNaN(t) ? 0 : t;
  };

  const getUnreadCount = (convoId: string) => {
    if (!convoId) return 0;
    return safeMessages.filter(msg => msg && msg.conversationId === convoId && !msg.read && msg.senderId !== guardId).length;
  };

  // Safe time formatting helper
  const formatMsgTime = (timestampStr: string) => {
    try {
      const d = new Date(timestampStr);
      if (isNaN(d.getTime())) return '';
      const now = new Date();
      const isToday = d.toDateString() === now.toDateString();

      let hours = d.getHours();
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const timeStr = `${hours}:${minutes} ${ampm}`;

      if (isToday) {
        return timeStr;
      }
      return `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ${timeStr}`;
    } catch {
      return '';
    }
  };

  const activeDirectContacts = useMemo(() => {
    const list: {
      id: string;
      name: string;
      role: string;
      roleColor: string;
      roleBg: string;
      subtitle: string;
      type: 'direct';
      conversationId: string;
      isReadOnly: boolean;
      avatarEmoji: string;
    }[] = [];

    if (supervisor) {
      list.push({
        id: 'emp-102',
        name: supervisor,
        role: 'Supervisor',
        roleColor: '#2563EB',
        roleBg: '#EFF6FF',
        subtitle: 'Supervisor • Online',
        type: 'direct',
        conversationId: getDirectConversationId('emp-102'),
        isReadOnly: false,
        avatarEmoji: '👮',
      });
    }

    safeContacts.forEach(guard => {
      list.push({
        id: guard.id,
        name: guard.name,
        role: 'Guard',
        roleColor: '#475569',
        roleBg: '#F1F5F9',
        subtitle: `Guard Officer • ${guard.site || assignedSite || 'Active Site'}`,
        type: 'direct',
        conversationId: getDirectConversationId(guard.id),
        isReadOnly: false,
        avatarEmoji: '🚶',
      });
    });

    list.sort((a, b) => {
      const tA = getLastMessageTimestamp(a.conversationId);
      const tB = getLastMessageTimestamp(b.conversationId);
      return tB - tA;
    });

    return list;
  }, [supervisor, safeContacts, safeMessages, guardId, assignedSite]);

  const pastDirectContacts = useMemo(() => {
    const list = safePastContacts.map(guard => ({
      id: guard.id,
      name: guard.name,
      role: 'Guard',
      roleColor: '#475569',
      roleBg: '#F1F5F9',
      subtitle: `Guard Officer • ${guard.site || 'Other Site'}`,
      type: 'direct' as const,
      conversationId: getDirectConversationId(guard.id),
      isReadOnly: false,
      readOnlyReason: undefined,
      avatarEmoji: '🚶',
    }));

    list.sort((a, b) => {
      const tA = getLastMessageTimestamp(a.conversationId);
      const tB = getLastMessageTimestamp(b.conversationId);
      return tB - tA;
    });

    return list;
  }, [safePastContacts, safeMessages, guardId]);

  const sitesList = useMemo(() => {
    const list: {
      id: string;
      name: string;
      role: string;
      roleColor: string;
      roleBg: string;
      subtitle: string;
      type: 'site';
      conversationId: string;
      isReadOnly: boolean;
      readOnlyReason?: string;
      isCurrentSite: boolean;
    }[] = [];

    if (assignedSiteId) {
      list.push({
        id: assignedSiteId,
        name: assignedSite || 'Assigned Site',
        role: 'Current Site',
        roleColor: '#15803D',
        roleBg: '#DCFCE7',
        subtitle: 'Current Site Communication Chat',
        type: 'site',
        conversationId: `site:${assignedSiteId}`,
        isReadOnly: false,
        isCurrentSite: true,
      });
    }

    safeAllSitesList
      .filter(s => s && s.id !== assignedSiteId && s.code !== assignedSiteId)
      .forEach(pastSite => {
        list.push({
          id: pastSite.id,
          name: pastSite.name || 'Previous Site',
          role: 'Previous Site',
          roleColor: '#64748B',
          roleBg: '#F1F5F9',
          subtitle: 'Past Site Chat • Messaging Disabled',
          type: 'site',
          conversationId: `site:${pastSite.id}`,
          isReadOnly: true,
          readOnlyReason: `You are no longer assigned to ${pastSite.name}. Messages are read-only.`,
          isCurrentSite: false,
        });
      });

    list.sort((a, b) => {
      const tA = getLastMessageTimestamp(a.conversationId);
      const tB = getLastMessageTimestamp(b.conversationId);
      return tB - tA;
    });

    return list;
  }, [assignedSiteId, assignedSite, safeAllSitesList, safeMessages]);

  const supervisorUnread = getUnreadCount(getDirectConversationId('emp-102'));
  const guardsUnread = safeContacts.reduce((sum, g) => sum + (g ? getUnreadCount(getDirectConversationId(g.id)) : 0), 0);
  const directUnreadCount = (supervisor ? supervisorUnread : 0) + guardsUnread;
  const siteUnreadCount = assignedSiteId ? getUnreadCount(`site:${assignedSiteId}`) : 0;

  return (
    <ScreenLayout style={{ flex: 1, backgroundColor: colors.background }}>
      <PageHeader title="Messages" showBack />

      {/* 2 TABS CONTROL: DIRECT MESSAGES | SITES */}
      <View style={[styles.tabBarWrapper, { backgroundColor: colors.surfaceSecondary || '#F1F5F9' }]}>
        <TouchableOpacity
          style={[
            styles.tabItem,
            activeTab === 'direct' && [styles.activeTabItem, { backgroundColor: colors.primary[600] }]
          ]}
          onPress={() => setActiveTab('direct')}
          activeOpacity={0.7}
        >
          <AppText
            size="md"
            weight={activeTab === 'direct' ? 'bold' : 'medium'}
            style={{ color: activeTab === 'direct' ? '#FFFFFF' : colors.text }}
          >
            Direct Messages
          </AppText>
          {directUnreadCount > 0 && (
            <View style={[
              styles.tabBadge,
              { backgroundColor: activeTab === 'direct' ? '#FFFFFF' : colors.error }
            ]}>
              <AppText
                size="xs"
                weight="bold"
                style={{ color: activeTab === 'direct' ? colors.primary[600] : '#FFFFFF' }}
              >
                {directUnreadCount}
              </AppText>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabItem,
            activeTab === 'sites' && [styles.activeTabItem, { backgroundColor: colors.primary[600] }]
          ]}
          onPress={() => setActiveTab('sites')}
          activeOpacity={0.7}
        >
          <AppText
            size="md"
            weight={activeTab === 'sites' ? 'bold' : 'medium'}
            style={{ color: activeTab === 'sites' ? '#FFFFFF' : colors.text }}
          >
            Sites
          </AppText>
          {siteUnreadCount > 0 && (
            <View style={[
              styles.tabBadge,
              { backgroundColor: activeTab === 'sites' ? '#FFFFFF' : colors.error }
            ]}>
              <AppText
                size="xs"
                weight="bold"
                style={{ color: activeTab === 'sites' ? colors.primary[600] : '#FFFFFF' }}
              >
                {siteUnreadCount}
              </AppText>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
        {activeTab === 'sites' ? (
          <>
            <Heading level="h3" style={styles.sectionHeader}>SITE CHATS (SORTED BY LATEST MESSAGE)</Heading>
            {sitesList.length > 0 ? (
              sitesList.map((site: any) => {
                const lastMsg = getLastMessage(site.conversationId);
                const unread = getUnreadCount(site.conversationId);
                const isMe = lastMsg?.senderId === guardId;

                return (
                  <TouchableOpacity
                    key={site.id}
                    style={[
                      styles.threadRow,
                      { backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.md },
                      site.isReadOnly && { opacity: 0.85 }
                    ]}
                    activeOpacity={0.7}
                    onPress={() => setSelectedChat({
                      id: site.id,
                      name: site.name,
                      type: 'site',
                      conversationId: site.conversationId,
                      isReadOnly: site.isReadOnly,
                      readOnlyReason: site.readOnlyReason,
                    })}
                  >
                    <View style={styles.threadInfo}>
                      <View style={[styles.avatarPlaceholder, site.isReadOnly && { backgroundColor: '#F3F4F6' }]}>
                        <AppText size="xl">🏢</AppText>
                      </View>
                      <View style={styles.textDetails}>
                        <View style={styles.titleWithTimeRow}>
                          <View style={styles.titleWithBadgeContainer}>
                            <AppText size="md" weight="bold" numberOfLines={1} style={{ flexShrink: 1, color: site.isReadOnly ? colors.secondary : colors.text }}>
                              {site.name}
                            </AppText>
                            <View style={[styles.roleBadge, { backgroundColor: site.roleBg }]}>
                              <AppText size="xs" weight="bold" style={{ color: site.roleColor }}>
                                {site.role}
                              </AppText>
                            </View>
                          </View>
                          {lastMsg ? (
                            <AppText size="xs" color="secondary" style={styles.msgTimeRight}>
                              {formatMsgTime(lastMsg.timestamp)}
                            </AppText>
                          ) : null}
                        </View>
                        <View style={styles.lastMsgPreviewRow}>
                          <AppText
                            size="sm"
                            numberOfLines={1}
                            style={{
                              flex: 1,
                              color: unread > 0 ? colors.text : '#64748B',
                              fontWeight: unread > 0 ? '700' : '400',
                            }}
                          >
                            {lastMsg
                              ? `${isMe ? 'You: ' : `${lastMsg.senderName}: `}${lastMsg.message}`
                              : site.subtitle}
                          </AppText>
                          {unread > 0 && (
                            <View style={[styles.unreadBadge, { backgroundColor: site.isReadOnly ? '#94A3B8' : colors.error, marginLeft: 8 }]}>
                              <AppText size="xs" color="surface" weight="bold">
                                {unread}
                              </AppText>
                            </View>
                          )}
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            ) : (
              <Card variant="flat" padding={12}>
                <AppText size="base" color="secondary">No site chats available.</AppText>
              </Card>
            )}
          </>
        ) : (
          <>
            {/* CURRENT SITE CONTACTS (SORTED BY LATEST MESSAGE) */}
            <Heading level="h3" style={styles.sectionHeader}>CURRENT SITE CONTACTS (SORTED BY LATEST MESSAGE)</Heading>
            <View style={styles.directList}>
              {activeDirectContacts.length > 0 ? (
                activeDirectContacts.map((contact: any) => {
                  const lastMsg = getLastMessage(contact.conversationId);
                  const unread = getUnreadCount(contact.conversationId);
                  const isMe = lastMsg?.senderId === guardId;

                  return (
                    <TouchableOpacity
                      key={contact.id}
                      style={[styles.threadRow, { backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.md }]}
                      activeOpacity={0.7}
                      onPress={() => setSelectedChat({
                        id: contact.id,
                        name: contact.name,
                        type: contact.type,
                        conversationId: contact.conversationId,
                        isReadOnly: contact.isReadOnly,
                      })}
                    >
                      <View style={styles.threadInfo}>
                        <View style={styles.avatarPlaceholder}>
                          <AppText size="xl">{contact.avatarEmoji}</AppText>
                        </View>
                        <View style={styles.textDetails}>
                          <View style={styles.titleWithTimeRow}>
                            <View style={styles.titleWithBadgeContainer}>
                              <AppText size="md" weight="bold" numberOfLines={1} style={{ flexShrink: 1, color: colors.text }}>
                                {contact.name}
                              </AppText>
                              <View style={[styles.roleBadge, { backgroundColor: contact.roleBg }]}>
                                <AppText size="xs" weight="bold" style={{ color: contact.roleColor }}>
                                  {contact.role}
                                </AppText>
                              </View>
                            </View>
                            {lastMsg ? (
                              <AppText size="xs" color="secondary" style={styles.msgTimeRight}>
                                {formatMsgTime(lastMsg.timestamp)}
                              </AppText>
                            ) : null}
                          </View>
                          <View style={styles.lastMsgPreviewRow}>
                            <AppText
                              size="sm"
                              numberOfLines={1}
                              style={{
                                flex: 1,
                                color: unread > 0 ? colors.text : '#64748B',
                                fontWeight: unread > 0 ? '700' : '400',
                              }}
                            >
                              {lastMsg
                                ? `${isMe ? 'You: ' : ''}${lastMsg.message}`
                                : contact.subtitle}
                            </AppText>
                            {unread > 0 && (
                              <View style={[styles.unreadBadge, { backgroundColor: colors.error, marginLeft: 8 }]}>
                                <AppText size="xs" color="surface" weight="bold">
                                  {unread}
                                </AppText>
                              </View>
                            )}
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })
              ) : (
                <Card variant="flat" padding={12}>
                  <AppText size="base" color="secondary">No active contacts available at your site.</AppText>
                </Card>
              )}
            </View>

            {/* PREVIOUS CONTACTS (READ-ONLY) */}
            {pastDirectContacts.length > 0 && (
              <>
                <Heading level="h3" style={[styles.sectionHeader, { marginTop: spacing.lg }]}>OTHER CONTACTS</Heading>
                <View style={styles.directList}>
                  {pastDirectContacts.map((contact: any) => {
                    const lastMsg = getLastMessage(contact.conversationId);
                    const unread = getUnreadCount(contact.conversationId);
                    const isMe = lastMsg?.senderId === guardId;

                    return (
                      <TouchableOpacity
                        key={contact.id}
                        style={[styles.threadRow, { backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.md, opacity: 0.85 }]}
                        activeOpacity={0.7}
                        onPress={() => setSelectedChat({
                          id: contact.id,
                          name: contact.name,
                          type: contact.type,
                          conversationId: contact.conversationId,
                          isReadOnly: contact.isReadOnly,
                          readOnlyReason: contact.readOnlyReason,
                        })}
                      >
                        <View style={styles.threadInfo}>
                          <View style={[styles.avatarPlaceholder, { backgroundColor: '#F3F4F6' }]}>
                            <AppText size="xl">{contact.avatarEmoji}</AppText>
                          </View>
                          <View style={styles.textDetails}>
                            <View style={styles.titleWithTimeRow}>
                              <View style={styles.titleWithBadgeContainer}>
                                <AppText size="md" weight="bold" numberOfLines={1} style={{ flexShrink: 1, color: colors.secondary }}>
                                  {contact.name}
                                </AppText>
                                <View style={[styles.roleBadge, { backgroundColor: contact.roleBg }]}>
                                  <AppText size="xs" weight="bold" style={{ color: contact.roleColor }}>
                                    {contact.role}
                                  </AppText>
                                </View>
                              </View>
                              {lastMsg ? (
                                <AppText size="xs" color="secondary" style={styles.msgTimeRight}>
                                  {formatMsgTime(lastMsg.timestamp)}
                                </AppText>
                              ) : null}
                            </View>
                            <View style={styles.lastMsgPreviewRow}>
                              <AppText
                                size="sm"
                                numberOfLines={1}
                                style={{
                                  flex: 1,
                                  color: unread > 0 ? colors.text : '#64748B',
                                  fontWeight: unread > 0 ? '700' : '400',
                                }}
                              >
                                {lastMsg
                                  ? `${isMe ? 'You: ' : ''}${lastMsg.message}`
                                  : contact.subtitle}
                              </AppText>
                              {unread > 0 && (
                                <View style={[styles.unreadBadge, { backgroundColor: '#94A3B8', marginLeft: 8 }]}>
                                  <AppText size="xs" color="surface" weight="bold">
                                    {unread}
                                  </AppText>
                                </View>
                              )}
                            </View>
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            )}
          </>
        )}
      </ScrollView>

      {/* CHAT INTERACTIVE MODAL */}
      <Modal 
        visible={selectedChat !== null} 
        animationType="slide"
        onRequestClose={() => setSelectedChat(null)}
        transparent={false}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.surface }]} edges={['top', 'bottom']}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
          >
            {/* Header */}
            <View style={[styles.modalHeader, { borderBottomColor: colors.border, backgroundColor: colors.surface }]}>
              <TouchableOpacity 
                onPress={() => setSelectedChat(null)} 
                style={styles.backButton}
                hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
                activeOpacity={0.6}
              >
                <NavIcon name="arrow-left" size={24} color={colors.text || '#0F172A'} />
              </TouchableOpacity>
              <View style={styles.headerTitleContainer}>
                <AppText size="lg" weight="bold" style={{ color: colors.text }}>{selectedChat?.name}</AppText>
                <AppText size="base" color="secondary" style={{ marginTop: 2 }}>
                  {selectedChat?.isReadOnly ? '🔒 Previous Assignment (Read-Only)' : selectedChat?.type === 'site' ? 'Site Broadcast Chat' : 'Direct secure message'}
                </AppText>
              </View>
              <View style={{ width: 40 }} />
            </View>

            {/* Messages list */}
            <ScrollView
              ref={scrollViewRef}
              style={{ flex: 1 }}
              contentContainerStyle={styles.chatListContent}
              onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: false })}
            >
              {activeChatMessages.map((msg) => {
                const isMe = msg.senderId === guardId;
                return (
                  <View key={msg.id} style={[styles.messageRow, isMe ? styles.myMessageRow : styles.otherMessageRow]}>
                    {!isMe && (
                      <AppText size="base" color="secondary" style={styles.senderLabel}>
                        {msg.senderName}
                      </AppText>
                    )}
                    <View style={[
                      styles.bubble,
                      { 
                        backgroundColor: isMe ? colors.primary[600] : colors.surfaceSecondary,
                        borderRadius: borderRadius.md,
                        paddingHorizontal: 14,
                        paddingVertical: 10,
                      }
                    ]}>
                      <AppText size="lg" style={{ color: isMe ? '#FFFFFF' : colors.text }}>
                        {msg.message}
                      </AppText>
                    </View>
                    <AppText size="base" color="secondary" style={styles.msgTime}>
                      {formatMsgTime(msg.timestamp)}
                    </AppText>
                  </View>
                );
              })}

              {activeChatMessages.length === 0 && (
                <View style={styles.emptyChatContainer}>
                  {selectedChat?.type === 'site' ? (
                    <View style={styles.emptySubContainer}>
                      <Heading level="h2" style={styles.emptyHeader}>No Site Messages</Heading>
                      <AppText size="lg" color="secondary" style={styles.emptyBodyText}>
                        There are no messages for this site history.
                      </AppText>
                    </View>
                  ) : (
                    <View style={styles.emptySubContainer}>
                      <Heading level="h2" style={styles.emptyHeader}>No Direct Messages</Heading>
                      <AppText size="lg" color="secondary" style={styles.emptyBodyText}>
                        No previous direct messages exchanged with this officer.
                      </AppText>
                    </View>
                  )}
                </View>
              )}
            </ScrollView>

            {/* Composer / Read-Only Notice */}
            {selectedChat?.isReadOnly ? (
              <View style={[styles.readOnlyNoticeContainer, { borderTopColor: colors.border, backgroundColor: colors.surfaceSecondary }]}>
                <AppText size="base" weight="bold" color="secondary" style={{ textAlign: 'center' }}>
                  🔒 {selectedChat.readOnlyReason || 'You are no longer assigned to this site/contact. Messaging is disabled (Read-Only).'}
                </AppText>
              </View>
            ) : (
              <View style={[styles.composerRow, { borderTopColor: colors.border }]}>
                <TextInput
                  style={[styles.composerInput, { borderRadius: borderRadius.md, backgroundColor: colors.surfaceSecondary, color: colors.text }]}
                  placeholder={selectedChat?.type === 'site' ? "Broadcasting to site team..." : "Send a message..."}
                  placeholderTextColor="#9CA3AF"
                  value={inputText}
                  onChangeText={setInputText}
                  multiline
                />
                <TouchableOpacity
                  style={[styles.sendButton, { backgroundColor: colors.primary[600], borderRadius: 24 }]}
                  onPress={handleSend}
                  activeOpacity={0.7}
                >
                  <NavIcon name="send" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            )}
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  tabBarWrapper: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    padding: 4,
    borderRadius: 12,
    gap: 6,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  activeTabItem: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  listContainer: {
    padding: 16,
  },
  sectionHeader: {
    marginBottom: 8,
    fontSize: 14,
    letterSpacing: 0.5,
    fontWeight: '700',
  },
  threadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  threadInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textDetails: {
    flex: 1,
  },
  titleWithBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  titleWithTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    width: '100%',
  },
  titleWithBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    paddingRight: 8,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  lastMsgPreviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  msgTimeRight: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '500',
    flexShrink: 0,
  },
  activeBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  readOnlyBadge: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  unreadBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  directList: {
    gap: 8,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
    minHeight: 60,
  },
  backButton: {
    paddingRight: 16,
    paddingVertical: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrowText: {
    fontSize: 28,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  chatListContent: {
    padding: 16,
    gap: 16,
    flexGrow: 1,
  },
  messageRow: {
    maxWidth: '75%',
    marginBottom: 4,
  },
  myMessageRow: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  otherMessageRow: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  senderLabel: {
    marginBottom: 4,
    fontWeight: 'bold',
  },
  bubble: {
    elevation: 0.5,
  },
  msgTime: {
    marginTop: 4,
  },
  composerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  composerInput: {
    flex: 1,
    minHeight: 48,
    maxHeight: 120,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    marginRight: 10,
    textAlignVertical: 'center',
  },
  sendButton: {
    height: 48,
    width: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  readOnlyNoticeContainer: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyChatContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptySubContainer: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyHeader: {
    marginBottom: 8,
  },
  emptyBodyText: {
    textAlign: 'center',
    lineHeight: 18,
  }
});
