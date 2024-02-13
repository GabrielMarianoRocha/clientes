import React, { createContext, useState, useEffect } from "react";
import { ICity } from "../types/city";
import { TAutocompleteDropdownItem } from "react-native-autocomplete-dropdown";

type ContextProps = {
  user: null | boolean;
  city: null | TAutocompleteDropdownItem;
};

const AuthContext = createContext<Partial<ContextProps>>({});

interface Props {
  children: React.ReactNode;
}

const AuthProvider = (props: Props) => {
  const [user, setUser] = useState<null | boolean>(null);

  useEffect(() => {
    // checkLogin();
    setUser(true);
  }, []);

  function checkLogin() {
    if (!user) {
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
