import 'react-native-gesture-handler';
import 'react-native-screens';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { LoggerService } from './src/services/logger.service';
import { alertService } from './src/services/alert.service';

LoggerService.initGlobalErrorHandler();
alertService.init();

AppRegistry.registerComponent(appName, () => App);

