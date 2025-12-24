import { Request, Response } from 'express';
import { ResponseCode } from '../../utils/responseCode';
import { UserSession } from '../../../model/custom-entity/UserSession';
import { ResponseHelper } from '../../utils/ResponseHelper';
import { GenericSurrounding } from './generic.surrounding';
import { ServerConfig } from '../../../model/surrounding/ServerConfig';
import { ResponseConfig } from '../../../model/surrounding/ResponseConfig';
import { ConfigParameter } from '../../../model/surrounding/ConfigParameter';
import { DateUtils } from '../../config/date-utils';

export class ServerConfigController {
    static async getAllConfig(req: Request, res: Response) {
        try {
            const userInfo: UserSession = (req.session as any).user;
            const configType: string = req.originalUrl.includes('config-type-list') ? 'config-type-list' : 'common-config';
            const commonConfigType = 'common-config';

            const endpointTarget = '/ndp/proxy/config/getall';
            const responseRequest: any = await GenericSurrounding.requestMicroService(userInfo, endpointTarget, 'GET');

            // Early return for empty or invalid response
            if (!responseRequest?.data || !Array.isArray(responseRequest.data) || responseRequest.data.length === 0) {
                return ResponseHelper.error(res, 'No configurations available');
            }

            if (responseRequest.data?.length > 0) {
                // ✅ Use Map to preserve order
                const responseConfigMap = new Map<string, any>();
                const filteredData = responseRequest.data.filter((item: ServerConfig) => configType === commonConfigType ? item.keyGroup === commonConfigType : item.keyGroup !== commonConfigType );

                for (const record of filteredData) {
                    const tempKeyGroup = record.keyGroup;
                    if (!responseConfigMap.has(tempKeyGroup)) {
                        responseConfigMap.set(tempKeyGroup, {
                            keyGroup: tempKeyGroup,
                            configList: [],
                        });
                    }

                    if (tempKeyGroup && record.keyName) {
                        const current = responseConfigMap.get(tempKeyGroup)!;
                        current.configList.push(record);
                    }
                }

                // ✅ Preserve insertion order
                const responseConfigList: ResponseConfig[] = Array.from(responseConfigMap.values()).map(group => ({
                    ...group,
                    configList: group.configList.sort((a: ServerConfig, b: ServerConfig) => {
                        // First sort by typeForm
                        if (a.typeForm < b.typeForm) return -1;
                        if (a.typeForm > b.typeForm) return 1;

                        // If typeForm is the same, sort by sortField
                        return a.sortField - b.sortField;
                    })
                }));

                return ResponseHelper.success(res, responseConfigList);
            }

            return ResponseHelper.success(res);
        } catch (error) {
            ResponseHelper.error(res, error);
        }
    }

    static async editConfig(req: Request, res: Response) {
        const userInfo: UserSession = (req.session as any).user;
        const requestBody = req.body;
        const endpointTargetGet = `/ndp/proxy/config/getkeygroup?keyGroup=${requestBody.keyGroup}`;
        const responseRequest: any = await GenericSurrounding.requestMicroService(userInfo, endpointTargetGet, 'GET');

        if (!responseRequest?.data || !Array.isArray(responseRequest.data) || responseRequest.data.length === 0) {
            return ResponseHelper.error(res, 'No configurations available');
        }

        const payloadUpdate: ServerConfig[] = responseRequest.data;
        if (payloadUpdate.length > 0) {
            for (const item of payloadUpdate) {
                item.value = requestBody[item.keyName];
            }
        }
        const endpointTargetUpdate = `/ndp/proxy/config/updatebykeygroup?keyGroup=${requestBody.keyGroup}`;
        return ResponseHelper.customResponse(res, await GenericSurrounding.requestMicroService(userInfo, endpointTargetUpdate, 'PUT', payloadUpdate));
    }

    static async postConfig(req: Request, res: Response) {
        const userInfo: UserSession = (req.session as any).user;
        const requestBody = { ...req.body }; // Create a copy to avoid mutating original
        const tempTypeForm: ConfigParameter = requestBody.typeForm;

        // Remove unwanted fields
        const { idConfigMain, typeForm, ...filteredBody } = requestBody;

        const currentDate = DateUtils.nowFormat("yyyy-MM-dd'T'HH:mm:ss.SSS");
        const currentUsername = userInfo.username;

        // Group properties by their base name first
        const groupedData = new Map<string, { keyName: any, value?: any; description?: any, statusCode: string, typeForm: any, sortField: any }>();
        let tempSortField = 1;

        for (const [key, value] of Object.entries(filteredBody)) {
            const baseName = key.includes('_description') ? key.replace('_description', '') : key;

            if (!groupedData.has(baseName)) {
                groupedData.set(baseName, {
                    keyName: baseName,
                    statusCode: 'Y',
                    typeForm: tempTypeForm.typeForm,
                    sortField: tempSortField++
                });
            }

            const item = groupedData.get(baseName)!;

            if (key.includes('_description')) {
                item.description = value;
            } else {
                item.value = value;
            }
        }

        const payloadBody = {
            keyGroup: tempTypeForm.paramCode,
            updatedBy: currentUsername,
            createdDate: currentDate,
            createdBy: currentUsername,
            isi: Array.from(groupedData.values())
        };
        const endpointTarget = `/ndp/proxy/config/create`;
        return ResponseHelper.customResponse(res, await GenericSurrounding.requestMicroService(userInfo, endpointTarget, 'POST', payloadBody));
    }

    static async deleteConfig(req: Request, res: Response) {
        try {
            const userInfo: UserSession = (req.session as any).user;
            const requestBody = req.body;
            if (Array.isArray(requestBody)) {
                for (const detail of requestBody) {
                    const endpointTarget = `/ndp/proxy/config/deletebykeygroup?keyGroup=${detail.idConfig}`;
                    await GenericSurrounding.requestMicroService(userInfo, endpointTarget, 'DELETE')
                }
            } else {
                const endpointTarget = `/ndp/proxy/config/deletebykeygroup?keyGroup=${requestBody.idConfig}`;
                await GenericSurrounding.requestMicroService(userInfo, endpointTarget, 'DELETE')
            }
            ResponseHelper.success(res);
        } catch (error) {
            ResponseHelper.error(res, error);
        }
    }

    static async getConfigParameter(req: Request, res: Response) {
        const userInfo: UserSession = (req.session as any).user;
        const requestBody = req.body;
        const endpointTargetGet = `/ndp/proxy/parameter/getbygroupcode/${requestBody.keyParameter}`;
        const responseData: any = await GenericSurrounding.requestMicroService(userInfo, endpointTargetGet, 'GET');
        const configList: ConfigParameter[] = responseData.data.length > 0 ?
            responseData.data.filter((item: ConfigParameter) =>
                requestBody.keyParameter === 'SCHEDULE' ? item.groupCode === requestBody.keyParameter : item.groupCode !== 'SCHEDULE') : [];
        return ResponseHelper.success(res, configList);
    }

    static async getSchedulerParameter(req: Request, res: Response) {
        const userInfo: UserSession = (req.session as any).user;
        const endpointTargetGet = `/ndp/proxy/parameter/getbygroupcode/SCHEDULE`;
        const responseData: any = await GenericSurrounding.requestMicroService(userInfo, endpointTargetGet, 'GET');
        const configList: ConfigParameter[] = responseData.data.length > 0 ? responseData.data.filter((item: ConfigParameter) => item.groupCode === 'SCHEDULE') : [];
        return ResponseHelper.success(res, configList);
    }
}
