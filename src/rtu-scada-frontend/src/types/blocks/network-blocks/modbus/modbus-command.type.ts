export interface IModbusCommand {
  slaveId: number;
  codeFunction: number;
  address: number;
  length: number;
  value?: number;
  typeData?: number;
}
