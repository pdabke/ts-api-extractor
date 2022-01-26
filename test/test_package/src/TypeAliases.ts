import { TypeAliasSource } from "./TypeAliasSource";

/**
 * A type that can be either a string or a number
 */
export type alphanumeric = string | TypeAliasSource| number;

/**
 * Type that maps to another type
 */
export type targetType = TypeAliasSource