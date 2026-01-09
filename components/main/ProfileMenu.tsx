import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Alert,
    Modal,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTranslation } from '../../hooks/use-translation';
import storageService from '../../services/storageService';

interface ProfileMenuProps {
  visible: boolean;
  onClose: () => void;
}

export default function ProfileMenu({ visible, onClose }: ProfileMenuProps) {
  const { t } = useTranslation();
  const router = useRouter();

  const handleLogout = async () => {
    Alert.alert(
      t('common.confirm'),
      t('auth.logoutConfirm') || '¿Estás seguro de que deseas cerrar sesión?',
      [
        {
          text: t('common.cancel') || 'Cancelar',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: t('auth.logout') || 'Cerrar sesión',
          onPress: async () => {
            try {
              await storageService.clear();
              onClose();
              router.replace('/login');
            } catch (error) {
              Alert.alert(t('common.error'), t('auth.logoutError') || 'Error al cerrar sesión');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const menuItems = [
    {
      id: 'wishlist',
      label: t('menu.wishlist') || 'Lista de deseos',
      icon: 'heart-outline' as const,
      onPress: () => {
        onClose();
        router.push('/wishlist');
      },
    },
    {
      id: 'friends',
      label: t('menu.friends') || 'Amigos',
      icon: 'people-outline' as const,
      onPress: () => {
        onClose();
        router.push('/friends');
      },
    },
    {
      id: 'settings',
      label: t('menu.accountSettings') || 'Configuración de cuenta',
      icon: 'settings-outline' as const,
      onPress: () => {
        onClose();
        router.push('/settings');
      },
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.overlay}>
        <TouchableOpacity
          style={styles.closeArea}
          activeOpacity={1}
          onPress={onClose}
        />
        
        <View style={styles.menuContainer}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <Ionicons name={item.icon} size={20} color="#FFFFFF" />
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={20} color="#FFFFFF80" />
            </TouchableOpacity>
          ))}

          <View style={styles.divider} />

          <TouchableOpacity
            style={[styles.menuItem, styles.logoutItem]}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={20} color="#FF4444" />
            <Text style={[styles.menuLabel, styles.logoutLabel]}>
              {t('auth.logout') || 'Cerrar sesión'}
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#FF444480" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  closeArea: {
    flex: 1,
  },
  menuContainer: {
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  menuLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#FFFFFF20',
    marginVertical: 12,
  },
  logoutItem: {
    backgroundColor: '#FF444410',
  },
  logoutLabel: {
    color: '#FF4444',
  },
});
