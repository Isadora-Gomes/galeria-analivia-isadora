import * as DocumentPicker from "expo-document-picker";
import { Picker } from "@react-native-picker/picker";
import { supabase } from '../../supabaseConfig';
import * as Filesystem from "expo-file-system";
import { useState } from "react";
import {
  View,
  Text,
  Alert,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

export default function UploadVideo({ navigation }) {
  const [video, setVideo] = useState(null);
  const [category, setCategory] = useState("matematica");
  const [categories, setCategories] = useState(["matematica"]);
  const [uploading, setUploading] = useState(false);

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
      Alert.alert("Erro", "Por favor, selecione um vídeo e uma categoria");
      return;
    }

    setUploading(true);

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
      <Text style={styles.title}>Upload de Vídeo</Text>

      <Text style={styles.label}>Selecione a categoria:</Text>
      <Picker
        selectedValue={category}
        onValueChange={(value) => setCategory(value)}
        style={styles.picker}
      >
        {categories.map((cat) => (
          <Picker.Item key={cat} label={cat} value={cat} />
        ))}
      </Picker>

      {video && (
        <Text style={styles.videoName}>🎬 {video.name}</Text>
      )}

      <TouchableOpacity style={styles.button} onPress={pickVideo}>
        <Text style={styles.buttonText}>Selecionar Vídeo</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#28a745" }]}
        onPress={uploadVideo}
        disabled={uploading}
      >
        <Text style={styles.buttonText}>
          {uploading ? "Enviando..." : "Fazer Upload"}
        </Text>
      </TouchableOpacity>

      {uploading && <ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 20 }} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f4f4f4",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    alignSelf: "center",
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  picker: {
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#007bff",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  videoName: {
    marginTop: 10,
    fontSize: 16,
    fontStyle: "italic",
    color: "#555",
  },
});
