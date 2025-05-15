import React, { useState } from "react";
import {
  View,
  TextInput,
  Button,
  Alert,
  Image,
  StyleSheet,
  TouchableOpacity,
  Text,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "./supabaseConfig";
import * as FileSystem from "expo-file-system";
import * as Notifications from "expo-notifications";

// Função para registrar o usuário
const registerUser = async (email, password, nome, imageUri) => {
  try {
    // Desloga qualquer usuário atual para evitar conflito de ID
    await supabase.auth.signOut();

    const { data: signUpData, error: signUpError } =
      await supabase.auth.signUp({
        email,
        password,
      });

    if (signUpError) throw signUpError;

    const userId = signUpData.user.id;
    const fileName = imageUri.substring(imageUri.lastIndexOf("/") + 1);
    const fileType = "image/jpeg";

    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("profile-photos")
      .upload(`${userId}/${fileName}`, {
        uri: `data:${fileType};base64,${base64}`,
        name: fileName,
        type: fileType,
        contentType: fileType,
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage
      .from("profile-photos")
      .getPublicUrl(`${userId}/${fileName}`);

    const photoURL = publicUrlData.publicUrl;

    const { error: dbError } = await supabase
      .from("users")
      .insert([{ id: userId, nome, email, photo_url: photoURL }]);

    if (dbError) throw dbError;

    console.log("Usuário registrado com sucesso!");
    return signUpData.user;
  } catch (error) {
    console.error("Erro ao registrar usuário:", error);
    throw error;
  }
};

const CadastroScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nome, setNome] = useState("");
  const [imageUri, setImageUri] = useState(null);

  // Função para escolher a imagem de perfil
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  // Função para lidar com o cadastro
  const handleRegister = async () => {
    if (email && password && nome && imageUri) {
      await registerUser(email, password, nome, imageUri);
      Alert.alert("Sucesso", "Usuário registrado com sucesso!");
      navigation.goBack();

      // Notificação local após adicionar jogador
      const permissao = await requestLocalNotificationPermission();

      if (permissao) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Novo usuário cadastrado!",
            body: `${nome} foi incluído no banco.`,
            sound: true,
          },
          trigger: null,
        });
      }
    } else {
      Alert.alert("Erro", "Por favor, preencha todos os campos.");
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Nome"
        value={nome}
        onChangeText={setNome}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        <Text style={styles.imagePickerText}>
          {imageUri ? "Imagem Selecionada" : "Selecionar Imagem"}
        </Text>
      </TouchableOpacity>
      {imageUri && (
        <Image source={{ uri: imageUri }} style={styles.imagePreview} />
      )}
      <Button title="Registrar" onPress={handleRegister} />
    </View>
  );
};

export default CadastroScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#f0f0f0",
  },
  input: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
  },
  imagePicker: {
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: "center",
  },
  imagePickerText: {
    color: "#fff",
    fontWeight: "bold",
  },
  imagePreview: {
    width: "100%",
    height: 200,
    marginBottom: 15,
    borderRadius: 10,
  },
});
