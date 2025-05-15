// Isadora Gomes da Silva
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import RealizarLogin from './src/screens/realizarLogin';
import PaginaPrincipal from './src/screens/paginaPrincipal';
import EditarPerfil from './src/screens/editarPerfil';

import ListarImagens from './src/screens/listarImg';
import UploadImagens from './src/screens/uploadImg';
import ListarVideos from './src/screens/listarVideo';
import UploadVideos from './src/screens/uploadVideo';

import AdicionarUser from './src/screens/adicionarUsuario';

const Stack = createNativeStackNavigator();
const App = () => (
// name é a identificação da tela
  <NavigationContainer>
    <Stack.Navigator initialRouteName='RealizarLogin' screenOptions={{ headerShown: false }}>
      <Stack.Screen name="RealizarLogin" component={RealizarLogin} /> 
      <Stack.Screen name="PaginaPrincipal" component={PaginaPrincipal} />
      <Stack.Screen name="EditarPerfil" component={EditarPerfil} />
      <Stack.Screen name="ListarImagens" component={ListarImagens} />
      <Stack.Screen name="UploadImagens" component={UploadImagens} />
      <Stack.Screen name="ListarVideos" component={ListarVideos} />
      <Stack.Screen name="UploadVideos" component={UploadVideos} />
      <Stack.Screen name="AdicionarUser" component={AdicionarUser} />
    </Stack.Navigator>
  </NavigationContainer>
);
export default App;