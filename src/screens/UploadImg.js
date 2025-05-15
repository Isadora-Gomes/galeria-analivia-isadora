// Isadora Gomes da Silva e Ana Lívia Lopes 
import { supabase } from '../../supabaseConfig';
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { Alert, View, Text, Pressable, Image, StyleSheet } from "react-native";
import { useState } from "react";

const UploadImagens = ({ navigation }) => {
  const [imageUri, setImageUri] = useState(null);

  const escolherImagem = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert("Permissão necessária", "Permita o acesso à galeria para trocar a foto.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets[0].uri) {
        const selectedUri = result.assets[0].uri;
        setImageUri(selectedUri); 
        await uploadImg(selectedUri);
        return selectedUri;
      }

    } catch (error) {
      console.error("Erro ao selecionar imagem:", error);
      Alert.alert("Erro", "Não foi possível selecionar a imagem.");
      return null;
    }
  };

  const uploadImg = async (uri) => {
    if (!uri) {
      Alert.alert("Erro", "Nenhuma imagem selecionada.");
      return;
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      const user = authData?.user;

      if (authError || !user) {
        Alert.alert("Erro", "Usuário não autenticado.");
        return;
      }

      const timestamp = new Date().getTime();
      let fileExt = uri.split(".").pop().toLowerCase();
      if (!fileExt || fileExt.length > 4) fileExt = "jpg";
      console.log(fileExt);

      const validExtensions = ["jpg", "jpeg", "png", "gif", "webp"];
      if (!validExtensions.includes(fileExt)) fileExt = "jpg";
    

      const filename = `${user.id}+${timestamp}.${fileExt}`;
      const filePath = `galeria/${user.id}/${filename}`;

      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const fileBuffer = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

      const { error: uploadError } = await supabase.storage
        .from("imagens")
        .upload(filePath, fileBuffer, {
          contentType: `image/${fileExt}`,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = await supabase.storage
        .from("imagens")
        .getPublicUrl(filePath);

      const finalUrl = `${urlData.publicUrl}?t=${timestamp}`;

      Alert.alert("Sucesso", "Imagem enviada com sucesso!");
      console.log("URL pública da imagem:", finalUrl);
      navigation.goBack();
      return finalUrl;

    } catch (error) {
      console.error("Erro ao fazer upload da imagem:", error);
      Alert.alert("Erro", error.message || "Falha ao enviar imagem.");
      return null;
    }
  };

  return(
      <View style={styles.container}>
      <Pressable style={styles.button} onPress={escolherImagem}>
        <Text style={styles.buttonText}>Escolher imagem</Text>
      </Pressable>

      {imageUri && (
        <View>
          <Image source={{ uri: imageUri }} style={styles.image} />
          <Pressable style={styles.button} onPress={uploadImg}>
            <Text style={styles.buttonText}>Fazer upload da imagem</Text>
          </Pressable>
        </View>
      )}

      <Pressable style={styles.logoutBotao} onPress={() => navigation.navigate("PaginaPrincipal")}>
        <Text style={styles.textBotaoOut}>Voltar</Text>
      </Pressable>
    </View>
  );;
};

export default UploadImagens;
const styles = StyleSheet.create({
  container: {
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center",
    backgroundColor: '#D9EAFD',
},
button: {
    backgroundColor: '#4169E1',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 10,
  },
  buttonText: {
    color: '#F0F8FF',
    fontSize: 19,
    fontWeight: "bold",
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutBotao: {
    backgroundColor: '#001A6E',
    borderRadius: 10,
    padding: 7,
    width: 100,
    alignItems: "center",
    marginTop: 20,
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
