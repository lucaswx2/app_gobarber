import React, { useCallback, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Form } from '@unform/mobile';
import * as Yup from 'yup';
import { FormHandles } from '@unform/core';
import {
    Image,
    View,
    ScrollView,
    KeyboardAvoidingView,
    TextInput,
    Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import api from '../../services/api';
import getValidationErrors from '../../utils/getValidationErrors';
import {
    Container,
    Title,
    BackToSignInButton,
    BackToSignInText,
} from './styles';

import logoImg from '../../assets/logo.png';
import Input from '../../components/Input';
import Button from '../../components/Button';

interface SignUpFormData {
    name: string;
    email: string;
    password: string;
}
const SignUp: React.FC = () => {
    const navigation = useNavigation();
    const passwordRef = useRef<TextInput>(null);
    const emailRef = useRef<TextInput>(null);

    const formRef = useRef<FormHandles>(null);
    const handleSignUp = useCallback(
        async (data: SignUpFormData) => {
            try {
                formRef.current?.setErrors({});

                const schema = Yup.object().shape({
                    name: Yup.string().required('Nome é obrigatório'),
                    email: Yup.string()
                        .required('E-mail obrigatório')
                        .email('Digite um e-mail válido!'),
                    password: Yup.string().min(6, 'No mínimo 6 dígitos'),
                });
                await schema.validate(data, { abortEarly: false });
                await api.post('/users', data);
                Alert.alert(
                    'Cadastro realizado!',
                    'Você já pode fazer seu logon no GoBarber',
                );
                navigation.navigate('SignIn');
            } catch (err) {
                if (err instanceof Yup.ValidationError) {
                    const errors = getValidationErrors(err);

                    formRef.current?.setErrors(errors);
                } else {
                    Alert.alert(
                        'Erro no cadastro',
                        'Ocorreu um erro ao fazer o cadastro,tente novamente',
                    );
                }
            }
        },
        [navigation],
    );
    return (
        <>
            <KeyboardAvoidingView>
                <ScrollView
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{ flexGrow: 1 }}
                >
                    <Container>
                        <Image source={logoImg} />
                        <View>
                            <Title>Crie sua Conta</Title>
                        </View>
                        <Form onSubmit={handleSignUp} ref={formRef}>
                            <Input
                                name="name"
                                autoCapitalize="words"
                                icon="user"
                                placeholder="Nome"
                                returnKeyType="next"
                                onSubmitEditing={() => {
                                    emailRef.current?.focus();
                                }}
                            />
                            <Input
                                autoCapitalize="none"
                                autoCorrect={false}
                                keyboardType="email-address"
                                name="email"
                                ref={emailRef}
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
                                icon="lock"
                                ref={passwordRef}
                                returnKeyType="send"
                                onSubmitEditing={() => {
                                    formRef.current?.submitForm();
                                }}
                                placeholder="Senha"
                                textContentType="newPassword"
                            />
                            <Button
                                onPress={() => {
                                    formRef.current?.submitForm();
                                }}
                            >
                                Criar Conta
                            </Button>
                        </Form>
                    </Container>
                </ScrollView>
            </KeyboardAvoidingView>
            <BackToSignInButton
                onPress={() => {
                    navigation.goBack();
                }}
            >
                <Icon name="arrow-left" size={20} color="#fff" />
                <BackToSignInText>Voltar para logon</BackToSignInText>
            </BackToSignInButton>
        </>
    );
};

export default SignUp;
