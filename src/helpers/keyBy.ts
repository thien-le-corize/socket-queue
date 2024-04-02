export const keyBy = <T extends Record<string, any>>(
    array: T[],
    key: keyof T
): Record<string, T> => {
    return array.reduce((acc, item) => {
        const keyValue = item[key]
        return { ...acc, [keyValue]: item }
    }, {} as Record<string, T>)
}
