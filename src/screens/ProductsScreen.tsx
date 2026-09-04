import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';
import type { RootStackScreenProps } from '../navigation/types';
import { getProducts } from '../services/api';
import type { Product } from '../types/product';

type ProductsScreenProps = RootStackScreenProps<'Products'>;

export default function ProductsScreen({ navigation }: ProductsScreenProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = useMemo(
    () =>
      Array.from(new Set(products.map((product) => product.category))).sort(
        (firstCategory, secondCategory) =>
          firstCategory.localeCompare(secondCategory, 'fr'),
      ),
    [products],
  );

  const filteredProducts = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === null || product.category === selectedCategory;
      const matchesSearch =
        normalizedQuery.length === 0 ||
        product.name.toLowerCase().includes(normalizedQuery) ||
        product.reference.toLowerCase().includes(normalizedQuery);

      return matchesCategory && matchesSearch;
    });
  }, [products, searchQuery, selectedCategory]);

  const hasActiveFilters =
    searchQuery.trim().length > 0 || selectedCategory !== null;

  const loadProducts = useCallback(async () => {
    setError(null);
    setIsLoading(true);

    try {
      setProducts(await getProducts());
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Impossible de charger les produits.',
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

  if (isLoading && products.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['right', 'bottom', 'left']}>
        <View style={styles.centeredState}>
          <ActivityIndicator color="#2563EB" size="large" />
          <Text style={styles.stateTitle}>Chargement des produits...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['right', 'bottom', 'left']}>
        <View style={styles.centeredState}>
          <Text style={styles.stateTitle}>Chargement impossible</Text>
          <Text style={styles.stateMessage}>{error}</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => void loadProducts()}
            style={({ pressed }) => [
              styles.retryButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['right', 'bottom', 'left']}>
      <FlatList
        contentContainerStyle={[
          styles.listContent,
          filteredProducts.length === 0 && styles.emptyListContent,
        ]}
        data={filteredProducts}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        keyExtractor={(product) => product.id}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.stateTitle}>
              {hasActiveFilters ? 'Aucun résultat' : 'Aucun produit'}
            </Text>
            <Text style={styles.stateMessage}>
              {hasActiveFilters
                ? 'Modifiez la recherche ou choisissez une autre catégorie.'
                : 'Ajoutez votre premier produit pour commencer à gérer le stock.'}
            </Text>
          </View>
        }
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <View style={styles.header}>
              <View style={styles.headerText}>
                <Text style={styles.title}>Gestion du stock</Text>
                <Text style={styles.subtitle}>
                  {filteredProducts.length} produit
                  {filteredProducts.length !== 1 ? 's' : ''} affiché
                  {filteredProducts.length !== 1 ? 's' : ''}
                </Text>
              </View>
              <Pressable
                accessibilityLabel="Créer un produit"
                accessibilityRole="button"
                onPress={() =>
                  navigation.navigate('ProductForm', { mode: 'create' })
                }
                style={({ pressed }) => [
                  styles.createButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.createButtonText}>Ajouter</Text>
              </Pressable>
            </View>

            <SearchBar value={searchQuery} onChangeText={setSearchQuery} />

            <Text style={styles.filterLabel}>Catégorie</Text>
            <ScrollView
              contentContainerStyle={styles.categoryFilters}
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: selectedCategory === null }}
                onPress={() => setSelectedCategory(null)}
                style={[
                  styles.categoryButton,
                  selectedCategory === null && styles.categoryButtonSelected,
                ]}
              >
                <Text
                  style={[
                    styles.categoryButtonText,
                    selectedCategory === null &&
                      styles.categoryButtonTextSelected,
                  ]}
                >
                  Toutes
                </Text>
              </Pressable>
              {categories.map((category) => {
                const isSelected = selectedCategory === category;

                return (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    key={category}
                    onPress={() => setSelectedCategory(category)}
                    style={[
                      styles.categoryButton,
                      isSelected && styles.categoryButtonSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryButtonText,
                        isSelected && styles.categoryButtonTextSelected,
                      ]}
                    >
                      {category}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        }
        onRefresh={() => void loadProducts()}
        refreshing={isLoading}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() =>
              navigation.navigate('ProductDetail', { productId: item.id })
            }
          />
        )}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F6F7F9',
    flex: 1,
  },
  listContent: {
    padding: 20,
    paddingBottom: 32,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  listHeader: {
    marginBottom: 20,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerText: {
    flex: 1,
    marginRight: 16,
  },
  title: {
    color: '#111827',
    fontSize: 26,
    fontWeight: '700',
  },
  subtitle: {
    color: '#6B7280',
    fontSize: 15,
    marginTop: 4,
  },
  createButton: {
    alignItems: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 10,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 16,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  buttonPressed: {
    opacity: 0.75,
  },
  separator: {
    height: 12,
  },
  filterLabel: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  categoryFilters: {
    gap: 8,
    paddingRight: 20,
  },
  categoryButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D1D5DB',
    borderRadius: 999,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 40,
    paddingHorizontal: 14,
  },
  categoryButtonSelected: {
    backgroundColor: '#DBEAFE',
    borderColor: '#2563EB',
  },
  categoryButtonText: {
    color: '#4B5563',
    fontSize: 14,
    fontWeight: '600',
  },
  categoryButtonTextSelected: {
    color: '#1D4ED8',
  },
  centeredState: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 32,
  },
  emptyState: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 80,
    paddingHorizontal: 24,
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
  retryButton: {
    backgroundColor: '#2563EB',
    borderRadius: 10,
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
