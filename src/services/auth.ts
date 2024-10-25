import axios from "axios";
import { IAuthResponse } from "../@types/auth";
import { API_PATH } from "../utils/constants";

export const signIn = (city, user, password) =>
  axios.post<IAuthResponse>(`${API_PATH}/autenticar`, {
    cidadeId: city?.id,
    usuario: user,
    senha: password,
  });
