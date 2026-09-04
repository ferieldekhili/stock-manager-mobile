import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RootStackScreenProps } from '../navigation/types';

type ProductFormScreenProps = RootStackScreenProps<'ProductForm'>;

export default function ProductFormScreen({ route }: ProductFormScreenProps) {
  const { mode, productId } = route.params;
  const isEditing = mode === 'edit';

  return (
    <SafeAreaView style={styles.container} edges={['right', 'bottom', 'left']}>
      <View style={styles.content}>
        <Text style={styles.title}>
          {isEditing ? 'Modifier un produit' : 'Créer un produit'}
        </Text>
        <Text style={styles.description}>
          {isEditing
            ? `Le formulaire chargera le produit ${productId}.`
            : 'Le formulaire de création sera ajouté dans une prochaine étape.'}
        </Text>
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
  },
});
