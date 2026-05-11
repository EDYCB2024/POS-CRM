export type TerminalStatus = 'online' | 'offline' | 'maintenance' | 'DISPONIBLE' | 'ENTREGADO' | 'EN REVISION' | 'DEVOLUCION';

export interface Terminal {
  id: string;
  terminal_id: string;
  location: string;
  status: TerminalStatus;
  last_sync: string;
  firmware_version: string | null;
  zone: string | null;
  created_at: string;
}

export interface Sale {
  id: string;
  terminal_id: string;
  amount: number;
  category: string;
  timestamp: string;
}

export interface ActivityLog {
  id: string;
  terminal_id: string | null;
  type: 'activation' | 'payment' | 'alert' | 'update';
  message: string;
  details: any;
  timestamp: string;
}

export interface AllyConfig {
  id: string;
  name: string;
  table_name: string;
  is_active: boolean;
  created_at: string;
}

export interface DeviceModel {
  id: number;
  linux: string | null;
  android: string | null;
}

export interface StatusConfig {
  id: number;
  estatus: string;
}
