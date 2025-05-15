import React, { useState } from "react";
import * as DocumentPicker from "expo-document-picker";
import { supabase } from '../../supabaseConfig';
import * as Filesystem from "expo-file-system";
import {
  View,
  Text,
  Pressable,
  Alert,
  Modal,
  TextInput,
  StyleSheet,
} from "react-native";

export default function UploadVideo({ navigation }) {
  const [video, setVideo] = useState(null);
  const [category, setCategory] = useState("");
  const [uploading, setUploading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const pickVideo = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "video/*",
        copyToCacheDirectory: true,
      });

      const asset = result.assets && result.assets.length > 0 ? result.assets[0] : null;

      if (asset && asset.uri) {
        const selectedVideo = {
          name: asset.name || "video.mp4",
          type: asset.mimeType || "video/mp4",
          uri: asset.uri,
        };
        setVideo(selectedVideo);
        setModalVisible(true);
      } else {
        Alert.alert("Erro", "Nenhum vídeo selecionado.");
      }
    } catch (error) {
      console.error("Erro ao selecionar vídeo: ", error);
      Alert.alert("Erro", "Não foi possível selecionar o vídeo.");
    }
  };

  const uploadVideo = async () => {
    if (!video || !category) {
      Alert.alert("Erro", "Por favor, selecione um vídeo e uma categoria.");
      return;
    }

    setUploading(true);
    setModalVisible(false);

    try {
      const timestamp = new Date().getTime();
      const filePath = `${category}/${timestamp}_${video.name}`;
      const uploadUrl = `https://gwdmdizewzrlshblun.supabase.co/storage/v1/object/videos/${filePath}`;

      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      const token = sessionData.session?.access_token;
      if (!token) throw new Error("Token de acesso não encontrado");

      const result = await Filesystem.uploadAsync(uploadUrl, video.uri, {
        httpMethod: "PUT",
        headers: {
          "Content-Type": video.type || "video/mp4",
          Authorization: `Bearer ${token}`,
        },
        uploadType: Filesystem.FileSystemUploadType.BINARY_CONTENT,
      });

      if (result.status !== 200) {
        console.error("Erro de status no upload:", result);
        Alert.alert("Erro", "Falha ao enviar o vídeo.");
      } else {
        Alert.alert("Sucesso", "Vídeo enviado com sucesso!");
        setVideo(null);
        navigation.goBack();
      }
    } catch (error) {
      console.error("Erro inesperado no upload:", error);
      Alert.alert("Erro", "Erro inesperado durante o upload.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Pressable style={styles.botao} onPress={pickVideo}>
        <Text style={styles.botaoTexto}>Selecionar Vídeo</Text>
      </Pressable>

      {video && (
        <View style={styles.videoInfo}>
          <Text style={styles.videoText}>Vídeo selecionado: {video.name}</Text>
        </View>
      )}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitulo}>Digite a categoria do vídeo:</Text>
            <TextInput
              value={category}
              onChangeText={setCategory}
              placeholder="Categoria"
              style={styles.input}
            />
            <Pressable
              style={styles.botao}
              onPress={uploadVideo}
            >
              <Text style={styles.botaoTexto}>Enviar Vídeo</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {uploading && (
        <View style={styles.uploadingContainer}>
          <Text style={styles.uploadingText}>Enviando vídeo...</Text>
        </View>
      )}

      <Pressable
        style={styles.logoutBotao}
        onPress={() => navigation.navigate("PaginaPrincipal")}
      >
        <Text style={styles.textBotaoOut}>Voltar</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#D9EAFD',
  },
  botao: {
    backgroundColor: '#4169E1',
    paddingVertical: 18,
    paddingHorizontal: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  botaoTexto: {
    color: '#fff',
    fontSize: 19,
    fontWeight: 'bold',
    fontFamily: 'Gotham, sans-serif',
  },
  videoInfo: {
    marginTop: 10,
    alignItems: 'center',
  },
  videoText: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'Gotham, sans-serif',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  modalTitulo: {
    marginBottom: 10,
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Gotham, sans-serif',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 5,
    marginBottom: 20,
  },
  uploadingContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  uploadingText: {
    fontSize: 16,
    color: '#666',
  },
  logoutBotao: {
    backgroundColor: 'red',
    borderRadius: 10,
    padding: 7,
    width: 100,
    alignSelf: 'center',
    marginTop: 120,
    marginBottom: 30,
  },
  textBotaoOut: {
    textAlign: 'center',
    fontFamily: 'Gotham, sans-serif',
    color: 'white',
    fontWeight: '400',
    fontSize: 18,
  },
});
