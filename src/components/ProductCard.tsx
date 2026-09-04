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
        </View>
        <StockBadge
          quantity={product.quantity}
          alertThreshold={product.alertThreshold}
        />
      </View>

      <View style={styles.stockInformation}>
        <Text style={styles.stockLabel}>Quantité</Text>
        <Text style={styles.stockValue}>{product.quantity}</Text>
        <Text style={styles.threshold}>
          Seuil d’alerte : {product.alertThreshold}
        </Text>
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
    minHeight: 132,
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
    color: '#6B7280',
    fontSize: 14,
    marginTop: 4,
  },
  stockInformation: {
    alignItems: 'baseline',
    flexDirection: 'row',
    marginTop: 20,
  },
  stockLabel: {
    color: '#6B7280',
    fontSize: 14,
    marginRight: 8,
  },
  stockValue: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '700',
  },
  threshold: {
    color: '#6B7280',
    fontSize: 13,
    marginLeft: 'auto',
  },
});
