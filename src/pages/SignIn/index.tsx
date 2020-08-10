import React, { useRef, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Form } from '@unform/mobile';
import { FormHandles } from '@unform/core';
import * as Yup from 'yup';

import {
    Image,
    View,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    TextInput,
    Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useAuth } from '../../hooks/auth';
import getValidationErrors from '../../utils/getValidationErrors';
import {
    Container,
    Title,
    ForgotPassword,
    ForgotPasswordText,
    CreateAccountButton,
    CreateAccountText,
} from './styles';

import logoImg from '../../assets/logo.png';
import Input from '../../components/Input';
import Button from '../../components/Button';

interface SignInFormData {
    email: string;
    password: string;
}
const SignIn: React.FC = () => {
    const passwordRef = useRef<TextInput>(null);
    const navigation = useNavigation();
    const formRef = useRef<FormHandles>(null);

    const { signIn } = useAuth();
    const handleSignIn = useCallback(async (data: SignInFormData) => {
        try {
            formRef.current?.setErrors({});

            const schema = Yup.object().shape({
                email: Yup.string()
                    .required('E-mail obrigatório')
                    .email('Digite um e-mail válido!'),
                password: Yup.string().required('Senha obrigatória'),
            });
            await schema.validate(data, { abortEarly: false });
            await signIn({
                email: data.email,
                password: data.password,
            });

            // history.push('/dashboard');
        } catch (err) {
            if (err instanceof Yup.ValidationError) {
                const errors = getValidationErrors(err);
                console.log(errors);
                formRef.current?.setErrors(errors);
            } else {
                Alert.alert(
                    'Erro na autenticação',
                    'Ocorreu um erro ao fazer login,cheque as credenciais',
                );
            }
        }
    }, []);

    return (
        <>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                <ScrollView
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{ flexGrow: 1 }}
                >
                    <Container>
                        <Image source={logoImg} />
                        <View>
                            <Title>Faça seu Logon</Title>
                        </View>
                        <Form onSubmit={handleSignIn} ref={formRef}>
                            <Input
                                autoCapitalize="none"
                                autoCorrect={false}
                                keyboardType="email-address"
                                name="email"
                                icon="mail"
                                placeholder="E-mail"
                                returnKeyType="next"
                                onSubmitEditing={() => {
                                    passwordRef.current?.focus();
                                }}
                            />
                            <Input
                                name="password"
                                secureTextEntry
                                returnKeyType="send"
                                icon="lock"
                                ref={passwordRef}
                                placeholder="Senha"
                                onSubmitEditing={() => {
                                    formRef.current?.submitForm();
                                }}
                            />
                            <Button
                                onPress={() => {
                                    formRef.current?.submitForm();
                                }}
                            >
                                Entrar
                            </Button>
                        </Form>
                        <ForgotPassword
                            onPress={() => {
                                console.log('clicou');
                            }}
                        >
                            <ForgotPasswordText>
                                Esqueci minha senha
                            </ForgotPasswordText>
                        </ForgotPassword>
                    </Container>
                </ScrollView>
            </KeyboardAvoidingView>
            <CreateAccountButton
                onPress={() => {
                    navigation.navigate('SignUp');
                }}
            >
                <Icon name="log-in" size={20} color="#ff9000" />
                <CreateAccountText>Criar uma conta</CreateAccountText>
            </CreateAccountButton>
        </>
    );
};

export default SignIn;
