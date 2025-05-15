import React, { useState } from "react";
import {
    View,
    TextInput,
    Alert,
    Image,
    StyleSheet,
    TouchableOpacity,
    Text,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { supabase } from '../../supabaseConfig';
import * as FileSystem from "expo-file-system";
import * as Notifications from "expo-notifications";

// Função para registrar o usuário
const registerUser = async (email, password, nome_user, imageUri) => {
  try {
    await supabase.auth.signOut();

        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
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
            .from("fotos-perfil")
            .upload(`${userId}/${fileName}`, {
                uri: `data:${fileType};base64,${base64}`,
                name: fileName,
                type: fileType,
                contentType: fileType,
                upsert: true,
            });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
            .from("fotos-perfil")
            .getPublicUrl(`${userId}/${fileName}`);

        const photoURL = publicUrlData.publicUrl;

    const { error: dbError } = await supabase
      .from("users")
      .insert([{ id_user: userId, nome_user, photoUrl_user: photoURL, email }]);

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
    const [file, setFile] = useState(null);

    const pickFile = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            alert('Permissão necessária', 'Precisamos de permissão para acessar suas fotos.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 1,
        });

        if (!result.canceled) {
            setFile(result.assets[0]);
        }
    };

    const handleRegister = async () => {
        if (email && password && nome && file) {
            await registerUser(email, password, nome, file.uri);
            Alert.alert("Sucesso", "Usuário registrado com sucesso!");
            navigation.goBack();

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
    const redirecionarLogin = () => {
        navigation.navigate("RealizarLogin")
    }

    return (
        <View style={styles.container}>

            {file && (
                <Image source={{ uri: file.uri }} style={styles.imagePreview} />
            )}

            <TouchableOpacity onPress={pickFile} style={styles.registerButton}>
                <Text style={styles.buttonText}>
                    {file ? "Imagem selecionada" : "Selecionar foto"}
                </Text>
            </TouchableOpacity>

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
            <TouchableOpacity style={styles.botao2} onPress={handleRegister}>
                <Text style={styles.textBotao}>Entrar</Text>
            </TouchableOpacity>
            <View style={styles.textCadastro}>
                <TouchableOpacity onPress={redirecionarLogin}>
                    <Text style={styles.linkCadastro}>
                        Já tem uma conta? <Text style={styles.linkDestacado}>Entrar</Text>
                    </Text>
                </TouchableOpacity>
            </View>
        </View>

    );
};

export default CadastroScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#D9EAFD',
    },
    input: {
        fontFamily: 'Gotham',
        height: 47,
        width: 350,
        margin: 12,
        borderWidth: 3,
        padding: 12,
        borderRadius: 10,
        borderColor: '#4169E1',
    },
    botao2: {
        backgroundColor: '#4169E1',
        borderRadius: 10,
        padding: 12,
        width: 125,
        gap: 5,
        marginTop: 15,
        marginLeft: 'auto',
        marginRight: 'auto',
    },
    textBotao: {
        textAlign: 'center',
        marginRight: 'auto',
        marginLeft: 'auto',
        fontFamily: 'Gotham',
        color: '#FFFFFF',
        fontWeight: '500',
        fontSize: 20,
    },
    registerButton: {
        backgroundColor: '#4169E1',
        padding: 15,
        borderRadius: 26,
        width: '60%',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: 'Gotham',
    },
    imagePreview: {
        width: 200,
        height: 200,
        marginBottom: 15,
        borderRadius: 990,
    },
    textCadastro: {
        marginTop: 100,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: 60,
    },
    
    linkCadastro: {
        fontFamily: 'Gotham',
        fontSize: 16,
        color: '#000',
    },

    linkDestacado: {
        color: '#2c2dd7',
        textDecorationLine: 'underline',
    },
});