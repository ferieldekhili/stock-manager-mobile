import { Button, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RootStackScreenProps } from '../navigation/types';

type ProductsScreenProps = RootStackScreenProps<'Products'>;

export default function ProductsScreen({ navigation }: ProductsScreenProps) {
  return (
    <SafeAreaView style={styles.container} edges={['right', 'bottom', 'left']}>
      <View style={styles.content}>
        <Text style={styles.title}>Gestion du stock</Text>
        <Text style={styles.description}>
          La liste des produits sera ajoutée dans une prochaine étape.
        </Text>

        <View style={styles.actions}>
          <Button
            title="Tester le détail produit"
            onPress={() =>
              navigation.navigate('ProductDetail', {
                productId: 'navigation-test',
              })
            }
          />
          <Button
            title="Créer un produit"
            onPress={() =>
              navigation.navigate('ProductForm', { mode: 'create' })
            }
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    color: '#111827',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
  },
  description: {
    color: '#4B5563',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  actions: {
    gap: 12,
  },
});
