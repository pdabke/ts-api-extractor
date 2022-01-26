import { APIEntity } from "./APIEntity";
import { APIKind } from "./APIKind";
import { APIType } from "./APIType";

/**
 * Type alias
 * @public
 */
export class APITypeAlias extends APIEntity {
  /**
   * Flag indicates that this type alias corresponds to one or more literals
   * @example type OneTwoThree 1 | 2 | 3
   */
  isAllLiterals? : boolean;

  /**
   * One or more source types or literals for this alias
   */
  types: Array<APIType | string>;
  constructor(name: string) {
    super(name, APIKind.TYPE_ALIAS);
  }
}