import { version } from "../../package.json";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import { ScrollView, View, KeyboardAvoidingView, Image, ActivityIndicator } from "react-native";
import { Layout, themeColor } from "react-native-rapi-ui";
import axios from "axios";
import { IState } from "../@types/state";
import { Text, Button, useTheme } from "@ui-kitten/components";
import filter from "../utils/filter";
import { TAutocompleteDropdownItem } from "react-native-autocomplete-dropdown";
import { AuthContext } from "../contexts/auth";
import * as api from "../services/api";
import { remove } from "remove-accents";
import { IBGE_PATH } from "../utils/constants";
import { FormProvider, useForm } from "react-hook-form";
import { ICitySelected } from "../@types/citySelected";
import { HFAutoComplete } from "../components/hook-form";
import Toast from "react-native-toast-message";

export default function ({ navigation }) {
  const { isDarkmode } = useTheme();
  const authData = useContext(AuthContext);
  const [states, setStates] = useState<TAutocompleteDropdownItem[]>([]);
  const [dataFiltredState, setDataFiltredState] = useState<
    TAutocompleteDropdownItem[]
  >([]);
  const [dataFiltredCity, setDataFiltredCity] = useState<
    TAutocompleteDropdownItem[]
  >([]);
  const [cities, setCities] = useState<TAutocompleteDropdownItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingState, setLoadingState] = useState<boolean>(false);
  const [loadingCity, setLoadingCity] = useState<boolean>(false);
  const CitySelectionSchema = useMemo(
    () =>
      Yup.object<ICitySelected>({
        state: Yup.object().default(undefined).required("Campo obrigatório!"),
        city: Yup.object().default(undefined).required("Campo obrigatório!"),
      }),
    [Yup]
  );

  const defaultValues = useMemo<ICitySelected>(
    () => ({
      state: undefined,
      city: undefined,
    }),
    []
  );

  const methods = useForm<ICitySelected>({
    resolver: yupResolver(CitySelectionSchema),
    defaultValues,
  });

  const { handleSubmit, watch, setValue, resetField } = methods;

  const selectedState = watch("state");

  const onSubmit = async(data: ICitySelected) => {
    setLoading(true);
    try {
        await api.verifyCity(data.city?.id);
        authData.city = data.city;
        navigation.navigate("Login");
    } catch(error) {
      Toast.show({
        type: "info",
        text1: "Informação!",
        text2: "O município selecionado não está ativo!",
        visibilityTime: 10000,
      });
    } finally {
      setLoading(false);
    }
  };

  const getStates = useCallback(async () => {
    setLoadingState(true);
    try {
      const { data } = await axios.get<IState[]>(IBGE_PATH);
      const dataToSet = data.map((item) => ({
        id: item.id.toString(),
        title: item.nome,
      })) as TAutocompleteDropdownItem[];
  
      dataToSet.sort((a, b) => a.title.localeCompare(b.title));
  
      setStates(dataToSet);
      setDataFiltredState(dataToSet);
    } catch (error) {
      console.warn(error);
    } finally {
      setLoadingState(false);
    }
  }, [IBGE_PATH]);
  

  const getCities = useCallback(
    async (id: string) => {
      setLoadingCity(true);
      try {
        const { data } = await axios.get<IState[]>(
          `${IBGE_PATH}/${id}/municipios`
        );
        const dataToSet = data.map((item) => ({
          id: item.id.toString(),
          title: item.nome,
        })) as TAutocompleteDropdownItem[];

        setCities(dataToSet);
        setDataFiltredCity(dataToSet);
      } catch (error) {
        console.warn("Deu erro cidades");
      } finally {
        setLoadingCity(false);
      }
    },
    [IBGE_PATH]
  );

  const onClearPressState = useCallback(() => {
    setValue("city", undefined);
    setValue("state", undefined);
  }, [setValue]);

  const onClearPressCity = useCallback(() => {
    setValue("city", undefined);
  }, [setValue]);

  const onChangeTextState = useCallback(
    (query): void => {
      const newList =
        states.filter((item) =>
          filter(remove(item.title as string), remove(query).trim())
        ) ?? states;
      setDataFiltredState(newList);
    },
    [states]
  );

  const onChangeTextCity = useCallback(
    (query): void => {
      const newList =
        cities.filter((item) =>
          filter(remove(item.title as string), remove(query).trim())
        ) ?? cities;
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
                height: 250,
                width: 250,
              }}
              source={require("../../assets/images/logo-cogesan.png")}
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
            <FormProvider {...methods}>
              <HFAutoComplete
                name="state"
                label="Estado"
                placeholder="Digite o nome do estado"
                emptyResultText="Nenhum estado foi encontrado."
                dataSet={dataFiltredState}
                loading={loadingState}
                onClear={onClearPressState}
                onChangeText={onChangeTextState}
                required
              />
              <HFAutoComplete
                name="city"
                label="Município"
                placeholder={!selectedState ? "" : "Digite o nome do município"}
                emptyResultText="Nenhum município foi encontrado."
                dataSet={dataFiltredCity}
                loading={loadingCity}
                onClear={onClearPressCity}
                onChangeText={onChangeTextCity}
                disabled={!selectedState}
                required
              />
            </FormProvider>
            <Button
              onPress={handleSubmit(onSubmit)}
              style={{
                marginTop: 20,
                backgroundColor: "#4169E1",
                height: 60,
              }}
              disabled={loading}
            >
              {loading ? <ActivityIndicator size={15} color="white" /> : "Continuar"}
            </Button>
          </View>
          <View
            style={{
              alignItems: "center",
              backgroundColor: isDarkmode ? themeColor.dark : themeColor.white,
              padding: 5,
            }}
          >
            <Text category="label">v{version}</Text>
          </View>
        </ScrollView>
      </Layout>
    </KeyboardAvoidingView>
  );
}
