import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Account } from '@/types/database.types';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { Eye, EyeOff, Plus, Mic } from 'lucide-react-native';
import { VoiceInputModal } from '@/components/VoiceInputModal';

export default function AccountsScreen() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBalances, setShowBalances] = useState(true);
  const [showVoiceModal, setShowVoiceModal] = useState(false);

  useEffect(() => {
    if (user) {
      fetchAccounts();
    }
  }, [user]);

  const fetchAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAccounts(data || []);
    } catch (error) {
      console.error('Error fetching accounts:', error);
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

  const getAccountTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      checking: 'Cuenta Corriente',
      savings: 'Cuenta de Ahorro',
      credit: 'Tarjeta de Crédito',
    };
    return labels[type] || type;
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + Number(acc.balance), 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hola</Text>
          <Text style={styles.headerTitle}>Tus Cuentas</Text>
        </View>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => setShowBalances(!showBalances)}
        >
          {showBalances ? (
            <Eye size={24} color={Colors.text.primary} />
          ) : (
            <EyeOff size={24} color={Colors.text.primary} />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>Balance Total</Text>
        <Text style={styles.totalAmount}>
          {showBalances ? formatCurrency(totalBalance) : '••••••'}
        </Text>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setShowVoiceModal(true)}
        >
          <View style={styles.actionIconContainer}>
            <Mic size={20} color={Colors.neutral.white} />
          </View>
          <Text style={styles.actionText}>Agregar por Voz</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.accountsList}
        contentContainerStyle={styles.accountsListContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Mis Cuentas</Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary.main} />
          </View>
        ) : accounts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No tienes cuentas registradas</Text>
            <Text style={styles.emptySubtext}>
              Usa el botón de voz para agregar tu primera cuenta
            </Text>
          </View>
        ) : (
          accounts.map((account) => (
            <TouchableOpacity key={account.id} style={styles.accountCard}>
              <View style={styles.accountHeader}>
                <Text style={styles.accountType}>
                  {getAccountTypeLabel(account.account_type)}
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    account.status === 'active' && styles.statusActive,
                  ]}
                >
                  <Text style={styles.statusText}>
                    {account.status === 'active' ? 'Activa' : 'Inactiva'}
                  </Text>
                </View>
              </View>
              <Text style={styles.accountNumber}>
                •••• {account.account_number.slice(-4)}
              </Text>
              <Text style={styles.accountBalance}>
                {showBalances ? formatCurrency(Number(account.balance)) : '••••••'}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <VoiceInputModal
        visible={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
        onSuccess={fetchAccounts}
        entityType="account"
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
  greeting: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral.white,
    opacity: 0.9,
  },
  headerTitle: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.neutral.white,
    marginTop: Spacing.xs,
  },
  iconButton: {
    padding: Spacing.sm,
    backgroundColor: Colors.neutral.white + '20',
    borderRadius: BorderRadius.full,
  },
  totalCard: {
    backgroundColor: Colors.neutral.white,
    marginHorizontal: Spacing.lg,
    marginTop: -Spacing.xl,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    shadowColor: Colors.primary.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  totalLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  totalAmount: {
    fontSize: Typography.fontSize.xxxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  actionsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral.white,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    shadowColor: Colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIconContainer: {
    backgroundColor: Colors.secondary.main,
    padding: Spacing.xs,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.xs,
  },
  actionText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
  accountsList: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  accountsListContent: {
    paddingBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
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
  accountCard: {
    backgroundColor: Colors.neutral.white,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    shadowColor: Colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  accountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  accountType: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.neutral.lightGray,
  },
  statusActive: {
    backgroundColor: Colors.status.success + '20',
  },
  statusText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.status.success,
  },
  accountNumber: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.tertiary,
    marginBottom: Spacing.sm,
  },
  accountBalance: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
});
