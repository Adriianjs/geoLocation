import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Button,
  FlatList,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import useLocation from "../hooks/useLocation";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Importando AsyncStorage

export default function Main({ navigation }) {
  const { coords, errorMsg } = useLocation();
  const [usuarios, setUsuarios] = useState([]);

  // Carregar usuários do AsyncStorage ao montar o componente
  useEffect(() => {
    const loadUsuarios = async () => {
      try {
        const storedUsers = await AsyncStorage.getItem("users");
        if (storedUsers) {
          setUsuarios(JSON.parse(storedUsers)); // Carregar os usuários armazenados
        }
      } catch (error) {
        console.error("Erro ao carregar usuários:", error);
      }
    };

    loadUsuarios();
  }, []);

  // Atualizar a lista de usuários se um novo for adicionado
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      try {
        const storedUsers = await AsyncStorage.getItem("users");
        if (storedUsers) {
          setUsuarios(JSON.parse(storedUsers)); // Carregar os usuários armazenados ao voltar à tela
        }
      } catch (error) {
        console.error("Erro ao carregar usuários:", error);
      }
    });

    return unsubscribe; // Limpar o listener ao sair da tela
  }, [navigation]);

  if (errorMsg) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{errorMsg}</Text>
      </View>
    );
  }

  if (!coords) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3498DB" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: coords.latitude,
          longitude: coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation={true}
      >
        <Marker
          coordinate={{
            latitude: coords.latitude,
            longitude: coords.longitude,
          }}
          title="Você está aqui"
          description="Localização atual"
        />
        {/* Adicionando marcadores para os usuários */}
        {usuarios.map((usuario, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: usuario.latitude,
              longitude: usuario.longitude,
            }}
            title={usuario.nome}
            description={`${usuario.rua}, ${usuario.cidade}, ${usuario.estado}`}
          />
        ))}
      </MapView>

      <View style={styles.content}>
        <Button
          title="Cadastrar Usuário"
          onPress={() => navigation.navigate("CadastrarUsuario")} // Navegação funcionando aqui
        />

        <Text style={styles.title}>Usuários Cadastrados:</Text>

        <FlatList
          data={usuarios}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.userItem}>
              <Text>
                {item.nome} - {item.cidade}, {item.estado}
              </Text>
            </View>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 20,
  },
  errorText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
  },
  title: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  userItem: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    marginBottom: 8,
    borderRadius: 5,
  },
});
