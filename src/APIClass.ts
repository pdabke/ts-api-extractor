import { APIEntity } from "./APIEntity";
import { APIKind } from "./APIKind";
import { APIMethod } from "./APIMethod";
import { APIProperty } from "./APIProperty";
import { APIType } from "./APIType";

/**
 * Describes Typescript <code>class</code> public signature
 * @public
 */
export class APIClass extends APIEntity {
  /**
   * Superclass type reference
   */
  extends? : APIType;

  /**
   * Interface type references implemented by this class
   */
  implements? : Array<APIType>;

  /**
   * Class properties
   */
  properties? : Array<APIProperty>;

  /**
   * Class methods
   */
  methods? : Array<APIMethod>;

  /**
   * Class constructors
   */
  constructors: Array<APIMethod>;

  /**
   * 
   * @param name - Class name 
   */
  constructor(name: string) {
    super(name, APIKind.CLASS);
  }

}