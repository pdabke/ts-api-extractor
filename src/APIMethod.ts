import { APIParam } from "./APIParam";
import { APIType } from "./APIType";

/**
 * Class or interface method
 * @public
 */
export class APIMethod {
  /**
   * Method name
   */
  name: string;

  /**
   * Summary section of TSDoc comment on this property
   */
  comment?: string;

  /**
   * Is this method marked as protected?
   */
  isProtected?: boolean;

  /**
   * Is this a static method?
   */
  isStatic?: boolean;
   
  /**
   * Method return type
   */
  returnType: APIType;

  /**
   * Is this type deprecated. <code>string</code> value specifies
   * TSDoc comment for at-deprecated tag
   */
  isDeprecated? : boolean | string;

  /**
    * Method parameters
    */
  params: Array<APIParam>;

   
  /**
   * Is the parameter optional
   */
  isOptional?: boolean;

  /**
   * Qualified return type
   */
  returns: APIParam;


}
