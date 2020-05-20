import { Types } from 'mongoose';
import * as _ from 'lodash';
import moment from 'moment';
import { date } from 'yup';
import Meet from '../../../src/entity/Meet';

export default class MeetFactory {
    _id: any;

    user: string;

    location: any;

    locationName?: string;

    datetime?: Date;

    description?: string;

    constructor(userId: string, _id = Types.ObjectId()) {
        this._id = _id;
        this.user = userId;
    }

    withRandomValues() {
        this.location = {
            type: 'Point',
            coordinates: [_.random(-180, 180), _.random(-90, 90)],
        };
        this.locationName = `locName.${Date.now()}`;
        this.datetime = moment().add(1, 'year').toDate();
        this.description = `description.${Date.now()}`;
        return this;
    }

    setLocation(location: any) {
        this.location = location;
        return this;
    }

    setDatetime(datetime: Date) {
        this.datetime = datetime;
        return this;
    }

    build() {
        return new Meet(this);
    }
}
