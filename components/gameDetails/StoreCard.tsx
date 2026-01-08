import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

interface StoreCardProps {
  storeLogo: { uri: string } | number;
  storeName: string;
  price: string;
  originalPrice?: string;
  discount?: string;
}

export default function StoreCard({ storeLogo, storeName, price, originalPrice, discount }: StoreCardProps) {
  const hasDiscount = discount && parseFloat(discount) > 0;

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image source={storeLogo} style={styles.logo} resizeMode="contain" />
      </View>
      <View style={styles.priceContainer}>
        <Text style={styles.price}>
          ${price} {hasDiscount && `${Math.round(parseFloat(discount))}% OFF`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '30%',
    marginBottom: 6,
    marginRight: 6,
    // Let height be determined by content to avoid enforcing a fixed aspect ratio on web
  },
  logoContainer: {
    height: 55,
    backgroundColor: '#013a60',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  logo: {
    width: '80%',
    height: '80%',
  },
  priceContainer: {
    height: 20,
    backgroundColor: '#013a60',
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  price: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
});
