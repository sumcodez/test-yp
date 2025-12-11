'use server'
import api from "@/src/lib/axios";

export default async function useCallApi(endpoints: string, httpmethod: string, data?: any) {
    try {
        if (httpmethod === 'GET') {
            const response = await api.get(endpoints);
            console.log(response)
            return response;
        }
        else if (httpmethod === 'POST') {

            const response = await api.post(endpoints, data);
            return response;
        }
    } catch (error) {
        return error;
    }
}