import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Importando AsyncStorage

export default function CadastrarUsuario({ navigation }) {
  const [formData, setFormData] = useState({
    nome: "",
    rua: "",
    numero: "",
    cidade: "",
    estado: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Função para normalizar o texto removendo os acentos
  const normalizeText = (text) =>
    text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      // Normalizando o endereço para remover os acentos
      const address = normalizeText(
        `${formData.rua}, ${formData.cidade}, ${formData.estado}`
      );
      const result = await Location.geocodeAsync(address);

      if (result.length === 0) {
        setError("Não foi possível encontrar o endereço.");
        setLoading(false);
        return;
      }

      const { latitude, longitude } = result[0];

      // Criando um novo usuário com latitude e longitude
      const newUser = { ...formData, latitude, longitude };

      // Recuperando usuários atuais do AsyncStorage
      const users = await AsyncStorage.getItem("users");
      const usersArray = users ? JSON.parse(users) : [];

      // Salvando o novo usuário no AsyncStorage
      usersArray.push(newUser);
      await AsyncStorage.setItem("users", JSON.stringify(usersArray));

      // Navegando para a tela principal
      navigation.goBack();

      setLoading(false);
    } catch (error) {
      setError("Erro ao cadastrar usuário. Tente novamente.");
      setLoading(false);
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cadastrar Usuário</Text>

      <Text>Nome:</Text>
      <TextInput
        style={styles.input}
        value={formData.nome}
        onChangeText={(value) => handleChange("nome", value)}
        placeholder="Digite seu nome"
      />

      <Text>Rua:</Text>
      <TextInput
        style={styles.input}
        value={formData.rua}
        onChangeText={(value) => handleChange("rua", value)}
        placeholder="Digite a rua"
      />

      <Text>Número:</Text>
      <TextInput
        style={styles.input}
        value={formData.numero}
        onChangeText={(value) => handleChange("numero", value)}
        placeholder="Digite o número"
      />

      <Text>Cidade:</Text>
      <TextInput
        style={styles.input}
        value={formData.cidade}
        onChangeText={(value) => handleChange("cidade", value)}
        placeholder="Digite sua cidade"
      />

      <Text>Estado:</Text>
      <TextInput
        style={styles.input}
        value={formData.estado}
        onChangeText={(value) => handleChange("estado", value)}
        placeholder="Digite seu estado"
      />

      <Button title="Salvar" onPress={handleSubmit} />

      {loading && <ActivityIndicator size="large" color="#3498DB" />}
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  errorText: {
    color: "red",
    marginTop: 10,
    fontSize: 16,
  },
});
