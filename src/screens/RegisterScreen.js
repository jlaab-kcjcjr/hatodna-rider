import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, FONTS, RADIUS } from '../theme';
import { useAuth } from '../context/AuthContext';
import { choosePhoto } from '../utils/photos';
import BanigBand from '../components/BanigBand';

const TOWNS = ['Legazpi City', 'Daraga', 'Tabaco City', 'Ligao City', 'Camalig', 'Guinobatan', 'Sto. Domingo'];

const VEHICLES = [
  { key: 'Motorcycle', icon: 'motorbike' },
  { key: 'Tricycle', icon: 'rickshaw' },
  { key: 'Bicycle', icon: 'bicycle' },
];

const DOCUMENTS = [
  { key: 'license', label: "Driver's license", motorOnly: true },
  { key: 'orcr', label: 'Vehicle OR/CR', motorOnly: true },
  { key: 'clearance', label: 'NBI or police clearance', motorOnly: false },
  { key: 'selfie', label: 'Selfie holding your ID', motorOnly: false },
];

const STEP_TITLES = ['About you', 'Your vehicle', 'Documents'];

export default function RegisterScreen() {
  const { user, submitApplication, logout } = useAuth();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [town, setTown] = useState('');
  const [vehicle, setVehicle] = useState('');
  const [plate, setPlate] = useState('');
  const [docs, setDocs] = useState({});
  const [error, setError] = useState('');

  const needsMotorDocs = vehicle !== 'Bicycle';
  const requiredDocs = DOCUMENTS.filter((d) => needsMotorDocs || !d.motorOnly);

  const validate = () => {
    if (step === 0) {
      if (name.trim().length < 3) return 'Enter your full name as it appears on your ID.';
      if (!town) return 'Choose the town where you will deliver.';
    }
    if (step === 1) {
      if (!vehicle) return 'Choose the vehicle you will use.';
      if (needsMotorDocs && plate.trim().length < 5) return 'Enter your plate number.';
    }
    if (step === 2) {
      const missing = requiredDocs.find((d) => !docs[d.key]);
      if (missing) return `Add a photo for "${missing.label}".`;
    }
    return '';
  };

  const onContinue = () => {
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }
    setError('');
    if (step < 2) {
      setStep(step + 1);
      return;
    }
    submitApplication({
      name: name.trim(),
      town,
      vehicle,
      plate: needsMotorDocs ? plate.trim().toUpperCase() : '',
      docs,
    });
  };

  const onBack = () => {
    setError('');
    if (step === 0) logout();
    else setStep(step - 1);
  };

  const addDoc = async (doc) => {
    const uri = await choosePhoto(doc.label);
    if (uri) {
      setDocs((d) => ({ ...d, [doc.key]: uri }));
      setError('');
    }
  };

  return (
    <SafeAreaView style={styles.page} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.head}>
          <Text style={styles.title}>Become a rider</Text>
          <Text style={styles.sub}>
            Step {step + 1} of 3: {STEP_TITLES[step]}
          </Text>
          <View style={styles.progress}>
            {STEP_TITLES.map((t, i) => (
              <View key={t} style={[styles.bar, i <= step && styles.barOn]} />
            ))}
          </View>
        </View>
        <BanigBand id="register-band" height={10} />

        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          {step === 0 && (
            <>
              <Text style={styles.label}>Full name</Text>
              <TextInput
                style={styles.input}
                placeholder="Juan Dela Cruz"
                placeholderTextColor={COLORS.inkSoft}
                value={name}
                onChangeText={setName}
              />
              <Text style={styles.label}>Mobile number</Text>
              <View style={[styles.input, styles.readonly]}>
                <Text style={styles.readonlyText}>{user.phone}</Text>
              </View>
              <Text style={styles.label}>Where will you deliver?</Text>
              <View style={styles.wrap}>
                {TOWNS.map((t) => (
                  <Pressable key={t} onPress={() => setTown(t)} style={[styles.chip, town === t && styles.chipOn]}>
                    <Text style={[styles.chipText, town === t && styles.chipTextOn]}>{t}</Text>
                  </Pressable>
                ))}
              </View>
            </>
          )}

          {step === 1 && (
            <>
              <Text style={styles.label}>Vehicle type</Text>
              <View style={styles.vehicles}>
                {VEHICLES.map((v) => {
                  const on = vehicle === v.key;
                  return (
                    <Pressable key={v.key} onPress={() => setVehicle(v.key)} style={[styles.vehicle, on && styles.vehicleOn]}>
                      <MaterialCommunityIcons name={v.icon} size={34} color={on ? '#FFFFFF' : COLORS.ink} />
                      <Text style={[styles.vehicleText, on && { color: '#FFFFFF' }]}>{v.key}</Text>
                    </Pressable>
                  );
                })}
              </View>
              {needsMotorDocs && vehicle !== '' && (
                <>
                  <Text style={styles.label}>Plate number</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="ABC 1234"
                    placeholderTextColor={COLORS.inkSoft}
                    autoCapitalize="characters"
                    value={plate}
                    onChangeText={setPlate}
                  />
                </>
              )}
            </>
          )}

          {step === 2 && (
            <>
              <Text style={styles.hint}>Take clear photos. Our team checks each one before approving you.</Text>
              {requiredDocs.map((d) => {
                const uri = docs[d.key];
                return (
                  <Pressable key={d.key} style={styles.doc} onPress={() => addDoc(d)}>
                    {uri ? (
                      <Image source={{ uri }} style={styles.thumb} />
                    ) : (
                      <View style={styles.thumbEmpty}>
                        <Ionicons name="camera-outline" size={22} color={COLORS.inkSoft} />
                      </View>
                    )}
                    <View style={{ flex: 1 }}>
                      <Text style={styles.docLabel}>{d.label}</Text>
                      <Text style={[styles.docStatus, uri ? { color: COLORS.pili } : null]}>
                        {uri ? 'Added. Tap to replace.' : 'Tap to add a photo'}
                      </Text>
                    </View>
                    {uri ? <Ionicons name="checkmark-circle" size={22} color={COLORS.pili} /> : null}
                  </Pressable>
                );
              })}
            </>
          )}

          {error ? <Text style={styles.error}>{error}</Text> : null}
        </ScrollView>

        <View style={styles.footer}>
          <Pressable style={styles.secondary} onPress={onBack}>
            <Text style={styles.secondaryText}>{step === 0 ? 'Log out' : 'Back'}</Text>
          </Pressable>
          <Pressable style={styles.primary} onPress={onContinue}>
            <Text style={styles.primaryText}>{step < 2 ? 'Continue' : 'Submit application'}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: COLORS.page },
  head: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 },
  title: { fontFamily: FONTS.display, fontSize: 30, color: COLORS.ink },
  sub: { fontFamily: FONTS.semi, fontSize: 14, color: COLORS.sili, marginTop: 4 },
  progress: { flexDirection: 'row', gap: 6, marginTop: 14 },
  bar: { flex: 1, height: 5, borderRadius: 3, backgroundColor: COLORS.line },
  barOn: { backgroundColor: COLORS.sili },
  body: { padding: 20, paddingBottom: 30 },
  label: { fontFamily: FONTS.semi, fontSize: 13, color: COLORS.ink, marginTop: 14, marginBottom: 6 },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.line,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: FONTS.body,
    fontSize: 15,
    color: COLORS.ink,
  },
  readonly: { backgroundColor: COLORS.abacaSoft, borderColor: COLORS.abacaSoft },
  readonlyText: { fontFamily: FONTS.semi, fontSize: 15, color: COLORS.ink },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.line,
    backgroundColor: COLORS.surface,
  },
  chipOn: { backgroundColor: COLORS.ink, borderColor: COLORS.ink },
  chipText: { fontFamily: FONTS.semi, fontSize: 14, color: COLORS.ink },
  chipTextOn: { color: '#FFFFFF' },
  vehicles: { flexDirection: 'row', gap: 10 },
  vehicle: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 18,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.line,
    backgroundColor: COLORS.surface,
    gap: 6,
  },
  vehicleOn: { backgroundColor: COLORS.sili, borderColor: COLORS.sili },
  vehicleText: { fontFamily: FONTS.semi, fontSize: 14, color: COLORS.ink },
  hint: { fontFamily: FONTS.body, fontSize: 14, color: COLORS.inkSoft, marginBottom: 6 },
  doc: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    marginTop: 10,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  thumb: { width: 56, height: 56, borderRadius: RADIUS.sm },
  thumbEmpty: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.abacaSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docLabel: { fontFamily: FONTS.semi, fontSize: 15, color: COLORS.ink },
  docStatus: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.inkSoft, marginTop: 2 },
  error: { fontFamily: FONTS.semi, fontSize: 13, color: COLORS.sili, marginTop: 16 },
  footer: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.line,
    backgroundColor: COLORS.page,
  },
  secondary: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.line,
    alignItems: 'center',
  },
  secondaryText: { fontFamily: FONTS.semi, fontSize: 15, color: COLORS.ink },
  primary: { flex: 1, backgroundColor: COLORS.sili, borderRadius: RADIUS.md, paddingVertical: 15, alignItems: 'center' },
  primaryText: { fontFamily: FONTS.heavy, fontSize: 16, color: '#FFFFFF' },
});