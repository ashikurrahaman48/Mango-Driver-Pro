
// Web Serial API Type Definitions to fix TypeScript errors.
// These definitions provide types for the Web Serial API, which is used for hardware communication.
export interface SerialPort extends EventTarget {
  onconnect: ((this: SerialPort, ev: Event) => any) | null;
  ondisconnect: ((this: SerialPort, ev: Event) => any) | null;
  readonly readable: ReadableStream<Uint8Array>;
  readonly writable: WritableStream<Uint8Array>;
  open(options: SerialOptions): Promise<void>;
  close(): Promise<void>;
  getInfo(): { usbVendorId?: number; usbProductId?: number };
}

interface SerialOptions {
  baudRate: number;
  dataBits?: 7 | 8;
  stopBits?: 1 | 2;
  parity?: 'none' | 'even' | 'odd';
  bufferSize?: number;
  flowControl?: 'none' | 'hardware';
}

interface SerialPortRequestOptions {
  filters?: {
    usbVendorId: number;
    usbProductId?: number;
  }[];
}

interface Serial extends EventTarget {
  onconnect: ((this: Serial, ev: Event) => any) | null;
  ondisconnect: ((this: Serial, ev: Event) => any) | null;
  getPorts(): Promise<SerialPort[]>;
  requestPort(options?: SerialPortRequestOptions): Promise<SerialPort>;
}

declare global {
  interface Navigator {
    serial: Serial;
  }
}

export interface Device {
  componentType: string;
  modelName: string;
}

export type DriverStatus = 'Update available' | 'Up-to-date' | 'Checking...' | 'Installed' | 'Missing';

export interface Driver {
  id: string;
  deviceName: string;
  provider: string;
  currentVersion: string;
  currentReleaseDate: string;
  latestVersion: string;
  latestReleaseDate: string;
  status: DriverStatus;
  hardwareId?: string;
}

export type InstallState = {
    status: 'idle' | 'downloading' | 'installing' | 'installed';
    progress: number;
};

export type ScanStatus = 'idle' | 'scanning' | 'complete' | 'error';

export interface NotificationType {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

export type AppMode = 'online' | 'offline';

export interface SystemInfo {
    os: string;
    cpu: string;
    ram: string;
    motherboard: string;
}

export type Theme = 'light' | 'dark';

export interface Backup {
  id: string;
  name: string;
  date: string;
  drivers: Driver[];
}

export interface HardwareInfo {
  deviceName: string;
  firmwareVersion: string;
  hardwareId: string;
}
