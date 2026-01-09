import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useCurrentUser } from '../../hooks/use-current-user';
import ProfileMenu from './ProfileMenu';

interface MainHeaderProps {
  onSearchPress?: () => void;
}

export default function MainHeader({ onSearchPress }: MainHeaderProps) {
  const { getUserInitial } = useCurrentUser();
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <>
      <View style={styles.container}>
        <Text style={styles.logo}>Logo</Text>
        
        <View style={styles.rightSection}>
          <TouchableOpacity onPress={onSearchPress} style={styles.iconButton}>
            <Ionicons name="search" size={23} color="#FFFFFF" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => setMenuVisible(true)}
            style={styles.profileButton}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getUserInitial()}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ProfileMenu 
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    paddingTop: 40, // Status bar padding
    backgroundColor: 'transparent',
  },
  logo: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconButton: {
    width: 23,
    height: 23,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileButton: {
    marginLeft: 5,
  },
  avatar: {
    width: 25,
    height: 23,
    borderRadius: 12.5,
    backgroundColor: '#4A4A4A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#D9D9D9',
    fontSize: 16,
    fontWeight: '600',
  },
});
