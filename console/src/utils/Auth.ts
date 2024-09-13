import axios from "axios";
import moment from "moment";
import * as qs from "qs";

import { envApi, envClientId, envRealm } from "./env";
import { router } from "@/router";
import { store } from "@/store";

const REFRESHTOKEN_COOKIE_NAME = `efficientIO_${envClientId}_${envRealm}_refreshToken`;

/** Class to handle authentication with keycloak enpoint (maybe also function with other openid endpoints) */
export class Auth {
  static didInitialize = false;

  static updateTokenHandler?: NodeJS.Timeout;

  /** check if refhresh token is set in cookie, if so renew access token  */
  static checkCookies(): Promise<void> {
    const refreshToken = this.getCookie(REFRESHTOKEN_COOKIE_NAME);
    if (refreshToken) {
      return this.renewToken(refreshToken, true)
        .catch(() => this.Logout())
        .then(() => this.dispatchStoreAndUpdateToken(true))
        .then(() => {
          this.didInitialize = true;
        });
    }
    this.didInitialize = true;
    return Promise.resolve();
  }

  static updateToken(setCookie = true) {
    this.renewToken(undefined, setCookie)
      .then(() => {
        this.updateTokenHandler = setTimeout(() => this.updateToken(setCookie), 10000);
      })
      .catch(async () => {
        await this.Logout();
      });
  }

  static dispatchStoreAndUpdateToken(setCookie = true) {
    return store.dispatch("permissions/fetchPlatformPermissions").then(() => {
      this.updateTokenHandler = setInterval(() => this.renewToken(undefined, setCookie), 10000);
    });
  }

  /**
   * Resource Owner Password Flow
   *
   * Use username and password to authenticate and set access token in store
   */
  static loginWithUserPassword(user: string, password: string, setCookie = true) {
    return this.callTokenEndpoint(
      {
        client_id: envClientId,
        username: user,
        password,
        grant_type: "password",
      },
      setCookie,
    );
  }

  /**
   * Resource Owner Password Flow
   *
   * Use username and password to authenticate and set access token in store
   */
  static loginWithUserPasswordAndOTP(
    user: string,
    password: string,
    otp: string,
    setCookie = true,
  ) {
    return this.callTokenEndpoint(
      {
        client_id: envClientId,
        username: user,
        password,
        otp,
        grant_type: "otp",
      },
      setCookie,
    ).then(() => {
      Auth.NavigateToRoot();
    });
  }

  /** Renew access token using refresh token, if refresh token is undefined the one from store is used */
  static renewToken(refreshToken?: string, setCookie = false) {
    return this.callTokenEndpoint(
      {
        client_id: envClientId,
        grant_type: "refresh_token",
        refresh_token: refreshToken ?? store.state.app.auth.refreshToken,
      },
      setCookie,
    );
  }

  /** Call open-id token endpoint with given data, and set refreshtoken in cookie */
  static callTokenEndpoint(data: any, setCookie = false) {
    const date = new Date();
    return axios({
      url: Auth.tokenURL(),
      method: "post",
      data: qs.stringify(data),
    })
      .then((res) => {
        if (res.status !== 200) {
          throw new Error(`Error logging in. Got response status: ${res.status}`);
        }
        return res.data;
      })
      .then((data) => {
        store.commit("app/setAuth", {
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          expiresAt: new Date(date.getTime() + 1000 * (data.expires_in - 10)),
          refreshExpiresAt: new Date(date.getTime() + 1000 * (data.refresh_expires_in - 30)),
        });

        const decoded = this.DecodeToken(data.access_token);

        store.commit(
          "app/setUser",
          {
            id: decoded.sub,
            email: decoded.email,
            first_name: decoded.given_name,
            last_name: decoded.family_name,
          } as any,
          { root: true },
        );

        if (setCookie) {
          this.setCookie(REFRESHTOKEN_COOKIE_NAME, data.refresh_token, data.refresh_expires_in);
        }

        return data.access_token as string;
      });
  }

  static DecodeToken(str: string) {
    str = str.split(".")[1];

    str = str.replace(/-/g, "+");
    str = str.replace(/_/g, "/");
    switch (str.length % 4) {
      case 0:
        break;
      case 2:
        str += "==";
        break;
      case 3:
        str += "=";
        break;
      default:
        throw "Invalid token";
    }

    str = decodeURIComponent(escape(atob(str)));

    const decoded = JSON.parse(str);
    return decoded;
  }

