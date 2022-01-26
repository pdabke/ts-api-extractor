import { APIEntity } from "./APIEntity";
import { APIKind } from "./APIKind";

/**
 * <code>enum</code> member
 * @public
 */
export class APIEnumMember {
  key: string;
  comment?: string;
  value: string;
}

/**
 * Describes <code>enum</code> definition
 * @public
 */
export class APIEnum extends APIEntity {
  members: Array<APIEnumMember>;
  constructor(name: string) {
    super(name, APIKind.ENUM);
  }
}

