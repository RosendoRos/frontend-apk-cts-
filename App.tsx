import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './LoginScreen';
import ScannerScreen from './ScannerScreen';
import AdminScreen from './AdminScreen';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Welcome">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Scanner" component={ScannerScreen} />
        <Stack.Screen name='AdminScreen' component={AdminScreen}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
};


import { AppRegistry } from 'react-native';

// Reemplaza 'nombre-de-tu-app' con el nombre de tu proyecto (de package.json)
AppRegistry.registerComponent('ctsasistencia', () => App);

export default App;