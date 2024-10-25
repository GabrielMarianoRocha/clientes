import React, { useContext, useState, useEffect, useCallback } from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  Text,
  Image,
  TouchableNativeFeedback,
  Dimensions,
  Linking,
  AppState
} from 'react-native';
import { Card, TopNavigation, TopNavigationAction } from '@ui-kitten/components';
import { AuthContext } from '../contexts/auth';
import { Ionicons, MaterialIcons, SimpleLineIcons } from '@expo/vector-icons';
import Layout from '../components/layout';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import * as api from '../services/api';

export default function ({ navigation }) {
  const authData = useContext(AuthContext);
  const { signOut } = authData;
  const [selectedCity, setSelectedCity] = useState("");
  const { height } = Dimensions.get('window');
  const [logo, setLogo] = useState([]);
  const [logoLoading, setLogoLoading] = useState<boolean>(false);
  const { city } = authData;
  const municipioSelecionado = city?.id;
  const [whatsapp, setWhatsapp] = useState();

  const styles = StyleSheet.create({
    mainContainer: {
      marginLeft: 35,
      flexDirection: 'row',
      flexWrap: 'wrap',
      rowGap: 5,
      columnGap: 5,
      justifyContent: 'flex-start',
    },
    card: {
      width: Dimensions.get('window').width * 0.4,
      height: Dimensions.get('window').height * 0.22,
    },
  });

  let fontSize;
  let containerTop;

  if (height < 600) {
    fontSize = 15;
    containerTop = '18%';
  } else if (height < 300) {
    fontSize = 12;
  } else {
    fontSize = 16;
    containerTop = '10%';
  }

  async function getSelectedCity() {
    try {
      const city = await AsyncStorage.getItem('selectedCity');
      if (city !== null) {
        console.log("Municipio selecionado: ", city);
        return city;
      }
    } catch (error) {
      console.error("Erro ao recuperar municipio: ", error)
    }
  }

  const renderBackAction = (): React.ReactElement => (
    <TopNavigationAction
      icon={
        <>
          <SimpleLineIcons name="logout" size={20} color="#4169E1" />
        </>
      }
      onPressOut={signOut}
    />
  );

  const getLogo = useCallback(async (item) => {
    try {
      let response = await api.getLogos(item);
      setLogo(response.data);
    } catch (error) {
      console.error("Erro ao carregar imagens", error)
    } finally {
      console.log("Imagens carregadas com sucesso");
    }
  }, [api]);

  const getLogoUrl = useCallback(async () => {
    setLogoLoading(true);
    try {
      const citySelected = await AsyncStorage.getItem('selectedCity');
      if (citySelected !== null) {
        console.log("Municipio selecionado: ", citySelected);
        setSelectedCity(citySelected);
        getLogo(citySelected);
        return citySelected;
      }
    } catch (error) {
      console.error("Erro ao recuperar municipio: ", error)
    } finally {
      setLogoLoading(false);
    }
  }, [AsyncStorage]);

  const getWhatsapp = useCallback(async (item) => {
    try {
      let response = await api.getWhatsapp(item);
      setWhatsapp(response.data.map((item) => item.contatoWhatsapp));
    } catch (error) {
      console.error("Erro ao carregar contato", error);
    } finally {
      console.log("Contato carregado com sucesso");
    }
  }, [AsyncStorage]);

  const openWhatsapp = () => {
    if (whatsapp) {
      Linking.openURL(`whatsapp://send?phone=${whatsapp}&text=`);
    } else if (whatsapp === '') {
      Toast.show({
        type: 'info',
        text1: 'Sem contato cadastrado',
      })
    }
  }

  useEffect(() => {
    getWhatsapp(selectedCity);
    getLogoUrl();
    getSelectedCity();
  }, [getLogo, selectedCity]);

  return (
    <Layout style={{ height: '100%' }}>
      <TopNavigation alignment="center" accessoryRight={renderBackAction} />
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
                    marginTop: '-14%',
                    height: 150,
                    width: 200,
                  }}
                  src={`https://cogesan.z19.web.core.windows.net/${item.url}`}
                />
              )
            })
          }
        </Layout>
      </View>
      <View>
        <ScrollView
          contentContainerStyle={styles.mainContainer}
          style={{
            maxHeight: '85%',
            marginTop: containerTop,
          }}
        >
          <TouchableNativeFeedback>
            <Card style={styles.card} onPress={() => navigation.navigate('SecondDocumentCopy')}>
              <View style={{ alignItems: 'center' }}>
                <Ionicons name="document-outline" size={50} color="#4169E1" />
                <Text style={{ fontSize: fontSize, marginTop: 20, color: 'black' }}>2ª via</Text>
              </View>
            </Card>
          </TouchableNativeFeedback>
          <TouchableNativeFeedback>
            <Card style={styles.card} onPress={() => navigation.navigate('FinancialStatement')}>
              <View style={{ alignItems: 'center' }}>
                <Ionicons name="document" size={50} color="#4169E1" />
                <Text style={{ fontSize: fontSize, marginTop: 20, textAlign: 'center', color: 'black' }}>Extrato financeiro</Text>
              </View>
            </Card>
          </TouchableNativeFeedback>
          <TouchableNativeFeedback>
            <Card style={styles.card} onPress={() => navigation.navigate('UpdateRegistration')}>
              <View style={{ alignItems: 'center' }}>
                <Ionicons name="people-circle" size={50} color="#4169E1" />
                <Text style={{ fontSize: fontSize, marginTop: 20, textAlign: 'center', color: 'black' }}>Atualização cadastral</Text>
              </View>
            </Card>
          </TouchableNativeFeedback>
          <TouchableNativeFeedback>
            <Card style={styles.card} onPress={() => navigation.navigate('UpdateDueDate')}>
              <View style={{ alignItems: 'center' }}>
                <Ionicons name="calendar-number-outline" size={50} color="#4169E1" />
                <Text style={{ fontSize: fontSize, marginTop: 20, textAlign: 'center', color: 'black' }}>Alterar dia de vencimento</Text>
              </View>
            </Card>
          </TouchableNativeFeedback>
          <TouchableNativeFeedback>
            <Card style={styles.card} onPress={() => navigation.navigate('Location')}>
              <View style={{ alignItems: 'center' }}>
                <MaterialIcons name="where-to-vote" size={50} color="#4169E1" />
                <Text style={{ fontSize: fontSize, marginTop: 20, color: 'black' }}>Onde pagar</Text>
              </View>
            </Card>
          </TouchableNativeFeedback>
          <TouchableNativeFeedback>
            <Card style={styles.card} onPress={() => openWhatsapp()}>
              <View style={{ alignItems: 'center' }}>
                <Ionicons name="logo-whatsapp" size={50} color="#25D366" />
                <Text style={{ fontSize: fontSize, marginTop: 20, color: 'black' }}>WhatsApp</Text>
              </View>
            </Card>
          </TouchableNativeFeedback>
        </ScrollView>
      </View>
    </Layout>
  );
}
