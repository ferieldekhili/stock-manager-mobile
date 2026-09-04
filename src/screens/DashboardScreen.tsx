import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ProductCard from '../components/ProductCard';
import ScreenState from '../components/ScreenState';
import type { RootStackScreenProps } from '../navigation/types';
import { getProducts } from '../services/api';
import type { Product, StockStatus } from '../types/product';
import { getStockStatus } from '../utils/stockStatus';

type DashboardScreenProps = RootStackScreenProps<'Dashboard'>;

type StatCardProps = {
  label: string;
  value: number;
  backgroundColor: string;
  color: string;
};

type CategoryCount = {
  name: string;
  count: number;
};

const STATUS_PRIORITY: Record<StockStatus, number> = {
  OUT_OF_STOCK: 0,
  LOW: 1,
  NORMAL: 2,
};

function StatCard({
  label,
  value,
  backgroundColor,
  color,
}: StatCardProps) {
  return (
    <View style={[styles.statCard, { backgroundColor }]}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={[styles.statLabel, { color }]}>{label}</Text>
    </View>
  );
}

export default function DashboardScreen({ navigation }: DashboardScreenProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    setError(null);
    setIsLoading(true);

    try {
      setProducts(await getProducts());
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Impossible de charger le tableau de bord.',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadProducts();
    }, [loadProducts]),
  );

  const dashboardData = useMemo(() => {
    const statusCounts: Record<StockStatus, number> = {
      NORMAL: 0,
      LOW: 0,
      OUT_OF_STOCK: 0,
    };
    const categoryMap = new Map<string, number>();

    products.forEach((product) => {
      const status = getStockStatus(
        product.quantity,
        product.alertThreshold,
      );

      statusCounts[status] += 1;
      categoryMap.set(
        product.category,
        (categoryMap.get(product.category) ?? 0) + 1,
      );
    });

    const alerts = products
      .filter(
        (product) =>
          getStockStatus(product.quantity, product.alertThreshold) !== 'NORMAL',
      )
      .sort((firstProduct, secondProduct) => {
        const firstStatus = getStockStatus(
          firstProduct.quantity,
          firstProduct.alertThreshold,
        );
        const secondStatus = getStockStatus(
          secondProduct.quantity,
          secondProduct.alertThreshold,
        );

        return (
          STATUS_PRIORITY[firstStatus] - STATUS_PRIORITY[secondStatus] ||
          firstProduct.quantity - secondProduct.quantity
        );
      });

    const categories: CategoryCount[] = Array.from(categoryMap)
      .map(([name, count]) => ({ name, count }))
      .sort((firstCategory, secondCategory) =>
        firstCategory.name.localeCompare(secondCategory.name, 'fr'),
      );

    return { statusCounts, alerts, categories };
  }, [products]);

  if (isLoading && products.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['right', 'bottom', 'left']}>
        <ScreenState loading title="Chargement du tableau de bord..." />
      </SafeAreaView>
    );
  }

  if (error && products.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['right', 'bottom', 'left']}>
        <ScreenState
          actionLabel="Réessayer"
          message={error}
          onAction={() => void loadProducts()}
          title="Chargement impossible"
        />
      </SafeAreaView>
    );
  }

  const { statusCounts, alerts, categories } = dashboardData;
  const maximumCategoryCount = Math.max(
    ...categories.map((category) => category.count),
    1,
  );

  return (
    <SafeAreaView style={styles.container} edges={['right', 'bottom', 'left']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            onRefresh={() => void loadProducts()}
            refreshing={isLoading}
            tintColor="#2563EB"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.greetingCard}>
          <Text style={styles.greeting}>
            Bonjour, est-ce que vous allez bien aujourd’hui ?
          </Text>
          <Text style={styles.greetingSubtitle}>
            Voici la situation actuelle de votre stock.
          </Text>
        </View>

        {error ? (
          <View accessibilityLiveRegion="polite" style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{error}</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => void loadProducts()}
            >
              <Text style={styles.errorBannerAction}>Réessayer</Text>
            </Pressable>
          </View>
        ) : null}

        <View
          accessibilityLiveRegion="polite"
          style={[
            styles.priorityMessage,
            statusCounts.OUT_OF_STOCK > 0
              ? styles.priorityMessageDanger
              : styles.priorityMessageSuccess,
          ]}
        >
          <Text
            style={[
              styles.priorityMessageText,
              statusCounts.OUT_OF_STOCK > 0
                ? styles.priorityMessageTextDanger
                : styles.priorityMessageTextSuccess,
            ]}
          >
            {statusCounts.OUT_OF_STOCK > 0
              ? `${statusCounts.OUT_OF_STOCK} produit${statusCounts.OUT_OF_STOCK > 1 ? 's sont' : ' est'} en rupture de stock.`
              : 'Aucun produit en rupture de stock.'}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Vue d’ensemble</Text>
        <View style={styles.statsGrid}>
          <StatCard
            backgroundColor="#DBEAFE"
            color="#1D4ED8"
            label="Produits"
            value={products.length}
          />
          <StatCard
            backgroundColor="#FEE2E2"
            color="#B91C1C"
            label="En rupture"
            value={statusCounts.OUT_OF_STOCK}
          />
          <StatCard
            backgroundColor="#FEF3C7"
            color="#92400E"
            label="Stock faible"
            value={statusCounts.LOW}
          />
          <StatCard
            backgroundColor="#DCFCE7"
            color="#166534"
            label="Stock normal"
            value={statusCounts.NORMAL}
          />
        </View>

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.navigate('Products')}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.primaryButtonText}>Voir tous les produits</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() =>
              navigation.navigate('ProductForm', { mode: 'create' })
            }
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.secondaryButtonText}>Ajouter un produit</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>Alertes prioritaires</Text>
        {alerts.length > 0 ? (
          <View style={styles.alerts}>
            {alerts.map((product) => (
              <ProductCard
                key={product.id}
                onPress={() =>
                  navigation.navigate('ProductDetail', {
                    productId: product.id,
                  })
                }
                product={product}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyAlerts}>
            <Text style={styles.emptyAlertsTitle}>Aucune alerte</Text>
            <Text style={styles.emptyAlertsText}>
              Tous les produits ont un niveau de stock normal.
            </Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Répartition par catégorie</Text>
        <View style={styles.categoryCard}>
          {categories.length > 0 ? (
            categories.map((category) => {
              const width = Math.max(
                (category.count / maximumCategoryCount) * 100,
                8,
              );

              return (
                <View key={category.name} style={styles.categoryRow}>
                  <View style={styles.categoryHeading}>
                    <Text style={styles.categoryName}>{category.name}</Text>
                    <Text style={styles.categoryCount}>{category.count}</Text>
                  </View>
                  <View style={styles.categoryBarTrack}>
                    <View
                      style={[styles.categoryBarFill, { width: `${width}%` }]}
                    />
                  </View>
                </View>
              );
            })
          ) : (
            <Text style={styles.emptyAlertsText}>Aucune donnée disponible.</Text>
          )}
        </View>
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
    paddingBottom: 40,
  },
  greetingCard: {
    backgroundColor: '#1D4ED8',
    borderRadius: 18,
    padding: 22,
  },
  greeting: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 30,
  },
  greetingSubtitle: {
    color: '#DBEAFE',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  errorBanner: {
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    padding: 12,
  },
  errorBannerText: {
    color: '#991B1B',
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  errorBannerAction: {
    color: '#B91C1C',
    fontSize: 13,
    fontWeight: '700',
  },
  priorityMessage: {
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 16,
    padding: 14,
  },
  priorityMessageDanger: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  priorityMessageSuccess: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  priorityMessageText: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 21,
  },
  priorityMessageTextDanger: {
    color: '#991B1B',
  },
  priorityMessageTextSuccess: {
    color: '#166534',
  },
  sectionTitle: {
    color: '#111827',
    fontSize: 19,
    fontWeight: '700',
    marginBottom: 12,
    marginTop: 28,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    borderRadius: 14,
    minHeight: 108,
    padding: 16,
    width: '48%',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 6,
  },
  actions: {
    gap: 10,
    marginTop: 20,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 10,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 16,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#2563EB',
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 16,
  },
  secondaryButtonText: {
    color: '#1D4ED8',
    fontSize: 15,
    fontWeight: '700',
  },
  buttonPressed: {
    opacity: 0.75,
  },
  alerts: {
    gap: 12,
  },
  emptyAlerts: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderRadius: 14,
    borderWidth: 1,
    padding: 18,
  },
  emptyAlertsTitle: {
    color: '#166534',
    fontSize: 16,
    fontWeight: '700',
  },
  emptyAlertsText: {
    color: '#6B7280',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  categoryCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderRadius: 14,
    borderWidth: 1,
    gap: 18,
    padding: 18,
  },
  categoryRow: {
    gap: 8,
  },
  categoryHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  categoryName: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },
  categoryCount: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '700',
  },
  categoryBarTrack: {
    backgroundColor: '#E5E7EB',
    borderRadius: 999,
    height: 10,
    overflow: 'hidden',
  },
  categoryBarFill: {
    backgroundColor: '#2563EB',
    borderRadius: 999,
    height: '100%',
  },
});
