import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Dashboard: undefined;
  Products: undefined;
  ProductDetail: { productId: string };
  ProductForm:
    | { mode: 'create'; productId?: never }
    | { mode: 'edit'; productId: string };
};

export type RootStackScreenProps<
  RouteName extends keyof RootStackParamList,
> = NativeStackScreenProps<RootStackParamList, RouteName>;
