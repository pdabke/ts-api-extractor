/**
 * Class or interface property
 * @public
 */
export class APIParam {
  /**
   * Property name
   */
  name?: string;

  /**
   * Property type
   */
  type: string;

  /**
   * Package that exported this property type. Applicable for non-primitive properties
   */
  package?: string;

  /**
   * Is the parameter optional
   */
  isOptional?: boolean;

  /**
   * Summary section of TSDoc comment on this property
   */
  comment?: string;
}
