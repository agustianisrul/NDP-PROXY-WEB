import { ResponseCode } from '../../backend/utils/responseCode';

export type ApiResponseData<T> = T | T[] | null;

export interface ApiResponse<T> {
    code: ResponseCode;
    message: unknown;
    data: ApiResponseData<T>;
}
