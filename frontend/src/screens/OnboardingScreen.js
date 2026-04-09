import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  ActivityIndicator,
  Dimensions,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { signIn, signUp, resetPassword } from '../services/authService';

const { height } = Dimensions.get('window');

// ────────────────────────────────────────────────────────────
// Leaf / Plant Decoration  (pure SVG-free, icon-based)
// ────────────────────────────────────────────────────────────
const PlantDecor = () => (
  <View style={{ position: 'absolute', top: -10, right: 24, alignItems: 'center' }}>
    {/* stem */}
    <View style={{ width: 3, height: 42, backgroundColor: '#2D5A3D', borderRadius: 4, marginBottom: -6 }} />
    {/* leaf left */}
    <View
      style={{
        position: 'absolute',
        top: 4,
        right: 6,
        width: 22,
        height: 36,
        backgroundColor: '#3D7A50',
        borderRadius: 40,
        transform: [{ rotate: '-30deg' }],
      }}
    />
    {/* leaf right */}
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 4,
        width: 20,
        height: 32,
        backgroundColor: '#4F9B64',
        borderRadius: 40,
        transform: [{ rotate: '30deg' }],
      }}
    />
    {/* pot */}
    <View
      style={{
        width: 32,
        height: 24,
        backgroundColor: '#F7F2E9',
        borderRadius: 6,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        marginTop: 0,
      }}
    />
  </View>
);

// ────────────────────────────────────────────────────────────
// Reusable Input Field
// ────────────────────────────────────────────────────────────
function AuthInput({ icon, placeholder, value, onChangeText, secureTextEntry, keyboardType }) {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = secureTextEntry;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FCF9F2',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#F2EAE0',
        paddingHorizontal: 16,
        paddingVertical: 14,
        marginBottom: 14,
        shadowColor: '#3A2E28',
        shadowOpacity: 0.05,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 1,
      }}
    >
      <Feather name={icon} size={16} color="#8C7A6B" style={{ marginRight: 10 }} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#C2B8B2"
        secureTextEntry={isPasswordField && !showPassword}
        keyboardType={keyboardType || 'default'}
        autoCapitalize="none"
        style={{
          flex: 1,
          fontSize: 14,
          color: '#3A2E28',
          fontWeight: '600',
          outline: 'none',
        }}
      />
      {isPasswordField && (
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Feather name={showPassword ? 'eye-off' : 'eye'} size={16} color="#8C7A6B" />
        </TouchableOpacity>
      )}
    </View>
  );
}

