import {EDataTypes} from "../../../../data-types/base-data-type.type"

export type TMqttBlockResponseData = 
EDataTypes.BYTES | 
EDataTypes.STRING | 
EDataTypes.NUMBER |
EDataTypes.IMAGE |
EDataTypes.AUDIO |
EDataTypes.VIDEO |
EDataTypes.PDF | 
EDataTypes.JSON |
EDataTypes.ANY_FILE |
EDataTypes.ARRAY_NUMBERS |
EDataTypes.NOTHING