import { Button, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RootStackScreenProps } from '../navigation/types';

type ProductDetailScreenProps = RootStackScreenProps<'ProductDetail'>;

export default function ProductDetailScreen({
  navigation,
  route,
}: ProductDetailScreenProps) {
  const { productId } = route.params;

  return (
    <SafeAreaView style={styles.container} edges={['right', 'bottom', 'left']}>
      <View style={styles.content}>
        <Text style={styles.title}>Détail du produit</Text>
        <Text style={styles.description}>
          Cette route a reçu l’identifiant : {productId}
        </Text>
        <Button
          title="Tester la modification"
          onPress={() =>
            navigation.navigate('ProductForm', {
              mode: 'edit',
              productId,
            })
          }
        />
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
});
