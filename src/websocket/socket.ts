// Centralized WebSocket Client for CareSync Patient Portal

import { isMockMode } from '../services/apiClient';
import { mockDb } from '../services/mockDb';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3000';

type SocketListener = (event: string, data: any) => void;

class WebSocketClient {
  private socket: WebSocket | null = null;
  private listeners: Map<string, Set<SocketListener>> = new Map();
  private isConnected = false;
  private reconnectInterval: any = null;
  private mockTimer: any = null;
  private lastUpdate: string = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  constructor() {
    if (isMockMode()) {
      this.startMockSimulation();
    } else {
      this.connect();
    }
  }

  private connect() {
    try {
      this.socket = new WebSocket(WS_URL);

      this.socket.onopen = () => {
        this.isConnected = true;
        this.lastUpdate = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        this.emitStatusChange();
        if (this.reconnectInterval) {
          clearInterval(this.reconnectInterval);
          this.reconnectInterval = null;
        }
      };

      this.socket.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          this.trigger(parsed.event, parsed.data);
        } catch (e) {
          console.error('Failed to parse WebSocket message:', e);
        }
      };

      this.socket.onclose = () => {
        this.isConnected = false;
        this.emitStatusChange();
        this.startReconnection();
      };

      this.socket.onerror = () => {
        this.isConnected = false;
        this.emitStatusChange();
      };
    } catch (e) {
      this.isConnected = false;
      this.startReconnection();
    }
  }

  private startReconnection() {
    if (!this.reconnectInterval) {
      this.reconnectInterval = setInterval(() => {
        this.connect();
      }, 5000);
    }
  }

  // Subscribe to WebSocket events
  subscribe(event: string, callback: SocketListener): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // Return unsubscribe callback
    return () => {
      const eventListeners = this.listeners.get(event);
      if (eventListeners) {
        eventListeners.delete(callback);
        if (eventListeners.size === 0) {
          this.listeners.delete(event);
        }
      }
    };
  }

  // Trigger local listeners
  trigger(event: string, data: any) {
    this.lastUpdate = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(cb => cb(event, data));
    }
    // Also trigger global status updates
    const globalListeners = this.listeners.get('*');
    if (globalListeners) {
      globalListeners.forEach(cb => cb(event, data));
    }
  }

  private emitStatusChange() {
    this.trigger('connection_status', {
      connected: this.isConnected,
      lastUpdated: this.lastUpdate,
    });
  }

  getConnectivity() {
    return {
      connected: this.isConnected,
      lastUpdated: this.lastUpdate,
    };
  }

  // Standalone Mock WebSocket Simulation
  private startMockSimulation() {
    this.isConnected = true;
    this.emitStatusChange();

    // Periodically update active appointments queue status to look "alive"
    this.mockTimer = setInterval(() => {
      const appointments = mockDb.getAppointments();
      const upcoming = appointments.filter(a => a.status === 'upcoming');
      
      if (upcoming.length === 0) return;

      // Update one random upcoming appointment
      const randomAppt = upcoming[Math.floor(Math.random() * upcoming.length)];
      
      // Let's either advance serving index or change position
      const isServingChange = Math.random() > 0.5;

      if (isServingChange) {
        // Advance currently serving, reducing wait time
        randomAppt.currentlyServing = Math.min(randomAppt.position, randomAppt.currentlyServing + 1);
        const currentWait = parseInt(randomAppt.estimatedWait) || 12;
        const newWait = Math.max(0, currentWait - Math.floor(Math.random() * 4) - 1);
        randomAppt.estimatedWait = `${newWait} min`;

        // Save and trigger event
        mockDb.saveAppointments(appointments);
        
        // Trigger queue update
        this.trigger('queue_update', {
          appointmentId: randomAppt.id,
          position: randomAppt.position,
          currentlyServing: randomAppt.currentlyServing,
          estimatedWait: randomAppt.estimatedWait,
        });

        // Live queue position changed message trigger (No notification appended)
      } else {
        // Sometimes progress the journey step
        if (randomAppt.journeyStep < 7) {
          randomAppt.journeyStep += 1;
          mockDb.saveAppointments(appointments);

          this.trigger('journey_update', {
            appointmentId: randomAppt.id,
            journeyStep: randomAppt.journeyStep,
          });

          // Journey stage changed trigger (No notification appended)
        }
      }
    }, 20000); // Trigger every 20 seconds
  }

  stopMockSimulation() {
    if (this.mockTimer) {
      clearInterval(this.mockTimer);
      this.mockTimer = null;
    }
  }
}

export const wsClient = new WebSocketClient();
