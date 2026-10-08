import React from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, RADIUS } from '../theme';
import { useAuth } from '../context/AuthContext';
import BanigBand from '../components/BanigBand';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function sameDay(a, b) {
  return new Date(a).toDateString() === new Date(b).toDateString();
}

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' });
}

export default function EarningsScreen() {
  const { history, remitCash } = useAuth();
  const now = Date.now();
  const today = history.filter((j) => sameDay(j.completedAt, now));
  const week = history.filter((j) => now - j.completedAt < WEEK_MS);
  const sum = (list) => list.reduce((total, j) => total + j.earning, 0);
  const toRemit = history.filter((j) => !j.remitted).reduce((total, j) => total + (j.orderTotal - j.earning), 0);

  const confirmRemit = () =>
    Alert.alert('Mark cash as remitted?', `Confirm that you handed ₱${toRemit} to HatodNa.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Confirm', onPress: remitCash },
    ]);

  const header = (
    <View>
      <Text style={styles.title}>Earnings</Text>
      <View style={styles.hero}>
        <Text style={styles.heroLabel}>Today's earnings</Text>
        <Text style={styles.heroAmount}>₱{sum(today)}</Text>
        <View style={styles.heroRow}>
          <View>
            <Text style={styles.statNum}>{today.length}</Text>
            <Text style={styles.statLabel}>deliveries today</Text>
          </View>
          <View>
            <Text style={styles.statNum}>₱{sum(week)}</Text>
            <Text style={styles.statLabel}>last 7 days</Text>
          </View>
        </View>
        <View style={styles.heroBand}>
          <BanigBand id="earn-band" height={10} />
        </View>
      </View>

      <View style={styles.remit}>
        <Text style={styles.remitTitle}>Cash to remit</Text>
        <Text style={styles.remitAmount}>₱{toRemit}</Text>
        <Text style={styles.remitSub}>
          The store's and HatodNa's share of the cash you collected. Remit it at the HatodNa office or by GCash.
        </Text>
        {toRemit > 0 && (
          <Pressable style={styles.remitBtn} onPress={confirmRemit}>
            <Text style={styles.remitBtnText}>Mark as remitted</Text>
          </Pressable>
        )}
      </View>

      <Text style={styles.section}>Completed deliveries</Text>
    </View>
  );

  return (
    <SafeAreaView edges={['top']} style={styles.page}>
      <FlatList
        data={history}
        keyExtractor={(j) => j.id}
        ListHeaderComponent={header}
        contentContainerStyle={{ paddingBottom: 30 }}
        ListEmptyComponent={<Text style={styles.empty}>Your completed deliveries will show up here.</Text>}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>
                {item.store} to {item.customer}
              </Text>
              <Text style={styles.rowMeta}>
                {formatTime(item.completedAt)}, {item.distanceKm} km
              </Text>
            </View>
            <Text style={styles.rowAmount}>+₱{item.earning}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: COLORS.page },
  title: { fontFamily: FONTS.display, fontSize: 30, color: COLORS.ink, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12 },
  hero: {
    marginHorizontal: 16,
    padding: 20,
    paddingBottom: 30,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.ink,
    overflow: 'hidden',
  },
  heroLabel: { fontFamily: FONTS.semi, fontSize: 14, color: '#CBBDB5' },
  heroAmount: { fontFamily: FONTS.display, fontSize: 46, color: COLORS.abaca, marginTop: 4 },
  heroRow: { flexDirection: 'row', gap: 36, marginTop: 14 },
  statNum: { fontFamily: FONTS.heavy, fontSize: 18, color: '#FFFFFF' },
  statLabel: { fontFamily: FONTS.body, fontSize: 13, color: '#CBBDB5' },
  heroBand: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  remit: {
    marginHorizontal: 16,
    marginTop: 14,
    padding: 18,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.abacaSoft,
  },
  remitTitle: { fontFamily: FONTS.semi, fontSize: 14, color: COLORS.ink },
  remitAmount: { fontFamily: FONTS.display, fontSize: 30, color: COLORS.ink, marginTop: 2 },
  remitSub: { fontFamily: FONTS.body, fontSize: 13, lineHeight: 19, color: COLORS.inkSoft, marginTop: 6 },
  remitBtn: {
    alignSelf: 'flex-start',
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.ink,
  },
  remitBtnText: { fontFamily: FONTS.semi, fontSize: 14, color: '#FFFFFF' },
  section: { fontFamily: FONTS.display, fontSize: 20, color: COLORS.ink, marginHorizontal: 20, marginTop: 24, marginBottom: 10 },
  empty: { fontFamily: FONTS.body, fontSize: 14, color: COLORS.inkSoft, marginHorizontal: 20 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 14,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  rowTitle: { fontFamily: FONTS.semi, fontSize: 15, color: COLORS.ink },
  rowMeta: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.inkSoft, marginTop: 2 },
  rowAmount: { fontFamily: FONTS.heavy, fontSize: 16, color: COLORS.pili },
});