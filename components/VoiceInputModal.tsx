import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { X, Mic, Send } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

type VoiceInputModalProps = {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  entityType: 'account' | 'transaction' | 'alert';
};

export function VoiceInputModal({ visible, onClose, onSuccess, entityType }: VoiceInputModalProps) {
  const { user } = useAuth();
  const [transcription, setTranscription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!transcription.trim()) {
      setError('Por favor ingresa algún texto');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const { error: voiceError } = await supabase
        .from('voice_entries')
        .insert({
          user_id: user?.id,
          transcription: transcription.trim(),
          processed: false,
          entity_type: entityType,
        });

      if (voiceError) throw voiceError;

      setTranscription('');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al guardar');
    } finally {
      setIsProcessing(false);
    }
  };

  const getTitle = () => {
    switch (entityType) {
      case 'account':
        return 'Agregar Cuenta por Voz';
      case 'transaction':
        return 'Agregar Transacción por Voz';
      case 'alert':
        return 'Crear Alerta por Voz';
      default:
        return 'Entrada por Voz';
    }
  };

  const getPlaceholder = () => {
    switch (entityType) {
      case 'account':
        return 'Ej: "Crear una cuenta de ahorros con número 1234567890 y balance de 5000 dólares"';
      case 'transaction':
        return 'Ej: "Registrar un pago de 150 dólares en Walmart en la categoría de compras"';
      case 'alert':
        return 'Ej: "Crear una alerta de límite de gasto de 1000 dólares para la categoría comida"';
      default:
        return 'Describe lo que deseas agregar...';
    }
  };

  const handleClose = () => {
    setTranscription('');
    setError('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>{getTitle()}</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={24} color={Colors.text.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={styles.micContainer}>
              <View style={styles.micIcon}>
                <Mic size={32} color={Colors.neutral.white} />
              </View>
            </View>

            <Text style={styles.instructions}>
              Por ahora, escribe el texto que normalmente dirías por voz. La integración con IA de voz estará disponible pronto.
            </Text>

            <TextInput
              style={styles.textInput}
              placeholder={getPlaceholder()}
              placeholderTextColor={Colors.neutral.gray}
              value={transcription}
              onChangeText={setTranscription}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />

            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={[styles.submitButton, isProcessing && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator color={Colors.neutral.white} />
              ) : (
                <>
                  <Send size={20} color={Colors.neutral.white} />
                  <Text style={styles.submitButtonText}>Enviar</Text>
                </>
              )}
            </TouchableOpacity>

            <Text style={styles.note}>
              Nota: Esta entrada será procesada por tu backend para crear automáticamente los datos correspondientes.
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: Colors.background.primary,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.lightGray,
  },
  title: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  content: {
    padding: Spacing.lg,
  },
  micContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  micIcon: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.secondary.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructions: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.md,
    lineHeight: Typography.fontSize.sm * Typography.lineHeight.normal,
  },
  textInput: {
    backgroundColor: Colors.background.secondary,
    borderWidth: 1,
    borderColor: Colors.neutral.lightGray,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: Typography.fontSize.base,
    color: Colors.text.primary,
    minHeight: 120,
    marginBottom: Spacing.md,
  },
  errorContainer: {
    backgroundColor: Colors.status.error + '10',
    borderLeftWidth: 3,
    borderLeftColor: Colors.status.error,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.md,
  },
  errorText: {
    color: Colors.status.error,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  submitButton: {
    backgroundColor: Colors.primary.main,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: Colors.neutral.white,
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
  },
  note: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.tertiary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
