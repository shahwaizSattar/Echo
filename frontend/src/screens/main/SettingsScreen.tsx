import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, ThemeType } from '../../context/ThemeContext';

const SettingsScreen: React.FC = () => {
  const { theme, themeName, setTheme } = useTheme();

  const themes: Array<{
    id: ThemeType;
    name: string;
    description: string;
    icon: string;
    previewColors: { primary: string; background: string; surface: string };
    category?: string;
  }> = [
    // Signature Themes
    {
      id: 'nebula-drift',
      name: 'Nebula Drift',
      description: 'A cosmic, dreamy vibe with deep plum to electric blue gradients. Floating star-dust particles create a feeling of anonymous thoughts drifting through space.',
      icon: '🌌',
      category: 'Premium',
      previewColors: {
        primary: '#8B5CF6',
        background: '#0F0A1F',
        surface: '#1A1333',
      },
    },
    {
      id: 'midnight-veil',
      name: 'Midnight Veil',
      description: 'Ultra dark mode with luxurious matte-black professional look. Glass blur cards with subtle silver edges create a secretive, elite aesthetic.',
      icon: '🖤',
      category: 'Premium',
      previewColors: {
        primary: '#C0C0C0',
        background: '#000000',
        surface: '#1A1A1A',
      },
    },
    {
      id: 'frost-glass',
      name: 'FrostGlass',
      description: 'Minimal and elegant with snow-white and ice-blue tints. Frosted glass cards shimmer like frozen droplets for a futuristic clean look.',
      icon: '❄️',
      category: 'Premium',
      previewColors: {
        primary: '#0EA5E9',
        background: '#F0F9FF',
        surface: '#E0F2FE',
      },
    },
    {
      id: 'aurora-wave',
      name: 'Aurora Wave',
      description: 'Inspired by northern lights with gradient pillars of green, purple, and blue. Slow animated light waves create a nature + digital art fusion.',
      icon: '🌊',
      category: 'Premium',
      previewColors: {
        primary: '#10B981',
        background: '#0A1628',
        surface: '#132337',
      },
    },
    {
      id: 'sunset-ember',
      name: 'Sunset Ember',
      description: 'Warm, emotional theme with burnt orange to deep wine red gradients. Posts appear with a rising heat shimmer effect for a cozy, intimate feel.',
      icon: '🌅',
      category: 'Premium',
      previewColors: {
        primary: '#F97316',
        background: '#1C0A00',
        surface: '#2D1508',
      },
    },
    {
      id: 'cyber-pulse',
      name: 'CyberPulse',
      description: 'Cyberpunk futuristic theme with neon pink, blue, and violet. Circuit-style borders and pulse effects create a techy, rebellious energy.',
      icon: '⚡',
      category: 'Premium',
      previewColors: {
        primary: '#EC4899',
        background: '#0C0A1F',
        surface: '#1A1333',
      },
    },
    {
      id: 'whisper-silk',
      name: 'Whisper Silk',
      description: 'Premium and soft with off-white, beige, and muted rose. Gentle 3D depth with smooth silk slide animations for a high-end, fashion-magazine style.',
      icon: '🎀',
      category: 'Premium',
      previewColors: {
        primary: '#BE185D',
        background: '#FFF7ED',
        surface: '#FFEDD5',
      },
    },
    {
      id: 'forest-lush',
      name: 'Forest Lush',
      description: 'Earthy, calm, and nature inspired with green hues and wooden brown accents. Posts expand like blooming plants for a relaxed, soothing experience.',
      icon: '🌿',
      category: 'Premium',
      previewColors: {
        primary: '#16A34A',
        background: '#F0FDF4',
        surface: '#DCFCE7',
      },
    },
    {
      id: 'electric-storm',
      name: 'Electric Storm',
      description: 'Intense, dramatic theme with dark background and electric highlight colors. Lightning-style motion on transitions creates a bold, expressive vibe.',
      icon: '⚡',
      category: 'Premium',
      previewColors: {
        primary: '#FACC15',
        background: '#0F172A',
        surface: '#1E293B',
      },
    },
    {
      id: 'retro-synthwave',
      name: 'Retro Synthwave',
      description: '80s neon nostalgia with purple, pink, and orange horizon gradients. Grid lines and VHS-style animations bring nostalgic energy.',
      icon: '🕹️',
      category: 'Premium',
      previewColors: {
        primary: '#F472B6',
        background: '#1A0B2E',
        surface: '#2D1B4E',
      },
    },
    // Classic Themes
    {
      id: 'light',
      name: 'Effortless Clarity',
      description: 'A clean, modern interface built for precision and simplicity. Soft whites, subtle shadows, and crisp typography.',
      icon: '🌤️',
      category: 'Classic',
      previewColors: {
        primary: '#6366F1',
        background: '#FFFFFF',
        surface: '#F8FAFC',
      },
    },
    {
      id: 'dark',
      name: 'Midnight Balance',
      description: 'A gentle dark mode engineered for comfort. Smooth charcoal tones reduce eye strain.',
      icon: '🌙',
      category: 'Classic',
      previewColors: {
        primary: '#818CF8',
        background: '#111827',
        surface: '#1F2937',
      },
    },
    {
      id: 'amoled',
      name: 'True Black Silence',
      description: 'Ultra-deep, battery-saving theme for OLED displays with absolute darkness aesthetic.',
      icon: '🖤',
      category: 'Classic',
      previewColors: {
        primary: '#00FFD1',
        background: '#000000',
        surface: '#0B0F15',
      },
    },
    {
      id: 'neon-whisper',
      name: 'Futuristic Cyberglow',
      description: 'High-tech theme with soft neon accents over a dark canvas creating a hidden digital world.',
      icon: '💎',
      category: 'Classic',
      previewColors: {
        primary: '#00FFD1',
        background: '#0B0F15',
        surface: '#111827',
      },
    },
    {
      id: 'mood-shift',
      name: 'Emotion-Adaptive Visuals',
      description: 'Dynamic theme that transforms based on emotional tone of posts with adaptive colors.',
      icon: '🎭',
      category: 'Classic',
      previewColors: {
        primary: '#6366F1',
        background: '#FFFFFF',
        surface: '#F8FAFC',
      },
    },
  ];

  // Create styles with useMemo to make them reactive to theme changes
  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollView: {
      flex: 1,
    },
    header: {
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border + '40',
      backgroundColor: theme.colors.surface,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    headerSubtitle: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    section: {
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.lg,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    themeCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.md,
      borderWidth: 2,
      borderColor: theme.colors.border + '40',
      ...theme.shadows.small,
    },
    themeCardSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary + '10',
      ...theme.shadows.medium,
    },
    themeHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    themeIcon: {
      fontSize: 32,
      marginRight: theme.spacing.md,
    },
    themeNameContainer: {
      flex: 1,
    },
    themeName: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    themeDescription: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      lineHeight: 20,
      marginBottom: theme.spacing.md,
    },
    themePreview: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: theme.spacing.sm,
    },
    previewColor: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: theme.spacing.sm,
      borderWidth: 2,
      borderColor: theme.colors.border,
    },
    previewLabel: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginRight: theme.spacing.sm,
    },
    selectedBadge: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.round,
      marginLeft: theme.spacing.sm,
    },
    selectedBadgeText: {
      color: theme.colors.textInverse,
      fontSize: 12,
      fontWeight: '600',
    },
    checkmark: {
      fontSize: 20,
      color: theme.colors.primary,
      marginLeft: theme.spacing.sm,
    },
  }), [theme]);

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={theme.dark ? 'light-content' : 'dark-content'} />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
          <Text style={styles.headerSubtitle}>Customize your experience</Text>
        </View>

        {/* Theme Selection Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎨 Theme Selection</Text>
          <Text style={{ fontSize: 14, color: theme.colors.textSecondary, marginBottom: theme.spacing.lg }}>
            Choose a theme that matches your style. Changes apply instantly across all screens.
          </Text>

          {/* Premium Themes */}
          <Text style={[styles.sectionTitle, { fontSize: 16, marginBottom: theme.spacing.md }]}>
            ✨ Premium Themes
          </Text>
          {themes.filter(t => t.category === 'Premium').map((themeOption) => {
            const isSelected = themeName === themeOption.id;
            return (
              <TouchableOpacity
                key={themeOption.id}
                style={[styles.themeCard, isSelected && styles.themeCardSelected]}
                onPress={() => {
                  console.log('Setting theme to:', themeOption.id);
                  setTheme(themeOption.id);
                }}
                activeOpacity={0.7}
              >
                <View style={styles.themeHeader}>
                  <Text style={styles.themeIcon}>{themeOption.icon}</Text>
                  <View style={styles.themeNameContainer}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Text style={styles.themeName}>{themeOption.name}</Text>
                      {isSelected && (
                        <View style={styles.selectedBadge}>
                          <Text style={styles.selectedBadgeText}>Active</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
                <Text style={styles.themeDescription}>{themeOption.description}</Text>
                <View style={styles.themePreview}>
                  <Text style={styles.previewLabel}>Preview:</Text>
                  <View
                    style={[
                      styles.previewColor,
                      { backgroundColor: themeOption.previewColors.primary },
                    ]}
                  />
                  <View
                    style={[
                      styles.previewColor,
                      { backgroundColor: themeOption.previewColors.background },
                    ]}
                  />
                  <View
                    style={[
                      styles.previewColor,
                      { backgroundColor: themeOption.previewColors.surface },
                    ]}
                  />
                </View>
              </TouchableOpacity>
            );
          })}

          {/* Classic Themes */}
          <Text style={[styles.sectionTitle, { fontSize: 16, marginTop: theme.spacing.lg, marginBottom: theme.spacing.md }]}>
            🎯 Classic Themes
          </Text>
          {themes.filter(t => t.category === 'Classic').map((themeOption) => {
            const isSelected = themeName === themeOption.id;
            return (
              <TouchableOpacity
                key={themeOption.id}
                style={[styles.themeCard, isSelected && styles.themeCardSelected]}
                onPress={() => {
                  console.log('Setting theme to:', themeOption.id);
                  setTheme(themeOption.id);
                }}
                activeOpacity={0.7}
              >
                <View style={styles.themeHeader}>
                  <Text style={styles.themeIcon}>{themeOption.icon}</Text>
                  <View style={styles.themeNameContainer}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Text style={styles.themeName}>{themeOption.name}</Text>
                      {isSelected && (
                        <View style={styles.selectedBadge}>
                          <Text style={styles.selectedBadgeText}>Active</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
                <Text style={styles.themeDescription}>{themeOption.description}</Text>
                <View style={styles.themePreview}>
                  <Text style={styles.previewLabel}>Preview:</Text>
                  <View
                    style={[
                      styles.previewColor,
                      { backgroundColor: themeOption.previewColors.primary },
                    ]}
                  />
                  <View
                    style={[
                      styles.previewColor,
                      { backgroundColor: themeOption.previewColors.background },
                    ]}
                  />
                  <View
                    style={[
                      styles.previewColor,
                      { backgroundColor: themeOption.previewColors.surface },
                    ]}
                  />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Info Section */}
        <View style={styles.section}>
          <View style={[styles.themeCard, { backgroundColor: theme.colors.primary + '10' }]}>
            <Text style={{ fontSize: 14, color: theme.colors.text, lineHeight: 20 }}>
              <Text style={{ fontWeight: '600' }}>💡 Tip:</Text> The theme you select will be applied to all screens in the app, including Home, Profile, Messages, and more. Your preference is saved automatically.
            </Text>
          </View>
    </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsScreen;
