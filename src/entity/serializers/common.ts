import * as _ from 'lodash';

export default function serialize(instance: any, fields: string[]) {
    if (Array.isArray(instance)) {
        const result: any = [];
        instance.forEach((el) => result.push(_.pick(el, fields)));
        return result;
    }
    return _.pick(instance, fields);
}
