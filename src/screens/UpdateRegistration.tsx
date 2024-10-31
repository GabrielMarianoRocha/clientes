import React, { useState, useContext, useCallback, useEffect, useMemo } from 'react';
import Layout from '../components/layout';
import { TopNavigationAction, TopNavigation, Button } from '@ui-kitten/components';
import { MaterialIcons } from '@expo/vector-icons';
import { ScrollView, View, Text } from 'react-native';
import { Stack, NativeBaseProvider } from "native-base";
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../contexts/auth';
import * as api from '../services/api';
import Toast from 'react-native-toast-message';
import { Select, Input, FormControl } from "native-base";
import { TextInputMask } from 'react-native-masked-text';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ({ navigation }) {
  const [data, setData] = useState([]);
  const [dataCities, setDataCities] = useState([]);
  const [dataAddresses, setDataAddresses] = useState([]);
  const [dataNeighorbood, setDataNeighorbood] = useState([]);
  const [user, setUser] = useState("");
  const [cpfCnpjInput, setCpfCnpjInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [typeInput, setTypeInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [mailInput, setMailInput] = useState("");
  const [cityInput, setCityInput] = useState("");
  const [neighborhoodInput, setNeighborhoodInput] = useState("");
  const [publicPlaceInput, setPublicPlaceInput] = useState("");
  console.log(neighborhoodInput, "neighborhoodInput");
  console.log(publicPlaceInput, "publicPlaceinput");
  const [numberInput, setNumberInput] = useState("");
  const [blockInput, setBlockInput] = useState("");
  const [cepInput, setCepInput] = useState("");
  const [complementInput, setComplementInput] = useState("");
  const [batchInput, setBatchInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isModified, setIsModified] = useState(false);
  const [initialState, setInitialState] = useState({});
  const [citySelected, setCitySelected] = useState("");
  const [city, setCity] = useState("");
  const [cityTitle, setCityTitle] = useState("");
  const authData = useContext(AuthContext);

  const renderBackAction = (): React.ReactElement => (
    <TopNavigationAction
      icon={<MaterialIcons name="arrow-back" size={25} color="#4169E1" />}
      onPressOut={() => navigation.goBack()}
    />
  );

  async function getSelectedCity() {
    try {
      const value = await AsyncStorage.getItem('selectedCity');
      getNeighborhood(value);
      setCitySelected(value);
    } catch (error) {
      console.error("Erro ao recuperar municipio: ", error)
    }
  }

  async function getSelectedCityTitle() {
    try {
      const value = await AsyncStorage.getItem('selectedCityTitle');
      setCityTitle(value);
    } catch (error) {
      console.error("Erro ao carregar municipio, ", error);
    }
  }

  const getData = useCallback(async (item) => {
    setLoading(true);
    try {
      const { data } = await api.listPeople(item);
      setData(data);
      if (data.length > 0) {
        const pessoa = data[0];
        console.log(pessoa, "pessoa");
        setInitialState(pessoa);
        setCpfCnpjInput(pessoa.cpfCnpj);
        setNameInput(pessoa.nome);
        setTypeInput(pessoa.tipo);
        setPhoneInput(pessoa.celular);
        setMailInput(pessoa.email);
          setCityInput(pessoa.municipioNome);
          setNeighborhoodInput(pessoa.bairroNome);
          setPublicPlaceInput(pessoa.logradouroNome);
          setCity(pessoa.municipio);
        setNumberInput(pessoa.numero);
        setBlockInput(pessoa.quadra);
        setCepInput(pessoa.cep);
        setComplementInput(pessoa.complemento);
        setBatchInput(pessoa.lote);
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro ao buscar o CPF logado, tente novamente.',
        text2: error.message,
      });
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  }, [api]);

  const getAddresses = useCallback(async (item) => {
    setLoading(true); // Ativa o loading ao iniciar o carregamento
    try {
      const { data } = await api.listAddress(item); // Limite de 20 itens por página
      // Só atualiza o estado se os dados tiverem mudado
      setDataAddresses((prevData) => {
        if (JSON.stringify(prevData) !== JSON.stringify(data)) {
          return data;
        }
        return prevData;
      });
    } catch (error) {
      console.error("Erro ao carregar endereços.");
    } finally {
      setLoading(false); // Desativa o loading ao finalizar o carregamento
    }
  }, []);

  // Função para carregar cidades com paginação e verificação de estado
  const getCities = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.listCities(); // Carrega 20 cidades por vez
      setDataCities((prevData) => {
        if (JSON.stringify(prevData) !== JSON.stringify(data)) {
          return data;
        }
        return prevData;
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro ao carregar municipios, tente novamente.',
        text2: error.message,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Função para carregar bairros com paginação e verificação de estado
  const getNeighborhood = useCallback(async (item) => {
    setLoading(true);
    try {
      const { data } = await api.listNeighborhood(item);
      setDataNeighorbood((prevData) => {
        if (JSON.stringify(prevData) !== JSON.stringify(data)) {
          return data;
        }
        return prevData;
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro ao carregar bairros, tente novamente.',
        text2: error.message,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Usar useMemo para dados transformados ou filtrados
  const memoizedAddresses = useMemo(() => dataAddresses, [dataAddresses]);
  const memoizedNeighborhood = useMemo(() => dataNeighorbood, [dataNeighorbood]);
  console.log(memoizedAddresses, "memoizedAddress")

  async function setSessionLogin() {
    try {
      await AsyncStorage.setItem('userLogged', JSON.stringify(authData.user));
    } catch (error) {
      console.error("Erro ao salvar usuário: ", error);
    }
  }

  async function getLoggedUser() {
    try {
      const userLogged = await AsyncStorage.getItem('userLogged');
      if (userLogged !== null) {
        setUser(JSON.parse(userLogged));
      }
    } catch (error) {
      console.error("Erro ao recuperar usuário: ", error);
    }
  }

  const updateRegistration = useCallback(async () => {
    try {
      await api.updatePeople(
        cpfCnpjInput,
        nameInput,
        phoneInput,
        mailInput,
        neighborhoodInput,
        publicPlaceInput,
        numberInput,
        blockInput,
        cepInput,
        complementInput,
        batchInput
      );
      Toast.show({
        type: 'success',
        text1: "Informações alteradas com sucesso!",
      });
      getData(data);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: "Erro ao salvar, tente novamente.",
        text2: 'Nenhuma alteração foi identificada'
      });
    } finally {
      setInitialState({
        cpfCnpj: cpfCnpjInput,
        nome: nameInput,
        celular: phoneInput,
        email: mailInput,
        municipioNome: cityInput,
        bairroNome: neighborhoodInput,
        logradouroNome: publicPlaceInput,
        numero: numberInput,
        quadra: blockInput,
        cep: cepInput,
        complemento: complementInput,
        lote: batchInput,
     });
    }
  }, [cpfCnpjInput, nameInput, phoneInput, mailInput, cityInput, neighborhoodInput, publicPlaceInput, numberInput, blockInput, cepInput, complementInput, batchInput, user]);

  const checkIfModified = useCallback(() => {
    const hasChanges = (
      cpfCnpjInput !== initialState.cpfCnpj ||
      nameInput !== initialState.nome ||
      phoneInput !== initialState.celular ||
      mailInput !== initialState.email ||
      cityInput !== initialState.city ||
      neighborhoodInput !== initialState.bairro ||
      publicPlaceInput !== initialState.logradouro ||
      numberInput !== initialState.numero ||
      blockInput !== initialState.quadra ||
      cepInput !== initialState.cep ||
      complementInput !== initialState.complemento ||
      batchInput !== initialState.lote
    );
    setIsModified(hasChanges);
  }, [cpfCnpjInput, nameInput, phoneInput, mailInput, cityInput, neighborhoodInput, publicPlaceInput, numberInput, blockInput, cepInput, complementInput, batchInput, initialState]);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      await Promise.all([
        getSelectedCity(),
        getSelectedCityTitle(),
        setSessionLogin(),
        getLoggedUser(),
        getCities(),
        getData(user),
        getAddresses(citySelected),
      ]);
      setLoading(false);
    };
    fetchAllData();
  }, [user, city]);

  useEffect(() => {
    checkIfModified();
  }, [cpfCnpjInput, nameInput, phoneInput, mailInput, cityInput, neighborhoodInput, publicPlaceInput, numberInput, blockInput, cepInput, complementInput, batchInput, checkIfModified]);

  return (
    <Layout loading={loading} level="1" style={{ height: '100%' }}>
      <TopNavigation
        title="Atualização cadastral"
        alignment="center"
        accessoryLeft={renderBackAction}
      />

      <ScrollView style={{ maxHeight: '80%', marginTop: 30 }}>
        <NativeBaseProvider>
              <Stack space={4} w="75%" maxW="300px" mx="auto">
                <FormControl.Label>CPF</FormControl.Label>
                <Input placeholder="CPF" value={cpfCnpjInput} isDisabled />
                <FormControl.Label>Nome</FormControl.Label>
                <Input
                  placeholder="Nome"
                  onChangeText={setNameInput}
                  value={nameInput}
                  isDisabled
                />

                <FormControl.Label>Tipo</FormControl.Label>
                <Input
                  placeholder="Tipo"
                  value={typeInput === "1" ? "Pessoa física" : "Pessoa jurídica"}
                  isDisabled
                />

                <FormControl.Label>Celular</FormControl.Label>
                <TextInputMask
                  type="cel-phone"
                  options={{
                    maskType: 'BRL',
                    withDDD: true,
                    dddMask: '(99) ',
                  }}
                  value={phoneInput}
                  onChangeText={setPhoneInput}
                  customTextInput={Input}
                  customTextInputProps={{ placeholder: 'Digite seu número de celular' }}
                />

                <FormControl.Label>E-mail</FormControl.Label>
                <Input
                  placeholder="E-mail"
                  onChangeText={setMailInput}
                  value={mailInput}
                />

                <FormControl.Label>Cidade</FormControl.Label>
                <Select
                  placeholder={cityTitle}
                  selectedValue={citySelected}
                  isDisabled
                >
                  {dataCities.map((item, index) => (
                    <Select.Item
                      key={item.municipio}
                      label={`${item.nome} - ${item.uf}`}
                      value={item.municipio}
                    />
                  ))}
                </Select>

                <FormControl.Label>Bairro</FormControl.Label>
                <Select
                  onValueChange={(itemValue) => setNeighborhoodInput(itemValue)}
                  placeholder={neighborhoodInput ? neighborhoodInput : "Selecione um bairro"}
                  selectedValue={neighborhoodInput}
                >
                  {memoizedNeighborhood.map((item, index) => (
                    <Select.Item
                      key={item.nome}
                      label={item.nome}
                      value={item.bairroId}
                    />
                  ))}
                </Select>

                <FormControl.Label>Logradouro</FormControl.Label>
                <Select
                  onValueChange={(itemValue) => setPublicPlaceInput(itemValue)}
                  placeholder={publicPlaceInput ? publicPlaceInput : "Selecione um logradouro"}
                  selectedValue={publicPlaceInput}
                >
                  {memoizedAddresses.map((item, index) => (
                    <Select.Item
                      key={item.nome}
                      label={item.nome}
                      value={item.logradouroId}
                    />
                  ))}
                </Select>

                <FormControl.Label>Número</FormControl.Label>
                <Input
                  keyboardType="numeric"
                  placeholder="Número"
                  value={numberInput}
                  onChangeText={setNumberInput}
                />

                <FormControl.Label>Complemento</FormControl.Label>
                <Input
                  placeholder="Complemento"
                  value={complementInput}
                  onChangeText={setComplementInput}
                />

                <FormControl.Label>Quadra</FormControl.Label>
                <Input
                  placeholder="Quadra"
                  value={blockInput}
                  onChangeText={setBlockInput}
                />

                <FormControl.Label>Lote</FormControl.Label>
                <Input
                  placeholder="Lote"
                  value={batchInput}
                  onChangeText={setBatchInput}
                />

                <FormControl.Label>CEP</FormControl.Label>
                <TextInputMask
                  type="zip-code"
                  value={cepInput}
                  onChangeText={setCepInput}
                  customTextInput={Input}
                  customTextInputProps={{ placeholder: 'CEP' }}
                />

              </Stack>
        </NativeBaseProvider>
      </ScrollView>

      <SafeAreaView>
        <View style={{ padding: 10 }}>
          <Button
            style={{ backgroundColor: '#a6ce39', borderColor: '#a6ce39' }}
            onPress={updateRegistration}
          >
            {isModified ? "Salvar" : "Sem alterações"}
          </Button>
        </View>
      </SafeAreaView>
    </Layout>
  );
};