  static Logout() {
    this.ClearTimer();

    this.deleteCookie(REFRESHTOKEN_COOKIE_NAME);

    const data = {
      client_id: envClientId,
      refresh_token: store.state.app.auth.refreshToken,
    };

    axios({
      url: Auth.logoutURL(),
      method: "post",
      data: qs.stringify(data),
      headers: {
        authorization: `Bearer ${store.state.app.auth.accessToken}`,
      },
    })
      .then((res) => {
        store.commit("app/setAuth", {
          accessToken: "",
          refreshToken: "",
          expiresAt: new Date(-8640000000000000),
          refreshExpiresAt: new Date(-8640000000000000),
        });
      })
      .finally(() => Auth.NavigateToRoot())
      .catch(() => {});
  }

  static NavigateToRoot() {
    window.location.replace("/#/login");
    window.location.reload();
  }

  static ClearTimer() {
    if (this.updateTokenHandler) {
      clearInterval(this.updateTokenHandler);
    }
  }

  static async registrationAllowed(): Promise<boolean> {
    return axios({
      url: Auth.registerURL(),
      method: "get",
    }).then((res) => {
      if (res.status !== 200) {
        throw new Error(`Error loging in. Got response status: ${res.status}`);
      }
      return res.data as boolean;
    });
  }

  static Register(data: any, invite: string | undefined = undefined) {
    const url = invite ? `${Auth.registerURL()}&invite=${invite}` : Auth.registerURL();

    return axios({
      url,
      method: "post",
      data,
    }).then((res) => {
      if (res.status !== 200) {
        throw new Error(`Error loging in. Got response status: ${res.status}`);
      }
      return res.data;
    });
  }

  static ResetPassword(email: string) {
    return axios({
      url: Auth.resetPasswordURL(),
      method: "post",
      data: qs.stringify({ email }),
    }).then((res) => {
      if (res.status !== 200) {
        throw new Error(`Error loging in. Got response status: ${res.status}`);
      }
      return res.data;
    });
  }

  /** Endpoint URLs */
  static getRealmUrl(): string {
    return `${envApi}/auth/${envRealm}`;
  }

  static resetPasswordURL(): string {
    return `${Auth.getRealmUrl()}/resetPassword`;
  }

  static tokenURL(): string {
    return `${Auth.getRealmUrl()}/token`;
  }

  static logoutURL(): string {
    return `${Auth.getRealmUrl()}/logout`;
  }

  static userinfoURL(): string {
    return `${Auth.getRealmUrl()}/protocol/openid-connect/userinfo`;
  }

  /** Registrations endpoint is not part of openid-connect but uses the same endpoint as template registration page */
  static registerURL(): string {
    return `${Auth.getRealmUrl()}/signup?client_id=${envClientId}`;
  }

  /*
   * General utils for managing cookies in Typescript.
   */
  static setCookie(name: string, value: string, expiresIn: number) {
    localStorage.setItem(
      name,
      JSON.stringify({ val: value, exp: moment().add(expiresIn, "seconds") }),
    );

    document.cookie = `${name}=${value}; Max-Age=${expiresIn};`;
  }

  static getCookie(name: string) {
    const locStr = localStorage.getItem(name);
    if (!locStr) {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);

      if (parts.length === 2) {
        return parts.pop()?.split(";").shift();
      }
      return;
    }

    const locItem: { val: string; exp: moment.Moment } = JSON.parse(locStr);
    if (moment() > moment(locItem.exp)) {
      return;
    }
    return locItem.val;
  }

  static deleteCookie(name: string) {
    const date = new Date();

    // Set it expire in -1 days
    date.setTime(date.getTime() + -1 * 24 * 60 * 60 * 1000);

    // Set it
    document.cookie = `${name}=; expires=${date.toUTCString()}; path=/`;
    localStorage.removeItem(name);
  }

  static async getValidAccessToken(): Promise<string> {
    const { expiresAt, accessToken } = store.state.app.auth;
    let expiresAtMoment: moment.Moment;
    if (expiresAt == null) {
      expiresAtMoment = moment();
    } else {
      expiresAtMoment = moment(expiresAt);
    }
    const mustRenewAccessToken = moment() > expiresAtMoment.subtract(1, "minute");
    if (mustRenewAccessToken || accessToken == null) {
      return Auth.renewToken();
    } else {
      return Promise.resolve(accessToken);
    }
  }
}
