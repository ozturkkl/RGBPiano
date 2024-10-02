import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: unknown
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
    gatt?: BluetoothRemoteGATTServer
  }

  interface BluetoothRemoteGATTServer {
    connect(): Promise<BluetoothRemoteGATTServer>
    getPrimaryService(service: BluetoothServiceUUID): Promise<BluetoothRemoteGATTService>
  }

  interface BluetoothRemoteGATTService {
    getCharacteristic(
      characteristic: BluetoothCharacteristicUUID
    ): Promise<BluetoothRemoteGATTCharacteristic>
  }

  type BluetoothCharacteristicUUID = number | string

  interface BluetoothRemoteGATTCharacteristic {
    startNotifications(): Promise<void>
    addEventListener(event: string, callback: (event: Event) => void): void
  }
}
