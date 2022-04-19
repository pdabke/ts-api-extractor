/**
 * Class or interface property
 * @public
 */
export class APIProperty {
  /**
   * Property name
   */
  name: string;

  /**
   * Property type
   */
  type: string;

  /**
   * Package that exported this property type. Applicable for non-primitive properties
   */
  package?: string;

  /**
   * Summary section of TSDoc comment on this property
   */
  comment?: string;

  /**
   * Is this property read only?
   */
  isReadOnly?: boolean;

  /**
   * Is this property marked as protected?
   */
  isProtected?: boolean;

  /**
   * Is this a static property?
   */
  isStatic?: boolean;

  /**
   * Is this type deprecated. <code>string</code> value specifies
   * TSDoc comment for at-deprecated tag
   */
  isDeprecated? : boolean | string;

  /**
   * Is the parameter optional
   */
  isOptional?: boolean;

}
