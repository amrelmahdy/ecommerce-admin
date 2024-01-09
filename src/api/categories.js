import { httpClient } from './http';


export const getCategories = async function () {
    try {
        const { data } = await httpClient.get('/categories');
        return data;
    } catch (error) {
        console.log(error);
    }
}





export const getAllCategories = async function () {
    try {
        const { data } = await httpClient.get('/categories');
        return data
    } catch (error) {
        console.log(error);
    }
}


export const uploadCategoryImage = async function (image) {
    const formData = new FormData();
    formData.append('file', image);
    console.log("formData", formData, image)
    const { data } = await httpClient.post('/upload-single-file', formData);
    return data;
}

export const addCategory = async function (category) {
    const { data } = await httpClient.post('/categories', category);
    return data;
}

export const getCategory = async (id) => {
    const { data } = await httpClient.get(`/categories/${id}`);
    return data;
}


export const updateCategory = async (id, category) => {
    const { data } = await httpClient.put(`/categories/${id}`, category);
    return data;
}


export const deleteCategory = async (id) => {
    const { data } = await httpClient.delete(`/categories/${id}`);
    return data;
}
