import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Linking, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, RADIUS } from '../theme';
import { useAuth, DELIVERY_STEPS } from '../context/AuthContext';
import { pickPhoto } from '../utils/photos';
import BanigBand from './BanigBand';

export default function ActiveJob() {
  const { activeJob: job, advanceJob } = useAuth();
  const [proofUri, setProofUri] = useState(null);

  const step = job.step;
  const current = DELIVERY_STEPS[step];
  const lastStep = step === DELIVERY_STEPS.length - 1;
  const goingToStore = step < 2;
  const place = goingToStore
    ? { name: job.store, address: job.storeAddress, landmark: '' }
    : { name: job.customer, address: job.customerAddress, landmark: job.landmark };

  const openMaps = () => {
    const destination = encodeURIComponent(`${place.address}, Albay`);
    Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${destination}`);
  };

  const takeProof = async () => {
    const uri = await pickPhoto(true);
    if (uri) setProofUri(uri);
  };

  const onAction = () => {
    if (lastStep && !proofUri) {
      Alert.alert('Proof photo needed', 'Take a photo of the order at the customer before completing the delivery.');
      return;
    }
    if (lastStep) {
      Alert.alert('Delivery complete', `You earned ₱${job.earning}. Ingat sa biyahe!`);
      advanceJob({ proofUri });
      return;
    }
    advanceJob();
  };

  return (
    <SafeAreaView edges={['top']} style={styles.page}>
      <ScrollView contentContainerStyle={{ paddingBottom: 110 }}>
        <View style={styles.head}>
          <Text style={styles.kicker}>Delivery in progress</Text>
          <Text style={styles.title}>{current.title}</Text>
          <View style={styles.dots}>
            {DELIVERY_STEPS.map((s, i) => (
              <View key={s.title} style={[styles.dot, i < step && styles.dotDone, i === step && styles.dotNow]} />
            ))}
          </View>
        </View>
        <BanigBand id="job-band" height={10} />

        <View style={styles.card}>
          <Text style={styles.cardLabel}>{goingToStore ? 'Pick up from' : 'Deliver to'}</Text>
          <Text style={styles.place}>{place.name}</Text>
          <Text style={styles.address}>{place.address}</Text>
          {place.landmark ? <Text style={styles.landmark}>Landmark: {place.landmark}</Text> : null}
          <Pressable style={styles.mapBtn} onPress={openMaps}>
            <Ionicons name="navigate" size={18} color={COLORS.ink} />
            <Text style={styles.mapText}>Open in Maps</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Order items</Text>
          {job.items.map((i) => (
            <Text key={i.name} style={styles.item}>
              {i.qty} × {i.name}
            </Text>
          ))}
        </View>

        <View style={[styles.card, lastStep && styles.cashCard]}>
          <Text style={styles.cardLabel}>Collect from customer</Text>
          <Text style={styles.cash}>₱{job.orderTotal}</Text>
          <Text style={styles.address}>Cash on delivery. Your earning: ₱{job.earning}</Text>
        </View>

        {lastStep && (
          <Pressable style={styles.proof} onPress={takeProof}>
            {proofUri ? (
              <Image source={{ uri: proofUri }} style={styles.proofImg} />
            ) : (
              <Ionicons name="camera-outline" size={26} color={COLORS.ink} />
            )}
            <Text style={styles.proofText}>
              {proofUri ? 'Proof photo added. Tap to retake.' : 'Take proof of delivery photo'}
            </Text>
          </Pressable>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={styles.action} onPress={onAction}>
          <Text style={styles.actionText}>{current.action}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: COLORS.page },
  head: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 },
  kicker: { fontFamily: FONTS.semi, fontSize: 14, color: COLORS.sili },
  title: { fontFamily: FONTS.display, fontSize: 28, lineHeight: 34, color: COLORS.ink, marginTop: 4 },
  dots: { flexDirection: 'row', gap: 6, marginTop: 14 },
  dot: { flex: 1, height: 5, borderRadius: 3, backgroundColor: COLORS.line },
  dotDone: { backgroundColor: COLORS.pili },
  dotNow: { backgroundColor: COLORS.abaca },
  card: {
    marginHorizontal: 16,
    marginTop: 14,
    padding: 16,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  cashCard: { borderColor: COLORS.abaca, borderWidth: 2, backgroundColor: COLORS.abacaSoft },
  cardLabel: { fontFamily: FONTS.semi, fontSize: 13, color: COLORS.inkSoft, marginBottom: 6 },
  place: { fontFamily: FONTS.display, fontSize: 22, color: COLORS.ink },
  address: { fontFamily: FONTS.body, fontSize: 14, color: COLORS.inkSoft, marginTop: 4 },
  landmark: { fontFamily: FONTS.semi, fontSize: 14, color: COLORS.ink, marginTop: 6 },
  mapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    marginTop: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.abacaSoft,
  },
  mapText: { fontFamily: FONTS.semi, fontSize: 14, color: COLORS.ink },
  item: { fontFamily: FONTS.body, fontSize: 15, color: COLORS.ink, marginTop: 4 },
  cash: { fontFamily: FONTS.display, fontSize: 34, color: COLORS.ink },
  proof: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 16,
    marginTop: 14,
    padding: 14,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: COLORS.ink,
  },
  proofImg: { width: 56, height: 56, borderRadius: RADIUS.sm },
  proofText: { flex: 1, fontFamily: FONTS.semi, fontSize: 15, color: COLORS.ink },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    backgroundColor: COLORS.page,
    borderTopWidth: 1,
    borderTopColor: COLORS.line,
  },
  action: { backgroundColor: COLORS.sili, borderRadius: RADIUS.md, paddingVertical: 17, alignItems: 'center' },
  actionText: { fontFamily: FONTS.heavy, fontSize: 17, color: '#FFFFFF' },
});