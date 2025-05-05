import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Importando AsyncStorage

function CadastrarUsuario({ navigation }) {
  const [formData, setFormData] = useState({
    nome: "",
    rua: "",
    numero: "",
    cidade: "",
    estado: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const { rua, cidade, estado } = formData;

    // Verificando se todos os campos foram preenchidos
    if (!rua || !cidade || !estado) {
      setError("Por favor, preencha todos os campos.");
      setLoading(false);
      return;
    }

    try {
      // Usando GeocodeAsync para obter a latitude e longitude do endereço
      const address = `${rua}, ${cidade}, ${estado}`;
      const result = await Location.geocodeAsync(address);

      if (result.length === 0) {
        setError("Não foi possível encontrar o endereço.");
        setLoading(false);
        return;
      }

      const { latitude, longitude } = result[0];

      // Dados do usuário com latitude e longitude
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

      <View style={styles.inputGroup}>
        <Text>Nome:</Text>
        <TextInput
          style={styles.input}
          value={formData.nome}
          onChangeText={(value) => handleChange("nome", value)}
          placeholder="Digite seu nome"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text>Rua:</Text>
        <TextInput
          style={styles.input}
          value={formData.rua}
          onChangeText={(value) => handleChange("rua", value)}
          placeholder="Digite sua rua"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text>Número:</Text>
        <TextInput
          style={styles.input}
          value={formData.numero}
          onChangeText={(value) => handleChange("numero", value)}
          placeholder="Digite o número"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text>Cidade:</Text>
        <TextInput
          style={styles.input}
          value={formData.cidade}
          onChangeText={(value) => handleChange("cidade", value)}
          placeholder="Digite sua cidade"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text>Estado:</Text>
        <TextInput
          style={styles.input}
          value={formData.estado}
          onChangeText={(value) => handleChange("estado", value)}
          placeholder="Digite seu estado"
        />
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Button
        title={loading ? "Cadastrando..." : "Salvar"}
        onPress={handleSubmit}
        disabled={loading}
      />
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
  inputGroup: {
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginTop: 5,
  },
  errorText: {
    color: "red",
    marginBottom: 10,
  },
});

export default CadastrarUsuario;
