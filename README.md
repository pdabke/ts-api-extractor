# ts-api-extractor
`ts-api-extractor` constructs structured metadata corresponding to the type 
signatures defined in a package. For the given package, it looks up the "types"
value from the `package.json` file at the root of the package directory. It
then extracts the signatures of all exported types from the Typescript 
definition files. The metadata can be used for a variety of use cases including
automated CLI creation, aspect oriented programming, and API documentation.
## Usage
Install globally or locally
```
npm i [-g] @nabh/create-index-ts
```
### Command Line Usage
`ts-api-extractor` provides a script called `extractapi` for generating the API
metadata objects. If you install `ts-api-extractor` globally, you can use the
script on the command line as shown below. 

> Note: You must invoke the command from a directory that allows node to find 
> the input package.
```
# Use if you want to print metadata definitions to the console
> extractapi "<package-name>"

# Write metadata definitions to a file
> extractapi "<package-name>" <file-name>
```
### Programmatic Usage
You can also install `ts-api-extractor` locally and use it in your Javascript code.
```javascript
const APIExtractor = require("ts-api-extractor");
const apiDefs = APIExtractor("test_package");

// Print API metadata object
console.log(JSON.stringify(apiDefs, null, 2));
```

```json

```

### Enumerations
#### Source
```typescript
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
```
### Generated Metadata 
```json
{
  "name": "Fruits",
  "members": [
    {
      "key": "BANANA",
      "comment": "Subject",
      "value": "\"Banana\""
    },
    {
      "key": "MANGO",
      "comment": "King of fruits",
      "value": "\"Mango\""
    }
  ],
  "kind": "enum"

}
```
## Classes
### Source
```typescript
/**
 * This is an example class.
 */
export class DocClass1 extends DocBaseClass implements IDocInterface1, IDocInterface2 {
  /**
   * An internal class constructor.
   * @internal
   */
  public constructor(name: string) {
    super();
  }

  /**
   * This is an overloaded function.
   * @param a - the first string
   * @param b - the second string
   *
   * @throws `Error`
   *  The first throws line
   *
   * @throws The second throws line
   */
  exampleFunction(a: string, b: string): string;

  public exampleFunction(x: number | string, y?: string): string | number {
    return x;
  }

  public get readonlyProperty(): string {
    return 'hello';
  }

  public get writeableProperty(): string {
    return 'hello';
  }
  public set writeableProperty(value: string) {}

  /**
   * This event is fired whenever the object is modified.
   * @eventProperty
   */
  public readonly modifiedEvent: SystemEvent;

  /**
   * This event should have been marked as readonly.
   * @eventProperty
   */
  public malformedEvent: SystemEvent;

  /**
   * This is a regular property that happens to use the SystemEvent type.
   */
  public regularProperty: SystemEvent;

  /**
   * @deprecated Use `otherThing()` instead.
   */
  public deprecatedExample(): void {}

  /**
   * Returns the sum of two numbers.
   *
   * @remarks
   * This illustrates usage of the `@example` block tag.
   *
   * @param x - the first number to add
   * @param y - the second number to add
   * @returns the sum of the two numbers
   *
   */
  public static sumWithExample(x: number, y: number): number {
    return x + y;
  }
}
```
### Generated Metadata
```json
{
    "name": "DocClass1",
    "comment": "This is an example class.",
    "constructors": [],
    "methods": [
      {
        "name": "deprecatedExample",
        "isDeprecated": {
          "comment": " Use <code>otherThing()</code> instead."
        },
        "returns": {
          "type": "void"
        },
        "comment": "",
        "params": []
      },
      {
        "name": "exampleFunction",
        "returns": {
          "type": "string"
        },
        "comment": "This is an overloaded function.",
        "params": [
          {
            "name": "a",
            "type": "string",
            "comment": "the first string"
          },
          {
            "name": "b",
            "type": "string",
            "comment": "the second string"
          }
        ]
      },
      {
        "name": "exampleFunction",
        "returns": {
          "type": "number"
        },
        "comment": "This is also an overloaded function.",
        "params": [
          {
            "name": "x",
            "type": "number",
            "comment": "the number"
          }
        ]
      },
      {
        "name": "sumWithExample",
        "isStatic": true,
        "returns": {
          "type": "number",
          "comment": " the sum of the two numbers"
        },
        "comment": "Returns the sum of two numbers.",
        "params": [
          {
            "name": "x",
            "type": "number",
            "comment": "the first number to add"
          },
          {
            "name": "y",
            "type": "number",
            "comment": "the second number to add"
          }
        ]
      }
    ],
    "properties": [
      {
        "name": "malformedEvent",
        "type": "SystemEvent",
        "package": "test_package",
        "comment": "This event should have been marked as readonly."
      },
      {
        "name": "modifiedEvent",
        "type": "SystemEvent",
        "isReadOnly": true,
        "package": "test_package",
        "comment": "This event is fired whenever the object is modified."
      },
      {
        "name": "readonlyProperty",
        "type": "string",
        "isReadOnly": true
      },
      {
        "name": "regularProperty",
        "type": "SystemEvent",
        "package": "test_package",
        "comment": "This is a regular property that happens to use the SystemEvent type."
      },
      {
        "name": "writeableProperty",
        "type": "string"
      }
    ],
    "extends": {
      "package": "test_package",
      "type": "DocBaseClass"
    },
    "implements": [
      {
        "type": "IDocInterface1",
        "package": "test_package"
      },
      {
        "type": "IDocInterface2",
        "package": "test_package"
      }
    ],
    "kind": "class"
  }
```
## Type Aliases
