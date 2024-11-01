import React, { useContext } from 'react';

import { AuthContext } from '../contexts/auth';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from '../screens/Home';
import SecondDocumentCopy from '../screens/SecondDocumentCopy';
import CitySelection from '../screens/CitySelection';
import Login from '../screens/Login';
import Location from '../screens/Location';
import FinancialStatement from '../screens/FinancialStatement';
import UpdateRegistration from '../screens/UpdateRegistration';
import UpdateDueDate from '../screens/UpdateDueDate';

const Stack = createNativeStackNavigator();

const Routes = () => {
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <Stack.Navigator>
      {!isAuthenticated ? (
        <Stack.Group
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="SecondDocumentCopy" component={SecondDocumentCopy} />
          <Stack.Screen name="Location" component={Location} />
          <Stack.Screen name="FinancialStatement" component={FinancialStatement} />
          <Stack.Screen name="UpdateRegistration" component={UpdateRegistration} />
          <Stack.Screen name="UpdateDueDate" component={UpdateDueDate} />
        </Stack.Group>
      ) : (
        <Stack.Group
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="CitySelection" component={CitySelection} />
          <Stack.Screen name="Login" component={Login} />
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
};

export default Routes;
