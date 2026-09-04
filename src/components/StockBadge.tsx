import { StyleSheet, Text, View } from 'react-native';

import type { StockStatus } from '../types/product';
import { getStockStatus } from '../utils/stockStatus';

type StockBadgeProps = {
  quantity: number;
  alertThreshold: number;
};

const STATUS_DISPLAY: Record<
  StockStatus,
  { label: string; backgroundColor: string; color: string; dotColor: string }
> = {
  NORMAL: {
    label: 'Normal',
    backgroundColor: '#DCFCE7',
    color: '#166534',
    dotColor: '#16A34A',
  },
  LOW: {
    label: 'Stock faible',
    backgroundColor: '#FEF3C7',
    color: '#92400E',
    dotColor: '#F59E0B',
  },
  OUT_OF_STOCK: {
    label: 'Rupture',
    backgroundColor: '#FEE2E2',
    color: '#991B1B',
    dotColor: '#DC2626',
  },
};

export default function StockBadge({
  quantity,
  alertThreshold,
}: StockBadgeProps) {
  const status = getStockStatus(quantity, alertThreshold);
  const display = STATUS_DISPLAY[status];

  return (
    <View
      accessible
      accessibilityLabel={`Statut du stock : ${display.label}`}
      style={[styles.badge, { backgroundColor: display.backgroundColor }]}
    >
      <View style={[styles.dot, { backgroundColor: display.dotColor }]} />
      <Text style={[styles.label, { color: display.color }]}>
        {display.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  dot: {
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
});
