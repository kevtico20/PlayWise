import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

type State = {
  hasError: boolean;
  error?: Error | null;
  info?: any;
};

export default class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, State> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: any) {
    // Log to console — Metro/Expo will capture this
    console.error('ErrorBoundary caught error:', error);
    console.error(info);
    this.setState({ error, info });
  }

  reset = () => {
    this.setState({ hasError: false, error: null, info: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Ha ocurrido un error en el componente</Text>
          <Text style={styles.message}>{this.state.error?.message}</Text>
          <TouchableOpacity onPress={this.reset} style={styles.button}>
            <Text style={styles.buttonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children as React.ReactElement;
  }
}

const styles = StyleSheet.create({
  container: {
    height: 340,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111',
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  message: {
    color: '#ddd',
    fontSize: 12,
    marginBottom: 12,
    paddingHorizontal: 16,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#D21718',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
