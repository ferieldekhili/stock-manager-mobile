import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ProductDetailScreen from '../screens/ProductDetailScreen';
import ProductFormScreen from '../screens/ProductFormScreen';
import ProductsScreen from '../screens/ProductsScreen';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Products"
        screenOptions={{
          contentStyle: { backgroundColor: '#F6F7F9' },
          headerBackButtonDisplayMode: 'minimal',
          headerTintColor: '#111827',
        }}
      >
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
