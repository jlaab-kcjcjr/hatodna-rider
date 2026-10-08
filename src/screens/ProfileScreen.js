import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, RADIUS } from '../theme';
import { useAuth } from '../context/AuthContext';
import BanigBand from '../components/BanigBand';

export default function ProfileScreen() {
  const { user, application, history, logout } = useAuth();

  const initials = application.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');

  const details = [
    { key: 'Service area', value: application.town },
    { key: 'Vehicle', value: `${application.vehicle}${application.plate ? `, ${application.plate}` : ''}` },
    { key: 'Documents', value: 'Verified' },
    { key: 'Total deliveries', value: String(history.length) },
  ];

  const confirmLogout = () =>
    Alert.alert('Log out?', "You'll go offline and need to verify your number again.", [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: logout },
    ]);

  return (
    <SafeAreaView edges={['top']} style={styles.page}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.hero}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.name}>{application.name}</Text>
          <Text style={styles.phone}>{user.phone}</Text>
          <View style={styles.badge}>
            <Ionicons name="shield-checkmark" size={14} color={COLORS.pili} />
            <Text style={styles.badgeText}>Approved rider</Text>
          </View>
        </View>
        <BanigBand id="rider-profile-band" height={10} />

        <View style={styles.card}>
          {details.map((d) => (
            <View key={d.key} style={styles.row}>
              <Text style={styles.key}>{d.key}</Text>
              <Text style={styles.value}>{d.value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.menu}>
          <Pressable
            style={styles.menuRow}
            onPress={() => Alert.alert('Help and support', 'This is coming in the next update.')}
          >
            <Ionicons name="help-circle-outline" size={22} color={COLORS.ink} />
            <Text style={styles.menuText}>Help and support</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.inkSoft} />
          </Pressable>
          <Pressable style={[styles.menuRow, { borderBottomWidth: 0 }]} onPress={confirmLogout}>
            <Ionicons name="log-out-outline" size={22} color={COLORS.sili} />
            <Text style={[styles.menuText, { color: COLORS.sili }]}>Log out</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: COLORS.page },
  hero: { alignItems: 'center', paddingTop: 24, paddingBottom: 22, backgroundColor: COLORS.abacaSoft },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: COLORS.pili,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: FONTS.display, fontSize: 34, color: '#FFFFFF' },
  name: { fontFamily: FONTS.display, fontSize: 24, color: COLORS.ink, marginTop: 12 },
  phone: { fontFamily: FONTS.body, fontSize: 14, color: COLORS.inkSoft, marginTop: 2 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: COLORS.piliSoft,
  },
  badgeText: { fontFamily: FONTS.semi, fontSize: 13, color: COLORS.pili },
  card: {
    margin: 16,
    padding: 16,
    gap: 12,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  key: { fontFamily: FONTS.body, fontSize: 14, color: COLORS.inkSoft },
  value: { fontFamily: FONTS.semi, fontSize: 14, color: COLORS.ink, flexShrink: 1, textAlign: 'right' },
  menu: {
    marginHorizontal: 16,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.line,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
  },
  menuText: { flex: 1, fontFamily: FONTS.semi, fontSize: 15, color: COLORS.ink },
});