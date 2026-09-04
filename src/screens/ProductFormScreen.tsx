import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import FormField from '../components/FormField';
import type { RootStackScreenProps } from '../navigation/types';
import { createProduct, getProduct, updateProduct } from '../services/api';
import type { CreateProductInput } from '../types/product';

type ProductFormScreenProps = RootStackScreenProps<'ProductForm'>;

type FormValues = {
  name: string;
  reference: string;
  description: string;
  category: string;
  quantity: string;
  alertThreshold: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

const INITIAL_VALUES: FormValues = {
  name: '',
  reference: '',
  description: '',
  category: '',
  quantity: '0',
  alertThreshold: '0',
};

function readNonNegativeInteger(
  value: string,
  label: string,
): { value?: number; error?: string } {
  const normalizedValue = value.trim();
  const number = Number(normalizedValue);

  if (
    !/^\d+$/.test(normalizedValue) ||
    !Number.isSafeInteger(number) ||
    number < 0
  ) {
    return { error: `${label} doit être un entier positif ou nul.` };
  }

  return { value: number };
}

function validateForm(values: FormValues): {
  errors: FormErrors;
  input?: CreateProductInput;
} {
  const errors: FormErrors = {};
  const name = values.name.trim();
  const reference = values.reference.trim();
  const category = values.category.trim();
  const quantity = readNonNegativeInteger(values.quantity, 'La quantité');
  const alertThreshold = readNonNegativeInteger(
    values.alertThreshold,
    'Le seuil d’alerte',
  );

  if (!name) {
    errors.name = 'Le nom est obligatoire.';
  }
  if (!reference) {
    errors.reference = 'La référence est obligatoire.';
  }
  if (!category) {
    errors.category = 'La catégorie est obligatoire.';
  }
  if (quantity.error) {
    errors.quantity = quantity.error;
  }
  if (alertThreshold.error) {
    errors.alertThreshold = alertThreshold.error;
  }

  if (
    Object.keys(errors).length > 0 ||
    quantity.value === undefined ||
    alertThreshold.value === undefined
  ) {
    return { errors };
  }

  return {
    errors,
    input: {
      name,
      reference,
      description: values.description.trim() || undefined,
      category,
      quantity: quantity.value,
      alertThreshold: alertThreshold.value,
    },
  };
}

export default function ProductFormScreen({
  navigation,
  route,
}: ProductFormScreenProps) {
  const isEditing = route.params.mode === 'edit';
  const productId = isEditing ? route.params.productId : undefined;
  const [values, setValues] = useState<FormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const loadProduct = useCallback(async () => {
    if (!productId) {
      return;
    }

    setLoadError(null);
    setIsLoading(true);

    try {
      const product = await getProduct(productId);

      setValues({
        name: product.name,
        reference: product.reference,
        description: product.description ?? '',
        category: product.category,
        quantity: String(product.quantity),
        alertThreshold: String(product.alertThreshold),
      });
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : 'Impossible de charger le produit.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    void loadProduct();
  }, [loadProduct]);

  const updateValue = (field: keyof FormValues, value: string) => {
    setValues((currentValues) => ({ ...currentValues, [field]: value }));
    setErrors((currentErrors) => ({ ...currentErrors, [field]: undefined }));
    setSubmitError(null);
  };

  const handleSubmit = async () => {
    if (isSubmitting) {
      return;
    }

    const validation = validateForm(values);
    setErrors(validation.errors);
    setSubmitError(null);

    if (!validation.input) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditing && productId) {
        await updateProduct(productId, validation.input);
        navigation.goBack();
      } else {
        const product = await createProduct(validation.input);
        navigation.replace('ProductDetail', { productId: product.id });
      }
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'Impossible d’enregistrer le produit.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['right', 'bottom', 'left']}>
        <View style={styles.centeredState}>
          <ActivityIndicator color="#2563EB" size="large" />
          <Text style={styles.stateTitle}>Chargement du produit...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loadError) {
    return (
      <SafeAreaView style={styles.container} edges={['right', 'bottom', 'left']}>
        <View style={styles.centeredState}>
          <Text style={styles.stateTitle}>Chargement impossible</Text>
          <Text style={styles.stateMessage}>{loadError}</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => void loadProduct()}
            style={({ pressed }) => [
              styles.submitButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.submitButtonText}>Réessayer</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['right', 'bottom', 'left']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>
            {isEditing ? 'Modifier le produit' : 'Nouveau produit'}
          </Text>
          <Text style={styles.description}>
            Les champs marqués d’un astérisque sont obligatoires.
          </Text>

          <View style={styles.form}>
            <FormField
              label="Nom *"
              onChangeText={(value) => updateValue('name', value)}
              placeholder="Ex. Clavier sans fil"
              value={values.name}
              error={errors.name}
            />
            <FormField
              autoCapitalize="characters"
              label="Référence *"
              onChangeText={(value) => updateValue('reference', value)}
              placeholder="Ex. INF-CLA-001"
              value={values.reference}
              error={errors.reference}
            />
            <FormField
              label="Catégorie *"
              onChangeText={(value) => updateValue('category', value)}
              placeholder="Ex. Informatique"
              value={values.category}
              error={errors.category}
            />
            <FormField
              keyboardType="number-pad"
              label={isEditing ? 'Quantité *' : 'Quantité initiale *'}
              onChangeText={(value) => updateValue('quantity', value)}
              placeholder="0"
              value={values.quantity}
              error={errors.quantity}
            />
            <FormField
              keyboardType="number-pad"
              label="Seuil d’alerte *"
              onChangeText={(value) => updateValue('alertThreshold', value)}
              placeholder="0"
              value={values.alertThreshold}
              error={errors.alertThreshold}
            />
            <FormField
              label="Description"
              multiline
              onChangeText={(value) => updateValue('description', value)}
              placeholder="Informations complémentaires"
              value={values.description}
              error={errors.description}
            />
          </View>

          {submitError ? (
            <Text accessibilityLiveRegion="polite" style={styles.submitError}>
              {submitError}
            </Text>
          ) : null}

          <Pressable
            accessibilityRole="button"
            disabled={isSubmitting}
            onPress={() => void handleSubmit()}
            style={({ pressed }) => [
              styles.submitButton,
              pressed && styles.buttonPressed,
              isSubmitting && styles.buttonDisabled,
            ]}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>
                {isEditing ? 'Enregistrer les modifications' : 'Créer le produit'}
              </Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
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
  title: {
    color: '#111827',
    fontSize: 26,
    fontWeight: '700',
  },
  description: {
    color: '#6B7280',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },
  form: {
    marginTop: 24,
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
  submitError: {
    color: '#B91C1C',
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
  submitButton: {
    alignItems: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 10,
    justifyContent: 'center',
    minHeight: 50,
    paddingHorizontal: 20,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  buttonPressed: {
    opacity: 0.75,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
});
