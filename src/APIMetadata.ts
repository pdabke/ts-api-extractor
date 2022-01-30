import { APIEntity } from "./APIEntity";

/**
 * Package information
 * @public
 */
export class APIPackage {
  /**
   * Package name
   */
  name: string;

  /**
   * Package version
   */
  version: string;
  /**
   * Path where this package was installed
   */
  path: string;
}

/**
 * Encapsulates package types metadata
 * @public
 */
export class APIMetadata {
  /**
   * Package name
   */
  package: APIPackage;

  /**
   * Map from type name to type metadata
   */
  metadata: Map<string, APIEntity>;
}