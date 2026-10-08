import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, RADIUS } from '../theme';
import { useAuth } from '../context/AuthContext';
import MayonMark from '../components/MayonMark';
import BanigBand from '../components/BanigBand';

const NEXT_STEPS = [
  'We check your documents',
  'You attend a short rider orientation',
  'You go online and start earning',
];

export default function PendingScreen() {
  const { user, application, approveDemo, logout } = useAuth();
  const firstName = application.name.split(' ')[0];

  return (
    <SafeAreaView style={styles.page}>
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.art}>
          <MayonMark width={240} />
        </View>
        <Text style={styles.title}>Dios mabalos, {firstName}!</Text>
        <Text style={styles.sub}>
          Your application is being reviewed. This usually takes 1 to 2 days. We'll text you at {user.phone} once
          you're approved.
        </Text>

        <View style={styles.band}>
          <BanigBand id="pending-band" height={10} />
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.key}>Service area</Text>
            <Text style={styles.value}>{application.town}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.key}>Vehicle</Text>
            <Text style={styles.value}>
              {application.vehicle}
              {application.plate ? `, ${application.plate}` : ''}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.key}>Documents</Text>
            <Text style={styles.value}>{Object.keys(application.docs).length} photos submitted</Text>
          </View>
        </View>

        <Text style={styles.section}>What happens next</Text>
        {NEXT_STEPS.map((text, i) => (
          <View key={text} style={styles.step}>
            <View style={styles.stepNum}>
              <Text style={styles.stepNumText}>{i + 1}</Text>
            </View>
            <Text style={styles.stepText}>{text}</Text>
          </View>
        ))}

        <Pressable style={styles.demo} onPress={approveDemo}>
          <Text style={styles.demoText}>Demo: approve my application</Text>
        </Pressable>
        <Pressable onPress={logout}>
          <Text style={styles.logout}>Log out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: COLORS.page },
  body: { padding: 24, paddingBottom: 40 },
  art: { alignItems: 'center', marginTop: 10 },
  title: { fontFamily: FONTS.display, fontSize: 30, color: COLORS.ink, marginTop: 16 },
  sub: { fontFamily: FONTS.body, fontSize: 15, lineHeight: 22, color: COLORS.inkSoft, marginTop: 8 },
  band: { marginVertical: 22, marginHorizontal: -24 },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.line,
    padding: 16,
    gap: 12,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  key: { fontFamily: FONTS.body, fontSize: 14, color: COLORS.inkSoft },
  value: { fontFamily: FONTS.semi, fontSize: 14, color: COLORS.ink, flexShrink: 1, textAlign: 'right' },
  section: { fontFamily: FONTS.display, fontSize: 20, color: COLORS.ink, marginTop: 26, marginBottom: 12 },
  step: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  stepNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.abacaSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumText: { fontFamily: FONTS.heavy, fontSize: 13, color: COLORS.ink },
  stepText: { fontFamily: FONTS.body, fontSize: 15, color: COLORS.ink },
  demo: {
    marginTop: 24,
    paddingVertical: 15,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: COLORS.abaca,
    alignItems: 'center',
  },
  demoText: { fontFamily: FONTS.semi, fontSize: 15, color: COLORS.ink },
  logout: { fontFamily: FONTS.semi, fontSize: 14, color: COLORS.sili, textAlign: 'center', marginTop: 18 },
});