import React from "react";
import Navigation from "./src/navigation";
import { AuthProvider } from "./src/provider/AuthProvider";
import { ApplicationProvider } from "@ui-kitten/components";
import * as eva from "@eva-design/eva";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AutocompleteDropdownContextProvider } from "react-native-autocomplete-dropdown";
import Toast from "react-native-toast-message";

export default function App() {
  return (
    <ApplicationProvider {...eva} theme={eva.light}>
      <AuthProvider>
        <SafeAreaProvider>
          <AutocompleteDropdownContextProvider>
            <Navigation />
            <Toast />
          </AutocompleteDropdownContextProvider>
        </SafeAreaProvider>
      </AuthProvider>
    </ApplicationProvider>
  );
}
