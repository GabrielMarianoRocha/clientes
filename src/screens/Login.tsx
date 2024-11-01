import * as Yup from 'yup';
import { Button, Text } from '@ui-kitten/components';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ScrollView, View, KeyboardAvoidingView, Image, ActivityIndicator } from 'react-native';
import Toast from 'react-native-toast-message';
import Layout from '../components/layout';
import { REGEX_CNPJ, REGEX_CPF } from '../utils/regex';
import { AuthContext } from '../contexts/auth';
import { TouchableWebElement } from '@ui-kitten/components/devsupport';
import { MaterialIcons } from '@expo/vector-icons';
import { HFTextInput } from '../components/hook-form';
import { FormProvider, useForm } from 'react-hook-form';
import { ILogin } from '../@types/login';
import { yupResolver } from '@hookform/resolvers/yup';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as api from '../services/api';

export default function ({ navigation }) {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [logo, setLogo] = useState([]);
  const [logoLoading, setLogoLoading] = useState<boolean>(false);

  const authData = useContext(AuthContext);

  const { city, signIn } = authData;

  async function saveSelectedCity() {
    try {
      await AsyncStorage.setItem('selectedCity', city?.id);
    } catch (error) {
      console.error("Erro ao salvar municipio: ", error);
    }
  }

  async function saveSelectedCityTitle() {
    try {
      await AsyncStorage.setItem('selectedCityTitle', city?.title);
    } catch (error) {
      console.error("Erro ao salvar municipio: ", error);
    }
  }

  async function setLogoUrl() {
    try {
      await AsyncStorage.setItem('logoUrl', logo);
    } catch (error) {
      console.error("Erro ao salvar logo: ", error)
    }
  }

  const LoginSchema = useMemo(
    () =>
      Yup.object<ILogin>({
        user: Yup.string()
          .required('Campo obrigatório!')
          .test((value, ctx) => {
            if (value.length < 14) {
              return ctx.createError({
                message: 'Mínimo 11 números para o CPF e 14 para o CNPJ.',
              });
            }

            if (!(REGEX_CPF.test(value) || REGEX_CNPJ.test(value))) {
              return ctx.createError({
                message: 'CPF/CNPJ inválido.',
              });
            }

            return true;
          }),
        password: Yup.string()
          .required('Campo obrigatório!')
          .min(6, 'O campo deve ter no mínimo 6 caracteres.'),
      }),
    [Yup]
  );

  const defaultValues = useMemo<ILogin>(
    () => ({
      user: '',
      password: '',
    }),
    []
  );

  const methods = useForm<ILogin>({
    resolver: yupResolver(LoginSchema),
    defaultValues,
  });

  const { handleSubmit, watch, setValue } = methods;

  const onSubmit = async (data: ILogin) => {
    const { user, password } = data;

    setLoading(true);
    if (!city?.id) {
      setLoading(false);
      Toast.show({
        type: 'error',
        text1: 'Código inválido!',
        text2: 'A cidade não foi selecionada, volte a tela anterior e tente novamente!',
      });
      return;
    }

    try {
      await signIn?.(city, user as string, password as string);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Campos inválidos!',
        text2: 'CPF ou Senha inválidos, verifique e tente novamente.',
      });
    } finally {
      setLoading(false);
    }
  };

  const renderShowPassword = (): TouchableWebElement => (
    <View>
      <MaterialIcons
        onPress={() => setShowPassword((prev) => !prev)}
        size={20}
        name={showPassword ? 'visibility' : 'visibility-off'}
        color="#4169E1"
      />
    </View>
  );

  const processMasks = useCallback(
    (text) => {
      text = text.replaceAll(/\D/g, '');
      if (text.length > 11) {
        text = text.replace(REGEX_CNPJ, '$1.$2.$3/$4-$5');
      } else {
        text = text.replace(REGEX_CPF, '$1.$2.$3-$4');
      }
      setValue('user', text);
    },
    [setValue, REGEX_CNPJ, REGEX_CPF]
  );

  const getLogo = useCallback(async () => {
    setLogoLoading(true);
    try {
      let response = await api.getLogos(city?.id);
      setLogo(response.data);
      setLogoUrl();
    } catch (error) {
      console.error("Erro ao carregar imagens", error)
    } finally {
      setLogoLoading(false);
      console.log("Imagens carregadas com sucesso");
    }
  }, [api])

  
  useEffect(() => {
    getLogo();
    saveSelectedCity();
    saveSelectedCityTitle();
  }, [getLogo]);

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
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'white',
            }}
          >
            <Layout loading={logoLoading}>
              {
                logo.map((item) => {
                  return (
                    <Image
                      resizeMode="contain"
                      style={{
                        height: 160,
                        width: 160,
                      }}
                      src={`https://cogesan.z19.web.core.windows.net/${item.url}`}
                    />
                  )
                })
              }
            </Layout>
          </View>
          <View
            style={{
              flex: 3,
              paddingHorizontal: 20,
              paddingBottom: 20,
              backgroundColor: 'white',
            }}
          >
            <Text
              style={{
                alignSelf: 'center',
                padding: 15,
              }}
              category="h3"
            >
              Login
            </Text>
            <FormProvider {...methods}>
              <HFTextInput
                name="user"
                label="CPF/CNPJ"
                placeholder="Insira seu CPF/CNPJ"
                keyboardType="number-pad"
                inputMode="decimal"
                onChangeText={processMasks}
                maxLength={18}
                required
              />

              <HFTextInput
                name="password"
                label="Senha"
                placeholder="Insira sua senha"
                secureTextEntry={!showPassword}
                accessoryRight={renderShowPassword}
                required
              />
              <Button
                onPress={navigation.navigate("Home")}
                style={{
                  marginTop: 20,
                  backgroundColor: loading ? 'lightgray' : '#4169E1',
                  height: 60,
                }}
                disabled={loading}
              >
                {loading ? <ActivityIndicator size={15} color="white" /> : 'Acessar'}
              </Button>
            </FormProvider>

            <Button
              onPress={() => {
                navigation.goBack();
              }}
              style={{
                marginTop: 15,
                backgroundColor: loading ? 'lightgray' : '#a6ce39',
                borderColor: loading ? 'lightgray' : '#a6ce39',
                height: 60,
              }}
              disabled={loading}
            >
              {loading ? <ActivityIndicator size={15} color="white" /> : 'Voltar'}
            </Button>
          </View>
        </ScrollView>
      </Layout>
    </KeyboardAvoidingView>
  );
}
