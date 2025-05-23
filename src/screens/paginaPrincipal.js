// Isadora Gomes da Silva e Ana Lívia Lopes 
import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';

const PaginaPrincipal = ({ navigation }) => {
    return (
            <View style={styles.container}>
                <Text style={styles.text1}>Bem-vindo a galeria!</Text>

                <Pressable style={styles.botao} onPress={() => navigation.navigate('EditarPerfil')}>
                    <Text style={styles.textBotao}>Editar perfil</Text>
                </Pressable>

                <Pressable style={styles.botao} onPress={() => navigation.navigate('ListarImagens')}>
                    <Text style={styles.textBotao}>Listar imagens</Text>
                </Pressable>

                <Pressable style={styles.botao} onPress={() => navigation.navigate('UploadImagens')}>
                    <Text style={styles.textBotao}>Upload IMG</Text>
                </Pressable>

                <Pressable style={styles.botao} onPress={() => navigation.navigate('ListarVideos')}>
                    <Text style={styles.textBotao}>Listar vídeos</Text>
                </Pressable>

                <Pressable style={styles.botao} onPress={() => navigation.navigate('UploadVideos')}>
                    <Text style={styles.textBotao}>Upload vídeos</Text>
                </Pressable>

                <Pressable style={styles.botao} onPress={() => navigation.navigate('RealizarLogin')}>
                    <Text style={styles.textBotao}>Sair</Text>
                </Pressable>
            </View>
    );
};
export default PaginaPrincipal;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#4169E1',
        height: 1000
    },
    text1: {
        fontFamily: 'Gotham, sans-serif',
        textAlign: 'center',
        fontSize: 40,
        fontWeight: 'bold',
        margin: 40,
        color: '#F0F8FF',

    },
    botao: {
        backgroundColor: '#F0F8FF',
        borderRadius: 10,
        padding: 14,
        width: 210,
        height: 55,
        gap: 35,
        marginBottom: 20,
        marginTop: 15,
    },
    textBotao: {
        textAlign: 'center',
        marginRight: 'auto',
        marginLeft: 'auto',
        fontFamily: 'Gotham',
        color: '#001A6E',
        fontWeight: 500,
        fontSize: 20,
    },
});