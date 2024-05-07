/**
 * Converts an object of key-value pairs into a URL query string.
 *
 * @param params - The object containing the parameters to be converted.
 * @returns The URL query string representation of the parameters.
 */

export const paramsToUrl = (url: string, params: Record<string, string | undefined>) => {
    const validParams = Object.entries(params).filter(([_, value]) => value !== undefined)
    const queryString = new URLSearchParams(validParams.map(([key, value]) => [key, value as string])).toString()
    return `${url}?${queryString}`
}