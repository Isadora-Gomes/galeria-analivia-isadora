import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Text, Image, ActivityIndicator, Pressable } from 'react-native';

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
      <Text style={styles.text}>Olá, React Native!</Text>
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
