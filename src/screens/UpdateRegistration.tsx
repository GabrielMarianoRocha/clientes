import React, { useState, useContext, useCallback, useEffect } from 'react';
import Layout from '../components/layout';
import { TopNavigationAction, TopNavigation, Button } from '@ui-kitten/components';
import { MaterialIcons } from '@expo/vector-icons';
import { ScrollView, View } from 'react-native';
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
  const [numberInput, setNumberInput] = useState("");
  const [blockInput, setBlockInput] = useState("");
  const [cepInput, setCepInput] = useState("");
  const [complementInput, setComplementInput] = useState("");
  const [batchInput, setBatchInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isModified, setIsModified] = useState(false);
  const [initialState, setInitialState] = useState({});
  const authData = useContext(AuthContext);

  const renderBackAction = (): React.ReactElement => (
    <TopNavigationAction
      icon={<MaterialIcons name="arrow-back" size={25} color="#4169E1" />}
      onPressOut={() => navigation.goBack()}
    />
  );

  const getData = useCallback(async (item) => {
    setLoading(true);
    try {
      const { data } = await api.listPeople(item);
      setData(data);
      if (data.length > 0) {
        const pessoa = data[0];
        setInitialState(pessoa);
        setCpfCnpjInput(pessoa.cpfCnpj);
        setNameInput(pessoa.nome);
        setTypeInput(pessoa.tipo);
        setPhoneInput(pessoa.celular);
        setMailInput(pessoa.email);
        setCityInput(pessoa.municipioNome);
        setNeighborhoodInput(pessoa.bairroNome);
        setPublicPlaceInput(pessoa.logradouroNome);
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
      setLoading(false);
    }
  }, [api]);
  
  const getAddresses = useCallback(async (item) => {
    try {
      const { data } = await api.listAddress(item);
      setDataAddresses(data);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro ao carregar endereços, tente novamente.',
        text2: error.message,
      });
    }
  }, []);

  const getCities = useCallback(async () => {
    try {
      const { data } = await api.listCities();
      setDataCities(data);
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

  const getNeighborhood = useCallback(async (item) => {
    try { 
      const { data } = await api.listNeighborhood(item);
      setDataNeighorbood(data);
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
        setUser(JSON.parse(userLogged));  // Converte de volta em objeto
        console.log("Usuário logado: ", JSON.parse(userLogged));
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
        cityInput,
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
        text1: "Falha ao salvar, tente novamente.",
        text2: error.message
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
    setSessionLogin();
    getLoggedUser();
    getCities();
    getData(user);
  }, [user]);
  
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
        
        {/* Campo CPF */}
        <FormControl.Label>CPF</FormControl.Label>
        <Input placeholder="CPF" value={cpfCnpjInput} isDisabled />

        {/* Campo Nome */}
        <FormControl.Label>Nome</FormControl.Label>
        <Input
          placeholder="Nome"
          onChangeText={setNameInput}
          value={nameInput}
          isDisabled
        />

        {/* Campo Tipo */}
        <FormControl.Label>Tipo</FormControl.Label>
        <Input
          placeholder="Tipo"
          value={typeInput === "1" ? "Pessoa física" : "Pessoa jurídica"}
          isDisabled
        />

        {/* Campo Celular */}
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

        {/* Campo E-mail */}
        <FormControl.Label>E-mail</FormControl.Label>
        <Input
          placeholder="E-mail"
          onChangeText={setMailInput}
          value={mailInput}
        />

        {/* Campo Cidade */}
        <FormControl.Label>Cidade</FormControl.Label>
        <Select
          onValueChange={(itemValue) => {
            getNeighborhood(itemValue);
            getAddresses(itemValue);
            setCityInput(itemValue);
          }}
          placeholder={cityInput}
          selectedValue={cityInput}
        >
          {dataCities.map((item, index) => (
            <Select.Item
              key={item.municipio}
              label={`${item.nome} - ${item.uf}`}
              value={item.municipio}
            />
          ))}
        </Select>

        {/* Campo Bairro */}
        <FormControl.Label>Bairro</FormControl.Label>
        <Select
          onValueChange={setNeighborhoodInput}
          isDisabled={!cityInput}
          placeholder={neighborhoodInput}
          selectedValue={neighborhoodInput}
        >
          {dataNeighorbood.map((item, index) => (
            <Select.Item
              key={item.nome}
              label={item.nome}
              value={item.bairroId}
            />
          ))}
        </Select>

        {/* Campo Logradouro */}
        <FormControl.Label>Logradouro</FormControl.Label>
        <Select
          onValueChange={setPublicPlaceInput}
          placeholder={publicPlaceInput}
          selectedValue={publicPlaceInput}
        >
          {dataAddresses.map((item, index) => (
            <Select.Item
              key={item.codigo}
              label={item.nome}
              value={item.municipio}
            />
          ))}
        </Select>

        {/* Campo Número */}
        <FormControl.Label>Número</FormControl.Label>
        <Input
          keyboardType="numeric"
          placeholder="Número"
          value={numberInput}
          onChangeText={setNumberInput}
        />

        {/* Campo Complemento */}
        <FormControl.Label>Complemento</FormControl.Label>
        <Input
          placeholder="Complemento"
          value={complementInput}
          onChangeText={setComplementInput}
        />

        {/* Campo Quadra */}
        <FormControl.Label>Quadra</FormControl.Label>
        <Input
          placeholder="Quadra"
          value={blockInput}
          onChangeText={setBlockInput}
        />

        {/* Campo CEP */}
        <FormControl.Label>CEP</FormControl.Label>
        <TextInputMask
          type="zip-code"
          value={cepInput}
          onChangeText={setCepInput}
          customTextInput={Input}
          customTextInputProps={{ placeholder: 'CEP' }}
        />

        {/* Campo Lote */}
        <FormControl.Label>Lote</FormControl.Label>
        <Input
          placeholder="Lote"
          value={batchInput}
          onChangeText={setBatchInput}
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
