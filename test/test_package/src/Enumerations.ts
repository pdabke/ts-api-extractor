/**
 * Docs for DocEnum
 * @public
 * {@docCategory SystemEvent}
 */
 export enum DocEnum {
  /**
   * These are some docs for Zero
   */
  Zero,

  /**
   * These are some docs for One
   */
  One = 1,

  /**
   * These are some docs for Two.
   *
   * {@link DocEnum.One} is a direct link to another enum member.
   */
  Two = DocEnum.One + 1
}

/**
 * Enum that merges with namespace
 *
 */
export enum DocEnumNamespaceMerge {
  /**
   * These are some docs for Left
   */
  Left = 0,

  /**
   * These are some docs for Right
   */
  Right = 1
}

export enum Fruits {
  /**
   * King of fruits
   */
  MANGO = "Mango",

  /**
   * Subject
   */
  BANANA = "Banana"
}