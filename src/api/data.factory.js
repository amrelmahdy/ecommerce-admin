export const getCategoriesList = (results = [], from = 0, to, filters, sortBy) => {
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
        total: results.length
    }
}

export const getProductsList = (results, from = 0, to, filters, sortBy) => {
    filters && filters.forEach(filter => {
        results = results.filter(product => {
            if (filter.id === 'categories')
                return product.categories && product.categories.find(cat => cat.slug === filter.value);
            else if (filter.id === 'stock') {
                // if (!product.manage_stock) return false;
                // if (filter.value === 'most')
                return product.stock > 2;
                // else if (filter.value === 'low')
                //     return product.stock_quantity > 0 && product.stock_quantity <= 2
                // return product.stock_quantity <= 1;
            } else if (filter.id !== 'en_name')
                return product[filter.id] === filter.value;
            return product[filter.id].search(new RegExp(filter.value, 'i')) >= 0;
        })
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
            case 'sku':
                results = results.sort((a, b) => a.sku < b.sku ? -index : index);
                break;
            case 'stock':
                results = results.sort((a, b) => a.stock < b.stock ? -index : index);
                break;
            case 'price':
                results = results.sort((a, b) => (a.price - b.price) * index);
                break;
            case 'date':
                results = results.sort((a, b) => (new Date(a.created_at) - new Date(b.created_at)) * index);
                break;
            default:
                break;
        }
    });

    return {
        data: results.slice(from, to),
        total: results.length
    }
}

export const isValidProductPayload = payload => {

    if (
        payload.ar_name !== "" &&
        payload.en_name !== "" &&
        payload.ar_description !== "" &&
        payload.en_description !== "" &&
        typeof payload.stock === 'number' && payload.stock > 0) {
        return true
    }
    return false;
    // ar_name: arName,
    // en_name: enName,
    // ar_subtitle: arSubtitle,
    // en_subtitle: enSubtitle,
    // slug: slug,
    // sku: sku,
    // price: price,
    // sale_price: salePrice,
    // max_quantity: maxQuantity,
    // en_description: enDescription,
    // ar_description: arDescription,
    // promotion_ar_title: promotionArTitle,
    // promotion_en_title: promotionEnTitle,
    // stock: parseInt(stock),
    // categories: productCats,
    // is_out_of_stock: isOutOfStock,
    // is_taxable: isTaxable,
    // is_on_sale: isOnSale,
    // require_shipping: requireShipping,
    // is_featured: isFeatured
}