import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BRAND, COLORS, FONTS, RADIUS } from '../theme';
import { useAuth } from '../context/AuthContext';
import MayonMark from '../components/MayonMark';
import BanigBand from '../components/BanigBand';

export default function LoginScreen({ navigation }) {
  const { requestOtp } = useAuth();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const onChange = (text) => {
    let digits = text.replace(/\D/g, '');
    if (digits.startsWith('0')) digits = digits.slice(1); // accept 0917... too
    setPhone(digits.slice(0, 10));
    setError('');
  };

  const onSendCode = () => {
    if (!/^9\d{9}$/.test(phone)) {
      setError('Enter a valid mobile number, like 917 123 4567.');
      return;
    }
    requestOtp(`+63${phone}`);
    navigation.navigate('Otp');
  };

  return (
    <View style={styles.page}>
      <StatusBar style="light" />
      <SafeAreaView edges={['top']} style={styles.hero}>
        <Text style={styles.brand}>{BRAND.name}</Text>
        <Text style={styles.tagline}>{BRAND.tagline}</Text>
        <View style={styles.mayon}>
          <MayonMark width={320} />
        </View>
      </SafeAreaView>
      <BanigBand id="login-band" height={14} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.form}
      >
        <Text style={styles.heading}>Log in with your mobile number</Text>
        <View style={[styles.phoneRow, error ? styles.phoneRowError : null]}>
          <Text style={styles.prefix}>+63</Text>
          <TextInput
            style={styles.input}
            placeholder="917 123 4567"
            placeholderTextColor={COLORS.inkSoft}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={onChange}
            maxLength={11}
          />
        </View>
        {error ? (
          <Text style={styles.error}>{error}</Text>
        ) : (
          <Text style={styles.hint}>We'll text you a 6-digit code to confirm it's you.</Text>
        )}
        <Pressable style={styles.button} onPress={onSendCode}>
          <Text style={styles.buttonText}>Send code</Text>
        </Pressable>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: COLORS.page },
  hero: { flex: 1.1, backgroundColor: COLORS.sili, paddingHorizontal: 24, overflow: 'hidden' },
  brand: { fontFamily: FONTS.display, fontSize: 52, color: '#FFFFFF', marginTop: 28, letterSpacing: -1 },
  tagline: { fontFamily: FONTS.semi, fontSize: 16, color: COLORS.siliSoft, maxWidth: 280, marginTop: 4 },
  mayon: { position: 'absolute', left: 0, right: 0, bottom: 0, alignItems: 'center' },
  form: { flex: 1, padding: 24, gap: 12 },
  heading: { fontFamily: FONTS.display, fontSize: 24, color: COLORS.ink, marginBottom: 4 },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.line,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 14,
  },
  phoneRowError: { borderColor: COLORS.sili },
  prefix: {
    fontFamily: FONTS.heavy,
    fontSize: 17,
    color: COLORS.ink,
    paddingRight: 12,
    marginRight: 12,
    borderRightWidth: 1,
    borderRightColor: COLORS.line,
  },
  input: { flex: 1, fontFamily: FONTS.body, fontSize: 18, color: COLORS.ink, paddingVertical: 14, letterSpacing: 1 },
  error: { fontFamily: FONTS.semi, fontSize: 13, color: COLORS.sili },
  hint: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.inkSoft },
  button: { backgroundColor: COLORS.sili, borderRadius: RADIUS.md, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  buttonText: { fontFamily: FONTS.heavy, fontSize: 16, color: '#FFFFFF' },
});