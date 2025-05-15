// Isadora Gomes da Silva e Ana Lívia Lopes 
import { supabase } from '../../supabaseConfig';
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, View, TouchableOpacity, Text, TextInput } from "react-native";

const EditarPerfil = ({ navigation }) => {
  const [nome, setNome] = useState("");
  const [novoEmail, setNovoEmail] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [senhaAtual, setSenhaAtual] = useState("");
  const [fotoAtual, setFotoAtual] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      const user = authData?.user;

      if (authError || !user) {
        console.error("Erro ao obter usuário:", authError);
        Alert.alert("Erro", "Usuário não autenticado.");
        return;
      }

      setNovoEmail(user.email); // E-mail sempre vem do auth

      // Agora buscamos os dados completos da tabela "users"
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("nome, photo_url")
        .eq("id", user.id)
        .single();

      if (userError) {
        console.error("Erro ao carregar dados do usuário:", userError);
      } else {
        setNome(userData.nome || "");
        setFotoAtual(userData.photo_url || "");
      }
    };

    fetchUserData();
  }, []);

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permissão necessária",
          "Permita o acesso à galeria para trocar a foto."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets[0].uri) {
        await uploadImageToSupabase(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Erro ao selecionar imagem:", error);
      Alert.alert("Erro", "Não foi possível selecionar a imagem.");
    }
  };

  const uploadImageToSupabase = async (uri) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.getUser();
      const user = data?.user;

      if (error || !user) {
        Alert.alert("Erro", "Usuário não autenticado.");
        return;
      }

      let fileExt = uri.split(".").pop().toLowerCase();
      if (!fileExt || fileExt.length > 4) fileExt = "jpg";

      const validExtensions = ["jpg", "jpeg", "png", "gif", "webp"];
      if (!validExtensions.includes(fileExt)) fileExt = "jpg";

      const timestamp = new Date().getTime();
      const fileName = `${user.id}+${timestamp}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Lê a imagem como base64
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const fileBuffer = Uint8Array.from(atob(base64), (c) =>
        c.charCodeAt(0)
      );

      const { error: uploadError } = await supabase.storage
        .from("profile-photos")
        .upload(filePath, fileBuffer, {
          contentType: `image/${fileExt}`,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("fotos-perfil")
        .getPublicUrl(filePath);

      const finalUrl = `${urlData.publicUrl}?t=${timestamp}`;
      setFotoAtual(finalUrl);

      const { error: updateError } = await supabase
        .from("users")
        .update({ photo_url: finalUrl })
        .eq("id", user.id);

      if (updateError) throw updateError;

      Alert.alert("Sucesso", "Foto de perfil atualizada!");
    } catch (error) {
      console.error("Erro ao enviar imagem:", error);
      Alert.alert("Erro", error.message || "Não foi possível atualizar a foto de perfil.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    const { data, error } = await supabase.auth.getUser();
    const user = data?.user;

    if (error || !user) {
      Alert.alert("Erro", "Usuário não autenticado.");
      return;
    }

    try {
      await supabase
        .from("users")
        .update({ nome: nome })
        .eq("id", user.id);

      if (novoEmail !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: novoEmail,
        });
        if (emailError) throw emailError;
      }

      if (novaSenha) {
        const { error: senhaError } = await supabase.auth.updateUser({
          password: novaSenha,
        });
        if (senhaError) throw senhaError;
      }

      Alert.alert("Sucesso", "Perfil atualizado com sucesso!");
      navigation.goBack();
    } catch (error) {
      console.error("Erro ao atualizar perfil: ", error);
      Alert.alert("Erro", "Ocorreu um erro ao atualizar o perfil.");
    }
  };
return (
  <View style={styles.container}>
    <TouchableOpacity onPress={handlePickImage} style={{ alignItems: "center", marginBottom: 20 }}>
      {fotoAtual ? ( <Image source={{ uri: fotoAtual }} style={{ width: 120, height: 120, borderRadius: 60 }}/>) 
      : (
        <View style={styles.foto}>
          <Text>Foto</Text>
        </View>
      )}
      <Text style={{ margin: 10, color: "white", fontSize: 16 }}>Alterar Foto</Text>
    </TouchableOpacity>

    <Text style={styles.textInput}>Nome:</Text>
    <TextInput
      style={{
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        padding: 10,
        marginBottom: 15,
      }}
      placeholder="Digite seu nome"
      value={nome}
      onChangeText={setNome}
      placeholderTextColor={'white'}
    />

    <Text style={styles.textInput}>Email:</Text>
    <TextInput
      style={{
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        padding: 10,
        marginBottom: 15,
      }}
      placeholder="Digite seu email"
      value={novoEmail}
      onChangeText={setNovoEmail}
      keyboardType="email-address"
      autoCapitalize="none"
      placeholderTextColor={'white'}
    />

    <Text style={styles.textInput}>Nova Senha:</Text>
    <TextInput
      style={{
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        padding: 10,
        marginBottom: 15,
      }}
      placeholder="Digite a nova senha"
      value={novaSenha}
      onChangeText={setNovaSenha}
      secureTextEntry
      placeholderTextColor={'white'}
    />

    <TouchableOpacity onPress={handleUpdateProfile} style={styles.botaoSalvar} disabled={isLoading}>
      {isLoading ? ( <ActivityIndicator color="#fff" />) 
      : (
        <Text style={styles.textSalvar}>Salvar alterações</Text>
      )}
    </TouchableOpacity>
  </View>
);

};

export default EditarPerfil;
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#4169E1',
    height: 1000,
    flex: 1,
    padding: 20,
  },
  input: {
    width: 250,
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    fontSize: 18,
    marginBottom: 10,
    backgroundColor: '#fff',
    color: '#8058ac',
  },
  textInput:{
    fontFamily: 'Gotham',
    fontWeight: 500,
    color: '#D9EAFD',
    fontSize: 20,
    marginBottom: 10,
  },
  img: {
    width: 150,
    height: 140,
    marginRight: 'auto',
    marginLeft: 'auto',
    borderRadius: 900,
    marginTop: 70,
    marginBottom: 25,
  },
  logoutBotao: {
    backgroundColor: 'red',
    borderRadius: 10,
    padding: 7,
    width: 100,
    alignSelf: 'center',
    marginTop: 220,
    marginBottom: 30,
  },
  textBotaoOut: {
    textAlign: 'center',
    color: 'white',
    fontWeight: '400',
    fontSize: 18,
  },
  foto: {
    width: 165,
    height: 165,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
},
botaoSalvar:{
    alignItems: 'center',
    marginTop: 30,
    backgroundColor: '#D9EAFD',
    width:210,
    height: 40,
    borderRadius: 10,
    padding: 10,
    marginLeft: 'auto',
    marginRight: 'auto',
},
textSalvar:{
    color: '#4169E1',
    fontSize: 20,
    fontFamily: 'Gotham',
    fontWeight: 500,
}
});

