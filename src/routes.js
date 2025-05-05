import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import Main from "./pages/main"; // Tela Principal
import CadastrarUsuario from "./pages/cadastrarUsuario"; // Tela de Cadastro

const Stack = createStackNavigator();

export default function Routes() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Main" component={Main} options={{ title: "Mapa" }} />
      <Stack.Screen
        name="CadastrarUsuario"
        component={CadastrarUsuario}
        options={{ title: "Cadastrar Usuário" }}
      />
    </Stack.Navigator>
  );
}
