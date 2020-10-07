/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export default (enumme: any, toValue: boolean = true): Array<any> => {
    const keys = Object.keys(enumme);
    return toValue ? keys.map((k) => enumme[k]) : keys;
};
