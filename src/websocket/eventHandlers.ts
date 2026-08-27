import { wsClient } from './socket';

// Initialize core socket handlers that are global to the portal
export const initializeGlobalSocketHandlers = (onNotificationReceived?: (data: any) => void) => {
  const unsubNotification = wsClient.subscribe('notification_received', (_, data) => {
    console.log('Received notification via WebSocket:', data);
    if (onNotificationReceived) {
      onNotificationReceived(data);
    }
  });

  return () => {
    unsubNotification();
  };
};

export const subscribeToQueueUpdates = (appointmentId: string, onUpdate: (data: any) => void) => {
  return wsClient.subscribe('queue_update', (_, data) => {
    if (data.appointmentId === appointmentId) {
      onUpdate(data);
    }
  });
};

export const subscribeToJourneyUpdates = (appointmentId: string, onUpdate: (data: any) => void) => {
  return wsClient.subscribe('journey_update', (_, data) => {
    if (data.appointmentId === appointmentId) {
      onUpdate(data);
    }
  });
};
