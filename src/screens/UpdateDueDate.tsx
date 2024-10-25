import React, { useContext, useState, useEffect, useCallback } from "react";
import { ScrollView, TouchableNativeFeedback, View,  Dimensions, StyleSheet } from "react-native";
import { TopNavigationAction, TopNavigation, Text, Card, Modal, Divider, Button } from "@ui-kitten/components";
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeBaseProvider, Select, FormControl } from "native-base";
import { MaterialIcons } from '@expo/vector-icons';
import Layout from '../components/layout';
import * as api from '../services/api';
import { DueDate, IUc } from '../@types/uc';
import Toast from 'react-native-toast-message';
import { AuthContext } from '../contexts/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ({ navigation }) {
    const authData = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [ucs, setUcs] = useState<IUc[]>([]);
    const [visible, setVisible] = useState(false);
    const [selectedUc, setSelectedUc] = useState([]);
    const [dataDueDate, setDataDueDate] = useState<DueDate[]>([]);
    const [user, setUser] = useState("");
    const [dayOptionSelected, setDayOptionSelected] = useState("");

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

    async function setSessionLogin() {
        try {
          await AsyncStorage.setItem('userLogged', authData.user);
        } catch (error) {
          console.error("Erro ao salvar usuário: ", error);
        }
    }
    
    async function getLoggedUser() {
        try {
          const userLogged = await AsyncStorage.getItem('userLogged');
          setUser(userLogged);
          if (userLogged !== null) {
            console.log("Usuário logado: ", userLogged);
            return userLogged;
          }
        } catch (error) {
          console.error("Erro ao recuperar usuário: ", error)
        }
    }

    const getUcs = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.listAllUcs();
            setUcs(data);
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: !!error ? "Sessão inválida!" : "Erro!",
                text2: error.message ?? 'Erro interno, tente novamente mais tarde. ',
            });
        } finally {
            setLoading(false);
        }
    }, [api]);

    const getDueDate = useCallback(async (codigo, cpf) => {
        setLoading(true);
        try {
            const { data } = await api.getDueDate(codigo, cpf);
            setDataDueDate(data);
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: !!error ? "Sessão inválida!" : "Erro!",
                text2: error.message ?? 'Erro interno, tente novamente. ',
            });
        } finally {
            setLoading(false);
        }
    }, [api]);

    const updateDueDate = useCallback(async () => {
        try {
            api.updateDueDate(user, selectedUc.codigo, dayOptionSelected);
            Toast.show({
                type: 'success',
                text1: 'Informações alteradas com sucesso!',
            });
            closeModal()
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Falha ao salvar, tente novamente.',
                text2: error.message
            });
        }
    }, [user, selectedUc, dayOptionSelected])

    const closeModal = async () => {
        setVisible(false);
    }

    const openUpdateDueDateModal = async (item) => {
        setSelectedUc(item);
        getDueDate(item.codigo, user);
        setVisible(true);
    }

    useEffect(() => {
        setSessionLogin();
        getLoggedUser();
        getUcs();
    }, [getUcs]);

    return (
        <Layout loading={loading} style={{ height: '100%' }}>
            <TopNavigation title="Alterar dia de vencimento" alignment="center" accessoryLeft={renderBackAction} />
            <ScrollView>
                {
                    ucs.map((item) => (
                        <TouchableNativeFeedback key={`uc-item-${item.codigo}`} style={{ marginTop: 10 }}>
                            <Card onPress={() => openUpdateDueDateModal(item)}>
                                <Text>
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
                }
            </ScrollView>
            <Modal
                visible={visible}
                hardwareAccelerated
                style={{
                    width: Dimensions.get('window').width,
                    height: Dimensions.get('window').height * 0.5, // 50% da altura da tela
                }}
                backdropStyle={styles.backdrop}
            >
                <Card
                    disabled
                >
                    <Layout
                        level='1'
                        style={{ height: Dimensions.get('window').height * 0.2 }} // 50% da altura da tela
                        loading={loading}
                    >
                        <TopNavigation title="Alterar dia de vencimento" alignment="center" />
                        <NativeBaseProvider>
                            <FormControl>
                                <FormControl.Label style={{ marginLeft: "35%" }}>Escolher Dia</FormControl.Label>
                                {
                                    dataDueDate.map((item) => {
                                        return (
                                            <Select
                                                onValueChange={itemValue => setDayOptionSelected(itemValue)}
                                                _selectedItem={item.diaOpcaoVencimento}
                                                placeholder={item.diaOpcaoVencimento}
                                            >
                                                <Select.Item key="1" label="1" value="1" />
                                                <Select.Item key="5" label="5" value="5" />
                                                <Select.Item key="10" label="10" value="10" />
                                                <Select.Item key="15" label="15" value="15" />
                                                <Select.Item key="20" label="20" value="20" />
                                                <Select.Item key="25" label="25" value="25" />
                                            </Select>
                                        )
                                    })
                                }
                            </FormControl>
                        </NativeBaseProvider>
                    </Layout>
                    <SafeAreaView style={{ marginTop: 'auto' }}>
                    <View>
                        <Button
                            style={{ backgroundColor: '#4169E1', borderColor: '#4169E1' }}
                            onPress={() => updateDueDate()}
                        >
                            Salvar
                        </Button>
                        <Button
                            style={{ backgroundColor: '#a6ce39', borderColor: '#a6ce39' }}
                            onPress={() => closeModal()}
                        >
                            Voltar
                        </Button>
                    </View>
                </SafeAreaView>
                </Card>
                <Divider />
            </Modal>
            <Toast />
        </Layout>
    )
};

const styles = StyleSheet.create({
    container: {
      minHeight: 192,
    },
    backdrop: {
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
  });