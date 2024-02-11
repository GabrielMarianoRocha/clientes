import React, { useContext } from "react";
import { AuthContext } from "../provider/AuthProvider";

import { NavigationContainer } from "@react-navigation/native";

import Loading from "../screens/utils/Loading";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import CitySelection from "../screens/CitySelection";
import Login from "../screens/Login";

const Stack = createNativeStackNavigator();

export default () => {
  const auth = useContext(AuthContext);
  const { user, city } = auth;

  return (
    <NavigationContainer>
      {user == null && <Loading />}
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
        initialRouteName={!user ? "CitySelection" : "Login"}
      >
        <Stack.Screen name="CitySelection" component={CitySelection} />
        <Stack.Screen name="Login" component={Login} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
