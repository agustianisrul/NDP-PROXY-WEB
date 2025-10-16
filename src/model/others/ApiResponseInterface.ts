import { ResponseCode } from '../../backend/utils/responseCode';

export interface ApiResponseInterface<T> {
    code: ResponseCode;
    message: string;
    data: T | T[] | null;
}
