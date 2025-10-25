import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Switch } from 'react-native';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { PersonalFinanceAlert } from '@/types/database.types';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { Bell, Plus, Trash2, Mic } from 'lucide-react-native';
import { VoiceInputModal } from '@/components/VoiceInputModal';

export default function FinanceScreen() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<PersonalFinanceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showVoiceModal, setShowVoiceModal] = useState(false);

  useEffect(() => {
    if (user) {
      fetchAlerts();
    }
  }, [user]);

  const fetchAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('personal_finance_alerts')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAlerts(data || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAlert = async (alertId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('personal_finance_alerts')
        .update({ is_active: !currentStatus })
        .eq('id', alertId);

      if (error) throw error;

      setAlerts(alerts.map(alert =>
        alert.id === alertId ? { ...alert, is_active: !currentStatus } : alert
      ));
    } catch (error) {
      console.error('Error toggling alert:', error);
    }
  };

  const deleteAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('personal_finance_alerts')
        .delete()
        .eq('id', alertId);

      if (error) throw error;

      setAlerts(alerts.filter(alert => alert.id !== alertId));
    } catch (error) {
      console.error('Error deleting alert:', error);
    }
  };

  const getAlertTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      spending_limit: 'Límite de Gasto',
      low_balance: 'Saldo Bajo',
      due_date: 'Fecha de Vencimiento',
      savings_goal: 'Meta de Ahorro',
    };
    return labels[type] || type;
  };

  const getAlertTypeIcon = (type: string) => {
    return <Bell size={20} color={Colors.primary.main} />;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Finanzas Personales</Text>
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
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alertas y Notificaciones</Text>
          <Text style={styles.sectionSubtitle}>
            Configura alertas para estar al tanto de tus finanzas
          </Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary.main} />
          </View>
        ) : alerts.length === 0 ? (
          <View style={styles.emptyState}>
            <Bell size={48} color={Colors.neutral.gray} />
            <Text style={styles.emptyText}>No tienes alertas configuradas</Text>
            <Text style={styles.emptySubtext}>
              Usa el botón de voz para crear tu primera alerta financiera
            </Text>
          </View>
        ) : (
          alerts.map((alert) => (
            <View key={alert.id} style={styles.alertCard}>
              <View style={styles.alertIcon}>
                {getAlertTypeIcon(alert.alert_type)}
              </View>
              <View style={styles.alertInfo}>
                <Text style={styles.alertType}>
                  {getAlertTypeLabel(alert.alert_type)}
                </Text>
                {alert.threshold_amount && (
                  <Text style={styles.alertThreshold}>
                    Límite: {formatCurrency(Number(alert.threshold_amount))}
                  </Text>
                )}
                {alert.category && (
                  <Text style={styles.alertCategory}>
                    Categoría: {alert.category}
                  </Text>
                )}
                <Text style={styles.alertMethod}>
                  Notificación: {alert.notification_method}
                </Text>
              </View>
              <View style={styles.alertActions}>
                <Switch
                  value={alert.is_active}
                  onValueChange={() => toggleAlert(alert.id, alert.is_active)}
                  trackColor={{
                    false: Colors.neutral.lightGray,
                    true: Colors.primary.light,
                  }}
                  thumbColor={alert.is_active ? Colors.primary.main : Colors.neutral.gray}
                />
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteAlert(alert.id)}
                >
                  <Trash2 size={18} color={Colors.status.error} />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        <View style={styles.tipsSection}>
          <Text style={styles.tipsSectionTitle}>Consejos de Ahorro</Text>
          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>Crea un presupuesto mensual</Text>
            <Text style={styles.tipText}>
              Establece límites de gasto para diferentes categorías y mantén el control de tus finanzas.
            </Text>
          </View>
          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>Automatiza tus ahorros</Text>
            <Text style={styles.tipText}>
              Configura transferencias automáticas a tu cuenta de ahorros cada vez que recibas tu salario.
            </Text>
          </View>
          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>Revisa tus gastos regularmente</Text>
            <Text style={styles.tipText}>
              Analiza tus transacciones semanalmente para identificar patrones y oportunidades de ahorro.
            </Text>
          </View>
        </View>
      </ScrollView>

      <VoiceInputModal
        visible={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
        onSuccess={fetchAlerts}
        entityType="alert"
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
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  sectionSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
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
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  emptySubtext: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.tertiary,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
  },
  alertCard: {
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
  alertIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary.main + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  alertInfo: {
    flex: 1,
  },
  alertType: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  alertThreshold: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    marginBottom: 2,
  },
  alertCategory: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.tertiary,
    marginBottom: 2,
  },
  alertMethod: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.tertiary,
  },
  alertActions: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  deleteButton: {
    padding: Spacing.xs,
  },
  tipsSection: {
    marginTop: Spacing.xl,
  },
  tipsSectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  tipCard: {
    backgroundColor: Colors.accent.teal + '10',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.accent.teal,
  },
  tipTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  tipText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    lineHeight: Typography.fontSize.sm * Typography.lineHeight.normal,
  },
});
