export interface IComConnectOptions {
  comPort: string;
  baudRate: number;
  isParity: boolean;
  dataBits: number;
  stopBits: number;
}
