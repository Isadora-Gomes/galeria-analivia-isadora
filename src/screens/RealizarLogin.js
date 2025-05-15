import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { supabase } from '../../supabaseConfig';


const RealizarLogin = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        })

        if (error) {
            console.error('Login error:', error)
        } else {
            console.log('Login success:', data)
            window.alert('Login realizado com sucesso!');
            navigation.navigate('PaginaPrincipal');
        }
    }
    const redirecionarCadastro = () => {
        navigation.navigate("Cadastro")
    }
    return (
        <View style={styles.container}>
            <Image source={require('../../assets/galeria.png')} style={styles.img} />

            <TextInput style={styles.input}
                placeholder='Email'
                onChangeText={setEmail}
                value={email}
                placeholderTextColor={"#4169E1"} />

            <TextInput style={styles.input}
                secureTextEntry={true}
                placeholder='Senha'
                onChangeText={setPassword}
                value={password}
                placeholderTextColor={"#4169E1"} />

            <Pressable style={styles.botao} onPress={handleLogin}>
                <Text style={styles.textBotao}>Entrar</Text>
            </Pressable>
            <View style={styles.textCadastro}>
                <TouchableOpacity onPress={redirecionarCadastro}>
                    <Text style={styles.linkCadastro}>
                        Não tem uma conta? <Text style={styles.linkDestacado}>Cadastre-se</Text>
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
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
    botao: {
        backgroundColor: '#4169E1',
        borderRadius: 10,
        padding: 12,
        width: 125,
        gap: 5,
        marginTop: 15,
    },
    textBotao: {
        textAlign: 'center',
        marginRight: 'auto',
        marginLeft: 'auto',
        fontFamily: 'Gotham',
        color: '#FFFFFF',
        fontWeight: 500,
        fontSize: 20,
    },
    img: {
        width: 170,
        height: 185,
        marginTop: 40,
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
export default RealizarLogin;