import axios, { AxiosRequestConfig, ResponseType, GenericAbortSignal, CanceledError } from "axios";

import { store } from "@/store";
import { i18nInstance } from "@/ui/plugins/i18n";
import { Auth } from "@/utils/Auth";
import { envApi, envMpcApi } from "@/utils/env";

export default class API {
  /**
   * Fetch data from any API
   * @param config request config
   */
  static async baseFetch(config: AxiosRequestConfig): Promise<any> {
    try {
      const accessToken = await Auth.getValidAccessToken();
      const res = await axios({
        ...config,
        headers: { ...config.headers, authorization: `Bearer ${accessToken}` },
      });
      return res.data;
    } catch (err: any) {
      const handledErrors = [400, 401, 500];
      if (err instanceof CanceledError) {
        return;
      } else if (handledErrors.includes(err?.response?.status)) {
        store.commit(
          "app/setReport",
          {
            type: "error",
            message: i18nInstance.t(`errorMessages.apiErrorTexts.${err?.response?.status}`),
            value: true,
          },
          { root: true },
        );
      } else {
        store.commit(
          "app/setReport",
          { type: "error", message: err?.message ?? "error", value: true },
          { root: true },
        );
      }
      throw err;
    }
  }

  /**
   * Fetch data from lynus API
   * @param {string} url request URL path
   * @param {'GET'|'POST'|'PUT'|'DELETE'} method request method
   * @param body
   * @param {object} headers request headers
   * @param responseType
   */
  static async fetch(
    url: string,
    method: "GET" | "POST" | "PUT" | "DELETE",
    body?: unknown,
    headers?: any,
    responseType?: ResponseType,
    signal?: GenericAbortSignal,
  ): Promise<any> {
    return API.baseFetch({
      baseURL: envApi,
      url,
      method,
      data: body,
      headers,
      responseType,
      signal,
    });
  }
}
