import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import Tree from 'rc-tree';
import Loader from '../../features/loader';
import 'rc-tree/assets/index.css';
import 'react-image-lightbox/style.css';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-popper-tooltip/dist/styles.css';

import 'react-quill/dist/quill.snow.css';
import ReactQuill from 'react-quill';

import Breadcrumb from '../../common/breadcrumb';
import MediaGalleryModal from '../../features/modals/media-gallery-modal';
import PNotify from '../../features/elements/p-notify';
import PtLazyLoad from '../../features/lazyload';
import PtToolTip from '../../features/elements/tooltip';
import { getCategories } from '../../../api/categories';
import { addProduct } from '../../../api/products';
import { isValidProductPayload } from '../../../api/data.factory';
import { uploadDynamicImages } from '../../../api';

export default function ProductAdd({ history }) {
    const [error, serError] = useState([]);
    const inputRef = useRef(null);
    const [validated, setValidated] = useState(false);
    const [loading, setLoading] = useState(false);

    const [arName, setArName] = useState("");
    const [enName, setEnName] = useState("");
    const [slug, setSlug] = useState("");
    const [price, setPrice] = useState(0);
    const [salePrice, setSalePrice] = useState(0);
    const [enDescription, setEnDescription] = useState("");
    const [arDescription, setArDescription] = useState("");
    const [stock, setStock] = useState(10);
    const [arSubtitle, setArSubtitle] = useState("");
    const [enSubtitle, setEnSubtitle] = useState("");
    const [promotionArTitle, serPromotionArTitle] = useState("");
    const [promotionEnTitle, setPromotionEnTitle] = useState("");
    const [maxQuantity, setMaxQuantity] = useState(10);
    const [sku, setSku] = useState("");
    const [isOutOfStock, setIsOutOfStock] = useState(false);
    const [requireShipping, setRequireShipping] = useState(true);
    const [isTaxable, setIsTaxable] = useState(true);
    const [isOnSale, setIsOnSale] = useState(false);
    const [isFeatured, setIsFeatured] = useState(false);
    const [productCats, setProductCats] = useState([]);
    const [productImages, setProductImages] = useState([]);

    const [images, setImages] = useState([]);

    // console.log("arName",arName)
    // console.log("enName", enName)
    // console.log("slug", slug)
    // console.log("price", price)
    // console.log("salePrice", salePrice)
    // console.log("enDescription", enDescription)
    console.log("arDescription", arDescription)
    // console.log("stock", stock)
    // console.log("arSubtitle", arSubtitle)
    // console.log("enSubtitle", enSubtitle)
    // console.log("promotionArTitle", promotionArTitle)
    // console.log("promotionEnTitle", promotionEnTitle)
    // console.log("maxQuantity", maxQuantity)
    // console.log("sku", sku)
    // console.log("isOutOfStock", isOutOfStock)
    // console.log("requireShipping", requireShipping)
    // console.log("isTaxable", isTaxable)
    // console.log("isOnSale", isOnSale)
    // console.log("isFeatured", isFeatured)
    // console.log("productCats", productCats)




    const [defaultImage, setDefault] = useState(1);
    const [categories, setCategories] = useState([]);
    const [files, setFiles] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [openImage, setOpenImage] = useState(false);
    const [onlyOneImage, SetOnlyOneImage] = useState(false);
    const [attrs, setAttrs] = useState([]);
    const [selectedAttr, setSelectedAttr] = useState('');
    const [attrsForVariation, setAttrsForVariation] = useState([]);
    const [variants, setVariants] = useState([]);
    const [variation, setVariation] = useState([]);


    const attrsForVariationUpdate = useCallback((e) => {
        e.preventDefault();
        let filtered = attrs.filter(attr => attr.usedForVariation && attr.selectedTerms.length);
        filtered = filtered.map(attr => {
            return {
                ...attr,
                terms: attr.terms.filter(term => attr.selectedTerms.find(selected => term.slug === selected.value))
            }
        });
        setAttrsForVariation(filtered);
        setVariation(new Array(filtered.length).fill(''));
        setVariants(variants.map(variant => {
            return {
                ...variant,
                excerpt: Object.assign([], filtered.map(attr => {
                    return {
                        attrId: attr.id,
                        termId: ''
                    };
                }), variant.excerpt)
            }
        }));
    }, [attrs, variants])

    // Product Attributes, Tags, Categories
    const [productTags, setProductTags] = useState([]);
    const [productAttrs, setProductAttrs] = useState([]);
    // const [productCats, setProductCats] = useState([]);
    const [taxTypes, setTaxTypes] = useState([]);

    useEffect(() => {
        fetchCategories()
        // getAttributes().then(response => {
        //     setProductAttrs(response.data);
        //     setSelectedAttr(response.data[0].slug);
        // });
        // getCategories('products').then(response => {
        //     setProductCats(getTreeData(response.data));
        // });
        // getTags('products').then(response => {
        //     setProductTags(response.data);
        // });
        // getTaxTypes().then(response => {
        //     setTaxTypes(response.data);
        // });
    }, [])

    const fetchCategories = async () => {
        try {
            const categories = await getCategories();
            setCategories(getTreeData(categories));
        } catch (error) {
            console.log("error fetching categories", error)
        }
    }

    // async function searchProducts(input) {
    //     let options = [];
    //     await getProducts(0, undefined, [{ id: 'name', value: input }], null).then(response => {
    //         options = response.data.map(product => {
    //             return {
    //                 label: product.name,
    //                 value: product.id
    //             }
    //         });
    //     }).catch(error => console.error(error));
    //     return options;
    // }

    function getTreeData(data) {
        let result = [];
        result = data.reduce((acc, cur) => {
            let newNode = {
                key: cur.id,
                title: cur.en_name,
                children: []
            };
            acc.push(newNode);
            return acc;
        }, []);
        return result;
    }

    console.log(validated)

    async function handleAddProduct(e) {
        e.preventDefault();
        if (e.currentTarget.checkValidity() === false) {
            e.stopPropagation();
        }
        setValidated(true);

        //setLoading(true);

        const newProduct = {
            ar_name: arName,
            en_name: enName,
            ar_subtitle: arSubtitle,
            en_subtitle: enSubtitle,
            slug: slug,
            sku: sku,
            price: price,
            sale_price: salePrice,
            max_quantity: maxQuantity,
            en_description: enDescription,
            ar_description: arDescription,
            promotion_ar_title: promotionArTitle,
            promotion_en_title: promotionEnTitle,
            stock: parseInt(stock),
            categories: productCats,
            is_out_of_stock: isOutOfStock,
            is_taxable: isTaxable,
            is_on_sale: isOnSale,
            require_shipping: requireShipping,
            is_featured: isFeatured,
            images: []
        }



        const isValidPayload = isValidProductPayload(newProduct);
        if (isValidPayload) {
            if (productImages.length > 0) {
                const images = await uploadDynamicImages(productImages);
                console.log("uploaded imageeeeeessssss", images, images && images.length > 0)
                if (images && images.length > 0) newProduct.images = images
            }


            try {
                const productCreated = await addProduct(newProduct);
                if (productCreated) {

                    toast(
                        <PNotify title="Success" icon="fas fa-check" text="Product added successfully." />,
                        {
                            containerId: "default",
                            className: "notification-success"
                        }
                    );
                    history.push("/products")
                }
            } catch (error) {
                window.scrollTo(0, 0)
                if (error.response.status === 400) {
                    serError(error.response.data.message)
                } else if (error.response.status === 409) {
                    serError([error.response.data.message])

                }
            }
        } else {
            serError(['Please fill in the required fields with the red *'])
        }
    }

    function openModal(e, info) {
        e.preventDefault();
        SetOnlyOneImage(info.type !== 'gallery');
        setModalOpen(info);
    }

    function chooseMedia(selectedMedia) {
        console.log("selectedMediaselectedMedia>>>>>:::::", selectedMedia.length)
        setImages(selectedMedia)
        setModalOpen(false);
        // if (!selectedMedia.length) return;
        // if (modalOpen.type === 'gallery') {
        //     setImages([...images, ...selectedMedia]);
        // } else if (modalOpen.type === 'file') {
        //     let id = modalOpen.id;
        //     setFiles(files.map((file, index) => {
        //         if (index === id) {
        //             return {
        //                 name: selectedMedia[0].name,
        //                 url: selectedMedia[0].copy_link
        //             }
        //         }
        //         return file;
        //     }));
        // } else if (modalOpen.type === 'variant') {
        //     let id = modalOpen.id[0];
        //     let fileId = modalOpen.id[1];
        //     setVariants(variants.map((variant, index) => {
        //         if (index === id) {
        //             if (typeof fileId === 'number') {
        //                 variant.files = variant.files.map((file, fileIndex) => {
        //                     if (fileIndex === fileId) {
        //                         return {
        //                             name: selectedMedia[0].name,
        //                             url: selectedMedia[0].copy_link
        //                         }
        //                     }
        //                     return file;
        //                 })
        //             } else {
        //                 variant.media = selectedMedia;
        //             }
        //         }
        //         return variant;
        //     }))
        // }
    }


    const handleSelectedFiles = (files) => {
        setProductImages(files)
    }

    console.log("UUUUUUUUUU", productImages)

    function selectDefaultImage(e, id) {
        e.target.checked && setDefault(id);
    }

    function removeImage(e, index) {
        e.preventDefault();
        setImages(images.filter(image => image.id !== index));
    }

    function addTag(e, tag) {
        e.preventDefault();
        inputRef.current.addTag(tag);
    }

    function addFile(e) {
        e.preventDefault();
        setFiles([
            ...files,
            {
                name: '',
                url: ''
            }
        ]);
    }

    function removeFile(index) {
        setFiles(files.filter((file, id) => id !== index));
    }

    function fileNameChange(e, index) {
        setFiles(files.map((file, id) => {
            if (id === index) {
                return {
                    ...file,
                    name: e.target.value
                };
            }
            return file;
        }));
    }

    function filePathChange(e, index) {
        setFiles(files.map((file, id) => {
            if (id === index) {
                return {
                    ...file,
                    url: e.target.value
                };
            }
            return file;
        }));
    }

    function addAttr(e) {
        e.preventDefault();
        if (attrs.find(attr => attr.slug === selectedAttr)) {
            return;
        }
        let attr = productAttrs.find(attr => attr.slug === selectedAttr);
        setAttrs([
            ...attrs,
            {
                ...attr,
                showOnProductPage: false,
                usedForVariation: false,
                selectedTerms: []
            }
        ]);
    }

    function removeAttr(e, slug) {
        e.preventDefault();
        setAttrs(attrs.filter(attr => attr.slug !== slug));
    }

    function changeAttr(index, key, value) {
        setAttrs(attrs.map((attr, id) => {
            if (id === index) {
                attr[key] = value;
            }
            return attr;
        }));
    }

    function variationChange(e, index) {
        setVariation(variation.map((variation, id) => {
            if (id === index) {
                return e.target.value;
            }
            return variation;
        }));
    }

    function addVariant(e) {
        e.preventDefault();
        setVariants([
            ...variants,
            {
                saleSchedule: false,
                virtual: false,
                downloadable: false,
                manageStock: false,
                files: [],
                media: [],
                excerpt: attrsForVariation.map((attr, id) => {
                    return {
                        attrId: attr.id,
                        termId: variation[id]
                    }
                }),
                taxType: ''
            }
        ]);
    }

    function removeVariant(e, index) {
        e.preventDefault();
        setVariants(variants.filter((variant, id) => id !== index));
    }

    function variantTermChange(e, index, attrIndex) {
        setVariants(variants.map((variant, id) => {
            if (id === index) {
                return {
                    ...variant,
                    excerpt: variant.excerpt.map((attr, attrId) => {
                        if (attrId === attrIndex) {
                            return {
                                attrId: attr.id,
                                termId: e.target.value === '' ? '' : parseInt(e.target.value)
                            };
                        }
                        return attr;
                    })
                }
            }
            return variant;
        }))
    }

    function variantItemChange(index, key, value) {
        setVariants(variants.map((variant, id) => {
            if (id === index) {
                variant[key] = value;
            }
            return variant;
        }));
    }

    function variantFileChange(index, fileIndex, key, value) {
        setVariants(variants.map((variant, id) => {
            if (id === index) {
                variant.files = variant.files.map((file, fileId) => {
                    if (fileId === fileIndex) {
                        file[key] = value;
                    }
                    return file;
                })
            }
            return variant;
        }));
    }

    function addVariantFile(e, index) {
        e.preventDefault();
        setVariants(variants.map((variant, id) => {
            if (id === index) {
                variant.files.push({
                    name: '',
                    url: ''
                });
            }
            return variant;
        }));
    }

    function removeVariantFile(index, fileIndex) {
        setVariants(variants.map((variant, id) => {
            if (id === index) {
                variant.files.splice(fileIndex, 1);
            }
            return variant;
        }));
    }

    function openLightBox(index) {
        setOpenImage(index);
    }

    function closeLightBox() {
        setOpenImage(false);
    }


    console.log("PPPPPPPP", error)



    return (
        <>
            {
                loading ? <Loader /> : <>

                    <Breadcrumb current="Add Product" paths={[{
                        name: "Home",
                        url: "/"
                    }, {
                        name: "Products",
                        url: "/products"
                    }]} />



                    <Form className="ecommerce-form"
                        noValidate
                        validated={validated}
                        action="#"
                        method="post"
                        enctype="multipart/form-data"
                        onSubmit={handleAddProduct}>
                        <Row className="mb-4">

                            <Col>
                                <Card className="card-modern card-big-info">
                                    <Card.Body>

                                        <Row>
                                            <Col lg="2-5" xl="1-5">
                                                <i className="card-big-info-icon bx bx-box"></i>
                                                <h2 className="card-big-info-title">General Info</h2>
                                                <p className="card-big-info-desc">
                                                    Add here the product description with
                                                    all details and necessary information.
                                                </p>
                                            </Col>
                                            <Col lg="3-5" xl="4-5">
                                                <Row>
                                                    <Col xl={9}>
                                                        {
                                                            error.map(err => <Alert key="danger" variant="danger">
                                                                {err}
                                                            </Alert>)
                                                        }
                                                        <Form.Group as={Row} className="align-items-center">
                                                            <Col as={Form.Label} lg={5} xl={3} className="control-label text-lg-right mb-lg-0">
                                                                Arabic Name
                                                                <span className="required">*</span>
                                                            </Col>
                                                            <Col lg={7} xl={8}>
                                                                <Form.Control
                                                                    type="text"
                                                                    className="form-control-modern"
                                                                    name="ar_name"
                                                                    value={arName}
                                                                    onChange={e => setArName(e.target.value)}
                                                                    required
                                                                />
                                                                <Form.Control.Feedback type="invalid">This field is required.</Form.Control.Feedback>
                                                            </Col>
                                                        </Form.Group>
                                                        <Form.Group as={Row} className="align-items-center">
                                                            <Col as={Form.Label} lg={5} xl={3} className="control-label text-lg-right mb-lg-0">
                                                                English Name
                                                                <span className="required">*</span>
                                                            </Col>
                                                            <Col lg={7} xl={8}>
                                                                <Form.Control
                                                                    type="text"
                                                                    className="form-control-modern"
                                                                    name="en_name"
                                                                    value={enName}
                                                                    onChange={e => setEnName(e.target.value)}
                                                                    required
                                                                />
                                                                <Form.Control.Feedback type="invalid">This field is required.</Form.Control.Feedback>

                                                            </Col>

                                                        </Form.Group>

                                                        <Form.Group as={Row} className="align-items-center">
                                                            <Col as={Form.Label} lg={5} xl={3} className="control-label text-lg-right mb-lg-0">
                                                                Slug
                                                                <span className="required">*</span>
                                                            </Col>
                                                            <Col lg={7} xl={8}>
                                                                <Form.Control
                                                                    type="text"
                                                                    className="form-control-modern"
                                                                    name="slug"
                                                                    value={slug}
                                                                    onChange={e => setSlug(e.target.value)}
                                                                    required
                                                                />
                                                                <Form.Control.Feedback type="invalid">This field is required.</Form.Control.Feedback>

                                                            </Col>

                                                        </Form.Group>

                                                        <Form.Group as={Row} className="align-items-center">
                                                            <Col as={Form.Label} lg={5} xl={3} className="control-label text-lg-right mb-lg-0">Arabic subtitle</Col>
                                                            <Col lg={7} xl={8}>
                                                                <Form.Control
                                                                    type="text"
                                                                    className="form-control-modern"
                                                                    name="ar_subtitle"
                                                                    value={arSubtitle}
                                                                    onChange={e => setArSubtitle(e.target.value)}
                                                                />

                                                            </Col>
                                                        </Form.Group>


                                                        <Form.Group as={Row} className="align-items-center">
                                                            <Col as={Form.Label} lg={5} xl={3} className="control-label text-lg-right mb-lg-0">English subtitle</Col>
                                                            <Col lg={7} xl={8}>
                                                                <Form.Control
                                                                    type="text"
                                                                    className="form-control-modern"
                                                                    name="en_subtitle"
                                                                    value={enSubtitle}
                                                                    onChange={e => setEnSubtitle(e.target.value)}
                                                                />

                                                            </Col>
                                                        </Form.Group>


                                                        <Form.Group as={Row} className="align-items-center">
                                                            <Col as={Form.Label} lg={5} xl={3} className="control-label text-lg-right mb-lg-0">Promotional Arabic title</Col>
                                                            <Col lg={7} xl={8}>
                                                                <Form.Control
                                                                    type="text"
                                                                    className="form-control-modern"
                                                                    name="promotional_arabic_title"
                                                                    value={promotionArTitle}
                                                                    onChange={e => serPromotionArTitle(e.target.value)}
                                                                />

                                                            </Col>
                                                        </Form.Group>


                                                        <Form.Group as={Row} className="align-items-center">
                                                            <Col as={Form.Label} lg={5} xl={3} className="control-label text-lg-right mb-lg-0">Promotional English title</Col>
                                                            <Col lg={7} xl={8}>
                                                                <Form.Control
                                                                    type="text"
                                                                    className="form-control-modern"
                                                                    name="promotional_arabic_title"
                                                                    value={promotionEnTitle}
                                                                    onChange={e => setPromotionEnTitle(e.target.value)}
                                                                />
                                                            </Col>
                                                        </Form.Group>

                                                        {/* <Form.Group as={ Row }>
                                                    <Col as={ Form.Label } lg={ 5 } xl={ 3 } className="control-label text-lg-right pt-2 mt-1 mb-0">Short Description</Col>
                                                    <Col lg={ 7 } xl={ 8 }>
                                                        <ReactQuill theme="snow" value={6} onChange={() => {}} />
                                                    </Col>
                                                </Form.Group> */}
                                                        <Form.Group as={Row}>
                                                            <Col as={Form.Label} lg={5} xl={3} className="control-label text-lg-right pt-2 mt-1 mb-0">Arabic Description <span className="required">*</span></Col>
                                                            <Col lg={7} xl={8}>
                                                                <ReactQuill style={{ border: validated && (arDescription === "" || arDescription === "<p><br></p>") ? "1px solid #dc3545" : "none" }} theme="snow" value={arDescription} onChange={setArDescription} />

                                                            </Col>
                                                        </Form.Group>

                                                        <Form.Group as={Row}>
                                                            <Col as={Form.Label} lg={5} xl={3} className="control-label text-lg-right pt-2 mt-1 mb-0">English Description <span className="required">*</span></Col>
                                                            <Col lg={7} xl={8}>
                                                                <ReactQuill theme="snow" style={{ border: validated && (enDescription === "" || enDescription === "<p><br></p>") ? "1px solid #dc3545" : "none" }} value={enDescription} onChange={setEnDescription} />
                                                            </Col>
                                                        </Form.Group>



                                                        <Form.Group as={Row}>
                                                            <Col as={Form.Label} lg={5} xl={3} className="control-label text-lg-right mb-lg-0 mb">
                                                                SKU
                                                                <PtToolTip placement="top" trigger="hover" tooltip="SKU refers to a Stock-keeping unit, a unique identifier for each distinct product and service that can be purchased." />
                                                            </Col>
                                                            <Col lg={7} xl={8}>
                                                                <Form.Control type="text" className="form-control-modern" value={sku} onChange={e => setSku(e.target.value)} />
                                                            </Col>
                                                        </Form.Group>

                                                        <Form.Group as={Row}>
                                                            <Col as={Form.Label} lg={5} xl={3} className="control-label text-lg-right mb-lg-0 mb">
                                                                Stock
                                                            </Col>
                                                            <Col lg={7} xl={8}>
                                                                <Form.Control
                                                                    type="number"
                                                                    className="form-control-modern"
                                                                    name="stock"
                                                                    value={stock}
                                                                    onChange={e => setStock(e.target.value)}
                                                                />
                                                            </Col>
                                                        </Form.Group>


                                                        <Form.Group as={Row}>
                                                            <Col as={Form.Label} lg={5} xl={3} className="control-label text-lg-right mb-lg-0 mb">
                                                                Price (SAR) <span className="required">*</span>
                                                            </Col>
                                                            <Col lg={7} xl={8}>
                                                                <Form.Control
                                                                    type="text"
                                                                    className="form-control-modern"
                                                                    name="price"
                                                                    required
                                                                    value={price}
                                                                    onChange={e => setPrice(e.target.value)}
                                                                />
                                                                <Form.Control.Feedback type="invalid">This field is required.</Form.Control.Feedback>

                                                            </Col>
                                                        </Form.Group>



                                                        <Form.Group as={Row}>
                                                            <Col as={Form.Label} lg={5} xl={3} className="control-label text-lg-right mb-lg-0 mb">
                                                                Sale Price (SAR)
                                                            </Col>
                                                            <Col lg={7} xl={8}>
                                                                <Form.Control
                                                                    type="text"
                                                                    className="form-control-modern"
                                                                    name="sale_price"
                                                                    value={salePrice}
                                                                    onChange={e => setSalePrice(e.target.value)}
                                                                />
                                                            </Col>
                                                        </Form.Group>

                                                        <Form.Group as={Row}>
                                                            <Col as={Form.Label} lg={5} xl={3} className="control-label text-lg-right mb-lg-0 mb">
                                                                Max quantity
                                                                <span className="required">*</span>
                                                            </Col>
                                                            <Col lg={7} xl={8}>
                                                                <Form.Control
                                                                    type="number"
                                                                    className="form-control-modern"
                                                                    name="max_quantity"
                                                                    required
                                                                    value={maxQuantity}
                                                                    onChange={e => setMaxQuantity(e.target.value)}
                                                                />
                                                            </Col>
                                                        </Form.Group>

                                                        <Form.Group as={Row}>
                                                            <Col as={Form.Label} lg={5} xl={3} className="control-label text-lg-right mb-lg-0 mb">
                                                                Is Out Of Stock
                                                            </Col>
                                                            <Col lg={7} xl={8}>
                                                                <Form.Control as="select" className="form-control-modern" value={isOutOfStock} onChange={e => setIsOutOfStock(e.target.value)} >
                                                                    <option value={false}>No</option>
                                                                    <option value={true}>Yes</option>
                                                                </Form.Control>
                                                            </Col>
                                                        </Form.Group>


                                                        <Form.Group as={Row}>
                                                            <Col as={Form.Label} lg={5} xl={3} className="control-label text-lg-right mb-lg-0 mb">
                                                                Is Taxable
                                                            </Col>
                                                            <Col lg={7} xl={8}>
                                                                <Form.Control as="select" className="form-control-modern" value={isTaxable} onChange={e => setIsTaxable(e.target.value)}>
                                                                    <option value={true}>Yes</option>
                                                                    <option value={false}>No</option>

                                                                </Form.Control>
                                                            </Col>
                                                        </Form.Group>



                                                        <Form.Group as={Row}>
                                                            <Col as={Form.Label} lg={5} xl={3} className="control-label text-lg-right mb-lg-0 mb">
                                                                Is On Sale
                                                            </Col>
                                                            <Col lg={7} xl={8}>
                                                                <Form.Control as="select" className="form-control-modern" value={isOnSale} onChange={e => setIsOnSale(e.target.value)}>
                                                                    <option value={false}>No</option>
                                                                    <option value={true}>Yes</option>
                                                                </Form.Control>
                                                            </Col>
                                                        </Form.Group>




                                                        <Form.Group as={Row}>
                                                            <Col as={Form.Label} lg={5} xl={3} className="control-label text-lg-right mb-lg-0 mb">
                                                                Require Shipping
                                                            </Col>
                                                            <Col lg={7} xl={8}>
                                                                <Form.Control as="select" className="form-control-modern" value={requireShipping} onChange={e => setRequireShipping(e.target.value)}>
                                                                    <option value={true}>Yes</option>
                                                                    <option value={false}>No</option>
                                                                </Form.Control>
                                                            </Col>
                                                        </Form.Group>

                                                        <Form.Group as={Row}>
                                                            <Col as={Form.Label} lg={5} xl={3} className="control-label text-lg-right mb-lg-0 mb">
                                                                Is Featured
                                                            </Col>
                                                            <Col lg={7} xl={8}>
                                                                <Form.Control as="select" className="form-control-modern" value={isFeatured} onChange={e => setIsFeatured(e.target.value)}>
                                                                    <option value={false}>No</option>
                                                                    <option value={true}>Yes</option>
                                                                </Form.Control>
                                                            </Col>
                                                        </Form.Group>



                                                    </Col>
                                                    <Col xl={3}>
                                                        <Form.Group>
                                                            <Form.Label className="control-label text-lg-right pt-2 mt-1 mb-2">
                                                                Product Categories
                                                                <PtToolTip placement="top" tooltip="In order to add category, you need to add create category first." trigger="hover" />
                                                            </Form.Label>
                                                            <Form.Control as="div" className="form-control-modern overflow-auto">
                                                                <Tree
                                                                    className="no-icon"
                                                                    selectable={false}
                                                                    checkable={true}
                                                                    showIcon={false}
                                                                    multiple={true}
                                                                    treeData={categories}
                                                                    onCheck={keys => setProductCats(keys)}
                                                                />
                                                            </Form.Control>
                                                        </Form.Group>

                                                    </Col>
                                                </Row>
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                        <Row className="mb-4">
                            <Col>
                                <Card className="card-modern card-big-info">
                                    <Card.Body>
                                        <Row>
                                            <Col lg="2-5" xl="1-5">
                                                <i className="card-big-info-icon bx bx-camera"></i>
                                                <h2 className="card-big-info-title">Product Image</h2>
                                                <p className="card-big-info-desc">Upload your Product image. You can add multiple images</p>
                                            </Col>
                                            <Col lg="3-5" xl="4-5">
                                                <Form.Group className="align-items-center">
                                                    <Row>
                                                        <Button
                                                            href="#openModal"
                                                            className="ml-auto mb-2 mr-3"
                                                            variant="primary"
                                                            onClick={e => openModal(e, { type: 'gallery' })}
                                                        >Add images</Button>
                                                    </Row>
                                                    <div className="media-gallery product-media-gallery">
                                                        <Row className="mg-files">
                                                            {images.map((image, index) => (
                                                                <Col md={4} lg={3} className="col-6" key={`image-${index}`}>
                                                                    <div className="thumbnail">
                                                                        <div className="thumb-preview">
                                                                            <div className="centered">
                                                                                <a href="#thumb" className="thumb-image">
                                                                                    <PtLazyLoad
                                                                                        src={image.copy_link}
                                                                                        alt={image.alt_text ? image.alt_text : 'product'}
                                                                                        width="300"
                                                                                        height="300"
                                                                                    />
                                                                                </a>
                                                                            </div>
                                                                            {/* <div className="mg-thumb-options">
                                                                        <div className="mg-zoom" onClick={() => openLightBox(index)}>
                                                                            <i className="fas fa-search"></i>
                                                                        </div>
                                                                        <div className="mg-toolbar">
                                                                            <Form.Check
                                                                                type="radio"
                                                                                custom
                                                                                inline
                                                                                style={{ minHeight: "auto" }}
                                                                                id={`image-${index}`}
                                                                                name="defaultImage"
                                                                                className="mg-option"
                                                                                value={image.id}
                                                                                checked={defaultImage === image.id}
                                                                                onChange={e => selectDefaultImage(e, image.id)}
                                                                                label="Set Default"
                                                                            />
                                                                            <div className="mg-option set-default float-right">
                                                                                <a href="#delete" className="text-white mg-remove" onClick={e => removeImage(e, image.id)}><i className="far fa-trash-alt d-block"></i></a>
                                                                            </div>
                                                                        </div>
                                                                    </div> */}
                                                                        </div>
                                                                    </div>
                                                                </Col>
                                                            ))
                                                            }
                                                        </Row>
                                                    </div>
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>

                        <Row className="action-buttons">
                            <Col md="auto" className="col-12">
                                <Button
                                    type="submit"
                                    className="btn-px-4 py-3 d-flex align-items-center font-weight-semibold line-height-1"
                                    variant="primary"
                                ><i className="bx bx-save text-4 mr-2"></i>Add Product</Button>
                            </Col>
                            <Col md="auto" className="col-12 px-md-0 mt-3 mt-md-0">
                                <Button
                                    as={Link}
                                    to={`${process.env.PUBLIC_URL}/products`}
                                    className="btn-px-4 py-3 border font-weight-semibold text-color-dark line-height-1 d-flex h-100 align-items-center"
                                    variant="light"
                                >Back</Button>
                            </Col>
                        </Row>
                    </Form>

                    <MediaGalleryModal chooseOne={onlyOneImage} handleSelectedFiles={handleSelectedFiles} isOpen={modalOpen ? true : false} onClose={chooseMedia} />

                </>
            }
        </>
    )
}