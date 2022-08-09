export function assertDefined<Type>(value: Type): NonNullable<Type> {
    if (value === null || value === undefined) throw new Error('Value must not be null');
    return value as NonNullable<Type>;
}
