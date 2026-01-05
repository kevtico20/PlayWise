import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { APP_COLORS } from '../../constants/colors';

export default function MainFooter() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>PlayWise</Text>
      <Text style={styles.text}>Encuentra juegos, compara precios y descubre novedades.</Text>

      <View style={styles.row}>
        <TouchableOpacity onPress={() => Linking.openURL('mailto:playwiseapp2025@gmail.com')} accessibilityLabel="Enviar correo a soporte">
          <Text style={styles.link}>Soporte</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => Linking.openURL('https://example.com/privacy')}>
          <Text style={styles.link}>Privacidad</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => Linking.openURL('https://example.com/terms')}>
          <Text style={styles.link}>Términos</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.copy}>© {new Date().getFullYear()} PlayWise</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  title: {
    color: APP_COLORS.labelActive || '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  text: {
    color: '#cfcfcf',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  link: {
    color: '#fff',
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  copy: {
    color: '#9b9b9b',
    fontSize: 11,
  },
});
