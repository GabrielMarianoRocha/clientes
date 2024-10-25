import React, { useCallback, useState, useEffect } from 'react';
import { Dimensions, TouchableNativeFeedback, StyleSheet, View, Image } from 'react-native';
import { Text, TopNavigation, TopNavigationAction, Card } from '@ui-kitten/components';
import Layout from '../components/layout';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as api from '../services/api';
import Toast from 'react-native-toast-message';
import { ScrollView, NativeBaseProvider } from 'native-base';

export default function ({ navigation }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const renderBackAction = (): React.ReactElement => (
    <TopNavigationAction
      icon={
        <>
          <MaterialIcons name="arrow-back" size={25} color="#4169E1" />
        </>
      }
      onPressOut={() => navigation.goBack()}
    />
  );

  const getBank = useCallback(async (item: string) => {
    setLoading(true);
    try {
      const { data } = await api.getBanks(item);
      setData(data);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error ao carregar bancos, tente novamente',
        text2: error.message,
      });
    } finally {
      setLoading(false);
    }
  }, [api]);
  

  async function getSelectedCity() {
    try {
      const city = await AsyncStorage.getItem('selectedCity');
      if (city !== null) {
        getBank(city);
        return city;
      }
    } catch (error) {
      console.error("Erro ao recuperar municipio: ", error)
    }
  }

  useEffect(() => {
    getSelectedCity();
  }, []);

  return (
    <Layout loading={loading} style={{ height: Dimensions.get('window').height }}>
      <TopNavigation title="Onde pagar" alignment="center" accessoryLeft={renderBackAction} />
      <NativeBaseProvider>
        <ScrollView>
          {
            data.length > 0 ? (
              data.map((item) => {
                return (
                  <TouchableNativeFeedback style={{ marginTop: 20 }}>
                    <Card>
                      <Text style={{ fontWeight: 'bold' }}>
                        <Text>{item.nome}</Text>
                      </Text>
                      <Text style={{ fontWeight: 'bold' }}>
                        Endereço: {!item.endereco ? <Text>Sem endereço cadastrado</Text> : <Text>{item.endereco}</Text>}
                      </Text>
                    </Card>
                  </TouchableNativeFeedback>
                )
              })
            ) : (
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor:  "white",
                }}
              >
                <Text>Não há bancos cadastrados</Text>
              </View>
            )
          } 
        </ScrollView>
      </NativeBaseProvider>
    </Layout>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    height: 400
  },
});