// ────────────────────────────────────────────────────────────
// Main Onboarding Screen
// ────────────────────────────────────────────────────────────
export default function OnboardingScreen({ onAuthSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup' | 'forgot'

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const cardAnim = useRef(new Animated.Value(0)).current;

  const switchMode = (newMode) => {
    setError('');
    setResetSent(false);
    Animated.sequence([
      Animated.timing(cardAnim, { toValue: 20, duration: 120, useNativeDriver: true }),
      Animated.timing(cardAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
    ]).start();
    setMode(newMode);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setPhone('');
  };

  // ── Friendly error message parser ───────────────────────
  const parseError = (e) => {
    const code = e.code;
    switch (code) {
      case 'auth/email-already-in-use': return 'This email is already registered. Try logging in.';
      case 'auth/invalid-email': return 'Please enter a valid email address.';
      case 'auth/weak-password': return 'Password must be at least 6 characters.';
      case 'auth/user-not-found': return 'No account found with this email.';
      case 'auth/wrong-password': return 'Incorrect password. Please try again.';
      case 'auth/invalid-credential': return 'Invalid email or password. Please try again.';
      case 'auth/too-many-requests': return 'Too many attempts. Please wait a moment.';
      case 'auth/network-request-failed': return 'Network error. Check your connection.';
      default: return e.message ? `Error: ${e.message}` : `Error code: ${code || 'Unknown'}`;
    }
  };

  // ── Handlers ────────────────────────────────────────────
  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await signIn(email.trim(), password);
      onAuthSuccess();
    } catch (e) {
      setError(parseError(e));
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await signUp(email.trim(), password);
      onAuthSuccess();
    } catch (e) {
      setError(parseError(e));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError('Please enter your email first.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await resetPassword(email.trim());
      setResetSent(true);
    } catch (e) {
      setError(parseError(e));
    } finally {
      setLoading(false);
    }
  };

  // ── Top header text per mode ─────────────────────────────
  const headerTitle = mode === 'login' ? 'Hello!' : mode === 'signup' ? 'Join Us!' : 'Reset Password';
  const headerSub =
    mode === 'login'
      ? 'Welcome back to Habit Coach'
      : mode === 'signup'
        ? 'Start building better habits'
        : 'We\'ll send you a reset link';

  // ── Card title per mode ──────────────────────────────────
  const cardTitle = mode === 'login' ? 'Login' : mode === 'signup' ? 'Sign Up' : 'Forgot Password';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1B3022' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Dark Green Header ─────────────────────────── */}
          <View style={{ backgroundColor: '#1B3022', paddingHorizontal: 32, paddingTop: 52, paddingBottom: 80 }}>
            {/* Back button for signup / forgot */}
            {mode !== 'login' && (
              <TouchableOpacity
                onPress={() => switchMode('login')}
                style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}
              >
                <Feather name="arrow-left" size={16} color="#A8C5A0" />
                <Text style={{ color: '#A8C5A0', fontSize: 12, fontWeight: '600', marginLeft: 6 }}>
                  Back to login
                </Text>
              </TouchableOpacity>
            )}

            {/* Greeting */}
            <Text style={{ fontSize: 42, fontWeight: '900', color: '#FFFFFF', letterSpacing: -1, lineHeight: 48 }}>
              {headerTitle}
            </Text>
            <Text style={{ fontSize: 14, color: '#A8C5A0', fontWeight: '600', marginTop: 6 }}>
              {headerSub}
            </Text>

            {/* Plant decoration */}
            <PlantDecor />
          </View>

          {/* ── White Rounded Card ────────────────────────── */}
          <Animated.View
            style={{
              flex: 1,
              backgroundColor: '#FCF9F2',
              borderTopLeftRadius: 40,
              borderTopRightRadius: 40,
              marginTop: -40,
              paddingHorizontal: 28,
              paddingTop: 36,
              paddingBottom: 48,
              transform: [{ translateY: cardAnim }],
              shadowColor: '#000',
              shadowOpacity: 0.12,
              shadowRadius: 20,
              shadowOffset: { width: 0, height: -4 },
              elevation: 10,
            }}
          >
            {/* Card Title */}
            <Text
              style={{
                fontSize: 26,
                fontWeight: '900',
                color: '#3A2E28',
                marginBottom: 24,
                letterSpacing: -0.5,
              }}
            >
              {cardTitle}
            </Text>

            {/* ── Error / Success message ──────────────────── */}
            {error !== '' && (
              <View
                style={{
                  backgroundColor: '#FFF0F0',
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  marginBottom: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: '#FFCDD2',
                }}
              >
                <Feather name="alert-circle" size={14} color="#A04040" />
                <Text style={{ color: '#A04040', fontSize: 12, fontWeight: '600', marginLeft: 8, flex: 1 }}>
                  {error}
                </Text>
              </View>
            )}

            {resetSent && (
              <View
                style={{
                  backgroundColor: '#E8F5E9',
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  marginBottom: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: '#A5D6A7',
                }}
              >
                <Feather name="check-circle" size={14} color="#2E7D32" />
                <Text style={{ color: '#2E7D32', fontSize: 12, fontWeight: '600', marginLeft: 8, flex: 1 }}>
                  Reset link sent! Check your inbox.
                </Text>
              </View>
            )}

            {/* ── Form Fields ──────────────────────────────── */}
            <AuthInput
              icon="mail"
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />

            {mode !== 'forgot' && (
              <AuthInput
                icon="lock"
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            )}

            {mode === 'signup' && (
              <>
                <AuthInput
                  icon="lock"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />
                <AuthInput
                  icon="phone"
                  placeholder="Phone (optional)"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </>
            )}

            {/* Forgot password link (login mode only) */}
            {mode === 'login' && (
              <TouchableOpacity
                onPress={() => switchMode('forgot')}
                style={{ alignSelf: 'flex-end', marginBottom: 24, marginTop: -4 }}
              >
                <Text style={{ color: '#A04040', fontSize: 12, fontWeight: '700' }}>Forgot Password?</Text>
              </TouchableOpacity>
            )}

            {mode !== 'login' && <View style={{ height: 24 }} />}

            {/* ── Primary Action Button ─────────────────────── */}
            <TouchableOpacity
              onPress={
                mode === 'login'
                  ? handleLogin
                  : mode === 'signup'
                    ? handleSignUp
                    : handleForgotPassword
              }
              disabled={loading}
              style={{
                backgroundColor: '#1B3022',
                borderRadius: 30,
                paddingVertical: 16,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#1B3022',
                shadowOpacity: 0.35,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 4 },
                elevation: 6,
                marginBottom: 24,
              }}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 14, letterSpacing: 1.5, textTransform: 'uppercase' }}>
                  {mode === 'login' ? 'Login' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}
                </Text>
              )}
            </TouchableOpacity>

            {/* ── Separator + Switch Mode ───────────────────── */}
            {mode === 'login' && (
              <>
                {/* Divider */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 22 }}>
                  <View style={{ flex: 1, height: 1, backgroundColor: '#F2EAE0' }} />
                  <Text style={{ color: '#8C7A6B', fontSize: 11, fontWeight: '600', marginHorizontal: 12 }}>
                    Or login with
                  </Text>
                  <View style={{ flex: 1, height: 1, backgroundColor: '#F2EAE0' }} />
                </View>

                {/* Social Buttons (placeholder — ready to wire) */}
                <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 16, marginBottom: 28 }}>
                  {[
                    { icon: 'facebook', color: '#1877F2', bg: '#E7F0FD' },
                    { icon: 'chrome', color: '#EA4335', bg: '#FDECEA' },   // chrome as "google" proxy
                    { icon: 'twitter', color: '#000000', bg: '#F2EAE0' },  // twitter as "Apple" proxy
                  ].map((s) => (
                    <TouchableOpacity
                      key={s.icon}
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 18,
                        backgroundColor: s.bg,
                        alignItems: 'center',
                        justifyContent: 'center',
                        shadowColor: '#000',
                        shadowOpacity: 0.06,
                        shadowRadius: 6,
                        shadowOffset: { width: 0, height: 2 },
                        elevation: 2,
                      }}
                    >
                      <Feather name={s.icon} size={20} color={s.color} />
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity onPress={() => switchMode('signup')} style={{ alignItems: 'center' }}>
                  <Text style={{ color: '#8C7A6B', fontSize: 13, fontWeight: '600' }}>
                    Don't have an account?{' '}
                    <Text style={{ color: '#A04040', fontWeight: '800' }}>Sign Up</Text>
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {mode === 'signup' && (
              <TouchableOpacity onPress={() => switchMode('login')} style={{ alignItems: 'center' }}>
                <Text style={{ color: '#8C7A6B', fontSize: 13, fontWeight: '600' }}>
                  Already have an account?{' '}
                  <Text style={{ color: '#A04040', fontWeight: '800' }}>Login</Text>
                </Text>
              </TouchableOpacity>
            )}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
