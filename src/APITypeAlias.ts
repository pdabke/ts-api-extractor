import { APIEntity } from "./APIEntity";
import { APIKind } from "./APIKind";
import { APIType } from "./APIType";

/**
 * Type alias
 * @public
 */
export class APITypeAlias extends APIEntity {
  types: Array<APIType>;
  constructor(name: string) {
    super(name, APIKind.TYPE_ALIAS);
  }
}