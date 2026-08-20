import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Modal, TextInput, KeyboardAvoidingView, Platform, FlatList } from 'react-native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { Card } from '../../../components/Card';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { Button } from '../../../components/Button';
import { useTheme } from '../../../providers/ThemeProvider';
import { useGuardStore } from '../../../store/useGuardStore';
import { getTable, DBEmployee } from '../../../services/db';

import { SafeAreaView } from 'react-native-safe-area-context';

interface ChatTarget {
  id: string; // receiverId for direct, siteId for site
  name: string;
  type: 'site' | 'direct';
  conversationId: string;
}

export const MessagesScreen: React.FC = () => {
  const { colors, spacing, borderRadius } = useTheme();
  const { guardId, guardName, assignedSite, assignedSiteId, supervisor, supervisorPhone, messages, sendMessage } = useGuardStore();

  const [contacts, setContacts] = useState<DBEmployee[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatTarget | null>(null);
  const [inputText, setInputText] = useState('');

  const scrollViewRef = useRef<ScrollView>(null);

  // Load same-site guards dynamically
  useEffect(() => {
    const loadContacts = async () => {
      try {
        const allEmployees = await getTable<DBEmployee>('employees');
        // Filter guards assigned to the same site (excluding myself and supervisor)
        const sameSiteGuards = allEmployees.filter(
          e => e.siteId === assignedSiteId && e.id !== guardId && !e.designation.toLowerCase().includes('supervisor')
        );
        setContacts(sameSiteGuards);
      } catch (err) {
        console.error('Failed to load contacts:', err);
      }
    };
    if (assignedSiteId && guardId) {
      loadContacts();
    }
  }, [assignedSiteId, guardId]);

  // Determine conversation ID for direct chats
  const getDirectConversationId = (contactId: string) => {
    if (!guardId) return '';
    const sortedIds = [guardId, contactId].sort();
    return `direct:${sortedIds[0]}:${sortedIds[1]}`;
  };

  const handleSend = async () => {
    if (!inputText.trim() || !selectedChat) return;
    const { type, conversationId, id: receiverId } = selectedChat;
    
    await sendMessage(type, conversationId, type === 'direct' ? receiverId : null, inputText.trim());
    setInputText('');

    // Scroll to end of messages
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  // Get messages for currently selected chat thread
  const activeChatMessages = messages.filter(
    msg => msg.conversationId === selectedChat?.conversationId
  );

  const getUnreadCount = (convoId: string) => {
    return messages.filter(msg => msg.conversationId === convoId && !msg.read && msg.senderId !== guardId).length;
  };

  // Safe time formatting helper
  const formatMsgTime = (timestampStr: string) => {
    try {
      const d = new Date(timestampStr);
      if (isNaN(d.getTime())) return '';
      let hours = d.getHours();
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      return `${hours}:${minutes} ${ampm}`;
    } catch {
      return '';
    }
  };

  return (
    <ScreenLayout>
      <PageHeader title="Messages" showBack />
      
      <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
        {/* SITE CONVERSATION SECTION */}
        <Heading level="h4" style={styles.sectionHeader}>SITE</Heading>
        {assignedSiteId ? (
          <TouchableOpacity
            style={[styles.threadRow, { backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.md }]}
            activeOpacity={0.7}
            onPress={() => setSelectedChat({
              id: assignedSiteId,
              name: assignedSite,
              type: 'site',
              conversationId: `site:${assignedSiteId}`
            })}
          >
            <View style={styles.threadInfo}>
              <View style={styles.avatarPlaceholder}>
                <AppText size="lg">🏢</AppText>
              </View>
              <View style={styles.textDetails}>
                <AppText size="base" weight="bold">{assignedSite}</AppText>
                <AppText size="xs" color="secondary">Site Communication Chat</AppText>
              </View>
            </View>
            {getUnreadCount(`site:${assignedSiteId}`) > 0 && (
              <View style={[styles.unreadBadge, { backgroundColor: colors.error }]}>
                <AppText size="xs" color="surface" weight="bold">
                  {getUnreadCount(`site:${assignedSiteId}`)}
                </AppText>
              </View>
            )}
          </TouchableOpacity>
        ) : (
          <Card variant="flat" padding={12}>
            <AppText size="sm" color="secondary">No site assigned.</AppText>
          </Card>
        )}

        {/* DIRECT MESSAGES SECTION */}
        <Heading level="h4" style={[styles.sectionHeader, { marginTop: spacing.lg }]}>DIRECT MESSAGES</Heading>
        <View style={styles.directList}>
          {/* Assigned Supervisor */}
          {supervisor && (
            <TouchableOpacity
              style={[styles.threadRow, { backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.md }]}
              activeOpacity={0.7}
              onPress={() => setSelectedChat({
                id: 'emp-102', // Seeded Jane Smith supervisor ID
                name: `Supervisor ${supervisor}`,
                type: 'direct',
                conversationId: getDirectConversationId('emp-102')
              })}
            >
              <View style={styles.threadInfo}>
                <View style={styles.avatarPlaceholder}>
                  <AppText size="lg">👮</AppText>
                </View>
                <View style={styles.textDetails}>
                  <AppText size="base" weight="bold">{supervisor}</AppText>
                  <AppText size="xs" color="secondary">Supervisor • Online</AppText>
                </View>
              </View>
              {getUnreadCount(getDirectConversationId('emp-102')) > 0 && (
                <View style={[styles.unreadBadge, { backgroundColor: colors.error }]}>
                  <AppText size="xs" color="surface" weight="bold">
                    {getUnreadCount(getDirectConversationId('emp-102'))}
                  </AppText>
                </View>
              )}
            </TouchableOpacity>
          )}

          {/* Same Site Guards */}
          {contacts.map(guard => (
            <TouchableOpacity
              key={guard.id}
              style={[styles.threadRow, { backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.md }]}
              activeOpacity={0.7}
              onPress={() => setSelectedChat({
                id: guard.id,
                name: `Guard ${guard.name}`,
                type: 'direct',
                conversationId: getDirectConversationId(guard.id)
              })}
            >
              <View style={styles.threadInfo}>
                <View style={styles.avatarPlaceholder}>
                  <AppText size="lg">🚶</AppText>
                </View>
                <View style={styles.textDetails}>
                  <AppText size="base" weight="bold">{guard.name}</AppText>
                  <AppText size="xs" color="secondary">Guard Officer • Ahmedabad Plant</AppText>
                </View>
              </View>
              {getUnreadCount(getDirectConversationId(guard.id)) > 0 && (
                <View style={[styles.unreadBadge, { backgroundColor: colors.error }]}>
                  <AppText size="xs" color="surface" weight="bold">
                    {getUnreadCount(getDirectConversationId(guard.id))}
                  </AppText>
                </View>
              )}
            </TouchableOpacity>
          ))}

          {contacts.length === 0 && !supervisor && (
            <Card variant="flat" padding={12}>
              <AppText size="sm" color="secondary">No contacts available at your site.</AppText>
            </Card>
          )}
        </View>
      </ScrollView>

      {/* CHAT INTERACTIVE MODAL */}
      <Modal 
        visible={selectedChat !== null} 
        animationType="slide"
        onRequestClose={() => setSelectedChat(null)}
      >
        <SafeAreaView style={[styles.modalSafeArea, { backgroundColor: colors.surface }]} edges={['top', 'bottom']}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContainer}
          >
            {/* Header */}
            <View style={[styles.modalHeader, { borderBottomColor: colors.border, backgroundColor: colors.surface }]}>
              <TouchableOpacity 
                onPress={() => setSelectedChat(null)} 
                style={styles.backButton}
                hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
                activeOpacity={0.6}
              >
                <AppText style={[styles.backArrowText, { color: colors.text }]}>←</AppText>
              </TouchableOpacity>
              <View style={styles.headerTitleContainer}>
                <AppText size="base" weight="bold" style={{ color: colors.text }}>{selectedChat?.name}</AppText>
                <AppText size="xs" color="secondary" style={{ marginTop: 2 }}>
                  {selectedChat?.type === 'site' ? 'Site Broadcast Chat' : 'Direct secure message'}
                </AppText>
              </View>
              <View style={{ width: 40 }} />
            </View>

          {/* Messages list */}
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.chatListContent}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: false })}
          >
            {activeChatMessages.map((msg) => {
              const isMe = msg.senderId === guardId;
              return (
                <View key={msg.id} style={[styles.messageRow, isMe ? styles.myMessageRow : styles.otherMessageRow]}>
                  {!isMe && (
                    <AppText size="xs" color="secondary" style={styles.senderLabel}>
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
                    <AppText size="base" style={{ color: isMe ? '#FFFFFF' : colors.text }}>
                      {msg.message}
                    </AppText>
                  </View>
                  <AppText size="xs" color="secondary" style={styles.msgTime}>
                    {formatMsgTime(msg.timestamp)}
                  </AppText>
                </View>
              );
            })}

            {activeChatMessages.length === 0 && (
              <View style={styles.emptyChatContainer}>
                {selectedChat?.type === 'site' ? (
                  <View style={styles.emptySubContainer}>
                    <AppText size="lg" style={styles.emptyIcon}>🏢</AppText>
                    <Heading level="h4" style={styles.emptyHeader}>No Site Messages</Heading>
                    <AppText size="sm" color="secondary" style={styles.emptyBodyText}>
                      There are no messages for your assigned site yet.
                    </AppText>
                  </View>
                ) : (
                  <View style={styles.emptySubContainer}>
                    <AppText size="lg" style={styles.emptyIcon}>💬</AppText>
                    <Heading level="h4" style={styles.emptyHeader}>No Direct Messages</Heading>
                    <AppText size="sm" color="secondary" style={styles.emptyBodyText}>
                      Start a conversation with your supervisor or a guard assigned to your site.
                    </AppText>
                  </View>
                )}
              </View>
            )}
          </ScrollView>

          {/* Composer */}
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
              style={[styles.sendButton, { backgroundColor: colors.primary[600], borderRadius: borderRadius.md }]}
              onPress={handleSend}
            >
              <AppText size="base" weight="bold" style={{ color: '#FFFFFF' }}>Send</AppText>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  </ScreenLayout>
);
};

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
  },
  sectionHeader: {
    marginBottom: 8,
    fontSize: 14,
    letterSpacing: 0.5,
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
  modalSafeArea: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 12 : 8,
    paddingBottom: 14,
    borderBottomWidth: 1,
    minHeight: 56,
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
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  composerInput: {
    flex: 1,
    height: 48,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 16,
    marginRight: 10,
    textAlignVertical: 'center',
  },
  sendButton: {
    height: 48,
    width: 72,
    justifyContent: 'center',
    alignItems: 'center',
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
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyHeader: {
    marginBottom: 8,
  },
  emptyBodyText: {
    textAlign: 'center',
    lineHeight: 18,
  }
});
