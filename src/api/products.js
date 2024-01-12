import { httpClient } from './http';

export const getProducts = async (isPublished = true, category = undefined, vendor = undefined, tags = []) => {
    const { data } = await httpClient.get("products", { isPublished })
    return data
}



export const addProduct = async (product) => {
    const { data } = await httpClient.post("products", product)
    return data
}

export const getProductDetails = async (slug) => {
    const { data } = await httpClient.get(`products/${slug}`)
    return data
}


export const getRelatedProducts = async (id) => {
    const { data } = await httpClient.get(`products/${id}/related`)
    return data

}

export const updateProduct = async (id, product) => {
    const { data } = await httpClient.put(`products/${id}`, product)
    return data

}


export const deleteProduct = async (id) => {
    const { data } = await httpClient.delete(`products/${id}`)
    return data

}





