import { APIKind } from "./APIKind";

/**
 * Root class for all API metadata objects that defines common properties
 * @public
 */
export class APIEntity {
  /**
   * Name of the class, interface, type, method, etc.
   */
  name: string;

  /**
   * Kind of API object
   */
  kind: APIKind;

  /**
   * Summary part of the TSDoc comment for the object
   */
  comment?: string;

  /**
   * Is this type deprecated. <code>string</code> value specifies
   * TSDoc comment for at-deprecated tag
   */
  isDeprecated? : boolean | string;

  constructor(name : string, kind : APIKind) {
    this.name = name;
    this.kind = kind;
  }
}