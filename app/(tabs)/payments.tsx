import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Transaction } from '@/types/database.types';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { ArrowUpRight, ArrowDownLeft, Repeat, DollarSign, Mic } from 'lucide-react-native';
import { VoiceInputModal } from '@/components/VoiceInputModal';

export default function PaymentsScreen() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showVoiceModal, setShowVoiceModal] = useState(false);

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user]);

  const fetchTransactions = async () => {
    try {
      const { data: accountsData } = await supabase
        .from('accounts')
        .select('id')
        .eq('user_id', user?.id);

      if (!accountsData || accountsData.length === 0) {
        setLoading(false);
        return;
      }

      const accountIds = accountsData.map(acc => acc.id);

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .in('account_id', accountIds)
        .order('transaction_date', { ascending: false })
        .limit(50);

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return <ArrowUpRight size={20} color={Colors.status.error} />;
      case 'deposit':
        return <ArrowDownLeft size={20} color={Colors.status.success} />;
      case 'transfer':
        return <Repeat size={20} color={Colors.accent.teal} />;
      case 'withdrawal':
        return <DollarSign size={20} color={Colors.accent.orange} />;
      default:
        return <DollarSign size={20} color={Colors.neutral.gray} />;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      payment: 'Pago',
      deposit: 'Depósito',
      transfer: 'Transferencia',
      withdrawal: 'Retiro',
    };
    return labels[type] || type;
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      food: 'Comida',
      transport: 'Transporte',
      entertainment: 'Entretenimiento',
      shopping: 'Compras',
      bills: 'Facturas',
      health: 'Salud',
      other: 'Otro',
    };
    return labels[category] || category;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pagos y Movimientos</Text>
        {/* <TouchableOpacity
          style={styles.voiceButton}
          onPress={() => setShowVoiceModal(true)}
        >
          <Mic size={20} color={Colors.neutral.white} />
        </TouchableOpacity> */}
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary.main} />
          </View>
        ) : transactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No tienes transacciones</Text>
            <Text style={styles.emptySubtext}>
              Usa el botón de voz para agregar tus primeros movimientos
            </Text>
          </View>
        ) : (
          transactions.map((transaction) => (
            <TouchableOpacity key={transaction.id} style={styles.transactionCard}>
              <View style={styles.transactionIcon}>
                {getTransactionIcon(transaction.type)}
              </View>
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionDescription}>
                  {transaction.description}
                </Text>
                <View style={styles.transactionMeta}>
                  <Text style={styles.transactionType}>
                    {getTypeLabel(transaction.type)}
                  </Text>
                  <Text style={styles.transactionDot}>•</Text>
                  <Text style={styles.transactionCategory}>
                    {getCategoryLabel(transaction.category)}
                  </Text>
                </View>
                <Text style={styles.transactionDate}>
                  {formatDate(transaction.transaction_date)}
                </Text>
              </View>
              <View style={styles.transactionRight}>
                <Text
                  style={[
                    styles.transactionAmount,
                    transaction.type === 'deposit' && styles.transactionAmountPositive,
                    (transaction.type === 'payment' || transaction.type === 'withdrawal') && styles.transactionAmountNegative,
                  ]}
                >
                  {transaction.type === 'deposit' ? '+' : '-'}
                  {formatCurrency(Number(transaction.amount))}
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    transaction.status === 'completed' && styles.statusCompleted,
                    transaction.status === 'pending' && styles.statusPending,
                    transaction.status === 'failed' && styles.statusFailed,
                  ]}
                >
                  <Text style={styles.statusText}>
                    {transaction.status === 'completed' && 'Completado'}
                    {transaction.status === 'pending' && 'Pendiente'}
                    {transaction.status === 'failed' && 'Fallido'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <VoiceInputModal
        visible={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
        onSuccess={fetchTransactions}
        entityType="transaction"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  header: {
    backgroundColor: Colors.primary.main,
    paddingTop: 60,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.neutral.white,
  },
  voiceButton: {
    padding: Spacing.sm,
    backgroundColor: Colors.secondary.main,
    borderRadius: BorderRadius.full,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  contentContainer: {
    paddingBottom: Spacing.xl,
  },
  loadingContainer: {
    paddingVertical: Spacing.xxl,
    alignItems: 'center',
  },
  emptyState: {
    paddingVertical: Spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  emptySubtext: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.tertiary,
    textAlign: 'center',
  },
  transactionCard: {
    backgroundColor: Colors.neutral.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: Colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  transactionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  transactionType: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.tertiary,
  },
  transactionDot: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.tertiary,
    marginHorizontal: 4,
  },
  transactionCategory: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.tertiary,
  },
  transactionDate: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.tertiary,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  transactionAmountPositive: {
    color: Colors.status.success,
  },
  transactionAmountNegative: {
    color: Colors.status.error,
  },
  statusBadge: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  statusCompleted: {
    backgroundColor: Colors.status.success + '20',
  },
  statusPending: {
    backgroundColor: Colors.status.warning + '20',
  },
  statusFailed: {
    backgroundColor: Colors.status.error + '20',
  },
  statusText: {
    fontSize: 10,
    fontWeight: Typography.fontWeight.semibold,
  },
});
