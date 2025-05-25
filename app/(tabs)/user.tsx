import Profile from '@/app/(user)/profile';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import CheckLogin from '../(auth)/check-login';

const User = () => {
  const [hasToken, setHasToken] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('accessToken')
      .then(token => setHasToken(!!token))
      .catch(error => {
        console.error('Error checking token:', error);
        setHasToken(false);
      });
  }, []);

  return (
    <View style={styles.container}>
      {hasToken === null ? (
        <Text>Loading...</Text>
      ) : hasToken ? (
        <Profile />
      ) : (
        <CheckLogin />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
});

export default User;