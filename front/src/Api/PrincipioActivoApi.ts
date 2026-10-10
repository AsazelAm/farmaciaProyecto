import api from "../lib/Axios";
import { isAxiosError } from "axios";
import { PrincipioActivoShcemas } from "../types";

export async function GetPrincipioActivoApi() {
  try {
    const { data } = await api.get("/PrincipioActivo/GetPrincipioActivo");
    const response = PrincipioActivoShcemas.safeParse(data);
    if (response.success) {
      return response.data;
    }
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error);
    }
  }
}