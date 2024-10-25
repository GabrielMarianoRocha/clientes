import React from 'react';
import { ApplicationProvider } from '@ui-kitten/components';
import * as eva from '@eva-design/eva';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AutocompleteDropdownContextProvider } from 'react-native-autocomplete-dropdown';
import Toast from 'react-native-toast-message';
import Routes from './src/routes';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/contexts/auth';

export default function App() {
  return (
    <ApplicationProvider {...eva} theme={eva.light}>
      <SafeAreaProvider>
        <NavigationContainer>
          <AutocompleteDropdownContextProvider>
            <AuthProvider>
              <Routes />
            </AuthProvider>
          </AutocompleteDropdownContextProvider>
        </NavigationContainer>
        <Toast />
      </SafeAreaProvider>
    </ApplicationProvider>
  );
}
