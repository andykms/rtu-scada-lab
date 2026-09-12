import {IModbusCommand} from './modbus-command.type';

export interface IBaseModbus {
    command: IModbusCommand;
}