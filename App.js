// Isadora Gomes da Silva e Ana Lívia Lopes 
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import RealizarLogin from './src/screens/RealizarLogin';
import PaginaPrincipal from './src/screens/paginaPrincipal';
import EditarPerfil from './src/screens/Perfil';

import ListarImagens from './src/screens/ListarImg';
import UploadImagens from './src/screens/UploadImg';
import ListarVideos from './src/screens/ListarVideos';
import UploadVideos from './src/screens/UploadVideo';

import Cadastro from './src/screens/Cadastro';

const Stack = createNativeStackNavigator();
const App = () => (
  <NavigationContainer>
    <Stack.Navigator initialRouteName='UploadVideos' screenOptions={{ headerShown: false }}>
      <Stack.Screen name="RealizarLogin" component={RealizarLogin} /> 
      <Stack.Screen name="PaginaPrincipal" component={PaginaPrincipal} />
      <Stack.Screen name="EditarPerfil" component={EditarPerfil} />
      <Stack.Screen name="ListarImagens" component={ListarImagens} />
      <Stack.Screen name="UploadImagens" component={UploadImagens} />
      <Stack.Screen name="ListarVideos" component={ListarVideos} />
      <Stack.Screen name="UploadVideos" component={UploadVideos} />
      <Stack.Screen name="Cadastro" component={Cadastro} />
    </Stack.Navigator>
  </NavigationContainer>
);
export default App;