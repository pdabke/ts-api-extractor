<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@nabh/ts-api-extractor](./ts-api-extractor.md) &gt; [APIEntity](./ts-api-extractor.apientity.md)

## APIEntity class

Root class for all API metadata objects that defines common properties

<b>Signature:</b>

```typescript
export declare class APIEntity 
```

## Constructors

|  Constructor | Modifiers | Description |
|  --- | --- | --- |
|  [(constructor)(name, kind)](./ts-api-extractor.apientity._constructor_.md) |  | Constructs a new instance of the <code>APIEntity</code> class |

## Properties

|  Property | Modifiers | Type | Description |
|  --- | --- | --- | --- |
|  [comment?](./ts-api-extractor.apientity.comment.md) |  | string | <i>(Optional)</i> Summary part of the TSDoc comment for the object |
|  [isDeprecated?](./ts-api-extractor.apientity.isdeprecated.md) |  | boolean \| string | <i>(Optional)</i> Is this type deprecated. <code>string</code> value specifies TSDoc comment for at-deprecated tag |
|  [kind](./ts-api-extractor.apientity.kind.md) |  | [APIKind](./ts-api-extractor.apikind.md) | Kind of API object |
|  [name](./ts-api-extractor.apientity.name.md) |  | string | Name of the class, interface, type, method, etc. |

