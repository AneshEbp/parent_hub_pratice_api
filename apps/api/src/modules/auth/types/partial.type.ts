/**
 * ${1:Description placeholder}
 *
 * @export
 * @typedef {PartialType}
 * @template T
 */
export type PartialType<T> = { [P in keyof T]?: T[P] };
