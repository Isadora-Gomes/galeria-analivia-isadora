import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Image} from 'react-native';
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
    return( 
        <View style={styles.container}>
            <Image source={require('../../assets/img/sesir.png')} style={styles.img}/>
            
            <TextInput style={styles.input}
            placeholder='Email' 
            onChangeText={setEmail} 
            value={email}
            placeholderTextColor={"#8058ac"} />

            <TextInput style={styles.input}
            secureTextEntry={true} 
            placeholder='Senha' 
            onChangeText={setPassword} 
            value={password} 
            placeholderTextColor={"#8058ac"} />

            <Pressable style={styles.botao} onPress={handleLogin}> 
                <Text style={styles.textBotao}>Entrar</Text> 
            </Pressable>
        </View>
    );
}
const styles = StyleSheet.create({
    container:{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ded9f6',
    },
    input:{
        fontFamily: 'Gotham',
        height: 47,
        width:350,
        margin: 12,
        borderWidth: 3,
        padding: 12,
        borderRadius: 10,
        borderColor: '#8058ac',
    },
    botao:{
        backgroundColor: '#8058ac',
        borderRadius: 10,
        padding: 12,
        width: 125,
        gap: 5,
        marginTop: 15,
    },
    textBotao:{
        textAlign: 'center',
        marginRight: 'auto',
        marginLeft: 'auto',
        fontFamily: 'Gotham',
        color: '#FFFFFF',
        fontWeight: 500,
        fontSize: 20,
    },
    img:{
        width: 170,
        height: 76,
        margin: 30,
    },
});
export default RealizarLogin;