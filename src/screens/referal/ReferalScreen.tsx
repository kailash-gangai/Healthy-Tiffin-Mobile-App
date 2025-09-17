// ReferralScreen.tsx
import React, { useMemo, useRef, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Clipboard from '@react-native-clipboard/clipboard';
import { useNavigation } from '@react-navigation/native';
import FontAwesome5 from '@react-native-vector-icons/fontawesome5';
import CryptoJS from 'crypto-js';
import { EMPTY_STATE_URL } from '../../constants';

type FriendForm = { name: string; email: string };

const BANNER =
  'https://client-assets.referralcandy.com/52l9sunOPjHkF_WOChzgN_banner-referral.png';
const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

// IN-APP KEYS — testing only
const RC_ACCESS_ID = 'jtogigvtl1jyrju3tjkpse4v9';
const RC_SECRET = '5cf8c6a6f254ec79dfacc595e49da45a';
const RC_BASE = 'https://my.referralcandy.com/api/v2';

function rcSign(params: Record<string, string | number>) {
  const joined = Object.entries(params)
    .map(([k, v]) => `${k}=${v}`)
    .sort()
    .join('');
  return CryptoJS.MD5(RC_SECRET + joined).toString();
}
function toQS(p: Record<string, string | number>) {
  const qs = new URLSearchParams();
  Object.entries(p).forEach(([k, v]) => qs.append(k, String(v)));
  return qs.toString();
}
async function rcGet(path: string, payload: Record<string, string | number>) {
  const base = {
    accessID: RC_ACCESS_ID,
    timestamp: Math.floor(Date.now() / 1000),
    ...payload,
  };
  const signature = rcSign(base);
  const url = `${RC_BASE}/${path}.json?${toQS({ ...base, signature })}`;
  const res = await fetch(url, { method: 'GET' });
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(text);
  }
}
async function rcPost(path: string, payload: Record<string, string | number>) {
  const base = {
    accessID: RC_ACCESS_ID,
    timestamp: Math.floor(Date.now() / 1000),
    ...payload,
  };
  const signature = rcSign(base);
  const res = await fetch(`${RC_BASE}/${path}.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: toQS({ ...base, signature }),
  });
  const json = await res.json();
  // Normalize response
  return {
    ok: res.ok,
    message: json?.message ?? '',
    referral_link: json?.referral_link ?? json?.data?.referral_link ?? null,
    referralcorner_url: json?.referralcorner_url ?? null,
    invite_code: json?.invite_code ?? null,
    raw: json,
  };
}
function splitName(full: string) {
  const parts = full.trim().split(/\s+/);
  if (parts.length === 1) return { first_name: parts[0], last_name: '' };
  const last = parts.pop() as string;
  return { first_name: parts.join(' '), last_name: last };
}
const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

const ReferralScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [form, setForm] = useState<FriendForm>({ name: '', email: '' });
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [touched, setTouched] = useState<{ name: boolean; email: boolean }>({
    name: false,
    email: false,
  });
  const [loading, setLoading] = useState(false);
  const inFlight = useRef(false); // prevents double submit in dev

  const nameError = useMemo(
    () => (touched.name && !form.name.trim() ? 'Name is required' : ''),
    [form.name, touched.name],
  );
  const emailError = useMemo(() => {
    if (!touched.email) return '';
    const v = form.email.trim();
    if (!v) return 'Email is required';
    if (!EMAIL_RX.test(v)) return 'Enter a valid email';
    return '';
  }, [form.email, touched.email]);

  const isValid = !nameError && !emailError && !!form.name && !!form.email;

  async function pollForReferrerLink(email: string, maxTries = 8) {
    // Poll "referrer" until link available (eventual consistency)
    for (let i = 0; i < maxTries; i++) {
      const data = await rcGet('referrer', { customer_email: email });
      console.log('referrer poll', i + 1, data);
      const link =
        data?.referrer?.referral_link ||
        data?.data?.referral_link ||
        data?.referral_link ||
        null;
      const code =
        data?.referrer?.invite_code ||
        data?.data?.invite_code ||
        data?.invite_code ||
        null;
      if (link || code) {
        if (link) setInviteLink(link);
        if (code) setInviteCode(code);
        return true;
      }
      await wait(i < 3 ? 1000 : 2000); // small backoff
    }
    return false;
  }

  const fetchInviteLink = async () => {
    if (!isValid) {
      setTouched({ name: true, email: true });
      Alert.alert('Check inputs', 'Fix the highlighted fields.');
      return;
    }
    if (inFlight.current) return;
    inFlight.current = true;
    setLoading(true);
    setInviteLink(null);
    setInviteCode(null);

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    const { first_name, last_name } = splitName(name);

    console.log('submit', { email, first_name, last_name });

    try {
      // Step 1: try invite (preferred)
      const invite = await rcPost('invite', { email, first_name, last_name });
      console.log('invite response', invite.raw);
      if (invite.referral_link) setInviteLink(invite.referral_link);
      if (invite.invite_code) setInviteCode(invite.invite_code);

      // If link already present or contact already exists, we are done.
      if (invite.referral_link && invite.invite_code) return;

      // Step 2: if invite failed hard, try signup to create referrer record
      if (!invite.ok && invite.message) {
        const signup = await rcPost('signup', { first_name, last_name, email });
        console.log('signup response', signup.raw);
        if (signup.referral_link) setInviteLink(signup.referral_link);
        if (signup.invite_code) setInviteCode(signup.invite_code);
        if (signup.referral_link && signup.invite_code) return;
      }

      // Step 3: Poll referrer endpoint until link/code is ready
      const ready = await pollForReferrerLink(email);
      if (!ready && !inviteLink && !inviteCode) {
        Alert.alert('Invite sent', 'Link will be available shortly.');
      }
    } catch (e: any) {
      console.log('error', e?.message ?? String(e));
      Alert.alert('Error', e?.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
      inFlight.current = false;
    }
  };

  const copyLink = () => {
    if (!inviteLink) return;
    Clipboard.setString(inviteLink);
    Alert.alert('Copied', 'Referral link copied to clipboard.');
  };

  return (
    <SafeAreaView style={s.screen}>
      <View style={s.topBar}>
        <TouchableOpacity
          onPress={() => (navigation.canGoBack() ? navigation.goBack() : null)}
          hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          testID="back-button"
        >
          <Text style={s.backText}>
            <FontAwesome5
              iconStyle="solid"
              name={'arrow-left'}
              size={18}
              color="#000"
              style={{ marginLeft: 8 }}
            />
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', android: undefined })}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={s.scroll} bounces={false}>
          <View style={s.badge}>
            <Image source={{ uri: EMPTY_STATE_URL }} height={55} width={55} />
          </View>

          <Text style={s.title}>Refer your friends, nab a $10 discount!</Text>
          <Text style={s.subtitle}>
            Gift your friends a $10 discount. When friends buy via your link,
            you earn a $10 discount.
          </Text>

          <View style={s.heroWrap}>
            <Image source={{ uri: BANNER }} style={s.hero} />
            <Image source={{ uri: BANNER }} style={[s.floatImg, s.fLeft]} />
            <Image source={{ uri: BANNER }} style={[s.floatImg, s.fRight]} />
            <Image source={{ uri: BANNER }} style={[s.floatMid]} />
          </View>

          <View style={s.card}>
            <View style={s.field}>
              <Text style={s.label}>Email</Text>
              <TextInput
                value={form.email}
                onChangeText={v => setForm(p => ({ ...p, email: v }))}
                onBlur={() => setTouched(t => ({ ...t, email: true }))}
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                style={[
                  s.input,
                  !!emailError && touched.email ? s.inputError : undefined,
                ]}
              />
              {!!emailError && touched.email && (
                <Text style={s.err}>{emailError}</Text>
              )}
            </View>

            <View style={s.field}>
              <Text style={s.label}>Your Name</Text>
              <TextInput
                value={form.name}
                onChangeText={v => setForm(p => ({ ...p, name: v }))}
                onBlur={() => setTouched(t => ({ ...t, name: true }))}
                placeholder="Prachi Sharma"
                style={[
                  s.input,
                  !!nameError && touched.name ? s.inputError : undefined,
                ]}
              />
              {!!nameError && touched.name && (
                <Text style={s.err}>{nameError}</Text>
              )}
            </View>

            <TouchableOpacity
              style={[s.cta, !isValid || loading ? s.ctaDisabled : undefined]}
              activeOpacity={0.8}
              onPress={fetchInviteLink}
              disabled={!isValid || loading}
            >
              <Text style={s.ctaText}>
                {loading ? 'WORKING…' : 'FETCH INVITE LINK'}
              </Text>
            </TouchableOpacity>
          </View>

          {!!inviteLink || !!inviteCode ? (
            <View style={s.linkBox}>
              <View style={{ flex: 1 }}>
                {!!inviteLink && (
                  <Text style={s.linkText} numberOfLines={2}>
                    {inviteLink}
                  </Text>
                )}
                {!!inviteCode && (
                  <Text style={[s.linkText, { marginTop: 6 }]}>
                    Invite code:{' '}
                    <Text style={{ fontWeight: '700' }}>{inviteCode}</Text>
                  </Text>
                )}
              </View>
              {!!inviteLink && (
                <TouchableOpacity style={s.copyBtn} onPress={copyLink}>
                  <Text style={s.copyText}>Copy</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ReferralScreen;

/* styles (same as yours) */
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#ffffff' },
  topBar: { height: 44, justifyContent: 'center', paddingHorizontal: 5 },
  backText: { fontSize: 16, fontWeight: '600', color: '#1b4332' },
  scroll: { padding: 20, alignItems: 'center' },
  badge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#e6e6e6',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  title: { fontSize: 20, fontWeight: '800', textAlign: 'center', marginTop: 8 },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
    color: '#4a4a4a',
    marginTop: 6,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  heroWrap: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    position: 'relative',
  },
  hero: { width: '100%', height: '100%', resizeMode: 'cover' },
  floatImg: {
    position: 'absolute',
    width: 86,
    height: 86,
    borderRadius: 16,
    top: '50%',
    resizeMode: 'cover',
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  fLeft: { left: -10, transform: [{ translateY: -8 }] },
  fRight: { right: -10, transform: [{ translateY: -30 }, { rotate: '12deg' }] },
  floatMid: {
    position: 'absolute',
    width: 88,
    height: 88,
    borderRadius: 16,
    bottom: -18,
    left: '50%',
    marginLeft: -44,
    borderWidth: 2,
    borderColor: 'white',
  },
  card: {
    width: '100%',
    backgroundColor: '#2d6a4f',
    borderRadius: 16,
    padding: 16,
  },
  field: { marginBottom: 12 },
  label: { color: '#d8f3dc', marginBottom: 6, fontSize: 12, fontWeight: '600' },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#d9d9d9',
  },
  inputError: { borderColor: '#ef476f' },
  err: { color: '#ffe3e3', marginTop: 6, fontSize: 12 },
  cta: {
    marginTop: 8,
    backgroundColor: '#1b4332',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  ctaDisabled: { opacity: 0.5 },
  ctaText: { color: '#ffffff', fontWeight: '700', letterSpacing: 0.4 },
  linkBox: {
    width: '100%',
    backgroundColor: '#e9f5ec',
    borderRadius: 12,
    marginTop: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  linkText: { flex: 1, fontSize: 13 },
  copyBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#40916c',
    borderRadius: 8,
  },
  copyText: { color: '#fff', fontWeight: '700' },
});
