import * as yup from 'yup';
import validator from 'validator';

export const locationSchema = yup.object().shape({
    type: yup
        .string()
        .required()
        .matches(/(^Point$)/),
    coordinates: yup
        .array()
        .of(yup.number())
        .test('len',
            'Coordinates array must include exactly 2 values',
            (val:any) => val.length === 2)
        .test('geojson',
            'Coordinates must be a longitude and latitude in their respectable ranges',
            (value: any) => validator.isLatLong(`${value[1]}, ${value[0]}`)),
});
