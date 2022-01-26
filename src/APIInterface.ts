import { APIEntity } from "./APIEntity";
import { APIKind } from "./APIKind";
import { APIMethod } from "./APIMethod";
import { APIProperty } from "./APIProperty";
import { APIType } from "./APIType";

/**
 * Describes Typescript <code>class</code> public signature
 * @public
 */
export class APIInterface extends APIEntity {

  /**
   * Interface type references extended by this <code>interface</code>
   */
  extends? : Array<APIType>;

  /**
   * Class properties
   */
  properties? : Array<APIProperty>;

  /**
   * Class methods
   */
  methods? : Array<APIMethod>;

  /**
   * 
   * @param name - Class name 
   */
  constructor(name: string) {
    super(name, APIKind.INTERFACE);
  }

}