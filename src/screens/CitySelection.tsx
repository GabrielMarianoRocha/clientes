import React, { useCallback, useContext, useEffect, useState } from "react";
import {
  ScrollView,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Image,
  Dimensions,
} from "react-native";
import { Layout, Button, themeColor } from "react-native-rapi-ui";
import axios from "axios";
import { IState } from "../types/state";
import { Text, useTheme } from "@ui-kitten/components";
import filter from "../utils/filter";
import Toast from "react-native-toast-message";
import {
  AutocompleteDropdown,
  TAutocompleteDropdownItem,
} from "react-native-autocomplete-dropdown";
import { AuthContext } from "../provider/AuthProvider";

export default function ({ navigation }) {
  const { isDarkmode } = useTheme();

  const user = useContext(AuthContext);

  const [states, setStates] = useState<TAutocompleteDropdownItem[]>([]);
  const [selectedState, setSelectedState] =
    useState<TAutocompleteDropdownItem>();
  const [selectedCity, setSelectedCity] = useState<TAutocompleteDropdownItem>();
  const [dataFiltredState, setDataFiltredState] = useState<
    TAutocompleteDropdownItem[]
  >([]);
  const [dataFiltredCity, setDataFiltredCity] = useState<
    TAutocompleteDropdownItem[]
  >([]);
  const [cities, setCities] = useState<TAutocompleteDropdownItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  function forget() {
    setLoading(true);
    if (selectedCity?.id) {
      user.city = selectedCity;
      navigation.navigate("Login");
    } else {
      Toast.show({
        type: "error",
        text1: "Campos Inválidos!",
        text2: "Selecione um Estado e um município para prosseguir.",
      });
    }
    setLoading(false);
  }

  const getStates = useCallback(async () => {
    try {
      const { data } = await axios.get<IState[]>(
        "https://servicodados.ibge.gov.br/api/v1/localidades/estados"
      );

      const dataToSet = data.map((item) => ({
        id: item.id.toString(),
        title: item.nome,
      })) as TAutocompleteDropdownItem[];

      setStates(dataToSet);
      setDataFiltredState(dataToSet);
    } catch (error) {
      console.warn("Deu erro estados");
    }
  }, []);

  const getCities = useCallback(async (id: string) => {
    try {
      const { data } = await axios.get<IState[]>(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${id}/municipios`
      );
      const dataToSet = data.map((item) => ({
        id: item.id.toString(),
        title: item.nome,
      })) as TAutocompleteDropdownItem[];

      setCities(dataToSet);
      setDataFiltredCity(dataToSet);
    } catch (error) {
      console.warn("Deu erro cidades");
    }
  }, []);

  const onClearPress = useCallback(() => {
    setCities([]);
    setDataFiltredCity([]);
    setSelectedCity(undefined);
  }, []);

  const onChangeTextState = useCallback(
    (query): void => {
      const newList =
        states.filter((item) => filter(item.title, query)) ?? states;
      setDataFiltredState(newList);
    },
    [states]
  );

  const onChangeTextCity = useCallback(
    (query): void => {
      const newList =
        cities.filter((item) => filter(item.title, query)) ?? cities;
      setDataFiltredCity(newList);
    },
    [cities]
  );

  useEffect(() => {
    getStates();
  }, [getStates]);

  useEffect(() => {
    if (selectedState?.id) {
      getCities(selectedState?.id);
    }
  }, [selectedState, getCities]);

  return (
    <KeyboardAvoidingView behavior="height" enabled style={{ flex: 1 }}>
      <Layout>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
          }}
        >
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: isDarkmode ? "#17171E" : themeColor.white100,
            }}
          >
            <Image
              resizeMode="contain"
              style={{
                height: 220,
                width: 220,
              }}
              source={require("../../assets/images/logo.png")}
            />
          </View>
          <View
            style={{
              flex: 3,
              paddingHorizontal: 20,
              paddingBottom: 20,
              backgroundColor: isDarkmode ? themeColor.dark : themeColor.white,
            }}
          >
            <Text
              category="label"
              style={{
                marginTop: 20,
                fontSize: 16,
              }}
            >
              Estado
            </Text>
            <AutocompleteDropdown
              onSelectItem={setSelectedState}
              dataSet={dataFiltredState}
              inputHeight={60}
              clearOnFocus={false}
              closeOnBlur={false}
              useFilter={false}
              onClear={onClearPress}
              textInputProps={{
                placeholder: "Digite o nome do estado",
              }}
              emptyResultText="Estado não encontrado..."
              onChangeText={onChangeTextState}
              suggestionsListMaxHeight={Dimensions.get("window").height * 0.4}
              inputContainerStyle={{
                backgroundColor: "white",
                borderWidth: 2,
                borderColor: "#ebeced",
              }}
            />
            <Text
              category="label"
              style={{
                marginTop: 20,
                fontSize: 16,
              }}
            >
              Município
            </Text>
            <AutocompleteDropdown
              onSelectItem={setSelectedCity}
              dataSet={dataFiltredCity}
              inputHeight={60}
              clearOnFocus={false}
              closeOnBlur={false}
              useFilter={false}
              textInputProps={{
                placeholder: "Digite o nome do município",
                editable: !!selectedState,
              }}
              emptyResultText="Município não encontrado..."
              onChangeText={onChangeTextCity}
              suggestionsListMaxHeight={Dimensions.get("window").height * 0.4}
              inputContainerStyle={{
                backgroundColor: !selectedState ? "#f2f2f2" : "white",
                borderWidth: 2,
                borderColor: "#ebeced",
              }}
              rightButtonsContainerStyle={{
                display: !selectedState ? "none" : undefined,
              }}
            />
            <Button
              text={loading ? "Carregando" : "Continuar"}
              onPress={forget}
              style={{
                marginTop: 20,
              }}
              disabled={loading}
            />
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 30,
                justifyContent: "center",
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  // isDarkmode ? setTheme("light") : setTheme("dark");
                }}
              >
                <Text
                  style={{
                    marginLeft: 5,
                  }}
                >
                  {isDarkmode ? "☀️ Tema claro" : "🌑 Tema escuro"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </Layout>
    </KeyboardAvoidingView>
  );
}
