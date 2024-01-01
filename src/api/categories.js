import axios from 'axios';

import { getCategoryTree } from '../utils';
import { httpClient } from './http';
import { error } from 'bfj/src/events';


export const getCategories = async function (from = 0, to, filters, sortBy) {

    console.log(from, to, filters, sortBy)
    try {
        const response = await httpClient.get('/categories');
        let results = response.data;
        // apply search functionality
        filters && filters.forEach(filter => {
            results = results.filter(cat => cat[filter.id].search(new RegExp(filter.value, 'i')) >= 0);
        });
        sortBy && sortBy.forEach(sort => {
            let index = sort.desc ? -1 : 1;
            switch (sort.id) {
                case 'en_name':
                    results = results.sort((a, b) => a.en_name < b.en_name ? -index : index);
                    break;
                case 'ar_name':
                    results = results.sort((a, b) => a.ar_name < b.ar_name ? -index : index);
                    break;
                case 'slug':
                    results = results.sort((a, b) => a.slug < b.slug ? -index : index);
                    break;
                default:
                    break;
            }
        });
        return {
            data: results.slice(from, to),
            total: results.length,
            tree: []
        }
    } catch (error) {
        console.log(error);
    }
}


export const uploadCategoryImage = async function (image) {
    const formData = new FormData();
    formData.append('file', image);
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
