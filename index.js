/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { registerNotifeeHandlers } from './src/utils/notification';
registerNotifeeHandlers();

AppRegistry.registerComponent(appName, () => App);
