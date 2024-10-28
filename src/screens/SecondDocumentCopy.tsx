import React, { useCallback, useEffect, useState } from 'react';
import { View, TouchableNativeFeedback, StyleSheet, ScrollView, Dimensions, Linking, KeyboardAvoidingView, Platform } from 'react-native';
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
  Input,
} from '@ui-kitten/components';
import { FontAwesome6, MaterialIcons } from '@expo/vector-icons';
import * as api from '../services/api';
import Layout from '../components/layout';
import { format } from 'date-fns';
import * as Clipboard from 'expo-clipboard';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ({ navigation }) {
  const [ucs, setUcs] = useState<IUc[]>([]);
  const [ucDetail, setUcDetail] = useState<IUcDetail[]>([]);
  const [selectedUc, setSelectedUc] = useState<IUc>();
  const [loading, setLoading] = useState(false);
  const [loadingModal, setLoadingModal] = useState(false);
  const [visible, setVisible] = React.useState(false);
  const [filterText, setFilterText] = useState('');
  const [filterTextRefs, setFilterTextRefs] = useState('');
  const filteredUcs = ucs.filter((item) =>
    item.codigo.toString().toLowerCase().includes(filterText.toLowerCase())
  );
  const REPORT_PATH = 'https://app.cogesan.com.br/Arrecadacao/DocumentoWeb.lex/Imprimir?id=';
  const { height: screenHeight } = Dimensions.get('window');

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
      format(item.vencimento, 'dd/MM/yyyy').toString()
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

  const openPaymentModal = async (item: IUc) => {
    setLoadingModal(true);
    setLoading(true)
    try {
      let response = await api.ucsDetail(item.codigo);
      response = response.filter((item) => item.situacao);
      setUcDetail(response);
      setSelectedUc(item);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro ao buscar unidade selecionada, tente novamente mais tarde.',
        text2: error.message,
      });
    } finally {
      setLoading(false);
      setTimeout(() => {
        setLoadingModal(false);
      }, 500);
      setVisible(true);
    }
  };



  const formatValue = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);
  };

  const copyToClipboard = async (code?: string | null) => {
    if (!code || code === null) {
      Toast.show({
        type: 'error',
        text1: 'Erro ao copiar código!',
        text2: 'Não foi possível copiar o código selecionado, tente novamente mais tarde!',
      });
      return;
    }

    await Clipboard.setStringAsync(code);

    Toast.show({
      type: 'success',
      text1: 'Código copiado para área de transferência!',
    });
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
      height: 40,
    },
    button: {
      backgroundColor: '#a6ce39',
      borderColor: '#a6ce39',
    },
    buttonContainer: {
      position: 'relative',
      bottom: '5%',
      left: 0,
      right: 0,
      backgroundColor: '#fff',
    },
  });

  useEffect(() => {
    getUcs();
  }, [getUcs]);

  return (
    <Layout loading={loading} style={{ height: '100%' }}>
      <TopNavigation title="Segunda via" alignment="center" accessoryLeft={renderBackAction} />
      <View style={styles.ucsQuantityContainer}>
        <Text category="h6">Selecione uma unidade</Text>
      </View>
      <ScrollView>
        <Input
          style={{
            flex: 1,
            margin: 2,
          }}
          status="basic"
          placeholder="Filtrar por UC"
          onChangeText={(text) => setFilterText(text)}
          value={filterText}
          keyboardType="numeric"
        />
        {filteredUcs.length > 0 ? (
          filteredUcs.map((item) => (
            <TouchableNativeFeedback key={`uc-item-${item.codigo}`}>
              <Card onPress={() => openPaymentModal(item)}>
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
          ))
        ) : (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              marginTop: "50%"
            }}
          >
            <Text style={{ textAlign: 'center' }}>
              Nenhuma unidade foi encontrada para o usuário logado.
            </Text>
          </View>
        )}
      </ScrollView>
      <Layout loading={loadingModal}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <Modal
            visible={visible}
            style={{
              marginTop: '5%',
              minHeight: Dimensions.get('window').height,
              width: Dimensions.get('window').width,
              backgroundColor: 'white',
              padding: 1,
            }}
  
          >
            <Layout style={{ padding: 10 }}>
              <Text category="h6" style={{ marginBottom: 8 }}>Unidade selecionada:</Text>
              <Text style={{ fontWeight: 'bold' }}>Endereço: <Text>{selectedUc?.endereco}</Text></Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 8 }}>
                <Text style={{ fontWeight: 'bold' }}>UC: <Text>{selectedUc?.codigo}</Text></Text>
                <Text style={{ fontWeight: 'bold' }}>Hidrômetro: <Text>{selectedUc?.hidrometro}</Text></Text>
              </View>
              <Text style={{ fontWeight: 'bold' }}>
                Situação: <Text style={{ color: selectedUc?.situacao === 'INATIVA' ? 'red' : 'green' }}>
                  {selectedUc?.situacao}
                </Text>
              </Text>
            </Layout>

            {/* Input Filter */}
            <Layout style={{ paddingHorizontal: 1 }}>
              <Input
                onChangeText={(text) => setFilterTextRefs(text)}
                value={filterTextRefs}
                placeholder="Filtrar por Referência, Valor, Vencimento ou Situação"
                style={{
                  marginVertical: 10,
                  padding: 10,
                  borderRadius: 5,
                }}
              />
            </Layout>

            {/* Divider and Header */}
            <Divider />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 10 }}>
              <Text category="label" style={{ fontWeight: 'bold' }}>Referência</Text>
              <Text category="label" style={{ fontWeight: 'bold' }}>Valor</Text>
              <Text category="label" style={{ fontWeight: 'bold' }}>Vencimento</Text>
              <Text category="label" style={{ fontWeight: 'bold' }}>Situação</Text>
            </View>

            {/* Scrollable Content */}
            <ScrollView style={{ flex: 1, paddingHorizontal: 10 }}>
              {filteredRefs?.length > 0 ? (
                filteredRefs
                  .filter(item => item.situacao !== 'BAIXADO' && item.situacao !== 'CONTESTADO')
                  .map((item, index) => (
                    <Card
                      key={`debito-${index}`}
                      style={{ marginVertical: 8 }}
                      status={item.situacao === 'BAIXADO' ? 'success' : 'warning'}
                    >
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                        <Text>{item.referencia}</Text>
                        <Text>{formatValue(item.valor)}</Text>
                        <Text>{format(item.vencimento, 'dd/MM/yyyy')}</Text>
                        <Text style={{ fontWeight: 'bold' }}>{item.situacao}</Text>
                      </View>

                      {/* Payment Options */}
                      {((item.situacao !== 'BAIXADO' && item.pix) || item.codigoBarras) && (
                        <View style={{ marginTop: 10 }}>
                          <Text category="label">Pagar com:</Text>
                          <View style={{ flexDirection: 'row', marginTop: 8 }}>
                            {item.situacao !== 'BAIXADO' && item.pix && (
                              <Button
                                size='tiny'
                                onPress={() => copyToClipboard(item.pix)}
                                style={{ marginRight: 5 }}
                                accessoryLeft={() => <FontAwesome6 name="pix" size={16} color="white" />}
                              >
                                Pix
                              </Button>
                            )}
                            {item.situacao !== 'BAIXADO' && item.codigoBarras && (
                              <Button
                                size='tiny'
                                onPress={() => copyToClipboard(item.codigoBarras)}
                                style={{ marginRight: 5 }}
                                accessoryLeft={() => <FontAwesome6 name="barcode" size={16} color="white" />}
                              >
                                Código de barras
                              </Button>
                            )}
                            {item.situacao !== 'BAIXADO' && item.codigoBarras && (
                              <Button
                                size='tiny'
                                style={{ backgroundColor: 'rgb(241, 86, 66)', borderColor: 'rgb(241, 86, 66)' }}
                                onPress={() => Linking.openURL(REPORT_PATH + item.documentoId)}
                                accessoryLeft={() => <FontAwesome6 name="file-pdf" size={16} color="white" />}
                              >
                                Baixar documento
                              </Button>
                            )}
                          </View>
                        </View>
                      )}
                    </Card>
                  ))
              ) : (
                <View style={{ alignItems: 'center', marginTop: screenHeight * 0.2 }}>
                  <Text>Nenhum lançamento para a unidade selecionada.</Text>
                </View>
              )}
            </ScrollView>

            <SafeAreaView style={{ padding: 20 }}>
              <Button
                style={{ backgroundColor: '#a6ce39', borderColor: '#a6ce39' }}
                onPress={closeModal}
              >
                Voltar
              </Button>
            </SafeAreaView>
            <Toast />
          </Modal>
        </KeyboardAvoidingView>
      </Layout>
    </Layout>
  );
}