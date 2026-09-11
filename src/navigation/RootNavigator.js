import React, { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import { DarkTheme, NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MenuApp from '../components/MenuApp';
import { useApp } from '../context/AppContext';
import { colors } from '../theme/theme';

import LoginScreen from '../screens/LoginScreen';
import InicioScreen from '../screens/InicioScreen';
import FichaDoDiaScreen from '../screens/FichaDoDiaScreen';
import FichaGeralScreen from '../screens/FichaGeralScreen';
import PerfilScreen from '../screens/PerfilScreen';
import AlunosScreen from '../screens/AlunosScreen';
import AlunoDetalheScreen from '../screens/AlunoDetalheScreen';
import EditorFichaScreen from '../screens/EditorFichaScreen';

const Stack = createNativeStackNavigator();
export const navegacaoRef = createNavigationContainerRef();

const tema = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.bg,
    card: colors.bg,
    text: colors.text,
    border: colors.border,
    primary: colors.yellow,
  },
};

export default function RootNavigator() {
  const { carregando, usuario, sair } = useApp();
  const [menuVisivel, setMenuVisivel] = useState(false);
  const [rotaAtual, setRotaAtual] = useState('Inicio');
  const destinoPendente = useRef(null);

  const abrirMenu = useCallback(() => setMenuVisivel(true), []);
  const fecharMenu = useCallback(() => setMenuVisivel(false), []);

  // Fecha o menu antes de navegar para a animação não competir com a transição.
  const navegarDoMenu = useCallback((rota) => {
    destinoPendente.current = rota;
    setMenuVisivel(false);
    setTimeout(() => {
      const destino = destinoPendente.current;
      destinoPendente.current = null;
      if (destino && navegacaoRef.isReady()) navegacaoRef.navigate(destino);
    }, 180);
  }, []);

  const sairDoMenu = useCallback(() => {
    setMenuVisivel(false);
    Alert.alert('Sair da conta', 'Deseja realmente sair?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: sair },
    ]);
  }, [sair]);

  if (carregando) {
    return (
      <View style={estilos.splash}>
        <Text style={estilos.splashMarca}>IRONPULSE</Text>
        <ActivityIndicator color={colors.yellow} style={{ marginTop: 20 }} />
      </View>
    );
  }

  if (!usuario) return <LoginScreen />;

  return (
    <>
      <NavigationContainer
        ref={navegacaoRef}
        theme={tema}
        onStateChange={() => {
          const rota = navegacaoRef.getCurrentRoute();
          if (rota?.name) setRotaAtual(rota.name);
        }}
      >
        <Stack.Navigator
          screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
          initialRouteName={usuario.perfil === 'adm' ? 'Alunos' : 'Inicio'}
        >
          <Stack.Screen name="Inicio">
            {(props) => <InicioScreen {...props} abrirMenu={abrirMenu} />}
          </Stack.Screen>
          <Stack.Screen name="FichaDoDia">
            {(props) => <FichaDoDiaScreen {...props} abrirMenu={abrirMenu} />}
          </Stack.Screen>
          <Stack.Screen name="FichaGeral">
            {(props) => <FichaGeralScreen {...props} abrirMenu={abrirMenu} />}
          </Stack.Screen>
          <Stack.Screen name="Perfil">
            {(props) => <PerfilScreen {...props} abrirMenu={abrirMenu} />}
          </Stack.Screen>
          <Stack.Screen name="Alunos">
            {(props) => <AlunosScreen {...props} abrirMenu={abrirMenu} />}
          </Stack.Screen>
          <Stack.Screen name="AlunoDetalhe" component={AlunoDetalheScreen} />
          <Stack.Screen name="EditorFicha" component={EditorFichaScreen} />
        </Stack.Navigator>
      </NavigationContainer>

      <MenuApp
        visivel={menuVisivel}
        aoFechar={fecharMenu}
        usuario={usuario}
        rotaAtual={rotaAtual}
        aoNavegar={navegarDoMenu}
        aoSair={sairDoMenu}
      />
    </>
  );
}

const estilos = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashMarca: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 5,
  },
});
