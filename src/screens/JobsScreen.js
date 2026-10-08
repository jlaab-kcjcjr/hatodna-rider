import React, { useEffect, useState } from 'react';
import { View, Text, Switch, Pressable, StyleSheet, Vibration, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, RADIUS } from '../theme';
import { useAuth } from '../context/AuthContext';
import BanigBand from '../components/BanigBand';
import MayonMark from '../components/MayonMark';
import ActiveJob from '../components/ActiveJob';

const OFFER_SECONDS = 30;

function OfferCard({ offer, onAccept, onDecline }) {
  const [seconds, setSeconds] = useState(OFFER_SECONDS);
  const count = offer.items.reduce((sum, i) => sum + i.qty, 0);

  useEffect(() => {
    Vibration.vibrate(400);
  }, []);

  // The request expires if the rider doesn't respond in time.
  useEffect(() => {
    if (seconds === 0) {
      onDecline();
      return;
    }
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  return (
    <View style={styles.offer}>
      <View style={styles.offerTop}>
        <Text style={styles.offerTitle}>New delivery request</Text>
        <Text style={styles.timer}>{seconds}s</Text>
      </View>
      <Text style={styles.earning}>₱{offer.earning}</Text>
      <Text style={styles.offerMeta}>
        {offer.distanceKm} km, {count} {count === 1 ? 'item' : 'items'}, cash on delivery
      </Text>

      <View style={styles.route}>
        <View style={styles.routeRow}>
          <Ionicons name="storefront-outline" size={18} color={COLORS.sili} />
          <View style={{ flex: 1 }}>
            <Text style={styles.routeName}>{offer.store}</Text>
            <Text style={styles.routeAddr}>{offer.storeAddress}</Text>
          </View>
        </View>
        <View style={styles.routeLine} />
        <View style={styles.routeRow}>
          <Ionicons name="location-outline" size={18} color={COLORS.pili} />
          <View style={{ flex: 1 }}>
            <Text style={styles.routeName}>{offer.customer}</Text>
            <Text style={styles.routeAddr}>{offer.customerAddress}</Text>
          </View>
        </View>
      </View>

      <View style={styles.offerActions}>
        <Pressable style={styles.decline} onPress={onDecline}>
          <Text style={styles.declineText}>Decline</Text>
        </Pressable>
        <Pressable style={styles.accept} onPress={onAccept}>
          <Text style={styles.acceptText}>Accept</Text>
        </Pressable>
      </View>
      <View style={[styles.timerBar, { width: `${(seconds / OFFER_SECONDS) * 100}%` }]} />
    </View>
  );
}

export default function JobsScreen() {
  const { application, online, toggleOnline, offer, acceptOffer, declineOffer, activeJob, history } = useAuth();

  if (activeJob) return <ActiveJob />;

  const firstName = application.name.split(' ')[0];
  const todayCount = history.filter(
    (j) => new Date(j.completedAt).toDateString() === new Date().toDateString()
  ).length;

  return (
    <SafeAreaView edges={['top']} style={styles.page}>
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        <View style={styles.head}>
          <Text style={styles.hello}>Ingat sa biyahe, {firstName}</Text>
          <Text style={styles.title}>{online ? 'You are online' : 'You are offline'}</Text>
        </View>

        <View style={[styles.status, online ? styles.statusOn : styles.statusOff]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.statusTitle}>
              {online ? `Looking for orders in ${application.town}` : 'Go online to receive orders'}
            </Text>
            <Text style={styles.statusSub}>
              {online
                ? 'Keep the app open. New requests appear here.'
                : `${todayCount} ${todayCount === 1 ? 'delivery' : 'deliveries'} completed today`}
            </Text>
          </View>
          <Switch
            value={online}
            onValueChange={toggleOnline}
            trackColor={{ false: '#5A4A44', true: COLORS.abaca }}
            thumbColor="#FFFFFF"
          />
        </View>
        <BanigBand id="jobs-band" height={10} />

        {offer ? (
          <View style={{ padding: 16 }}>
            <OfferCard key={offer.id} offer={offer} onAccept={acceptOffer} onDecline={declineOffer} />
          </View>
        ) : (
          <View style={styles.idle}>
            <MayonMark width={220} color={online ? COLORS.piliSoft : COLORS.line} sun={COLORS.abacaSoft} />
            <Text style={styles.idleText}>
              {online ? 'Waiting for the next order...' : 'No requests while you are offline.'}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: COLORS.page },
  head: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 14 },
  hello: { fontFamily: FONTS.semi, fontSize: 14, color: COLORS.sili },
  title: { fontFamily: FONTS.display, fontSize: 30, color: COLORS.ink, marginTop: 4 },
  status: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 18 },
  statusOn: { backgroundColor: COLORS.pili },
  statusOff: { backgroundColor: COLORS.ink },
  statusTitle: { fontFamily: FONTS.semi, fontSize: 16, color: '#FFFFFF' },
  statusSub: { fontFamily: FONTS.body, fontSize: 13, color: '#E6DCD5', marginTop: 3 },
  idle: { alignItems: 'center', paddingTop: 50, paddingHorizontal: 24 },
  idleText: { fontFamily: FONTS.body, fontSize: 15, color: COLORS.inkSoft, marginTop: 14, textAlign: 'center' },
  offer: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.abaca,
    padding: 18,
    overflow: 'hidden',
  },
  offerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  offerTitle: { fontFamily: FONTS.semi, fontSize: 15, color: COLORS.sili },
  timer: { fontFamily: FONTS.heavy, fontSize: 15, color: COLORS.ink },
  earning: { fontFamily: FONTS.display, fontSize: 44, color: COLORS.ink, marginTop: 6 },
  offerMeta: { fontFamily: FONTS.body, fontSize: 14, color: COLORS.inkSoft },
  route: { marginTop: 16, padding: 14, borderRadius: RADIUS.sm, backgroundColor: COLORS.page },
  routeRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  routeLine: { width: 2, height: 16, backgroundColor: COLORS.line, marginLeft: 8, marginVertical: 4 },
  routeName: { fontFamily: FONTS.semi, fontSize: 15, color: COLORS.ink },
  routeAddr: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.inkSoft, marginTop: 1 },
  offerActions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  decline: {
    paddingVertical: 15,
    paddingHorizontal: 22,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.line,
    alignItems: 'center',
  },
  declineText: { fontFamily: FONTS.semi, fontSize: 15, color: COLORS.ink },
  accept: { flex: 1, backgroundColor: COLORS.sili, borderRadius: RADIUS.md, paddingVertical: 15, alignItems: 'center' },
  acceptText: { fontFamily: FONTS.heavy, fontSize: 16, color: '#FFFFFF' },
  timerBar: { position: 'absolute', left: 0, bottom: 0, height: 4, backgroundColor: COLORS.abaca },
});