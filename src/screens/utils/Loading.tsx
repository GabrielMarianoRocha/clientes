import React from 'react';
import { View, ActivityIndicator } from 'react-native';

export default function () {
  return (
    <View
      style={{
        display: 'flex',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <ActivityIndicator size="large" color="#4169E1" />
    </View>
  );
}
