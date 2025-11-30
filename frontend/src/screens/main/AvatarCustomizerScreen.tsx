import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import AvatarRenderer from '../../components/avatar/AvatarRenderer';
import Toast from 'react-native-toast-message';
import {
  AvatarConfig,
  DEFAULT_AVATAR_CONFIG,
  MASK_STYLES,
  HAIR_STYLES,
  OUTFIT_TYPES,
  THEME_PRESETS,
  AVATAR_COLORS,
  ACCESSORY_OPTIONS,
  MaskStyle,
  HairStyle,
  OutfitType,
  ThemeName,
} from '../../utils/avatarConfig';

const { width } = Dimensions.get('window');

type CustomizationCategory = 'mask' | 'hair' | 'outfit' | 'theme' | 'accessories';

const AvatarCustomizerScreen: React.FC = () => {
  const { theme } = useTheme();
  const { user, updateUser } = useAuth();
  const navigation = useNavigation();
  
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>(
    user?.customAvatar?.enabled ? user.customAvatar : DEFAULT_AVATAR_CONFIG
  );
  const [activeCategory, setActiveCategory] = useState<CustomizationCategory>('mask');
  const [saving, setSaving] = useState(false);
  
  const slideAnim = useRef(new Animated.Value(0)).current;

  const categories = [
    { id: 'mask', name: 'Mask', icon: '🎭' },
    { id: 'hair', name: 'Hair', icon: '💇' },
    { id: 'outfit', name: 'Outfit', icon: '👔' },
    { id: 'theme', name: 'Theme', icon: '🎨' },
    { id: 'accessories', name: 'Extras', icon: '✨' },
  ];

  const handleCategoryChange = (category: CustomizationCategory) => {
    setActiveCategory(category);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };

  const updateMask = (style: MaskStyle, color?: string) => {
    setAvatarConfig(prev => ({
      ...prev,
      mask: {
        ...prev.mask,
        style,
        ...(color && { color }),
      },
    }));
  };

  const updateHair = (style: HairStyle, color?: string) => {
    setAvatarConfig(prev => ({
      ...prev,
      hair: {
        ...prev.hair,
        style,
        ...(color && { color }),
      },
    }));
  };

  const updateOutfit = (type: OutfitType, color?: string) => {
    setAvatarConfig(prev => ({
      ...prev,
      outfit: {
        ...prev.outfit,
        type,
        ...(color && { color }),
      },
    }));
  };

  const updateTheme = (name: ThemeName) => {
    const themePreset = THEME_PRESETS[name];
    setAvatarConfig(prev => ({
      ...prev,
      theme: {
        name,
        lighting: themePreset.lighting,
        background: themePreset.background,
      },
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updatedConfig = { ...avatarConfig, enabled: true };
      
      // Call API to update user avatar
      await updateUser({ customAvatar: updatedConfig });
      
      Toast.show({
        type: 'success',
        text1: 'Avatar Saved',
        text2: 'Your custom avatar has been updated!',
      });
      
      navigation.goBack();
    } catch (error: any) {
      console.error('Save avatar error:', error);
      Toast.show({
        type: 'error',
        text1: 'Save Failed',
        text2: error.message || 'Failed to save avatar',
      });
    } finally {
      setSaving(false);
    }
  };

  const renderMaskOptions = () => (
    <View style={styles.optionsContainer}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Choose Your Mask</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {Object.entries(MASK_STYLES).map(([key, value]) => (
          <TouchableOpacity
            key={key}
            style={[
              styles.optionCard,
              { backgroundColor: theme.colors.surface },
              avatarConfig.mask.style === key && styles.optionCardActive,
            ]}
            onPress={() => updateMask(key as MaskStyle)}
          >
            <Text style={styles.optionIcon}>{value.icon}</Text>
            <Text style={[styles.optionName, { color: theme.colors.text }]}>{value.name}</Text>
            <Text style={[styles.optionDesc, { color: theme.colors.textSecondary }]}>
              {value.description}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      <Text style={[styles.sectionTitle, { color: theme.colors.text, marginTop: 20 }]}>
        Mask Color
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {AVATAR_COLORS.neutrals.concat(AVATAR_COLORS.pastels).map((color) => (
          <TouchableOpacity
            key={color}
            style={[
              styles.colorOption,
              { backgroundColor: color },
              avatarConfig.mask.color === color && styles.colorOptionActive,
            ]}
            onPress={() => updateMask(avatarConfig.mask.style, color)}
          />
        ))}
      </ScrollView>
    </View>
  );

  const renderHairOptions = () => (
    <View style={styles.optionsContainer}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Choose Hairstyle</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {Object.entries(HAIR_STYLES).map(([key, value]) => (
          <TouchableOpacity
            key={key}
            style={[
              styles.optionCard,
              { backgroundColor: theme.colors.surface },
              avatarConfig.hair.style === key && styles.optionCardActive,
            ]}
            onPress={() => updateHair(key as HairStyle)}
          >
            <Text style={styles.optionIcon}>{value.icon}</Text>
            <Text style={[styles.optionName, { color: theme.colors.text }]}>{value.name}</Text>
            <Text style={[styles.optionDesc, { color: theme.colors.textSecondary }]}>
              {value.description}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      <Text style={[styles.sectionTitle, { color: theme.colors.text, marginTop: 20 }]}>
        Hair Color
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {AVATAR_COLORS.muted.concat(AVATAR_COLORS.pastels).map((color) => (
          <TouchableOpacity
            key={color}
            style={[
              styles.colorOption,
              { backgroundColor: color },
              avatarConfig.hair.color === color && styles.colorOptionActive,
            ]}
            onPress={() => updateHair(avatarConfig.hair.style, color)}
          />
        ))}
      </ScrollView>
    </View>
  );

  const renderOutfitOptions = () => (
    <View style={styles.optionsContainer}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Choose Outfit</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {Object.entries(OUTFIT_TYPES).map(([key, value]) => (
          <TouchableOpacity
            key={key}
            style={[
              styles.optionCard,
              { backgroundColor: theme.colors.surface },
              avatarConfig.outfit.type === key && styles.optionCardActive,
            ]}
            onPress={() => updateOutfit(key as OutfitType)}
          >
            <Text style={styles.optionIcon}>{value.icon}</Text>
            <Text style={[styles.optionName, { color: theme.colors.text }]}>{value.name}</Text>
            <Text style={[styles.optionDesc, { color: theme.colors.textSecondary }]}>
              {value.description}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      <Text style={[styles.sectionTitle, { color: theme.colors.text, marginTop: 20 }]}>
        Outfit Color
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {AVATAR_COLORS.neutrals.concat(AVATAR_COLORS.accents).map((color) => (
          <TouchableOpacity
            key={color}
            style={[
              styles.colorOption,
              { backgroundColor: color },
              avatarConfig.outfit.color === color && styles.colorOptionActive,
            ]}
            onPress={() => updateOutfit(avatarConfig.outfit.type, color)}
          />
        ))}
      </ScrollView>
    </View>
  );

  const renderThemeOptions = () => (
    <View style={styles.optionsContainer}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Choose Theme</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {Object.entries(THEME_PRESETS).map(([key, value]) => (
          <TouchableOpacity
            key={key}
            style={[
              styles.themeCard,
              avatarConfig.theme.name === key && styles.themeCardActive,
            ]}
            onPress={() => updateTheme(key as ThemeName)}
          >
            <LinearGradient
              colors={value.background.match(/#[0-9A-Fa-f]{6}/g) || ['#F5F5F0', '#E8E6E1']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.themeGradient}
            >
              <Text style={styles.themeIcon}>{value.icon}</Text>
            </LinearGradient>
            <Text style={[styles.themeName, { color: theme.colors.text }]}>{value.name}</Text>
            <Text style={[styles.themeDesc, { color: theme.colors.textSecondary }]}>
              {value.description}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderAccessoryOptions = () => (
    <View style={styles.optionsContainer}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Add Accessories</Text>
      <Text style={[styles.comingSoon, { color: theme.colors.textSecondary }]}>
        Coming soon! Premium accessories will be available in the next update.
      </Text>
    </View>
  );

  const renderOptions = () => {
    switch (activeCategory) {
      case 'mask':
        return renderMaskOptions();
      case 'hair':
        return renderHairOptions();
      case 'outfit':
        return renderOutfitOptions();
      case 'theme':
        return renderThemeOptions();
      case 'accessories':
        return renderAccessoryOptions();
      default:
        return null;
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.lg,
      backgroundColor: theme.colors.surface,
    },
    backButton: {
      padding: theme.spacing.sm,
    },
    backText: {
      fontSize: 24,
      color: theme.colors.text,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.colors.text,
    },
    saveButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
    },
    saveButtonText: {
      color: theme.colors.textInverse,
      fontWeight: '600',
      fontSize: 14,
    },
    previewContainer: {
      alignItems: 'center',
      paddingVertical: theme.spacing.xxl,
      backgroundColor: theme.colors.surface,
    },
    previewLabel: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.md,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    categoriesContainer: {
      flexDirection: 'row',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.lg,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    categoryButton: {
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      marginHorizontal: theme.spacing.xs,
      borderRadius: theme.borderRadius.md,
    },
    categoryButtonActive: {
      backgroundColor: theme.colors.primary + '20',
    },
    categoryIcon: {
      fontSize: 24,
      marginBottom: theme.spacing.xs,
    },
    categoryName: {
      fontSize: 12,
      fontWeight: '600',
    },
    optionsContainer: {
      padding: theme.spacing.xl,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: theme.spacing.lg,
    },
    optionCard: {
      width: 140,
      padding: theme.spacing.lg,
      marginRight: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      alignItems: 'center',
      borderWidth: 2,
      borderColor: 'transparent',
    },
    optionCardActive: {
      borderColor: theme.colors.primary,
    },
    optionIcon: {
      fontSize: 40,
      marginBottom: theme.spacing.sm,
    },
    optionName: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: theme.spacing.xs,
      textAlign: 'center',
    },
    optionDesc: {
      fontSize: 11,
      textAlign: 'center',
    },
    colorOption: {
      width: 50,
      height: 50,
      borderRadius: 25,
      marginRight: theme.spacing.md,
      borderWidth: 3,
      borderColor: 'transparent',
    },
    colorOptionActive: {
      borderColor: theme.colors.primary,
      borderWidth: 4,
    },
    themeCard: {
      width: 160,
      marginRight: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      overflow: 'hidden',
      borderWidth: 3,
      borderColor: 'transparent',
    },
    themeCardActive: {
      borderColor: theme.colors.primary,
    },
    themeGradient: {
      height: 120,
      justifyContent: 'center',
      alignItems: 'center',
    },
    themeIcon: {
      fontSize: 48,
    },
    themeName: {
      fontSize: 14,
      fontWeight: '600',
      padding: theme.spacing.sm,
      textAlign: 'center',
    },
    themeDesc: {
      fontSize: 11,
      paddingHorizontal: theme.spacing.sm,
      paddingBottom: theme.spacing.sm,
      textAlign: 'center',
    },
    comingSoon: {
      fontSize: 16,
      textAlign: 'center',
      marginTop: theme.spacing.xl,
      fontStyle: 'italic',
    },
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Customize Avatar</Text>
        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView>
        {/* Preview */}
        <View style={styles.previewContainer}>
          <Text style={styles.previewLabel}>Preview</Text>
          <AvatarRenderer config={avatarConfig} size={180} />
        </View>

        {/* Categories */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                activeCategory === category.id && styles.categoryButtonActive,
              ]}
              onPress={() => handleCategoryChange(category.id as CustomizationCategory)}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text 
                style={[
                  styles.categoryName,
                  { color: activeCategory === category.id ? theme.colors.primary : theme.colors.text }
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Options */}
        <Animated.View style={{ transform: [{ translateX: slideAnim }] }}>
          {renderOptions()}
        </Animated.View>
      </ScrollView>
    </View>
  );
};

export default AvatarCustomizerScreen;
