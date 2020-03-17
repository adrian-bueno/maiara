
export function transformMapToObject(map: Map<any, any>) {
    const object = {};
    [...map].forEach(([k, v]) => {
        object[k] = v;
    });
    return object;
}

export function transformObjectToMap(object: any): Map<any, any> {
    if (!object) {
        return new Map();
    }
    return new Map(Object.entries(object));
}


export function getRandomInteger(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function sleep(timeMilliseconds: number): Promise<any> {
    return new Promise(resolve => setTimeout(resolve, timeMilliseconds));
}
