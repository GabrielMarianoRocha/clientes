import React, { useCallback, useEffect, useState } from 'react';
import { View, TouchableNativeFeedback, StyleSheet, ScrollView, Dimensions } from 'react-native';
import Toast from 'react-native-toast-message';
import { IUc, IUcDetail } from '../@types/uc';
import {
  Text,
  TopNavigationAction,
  TopNavigation,
  Card,
  Modal,
  Button,
  Divider,
  Input
} from '@ui-kitten/components';
import { MaterialIcons } from '@expo/vector-icons';
import * as api from '../services/api';
import Layout from '../components/layout';
import { format } from 'date-fns';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ({ navigation }) {
  const [ucs, setUcs] = useState<IUc[]>([]);
  const [ucDetail, setUcDetail] = useState<IUcDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = React.useState(false);
  const [filterText, setFilterText] = useState('');
  const [filterTextRefs, setFilterTextRefs] = useState('');
  const filteredUcs = ucs.filter((item) =>
    item.codigo.toString().toLowerCase().includes(filterText.toLowerCase())
  );
  const { height } = Dimensions.get('window');
  let scrollViewMaxHeight;
  let containerHeight;
  let containerUcInfos;
  let marginTop;

  if (height >= 601 && height <= 814) {
    scrollViewMaxHeight = height * 0.82;
    containerHeight = height * 0.93;
    containerUcInfos = 40;
    marginTop = '-5%';
  } else if (height >= 814) {
    scrollViewMaxHeight = height * 0.90;
    containerHeight = height * 0.70;
    marginTop = '1%';
  } else if (height <= 600) {
    scrollViewMaxHeight = height * 0.70;
    containerHeight = height * 0.80;
  }

  const filteredRefs = ucDetail.filter(
    (item) =>
      item.referencia
        .toString()
        .replace(/[^\w\s]/gi, '')
        .toLowerCase()
        .includes(filterTextRefs.toLowerCase()) ||
      item.valor
        .toString()
        .replace(/[^\w\s]/gi, '')
        .toLowerCase()
        .includes(filterTextRefs.toLowerCase()) ||
      format(item.vencimento, 'dd/MM/yyyy')
        .toString()
        .replace(/[^\w\s]/gi, '')
        .toLowerCase()
        .includes(filterTextRefs.toLowerCase()) ||
      item.situacao
        .toString()
        .replace(/[^\w\s]/gi, '')
        .toLowerCase()
        .includes(filterTextRefs.toLowerCase())
  );

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

  const openModal = async (item: IUc) => {
    setLoading(true);
    try {
      let response = await api.ucsDetail(item.codigo);
      response = response.filter((item) => item.situacao);
      setUcDetail(response);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro ao buscar unidade selecionada, tente novamente mais tarde.',
        text2: error.message,
      });
    } finally {
      setVisible(true);
      setLoading(false);
    }
  };

  const getUcs = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.listAllUcs();
      setUcs(data);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: !!error ? 'Sessão inválida!' : 'Erro!',
        text2: error.message ?? 'Erro interno, tente novamente mais tarde.',
      });
    } finally {
      setLoading(false);
    }
  }, [api]);

  const formatValue = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);
  };

  const closeModal = async () => {
    setFilterTextRefs('');
    setLoading(true);
    setTimeout(() => {
      setVisible(false);
      setLoading(false);
    }, 100);
  };

  const styles = StyleSheet.create({
    ucsQuantityContainer: {
      alignItems: 'center',
      height: 30,
    },
    button: {
      backgroundColor: '#a6ce39',
      borderColor: '#a6ce39',
    },
    buttonContainer: {
      position: 'relative',
      bottom: '3%',
      left: 0,
      right: 0,
      backgroundColor: '#fff',
    }
  });

  useEffect(() => {
    getUcs();
    openModal;
  }, [getUcs]);

  return (
    <Layout loading={loading} style={{ height: '100%' }}>
      <TopNavigation
        title="Extrato financeiro"
        alignment="center"
        accessoryLeft={renderBackAction}
      />
      <View style={styles.ucsQuantityContainer}>
        <Text category="h6">Selecione uma unidade</Text>
      </View>
      <ScrollView>
        <Input
          style={{
            flex: 1,
            margin: 1,
          }}
          status="basic"
          placeholder="Filtrar por UC"
          onChangeText={(text) => setFilterText(text)}
          value={filterText}
          keyboardType="numeric"
        />
        {filteredUcs.map((item) => (
          <TouchableNativeFeedback key={`uc-item-${item.codigo}`} style={{ marginTop: 20 }}>
            <Card onPress={() => openModal(item)}>
              <Text style={{ fontWeight: 'bold' }}>
                Endereço: <Text>{item.endereco}</Text>
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontWeight: 'bold' }}>
                  UC: <Text>{item.codigo}</Text>
                </Text>
                <Text style={{ fontWeight: 'bold' }}>
                  Hidrômetro: <Text>{item.hidrometro}</Text>
                </Text>
              </View>
              <Text style={{ fontWeight: 'bold' }}>
                Situação:{' '}
                <Text
                  style={{ fontWeight: 'bold' }}
                  status={item.situacao === 'INATIVA' ? 'danger' : 'success'}
                >
                  {item.situacao}
                </Text>
              </Text>
            </Card>
          </TouchableNativeFeedback>
        ))}
      </ScrollView>
      <Modal
      visible={visible}
      style={{
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: 'white',
        padding: 1,
      }}
    >
      <Layout style={{ paddingVertical: 5, paddingHorizontal: 8 }}>
        <Input
          onChangeText={(text) => setFilterTextRefs(text)}
          value={filterTextRefs}
          placeholder="Filtrar por Referência, Valor, Vencimento ou Situação"
        />
      </Layout>
      
      <Divider />

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingHorizontal: 10,
          paddingVertical: 8,
        }}
      >
        <Text category="label" style={{ fontWeight: 'bold' }}>Referência</Text>
        <Text category="label" style={{ fontWeight: 'bold' }}>Valor</Text>
        <Text category="label" style={{ fontWeight: 'bold' }}>Vencimento</Text>
        <Text category="label" style={{ fontWeight: 'bold' }}>Situação</Text>
      </View>
      
      <ScrollView style={{ flex: 1 }}>
        {filteredRefs?.length > 0 ? (
          filteredRefs.map((item, index) => (
            <Card
              key={`debito-${index}`}
              style={{ margin: 8 }}
              status={item.situacao === 'BAIXADO' ? 'success' : 'warning'}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text>{item.referencia}</Text>
                <Text>{formatValue(item.valor)}</Text>
                <Text>{format(item.vencimento, 'dd/MM/yyyy')}</Text>
                <Text style={{ fontWeight: 'bold' }}>
                  {item.situacao}
                </Text>
              </View>
            </Card>
          ))
        ) : (
          <Text style={{ textAlign: 'center', marginVertical: 20 }}>
            Nenhum lançamento para a unidade selecionada.
          </Text>
        )}
      </ScrollView>
      
      <SafeAreaView style={{ padding: 16 }}>
        <Button
          style={{ backgroundColor: '#a6ce39', borderColor: '#a6ce39' }}
          onPress={closeModal}
        >
          Voltar
        </Button>
      </SafeAreaView>
    </Modal>
    </Layout>
  );
}
