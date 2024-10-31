import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { IUc, IUcDetail, Pessoa } from '../@types/uc';
import { API_PATH } from '../utils/constants';

const getToken = () => AsyncStorage.getItem('@CogesanAuth:token');

const getCity = async () => {
  const city = await AsyncStorage.getItem('@CogesanAuth:city');

  return city ? JSON.parse(city) : null;
};

const listAllUcs = async () => {
  const token = await getToken();

  if (!token) {
    throw new Error('Sessão não encontrada, faça o login');
  }
  const headers = { Authorization: `Bearer ${token}` };

  return await axios.get<IUc[]>(`${API_PATH}/listar-ucs`, { headers });
};

const ucsDetail = async (codUc: number) => {
  const token = await getToken();

  if (!token) {
    throw new Error('Sessão não encontrada, faça o login');
  }
  const headers = { Authorization: `Bearer ${token}` };

  const {
    data: { documentos },
  } = await axios.get(`${API_PATH}/detalhe-uc?uc=${codUc}`, { headers });
  return documentos as IUcDetail[];
};

const verifyCity = (cityId?: string) =>
  axios.get(`${API_PATH}/verificar-cidade`, {
    params: {
      id: cityId,
    },
  });

const listPeople = async (item) => {
  const token = await getToken();

  if (!token) {
    throw new Error('Sessão não encontrada, faça o login');
  }

  const headers = { Authorization: `Bearer ${token}` };

  return axios.get(`${API_PATH}/listar-pessoa?cpf=${item}`, { headers });
}

const updatePeople = async (
  cpf: string, 
  nome: string, 
  celular: string, 
  email: string, 
  bairro: string, 
  logradouro: string, 
  numero: string, 
  quadra: string, 
  cep: string, 
  complemento: string, 
  lote: string
) => {
  const token = await getToken();

  if (!token) {
    throw new Error('Sessão não encontrada, faça o login');
  }

  const headers = { Authorization: `Bearer ${token}` };
  return axios.post(`${API_PATH}/update-pessoa/`, {
    CpfCnpj: cpf,
    Nome: nome,
    Celular: celular,
    Email: email,
    Bairro: bairro,
    Logradouro: logradouro,
    Numero: numero,
    Quadra: quadra,
    Cep: cep,
    Complemento: complemento,
    Lote: lote, 
  }, { headers })
}

const listCities = async () => {
  const token = await getToken();

  if (!token) {
    throw new Error('Sessão não encontrada, faça o login');
  }

  const headers = { Authorization: `Bearer ${token}` };

  return axios.get(`${API_PATH}/listar-municipios`, { headers });
}

const listAddress = async (item) => {
  const token = await getToken();

  if (!token) {
    throw new Error('Sessão não encontrada, faça o login');
  }

  const headers = { Authorization: `Bearer ${token}` };

  return axios.get(`${API_PATH}/listar-logradouro?Id=${item}`, { headers });
}

const listNeighborhood = async (item) => {
  const token = await getToken();

  if (!token) {
    throw new Error('Sessão não encontrada, faça o login');
  }

  const headers = { Authorization: `Bearer ${token}` };

  return axios.get(`${API_PATH}/listar-bairros?Id=${item}`, { headers });
}

const getDueDate = async (codigo: string, cpf: string) => {
  const token = await getToken();
  
  if (!token) {
    throw new Error('Sessão não encontrada, faça o login');
  }

  const headers = { Authorization: `Bearer ${token}` };

  return axios.get(`${API_PATH}/get-dia-vencimento-uc?CpfCnpj=${cpf}&Codigo=${codigo}`, { headers });
}

const updateDueDate = async (Cpf: string, Uc: string, Dia: string) => {
  const token = await getToken();

  if (!token) {
    throw new Error('Sessão não encontrada, faça o login');
  }

  const headers = { Authorization: `Bearer ${token}` };
  return axios.post(`${API_PATH}/update-dia-vencimento-uc?Cpf=${Cpf}&Uc=${Uc}&DiaOpcao=${Dia}`, { headers });
}

const getLogos = async (Id) => {
  return axios.get(`${API_PATH}/get-logo-org?Id=${Id}`);
}

const getBanks = async (Id: string) => {
  const token = await getToken();

  if (!token) {
    throw new Error('Sessão não encontrada, faça o login');
  }

  const headers = { Authorization: `Bearer ${token}` };
  return axios.get(`${API_PATH}/get-bancos-org?Id=${Id}`, { headers });
}

const getWhatsapp = async (Id: string) => {
  const token = await getToken();

  if (!token) {
    throw new Error('Sessão não encontrada, faça o login');
  }

  const headers = { Authorization: `Bearer ${token}` };
  return axios.get(`${API_PATH}/get-whatsapp-org?Id=${Id}`, { headers });
}

export { 
  getToken, 
  getCity, 
  listAllUcs, 
  ucsDetail, 
  verifyCity, 
  listPeople, 
  updatePeople, 
  listCities, 
  listAddress, 
  getDueDate, 
  updateDueDate,
  getLogos,
  getBanks,
  getWhatsapp,
  listNeighborhood
};

