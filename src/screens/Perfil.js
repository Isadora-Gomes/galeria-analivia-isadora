// Isadora Gomes da Silva e Ana Lívia Lopes 
import { supabase } from '../../supabaseConfig';
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import React, { useEffect, useState } from "react";
import { Alert } from "react-native";

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
        .from("profile-photos")
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

};

export default EditarPerfil;

