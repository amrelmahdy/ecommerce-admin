import { httpClient } from './http';

export const getVendors = async function () {
    try {
        const { data } = await httpClient.get('/vendors');
        return data;
    } catch (error) {
        console.log(error);
    }
}
