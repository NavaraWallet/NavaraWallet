import AsyncStorage from '@react-native-async-storage/async-storage';
import {IAppLockState} from '../data/types';
import {getUniqueId} from 'react-native-device-info';
interface ILocalStorage {
  set(key: string, value: number | string | object): Promise<void>;
  get(key: string): Promise<string | number | object | null>;
  remove(key: string): Promise<void>;
}
var CryptoJS = require('crypto-js');
export const localStorage: ILocalStorage = {
  set: async (key, value) => {
    return await AsyncStorage.setItem(key, JSON.stringify(value));
  },

  get: async key => {
    try {
      const value = await AsyncStorage.getItem(key);
      if (!!value) {
        return JSON.parse(value);
      } else {
        return null;
      }
    } catch (e) {
      return null;
    }
  },
  remove: async key => await AsyncStorage.removeItem(key),
};

export const STORAGE_APP_LOCK = 'STORAGE_APP_LOCK';
export const STORAGE_TYPE_BIOMETRIC = 'STORAGE_TYPE_BIOMETRIC';
export const ALLOW_ENTER_PINCODE = 'ALLOW_ENTER_PINCODE';
export const NAME_WALLETS = 'NAME_WALLETS';
export const SEED_PHRASE = 'SEED_PHRASE';
export const YOUR_DOMAIN = 'YOUR_DOMAIN';

export const SEED_PHRASE_CLEAR_TEXT = 'SEED_PHRASE_CLEAR_TEXT';
export const LIST_WALLETS = 'LIST_WALLETS';
export const LIST_CHAINS = 'LIST_CHAINS';

export const GOOGLE_ACCESS_TOKEN = 'GOOGLE_ACCESS_TOKEN';

export const COLOR_SCHEME = 'COLOR_SCHEME';
export const CURRENCY_SYMBOL = 'CURRENCY_SYMBOL';
export const LOCALES = 'LOCALES'; //Use this to store the locale along with the language
export const BROWSER_TABS = 'BROWSER_TABS';
export const BROWSER_HISTORY = 'BROWSER_HISTORY';
export const BROWSER_SETTINGS = 'BROWSER_SETTINGS';
export const TYPE_NETWORKS = 'TYPE_NETWORKS';
export const ENABLE_NETWORKS = 'ENABLE_NETWORKS';
export const COLOR_MODE = 'COLOR_MODE';

export const SELECTED_WALLET = 'SELECTED_WALLET';
