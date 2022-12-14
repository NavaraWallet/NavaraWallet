/**
 * @format
 */

 DEV = false

import 'react-native-get-random-values';
import '@ethersproject/shims';
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import 'text-encoding-polyfill'
import './shim'

AppRegistry.registerComponent(appName, () => App);
