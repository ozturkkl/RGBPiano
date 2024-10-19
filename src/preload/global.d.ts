/// <reference types="svelte" />
/// <reference types="vite/client" />

declare global {
  interface Window {
    ipcRenderer: {
      on: (channel: string, func: () => void) => void
      invoke: (channel: string, data: unknown) => Promise<void | unknown>
    }
  }

  interface Navigator {
    bluetooth: {
      requestDevice(options: RequestDeviceOptions): Promise<BluetoothDevice>
    }
  }

  interface RequestDeviceOptions {
    filters?: BluetoothLEScanFilter[]
    optionalServices?: BluetoothServiceUUID[]
  }

  interface BluetoothLEScanFilter {
    services?: BluetoothServiceUUID[]
  }

  type BluetoothServiceUUID = number | string

  interface BluetoothDevice {
    id: string
    name?: string
    gatt: BluetoothRemoteGATTServer
    addEventListener(event: string, callback: () => void): void
  }

  interface BluetoothRemoteGATTServer {
    connect(): Promise<BluetoothRemoteGATTServer>
    getPrimaryService(service: BluetoothServiceUUID): Promise<BluetoothRemoteGATTService>
  }

  interface BluetoothRemoteGATTService {
    getCharacteristic(characteristic: BluetoothCharacteristicUUID): Promise<BluetoothRemoteGATTCharacteristic>
  }

  type BluetoothCharacteristicUUID = number | string

  interface BluetoothRemoteGATTCharacteristic {
    startNotifications(): Promise<void>
    addEventListener(event: string, callback: (event: BluetoothCharacteristicEvent) => void): void
  }

  interface BluetoothCharacteristicEvent {
    target: {
      value: DataView
    }
  }
}

export {}
