import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, FlatList } from "react-native";
import { Video } from "expo-av";
import { supabase } from '../../supabaseConfig';
import { Picker } from "@react-native-picker/picker";

const bucketName = "videos";

export default function ListarVideos({ navigation }) {
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Buscar categorias (pastas)
  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .list("", {
          limit: 100,
          offset: 0,
          sortBy: { column: "name", order: "asc" },
        });

      if (error) {
        console.error("Erro ao buscar categorias:", error);
        throw error;
      }

      // Log para verificar os dados retornados
      console.log("Dados das categorias:", data);

      // Extrair as categorias diretamente de nome
      const categoriesList = data
        .filter((file) => file.name) // Aqui pegamos diretamente o 'name' do arquivo
        .map((file) => file.name);

      console.log("Categorias extraídas:", categoriesList);

      if (categoriesList.length > 0) {
        setCategories(categoriesList);
        setCategory(categoriesList[0]);
      }
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
    } finally {
      setLoadingCategories(false);
    }
  };

  // Buscar vídeos de uma categoria
  const fetchVideos = async () => {
    if (!category) return; // Se não houver categoria, não faz a requisição

    setLoading(true);

    try {
      const prefix = `${category}/`;
      const { data, error } = await supabase.storage
        .from(bucketName)
        .list(prefix, {
          limit: 100,
          offset: 0,
          sortBy: { column: "name", order: "asc" },
        });

      if (error) {
        console.error("Erro ao buscar vídeos:", error);
        throw error;
      }

      // Log para verificar os dados retornados
      console.log("Lista dos vídeos:", data);

      const videoList = data
        .filter((file) => file.name.endsWith(".mp4")) // Filtra arquivos de vídeo
        .map((file) => {
          const fullPath = `${prefix}${file.name}`;
          return supabase.storage
            .from(bucketName)
            .getPublicUrl(fullPath).data.publicUrl;
        });

      // Verificar se os vídeos estão sendo encontrados corretamente
      if (videoList.length > 0) {
        const videoUrls = videoList.map((url, i) => ({
          name: data[i].name,
          url,
        }));
        setVideos(videoUrls);
      } else {
        setVideos([]); // Caso não haja vídeos
      }
    } catch (error) {
      console.error("Erro ao carregar vídeos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (category) {
      fetchVideos();
    }
  }, [category]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Listar Vídeos</Text>

      {loadingCategories ? (
        <ActivityIndicator size="large" color="#4CAF50" />
      ) : (
        <Picker
          selectedValue={category}
          onValueChange={(value) => setCategory(value)}
          style={styles.picker}
        >
          {categories.map((cat) => (
            <Picker.Item label={cat} value={cat} key={cat} />
          ))}
        </Picker>
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#2196F3" style={styles.loading} />
      ) : videos.length === 0 ? (
        <Text style={styles.emptyText}>Nenhum vídeo encontrado.</Text>
      ) : (
        <FlatList
          data={videos}
          keyExtractor={(item) => item.name}
          renderItem={({ item }) => (
            <View style={styles.videoContainer}>
              <Text style={styles.videoTitle}>{item.name}</Text>
              <Video
                source={{ uri: item.url }}
                rate={1.0}
                volume={1.0}
                isMuted={false}
                resizeMode="contain"
                shouldPlay={false}
                useNativeControls
                style={styles.video}
              />
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#ded9f6",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
    color: "#333",
  },
  picker: {
    height: 50,
    backgroundColor: "#fff",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
  },
  videoContainer: {
    marginBottom: 24,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  video: {
    height: 200,
    borderRadius: 8,
    backgroundColor: "#000",
  },
  loading: {
    marginTop: 20,
  },
  emptyText: {
    textAlign: "center",
    color: "#666",
    marginTop: 20,
  },
});
