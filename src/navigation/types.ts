import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Products: undefined;
  ProductDetail: { productId: string };
  ProductForm: {
    mode: 'create' | 'edit';
    productId?: string;
  };
};

export type RootStackScreenProps<
  RouteName extends keyof RootStackParamList,
> = NativeStackScreenProps<RootStackParamList, RouteName>;
