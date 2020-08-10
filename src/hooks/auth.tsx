import React, {
    createContext,
    useCallback,
    useState,
    useContext,
    useEffect,
} from 'react';
import AsyncStorage from '@react-native-community/async-storage';
import api from '../services/api';

interface AuthState {
    token: string;
    user: object;
}

interface SignInCredentials {
    email: string;
    password: string;
}
interface AuthContextInterface {
    user: object;
    signIn(credentials: SignInCredentials): Promise<void>;
    signOut(): void;
    loading: boolean;
}
export const AuthContext = createContext<AuthContextInterface>(
    {} as AuthContextInterface,
);

export const AuthProvider: React.FC = ({ children }) => {
    const [data, setData] = useState<AuthState>({} as AuthState);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadStoragedData(): Promise<void> {
            const [token, user] = await AsyncStorage.multiGet([
                '@Gobarber:token',
                '@Gobarber:user',
            ]);

            if (token[1] && user[1]) {
                setData({ token: token[1], user: JSON.parse(user[1]) });
                setLoading(false);
            }
        }
        loadStoragedData();
    }, []);
    const signIn = useCallback(async ({ email, password }) => {
        const response = await api.post('sessions', {
            email,
            password,
        });
        const { token, user } = response.data;

        await AsyncStorage.multiSet([
            ['@Gobarber:token', token],
            ['@Gobarber:user', JSON.stringify(user)],
        ]);

        setData({ token, user });
    }, []);

    const signOut = useCallback(async () => {
        await AsyncStorage.multiRemove(['@Gobarber:token', '@Gobarber:user']);

        setData({} as AuthState);
    }, []);

    return (
        <AuthContext.Provider
            value={{ user: data.user, signIn, signOut, loading }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export function useAuth(): AuthContextInterface {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used withn an AuthProvider');
    }

    return context;
}
