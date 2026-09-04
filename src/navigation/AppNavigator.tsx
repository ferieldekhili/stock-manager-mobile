import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import DashboardScreen from '../screens/DashboardScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import ProductFormScreen from '../screens/ProductFormScreen';
import ProductsScreen from '../screens/ProductsScreen';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Dashboard"
        screenOptions={{
          contentStyle: { backgroundColor: '#F6F7F9' },
          headerBackButtonDisplayMode: 'minimal',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: '#F6F7F9' },
          headerTintColor: '#111827',
          headerTitleStyle: { fontWeight: '700' },
        }}
      >
        <Stack.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{ title: 'Tableau de bord' }}
        />
        <Stack.Screen
          name="Products"
          component={ProductsScreen}
          options={{ title: 'Produits' }}
        />
        <Stack.Screen
          name="ProductDetail"
          component={ProductDetailScreen}
          options={{ title: 'Détail du produit' }}
        />
        <Stack.Screen
          name="ProductForm"
          component={ProductFormScreen}
          options={({ route }) => ({
            title:
              route.params.mode === 'create'
                ? 'Nouveau produit'
                : 'Modifier le produit',
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
