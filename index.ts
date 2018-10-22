// required until https://github.com/DefinitelyTyped/DefinitelyTyped/issues/28648
const btoa = require("btoa"); // tslint:disable-line:no-var-requires

import fetch from "node-fetch";

enum APIVersion {
    V1,
    V2
}

export class Targetprocess {
    private subdomain: string;
    private headers: {
        [index: string]: string;
    };

    constructor(subdomain: string, username: string, password: string) {
        this.subdomain = subdomain;

        this.headers = {
            "Accept": "application/json",
            "Authorization": "Basic " + btoa(`${username}:${password}`),
            "Cache-Control": "no-cache",
            "Content-Type": "application/json"
        };
    }

    public async getBug(id: number) {
        return this.requestJSON(APIVersion.V1, `Bugs/${id}`, "GET");
    }

    public async getTask(id: number) {
        return this.requestJSON(APIVersion.V1, `Tasks/${id}`, "GET");
    }

    public async getStory(id: number) {
        return this.requestJSON(APIVersion.V1, `Userstories/${id}`, "GET");
    }

    public async addTime(id: number, spent: number, remain: number, date: Date, description: string) {
        const body = {
            Spent: spent,
            Remain: remain,
            Date: date,
            Description: description,
            Assignable: {
                Id: id
            }
        };

        return this.requestJSON(APIVersion.V1, `Times/`, "POST", body);
    }

    public async getCustomValueForProject<T>(projectId: number, customValueKey: string) {
        const url =  `Project/${projectId}?select={val:CustomValues["${customValueKey}"]}`;

        try {
            const response = await this.requestJSON(APIVersion.V2, url, "GET");
            const item = response.items[0];

            if (item.val === undefined) {
                return null;
            }

            return item.val as T;
        } catch (e) {
            throw e;
        }
    }

    private async requestJSON(version: APIVersion, endpoint: string, method: string, body?: any) {
        const url = this.getUrlForAPIVersion(version);
        const fullUrl = `${url}/${endpoint}`;

        const data = { method, headers: this.headers };

        if (body) {
            (data as any).body = JSON.stringify(body);
        }

        const res = await fetch(fullUrl, data);

        if (!res.ok) {
            throw {
                statusCode: res.status,
                message: res.statusText
            };
        }

        return res.json();
    }

    private getUrlForAPIVersion(version: APIVersion) {
        if (version === APIVersion.V1) {
            return `https://${this.subdomain}.tpondemand.com/api/v1`;
        }

        return `https://${this.subdomain}.tpondemand.com/api/v2`;
    }

}
