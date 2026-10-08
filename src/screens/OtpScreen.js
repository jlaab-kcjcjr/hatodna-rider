import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { COLORS, FONTS, RADIUS } from '../theme';
import { useAuth, DEMO_OTP } from '../context/AuthContext';
import BanigBand from '../components/BanigBand';

const LENGTH = 6;

export default function OtpScreen() {
  const { pendingPhone, verifyOtp, requestOtp } = useAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [seconds, setSeconds] = useState(30);
  const inputRef = useRef(null);

  useEffect(() => {
    if (seconds === 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const onChange = (text) => {
    setCode(text.replace(/\D/g, '').slice(0, LENGTH));
    setError('');
  };

  // When the code is right, the user is saved and the app switches to Home on its own.
  const onVerify = () => {
    if (code.length < LENGTH) {
      setError('Enter all 6 digits of the code.');
      return;
    }
    if (!verifyOtp(code)) {
      setError('That code is incorrect. Check the SMS and try again.');
    }
  };

  const onResend = () => {
    requestOtp(pendingPhone);
    setSeconds(30);
    setCode('');
  };

  return (
    <View style={styles.page}>
      <Text style={styles.title}>Enter the code</Text>
      <Text style={styles.sub}>We sent a 6-digit code to {pendingPhone}.</Text>

      <Pressable style={styles.boxes} onPress={() => inputRef.current?.focus()}>
        {Array.from({ length: LENGTH }).map((_, i) => {
          const filled = i < code.length;
          const active = i === code.length;
          return (
            <View key={i} style={[styles.box, active && styles.boxActive, filled && styles.boxFilled]}>
              <Text style={styles.digit}>{code[i] ?? ''}</Text>
            </View>
          );
        })}
      </Pressable>
      <TextInput
        ref={inputRef}
        value={code}
        onChangeText={onChange}
        keyboardType="number-pad"
        maxLength={LENGTH}
        autoFocus
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        style={styles.hidden}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Text style={styles.demo}>Demo mode: use code {DEMO_OTP}</Text>

      <Pressable style={styles.button} onPress={onVerify}>
        <Text style={styles.buttonText}>Verify and continue</Text>
      </Pressable>
      <Pressable disabled={seconds > 0} onPress={onResend}>
        <Text style={[styles.resend, seconds > 0 && { color: COLORS.inkSoft }]}>
          {seconds > 0 ? `Resend code in ${seconds}s` : 'Resend code'}
        </Text>
      </Pressable>

      <View style={styles.footer}>
        <BanigBand id="otp-band" height={10} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: COLORS.page, padding: 24 },
  title: { fontFamily: FONTS.display, fontSize: 32, color: COLORS.ink },
  sub: { fontFamily: FONTS.body, fontSize: 15, color: COLORS.inkSoft, marginTop: 6 },
  boxes: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 28 },
  box: {
    width: 46,
    height: 56,
    borderRadius: RADIUS.sm,
    borderWidth: 1.5,
    borderColor: COLORS.line,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxActive: { borderColor: COLORS.abaca },
  boxFilled: { borderColor: COLORS.ink },
  digit: { fontFamily: FONTS.display, fontSize: 24, color: COLORS.ink },
  hidden: { position: 'absolute', width: 1, height: 1, opacity: 0 },
  error: { fontFamily: FONTS.semi, fontSize: 13, color: COLORS.sili, marginTop: 14 },
  demo: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.inkSoft, marginTop: 14 },
  button: { backgroundColor: COLORS.sili, borderRadius: RADIUS.md, paddingVertical: 16, alignItems: 'center', marginTop: 20 },
  buttonText: { fontFamily: FONTS.heavy, fontSize: 16, color: '#FFFFFF' },
  resend: { fontFamily: FONTS.semi, fontSize: 14, color: COLORS.sili, textAlign: 'center', marginTop: 18 },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0 },
});