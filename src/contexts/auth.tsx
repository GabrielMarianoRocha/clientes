import React, { createContext, useState, useEffect, useCallback } from 'react';
import { TAutocompleteDropdownItem } from 'react-native-autocomplete-dropdown';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCity, getToken } from '../services/api';

import * as auth from '../services/auth';
import Loading from '../screens/utils/Loading';

type ContextProps = {
  isAuthenticated: null | boolean;
  city: null | TAutocompleteDropdownItem;
  user: string;
  loading: boolean;
  signIn: (city: null | TAutocompleteDropdownItem, user: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<Partial<ContextProps>>({} as ContextProps);

interface Props {
  children: React.ReactNode;
}

const AuthProvider = (props: Props) => {
  const [isAuthenticated, setIsAuthenticated] = useState<null | boolean>(null);
  const [city, setCity] = useState<null | TAutocompleteDropdownItem>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState();

  const checkLogin = useCallback(async () => {
    const token = await getToken();
    const cityStorage = await getCity();

    // loading simulate
    await new Promise((resolve) => setTimeout(resolve, 2000));

    if (token && cityStorage) {
      setIsAuthenticated(true);
      setCity(cityStorage);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    checkLogin();
  }, [checkLogin]);

  const signIn = async (city, user, password) => {
    console.log(user, "user");
    const response = await auth.signIn(city, user, password);
    const { token } = response.data;

    await AsyncStorage.multiSet([
      ['@CogesanAuth:token', token],
      ['@CogesanAuth:city', JSON.stringify(city)],
    ]);
    setIsAuthenticated(true);
    setCity(city);
    setLoading(false);
    setUser(user);
  };

  const signOut = async () => {
    await AsyncStorage.clear();
    setCity(null);
    setIsAuthenticated(false);
    setLoading(false);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <AuthContext.Provider
      value={{
        signIn: !!signIn ? signIn : undefined,
        signOut,
        isAuthenticated,
        loading,
        city,
        user
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
