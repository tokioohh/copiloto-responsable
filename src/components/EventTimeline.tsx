import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Surface, Chip, Avatar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DrivingEvent, DrivingEventType } from '../types/trip';

interface EventTimelineProps {
  events: DrivingEvent[];
  tripStartTime?: number;
}

export default function EventTimeline({
  events,
  tripStartTime,
}: EventTimelineProps) {
  if (!events || events.length === 0) {
    return (
      <Surface style={styles.cleanContainer} elevation={0}>
        <View style={styles.cleanIconContainer}>
          <MaterialCommunityIcons
            name="shield-check"
            size={40}
            color="#4CAF50"
          />
        </View>
        <Text variant="titleMedium" style={styles.cleanTitle}>
          ¡Conducción Impecable!
        </Text>
        <Text variant="bodySmall" style={styles.cleanSubtitle}>
          No se registraron maniobras bruscas ni incidentes durante este recorrido.
        </Text>
      </Surface>
    );
  }

  const getEventMeta = (type: DrivingEventType) => {
    switch (type) {
      case 'harsh_brake':
        return {
          title: 'Frenada Brusca',
          icon: 'car-brake-alert' as const,
          color: '#D32F2F',
          bg: '#FFEBEE',
          penalty: '-5 pts',
        };
      case 'harsh_accel':
        return {
          title: 'Aceleración Brusca',
          icon: 'car-speed-limiter' as const,
          color: '#E65100',
          bg: '#FFF3E0',
          penalty: '-5 pts',
        };
      case 'sharp_turn':
        return {
          title: 'Giro Brusco',
          icon: 'steering' as const,
          color: '#1976D2',
          bg: '#E3F2FD',
          penalty: '-3 pts',
        };
      case 'speeding':
        return {
          title: 'Exceso de Velocidad',
          icon: 'speedometer' as const,
          color: '#C2185B',
          bg: '#FCE4EC',
          penalty: '-2 pts/min',
        };
      default:
        return {
          title: 'Evento Registrado',
          icon: 'alert-circle-outline' as const,
          color: '#757575',
          bg: '#EEEEEE',
          penalty: '',
        };
    }
  };

  const getSeverityLabel = (severity: number) => {
    if (severity >= 0.7) return { text: 'Grave', color: '#D32F2F' };
    if (severity >= 0.4) return { text: 'Moderado', color: '#F57C00' };
    return { text: 'Leve', color: '#388E3C' };
  };

  const formatEventTime = (timestamp: number) => {
    if (tripStartTime && timestamp >= tripStartTime) {
      const elapsedSec = Math.floor((timestamp - tripStartTime) / 1000);
      const min = Math.floor(elapsedSec / 60);
      const sec = elapsedSec % 60;
      return `+${min}m ${sec < 10 ? '0' : ''}${sec}s`;
    }
    const d = new Date(timestamp);
    return `${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}:${d
      .getSeconds()
      .toString()
      .padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {events.map((ev, index) => {
        const meta = getEventMeta(ev.type);
        const sev = getSeverityLabel(ev.severity);
        const isLast = index === events.length - 1;

        return (
          <View key={`${ev.timestamp}_${index}`} style={styles.timelineItem}>
            {/* Left timeline indicator line */}
            <View style={styles.markerColumn}>
              <View style={[styles.iconCircle, { backgroundColor: meta.bg }]}>
                <MaterialCommunityIcons
                  name={meta.icon}
                  size={20}
                  color={meta.color}
                />
              </View>
              {!isLast && <View style={styles.connectorLine} />}
            </View>

            {/* Event detail card */}
            <Surface style={styles.eventCard} elevation={1}>
              <View style={styles.cardTopRow}>
                <Text variant="titleSmall" style={[styles.eventTitle, { color: meta.color }]}>
                  {meta.title}
                </Text>
                <Text variant="labelSmall" style={styles.timeText}>
                  {formatEventTime(ev.timestamp)}
                </Text>
              </View>

              {/* Telemetry info */}
              <View style={styles.detailsRow}>
                {ev.metadata?.gForce !== undefined && (
                  <Text variant="bodySmall" style={styles.metaDataText}>
                    Fuerza G: <Text style={styles.metaValue}>{ev.metadata.gForce.toFixed(2)}G</Text>
                  </Text>
                )}
                {ev.metadata?.speed !== undefined && (
                  <Text variant="bodySmall" style={styles.metaDataText}>
                    Vel: <Text style={styles.metaValue}>{Math.round(ev.metadata.speed)} km/h</Text>
                  </Text>
                )}
                {ev.metadata?.angle !== undefined && (
                  <Text variant="bodySmall" style={styles.metaDataText}>
                    Giro: <Text style={styles.metaValue}>{Math.round(ev.metadata.angle)}°/s</Text>
                  </Text>
                )}
              </View>

              <View style={styles.badgesRow}>
                <Chip
                  compact
                  mode="flat"
                  style={[styles.severityChip, { backgroundColor: `${sev.color}15` }]}
                  textStyle={[styles.severityText, { color: sev.color }]}
                >
                  {sev.text}
                </Chip>
                {meta.penalty ? (
                  <Text variant="labelSmall" style={styles.penaltyText}>
                    {meta.penalty}
                  </Text>
                ) : null}
              </View>
            </Surface>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 6,
  },
  cleanContainer: {
    padding: 20,
    backgroundColor: '#F1F8E9',
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 4,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  cleanIconContainer: {
    marginBottom: 8,
  },
  cleanTitle: {
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 4,
  },
  cleanSubtitle: {
    color: '#558B2F',
    textAlign: 'center',
    lineHeight: 18,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  markerColumn: {
    alignItems: 'center',
    width: 36,
    marginRight: 10,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectorLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E0E0E0',
    marginTop: 4,
  },
  eventCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  eventTitle: {
    fontWeight: 'bold',
  },
  timeText: {
    color: '#888888',
    fontFamily: 'monospace',
  },
  detailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  metaDataText: {
    color: '#666666',
  },
  metaValue: {
    fontWeight: 'bold',
    color: '#333333',
  },
  badgesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  severityChip: {
    height: 24,
    borderRadius: 12,
  },
  severityText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  penaltyText: {
    color: '#D32F2F',
    fontWeight: 'bold',
  },
});
