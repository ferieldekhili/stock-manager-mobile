import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import StockBadge from '../components/StockBadge';
import type { RootStackScreenProps } from '../navigation/types';
import { getProduct } from '../services/api';
import type { Product } from '../types/product';

type ProductDetailScreenProps = RootStackScreenProps<'ProductDetail'>;

type InformationRowProps = {
  label: string;
  value: string;
};

function InformationRow({ label, value }: InformationRowProps) {
  return (
    <View style={styles.informationRow}>
      <Text style={styles.informationLabel}>{label}</Text>
      <Text style={styles.informationValue}>{value}</Text>
    </View>
  );
}

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ProductDetailScreen({
  navigation,
  route,
}: ProductDetailScreenProps) {
  const { productId } = route.params;
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProduct = useCallback(async () => {
    setError(null);
    setIsLoading(true);

    try {
      setProduct(await getProduct(productId));
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Impossible de charger le produit.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  useFocusEffect(
    useCallback(() => {
      void loadProduct();
    }, [loadProduct]),
  );

  if (isLoading && product === null) {
    return (
      <SafeAreaView style={styles.container} edges={['right', 'bottom', 'left']}>
        <View style={styles.centeredState}>
          <ActivityIndicator color="#2563EB" size="large" />
          <Text style={styles.stateTitle}>Chargement du produit...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || product === null) {
    return (
      <SafeAreaView style={styles.container} edges={['right', 'bottom', 'left']}>
        <View style={styles.centeredState}>
          <Text style={styles.stateTitle}>Produit indisponible</Text>
          <Text style={styles.stateMessage}>
            {error ?? 'Ce produit est introuvable.'}
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => void loadProduct()}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.primaryButtonText}>Réessayer</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['right', 'bottom', 'left']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heading}>
          <View style={styles.headingText}>
            <Text style={styles.title}>{product.name}</Text>
            <Text style={styles.reference}>{product.reference}</Text>
          </View>
          <StockBadge
            quantity={product.quantity}
            alertThreshold={product.alertThreshold}
          />
        </View>

        <View style={styles.stockCard}>
          <View>
            <Text style={styles.stockLabel}>Quantité en stock</Text>
            <Text style={styles.stockValue}>{product.quantity}</Text>
          </View>
          <View style={styles.thresholdBlock}>
            <Text style={styles.stockLabel}>Seuil d’alerte</Text>
            <Text style={styles.thresholdValue}>{product.alertThreshold}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations</Text>
          <InformationRow label="Catégorie" value={product.category} />
          <InformationRow label="Référence" value={product.reference} />
          <InformationRow
            label="Créé le"
            value={formatDate(product.createdAt)}
          />
          <InformationRow
            label="Mis à jour le"
            value={formatDate(product.updatedAt)}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>
            {product.description ?? 'Aucune description renseignée.'}
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() =>
            navigation.navigate('ProductForm', {
              mode: 'edit',
              productId,
            })
          }
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.primaryButtonText}>Modifier le produit</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F6F7F9',
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 32,
  },
  heading: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  headingText: {
    flex: 1,
  },
  title: {
    color: '#111827',
    fontSize: 28,
    fontWeight: '700',
  },
  reference: {
    color: '#6B7280',
    fontSize: 15,
    marginTop: 6,
  },
  stockCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    padding: 20,
  },
  stockLabel: {
    color: '#6B7280',
    fontSize: 14,
  },
  stockValue: {
    color: '#111827',
    fontSize: 36,
    fontWeight: '700',
    marginTop: 4,
  },
  thresholdBlock: {
    alignItems: 'flex-end',
  },
  thresholdValue: {
    color: '#111827',
    fontSize: 24,
    fontWeight: '700',
    marginTop: 8,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 16,
    padding: 18,
  },
  sectionTitle: {
    color: '#111827',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 12,
  },
  informationRow: {
    borderTopColor: '#F3F4F6',
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  informationLabel: {
    color: '#6B7280',
    fontSize: 14,
  },
  informationValue: {
    color: '#111827',
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
  },
  description: {
    color: '#4B5563',
    fontSize: 16,
    lineHeight: 24,
  },
  centeredState: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 32,
  },
  stateTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
    textAlign: 'center',
  },
  stateMessage: {
    color: '#6B7280',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
    textAlign: 'center',
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 10,
    justifyContent: 'center',
    marginTop: 24,
    minHeight: 48,
    paddingHorizontal: 20,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  buttonPressed: {
    opacity: 0.75,
  },
});
