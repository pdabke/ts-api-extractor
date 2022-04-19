/**
 * Qualified type reference that specifies the object type and package it
 * is exported by
 * @public
 */

export class APIType {
  /**
   * Package that exports this type
   */
  package: string;

  /**
   * Type name
   */
  type: string;
}