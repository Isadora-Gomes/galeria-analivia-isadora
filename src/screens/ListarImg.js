import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Text, Image, ActivityIndicator, Pressable } from 'react-native';
import { supabase } from '../../supabaseConfig';

const ListarImagens = ({ navigation }) =>  {
  const [imagens, setImagens] = useState([]);
const [loading, setLoading] = useState(false);

const fetchImagens = async () => {
  setLoading(true);

  // Obter usuário atual
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("Erro ao obter usuário:", userError?.message);
    setLoading(false);
    return;
  }

  const userId = user.id;

  try {
    // Lista os arquivos da pasta 'imagens'
    const { data, error } = await supabase.storage
      .from("imagens")
      .list(`galeria/${userId}`, {
        limit: 100,
      });

    if (error) {
      console.error("Erro ao listar imagens:", error.message);
      setLoading(false);
      return;
    }

    const urls = await Promise.all(
      data
        .filter((item) => item.name)
        .map(async (item) => {
          const { data: urlData, error: urlError } = await supabase.storage
            .from("imagens")
            .getPublicUrl(`galeria/${userId}/${item.name}`);

          if (urlError) {
            console.error("Erro ao obter URL:", urlError.message);
            return null;
          }

          return {
            name: item.name,
            url: urlData.publicUrl,
          };
        })
    );

    setImagens(urls.filter((img) => img !== null));
  } catch (err) {
    console.error("Erro inesperado:", err);
  }

  setLoading(false);
};

useEffect(() => {
  fetchImagens();
}, []);

  return (
    <View style={styles.container}>
    {loading ? (
      <ActivityIndicator size="large" color="#0000ff" />
    ) : imagens.length === 0 ? (
      <Text style={styles.text}>Nenhuma imagem encontrada.</Text>
    ) : (
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {imagens.map((img, index) => (
          <View key={index} style={styles.imageContainer}>
            <Image source={{ uri: img.url }} style={styles.image} />
            <Text style={styles.imageName}>{img.name}</Text>
          </View>
        ))}
      </ScrollView>
    )}
    <Pressable onPress={fetchImagens} style={styles.button}>
      <Text style={styles.buttonText}>Recarregar</Text>
    </Pressable>
  </View>
  );
}
export default ListarImagens;

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  text: {
    fontSize: 20,
    color: '#333'
  }
});
