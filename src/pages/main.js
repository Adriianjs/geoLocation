import React, { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import useLocation from "../hooks/useLocation";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  FAB,
  Portal,
  Modal,
  Provider as PaperProvider,
} from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";

export default function Main({ navigation }) {
  const { coords, errorMsg } = useLocation();
  const [usuarios, setUsuarios] = useState([]);
  const [menuVisivel, setMenuVisivel] = useState(false);
  const mapRef = useRef(null);

  useEffect(() => {
    const loadUsuarios = async () => {
      try {
        const storedUsers = await AsyncStorage.getItem("users");
        if (storedUsers) {
          setUsuarios(JSON.parse(storedUsers));
        }
      } catch (error) {
        console.error("Erro ao carregar usuários:", error);
      }
    };
    loadUsuarios();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      try {
        const storedUsers = await AsyncStorage.getItem("users");
        if (storedUsers) {
          setUsuarios(JSON.parse(storedUsers));
        }
      } catch (error) {
        console.error("Erro ao carregar usuários:", error);
      }
    });
    return unsubscribe;
  }, [navigation]);

  const irParaUsuario = (latitude, longitude) => {
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  const deletarUsuario = async (index) => {
    const novaLista = [...usuarios];
    novaLista.splice(index, 1);
    setUsuarios(novaLista);
    await AsyncStorage.setItem("users", JSON.stringify(novaLista));
  };

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
    <PaperProvider>
      <View style={styles.container}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={{
            latitude: coords.latitude,
            longitude: coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          showsUserLocation={true}
        >
          {usuarios.map((usuario, index) => (
            <Marker
              key={index}
              coordinate={{
                latitude: usuario.latitude,
                longitude: usuario.longitude,
              }}
              title={usuario.nome}
              description={`${usuario.rua}, ${usuario.numero}`}
            />
          ))}
        </MapView>

        <Portal>
          <Modal
            visible={menuVisivel}
            onDismiss={() => setMenuVisivel(false)}
            contentContainerStyle={styles.modal}
          >
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                setMenuVisivel(false);
                navigation.navigate("CadastrarUsuario");
              }}
            >
              <Text style={styles.buttonText}>Cadastrar Usuário</Text>
            </TouchableOpacity>

            <Text style={styles.title}>Usuários Cadastrados:</Text>

            <FlatList
              data={usuarios}
              keyExtractor={(_, index) => index.toString()}
              renderItem={({ item, index }) => (
                <View style={styles.userItem}>
                  <TouchableOpacity
                    style={{ flex: 1 }}
                    onPress={() => {
                      irParaUsuario(item.latitude, item.longitude);
                      setMenuVisivel(false);
                    }}
                  >
                    <Text>{item.nome}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deletarUsuario(index)}>
                    <Ionicons name="trash" size={20} />
                  </TouchableOpacity>
                </View>
              )}
            />
          </Modal>
        </Portal>

        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => setMenuVisivel(true)}
        />
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
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
  modal: {
    backgroundColor: "white",
    padding: 20,
    margin: 20,
    borderRadius: 10,
    maxHeight: "80%",
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: "#3498DB",
  },
  button: {
    backgroundColor: "#3498DB",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
