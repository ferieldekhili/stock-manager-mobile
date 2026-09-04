import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Product } from '../types/product';
import StockBadge from './StockBadge';

type ProductCardProps = {
  product: Product;
  onPress: () => void;
};

export default function ProductCard({ product, onPress }: ProductCardProps) {
  return (
    <Pressable
      accessibilityHint="Ouvre le détail du produit"
      accessibilityLabel={`${product.name}, quantité ${product.quantity}`}
      accessibilityRole="button"
      android_ripple={{ color: '#E5E7EB' }}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.header}>
        <View style={styles.heading}>
          <Text numberOfLines={1} style={styles.name}>
            {product.name}
          </Text>
          <Text numberOfLines={1} style={styles.category}>
            {product.category}
          </Text>
          <Text numberOfLines={1} style={styles.reference}>
            Réf. {product.reference}
          </Text>
        </View>
        <StockBadge
          quantity={product.quantity}
          alertThreshold={product.alertThreshold}
        />
      </View>

      <View style={styles.stockInformation}>
        <View>
          <Text style={styles.stockLabel}>Quantité en stock</Text>
          <Text style={styles.stockValue}>{product.quantity}</Text>
        </View>
        <View style={styles.thresholdBlock}>
          <Text style={styles.stockLabel}>Seuil d’alerte</Text>
          <Text style={styles.thresholdValue}>{product.alertThreshold}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderRadius: 14,
    borderWidth: 1,
    minHeight: 156,
    overflow: 'hidden',
    padding: 16,
  },
  cardPressed: {
    opacity: 0.75,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  heading: {
    flex: 1,
  },
  name: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '700',
  },
  category: {
    color: '#4B5563',
    fontSize: 14,
    marginTop: 4,
  },
  reference: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 3,
  },
  stockInformation: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  stockLabel: {
    color: '#6B7280',
    fontSize: 12,
  },
  stockValue: {
    color: '#111827',
    fontSize: 24,
    fontWeight: '700',
    marginTop: 2,
  },
  thresholdBlock: {
    alignItems: 'flex-end',
  },
  thresholdValue: {
    color: '#374151',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 2,
  },
});
