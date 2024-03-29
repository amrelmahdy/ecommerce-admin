import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Card, Form, Button, InputGroup, Table, OverlayTrigger, Tooltip, Alert } from 'react-bootstrap';
import LightBox from 'react-image-lightbox';
import { SlideToggle } from 'react-slide-toggle';
import { Tabs, TabList, TabPanel, Tab } from 'react-tabs';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import SelectAsync from 'react-select/async';
import { toast } from 'react-toastify';
import Tree from 'rc-tree';
import 'react-quill/dist/quill.snow.css';
import ReactQuill from 'react-quill';
import 'rc-tree/assets/index.css';
import 'react-image-lightbox/style.css';
import 'react-datepicker/dist/react-datepicker.css';

import Breadcrumb from '../../common/breadcrumb';
import Loader from '../../features/loader';
import MediaGalleryModal from '../../features/modals/media-gallery-modal';
import PNotify from '../../features/elements/p-notify';
import PtLazyLoad from '../../features/lazyload';
import PtTagsInput from '../../features/elements/tags-input';
import PtToolTip from '../../features/elements/tooltip';

import { getAttributes, getTags, getTaxTypes, getProduct, getProducts, uploadDynamicImages, uploadCloudImages, deleteCloudImage } from '../../../api';
import { getProductDetails, updateProduct } from '../../../api/products';
import { getCategories, getCategory } from '../../../api/categories';
import { getVendors } from '../../../api/vendors';
import { isValidProductPayload } from '../../../api/data.factory';

export default function ProductDetail({ history, ...props }) {
    const enTagsInputRef = useRef(null);
    const arTagsInputRef = useRef(null);
    const [error, setError] = useState([]);
    const [validated, setValidated] = useState(false);

    const [loading, setLoading] = useState(true);
    const [product, setProduct] = useState(null);



    const [arName, setArName] = useState("");
    const [enName, setEnName] = useState("");
    const [slug, setSlug] = useState("");
    const [price, setPrice] = useState();
    const [salePrice, setSalePrice] = useState(0);
    const [enDescription, setEnDescription] = useState("");
    const [arDescription, setArDescription] = useState("");
    const [stock, setStock] = useState();
    const [arSubtitle, setArSubtitle] = useState("");
    const [enSubtitle, setEnSubtitle] = useState("");
    const [promotionArTitle, setPromotionArTitle] = useState("");
    const [promotionEnTitle, setPromotionEnTitle] = useState("");
    const [maxQuantity, setMaxQuantity] = useState(10);
    const [sku, setSku] = useState("");
    const [isOutOfStock, setIsOutOfStock] = useState(false);
    const [isPublished, setIsPublished] = useState(false)
    const [requireShipping, setRequireShipping] = useState(true);
    const [isTaxable, setIsTaxable] = useState(true);
    const [isOnSale, setIsOnSale] = useState(false);
    const [isFeatured, setIsFeatured] = useState(false);
    const [productCats, setProductCats] = useState([]);
    const [productImages, setProductImages] = useState([]);
    const [arTags, setArTags] = useState([]);
    const [enTags, setEnTags] = useState([]);
    const [vendor, setVendor] = useState(null);


    const [categories, setCategories] = useState([]);
    const [vendors, setVendors] = useState([]);


    const [type, setType] = useState('simple');
    const [virtual, setVirtual] = useState(false);
    const [downloadable, setDownloadable] = useState(false);
    const [cats, setCats] = useState([]);
    const [images, setImages] = useState([]);
    const [defaultImage, setDefault] = useState(1);
    const [files, setFiles] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [openImage, setOpenImage] = useState(false);
    const [onlyOneImage, SetOnlyOneImage] = useState(false);
    const [saleSchedule, setSaleSchedule] = useState(false);
    const [saleStart, setSaleStart] = useState(null);
    const [saleEnd, setSaleEnd] = useState(null);
    const [manageStock, setManageStock] = useState(false);
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
    const [taxTypes, setTaxTypes] = useState([]);

    useEffect(() => {
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

    const fetchData = async () => {
        setLoading(true);
        const productDetails = await getProductDetails(props.match.params.slug);
        const categories = await getCategories();
        const vendors = await getVendors();

        setProduct(productDetails);
        setCategories(categories);

        setLoading(false);

        setArName(productDetails.ar_name)
        setEnName(productDetails.en_name)
        setSlug(productDetails.slug)
        setArSubtitle(productDetails.ar_subtitle)
        setEnSubtitle(productDetails.en_subtitle)
        setPromotionArTitle(productDetails.promotion_ar_title)
        setPromotionEnTitle(productDetails.promotion_en_title)
        setSku(productDetails.sku)
        setEnDescription(productDetails.en_description)
        setArDescription(productDetails.ar_description)
        setVendor(productDetails.vendor ? productDetails.vendor.id : null)
        setStock(productDetails.stock)
        setPrice(productDetails.price)
        setSalePrice(productDetails.sale_price)
        setMaxQuantity(productDetails.max_quantity)
        setIsFeatured(productDetails.is_featured)
        setIsOnSale(productDetails.is_on_sale)
        setIsOutOfStock(productDetails.is_out_of_stock)
        setIsTaxable(productDetails.is_taxable)
        setIsPublished(productDetails.isPublished);
        setArTags(productDetails.ar_tags)
        setEnTags(productDetails.en_tags)

        setCats(productDetails.categories.map(cat => cat.slug));
        setImages(productDetails.images);


        setVendors(vendors)
        setProductCats(productDetails.categories.map(cat => cat.id))
        // setDefault( response.media.findIndex( media => media.pivot.default ) );
        // setSaleSchedule( response.sale_schedule );
        // setSaleStart( response.sale_start ? new Date( response.sale_start ) : null );
        // setSaleEnd( response.sale_end ? new Date( response.sale_end ) : null );
        // setManageStock( response.manage_stock );
        // setAttrs( response.attributes.map( attr => {
        //     let termIds = attr.pivot.term_ids.split( ',' ).map( termId => parseInt( termId ) );
        //     let selectedTerms = attr.terms.filter( term => termIds.includes( term.id ) );

        //     return {
        //         id: attr.id,
        //         name: attr.name,
        //         slug: attr.slug,
        //         enable_archives: attr.enable_archives,
        //         created_at: attr.created_at,
        //         updated_at: attr.updated_at,
        //         usedForVariation: attr.pivot.used_for_variation === 1,
        //         terms: attr.terms,
        //         excerpt: attr.excerpt,
        //         selectedTerms: selectedTerms.map( term => {
        //             return {
        //                 label: attr.slug === 'color' ? term.slug : term.name,
        //                 value: term.slug
        //             }
        //         } )
        //     };
        // } ) );
        // setVariants( response.variants ? response.variants.map( variant => {
        //     return {
        //         ...variant,
        //         sale_start: variant.sale_start ? new Date( variant.sale_start ) : null,
        //         sale_end: variant.sale_end ? new Date( variant.sale_end ) : null
        //     };
        // } ) : [] );
    }

    console.log("ar_tage", arTags, enTags)

    useEffect(() => {
        fetchData()
    }, [props.match.params.id])

    async function searchProducts(input) {
        let options = [];
        await getProducts(0, undefined, [{ id: 'name', value: input }], null).then(response => {
            options = response.data.filter(product => product.id !== parseInt(props.match.params.id)).map(product => {
                return {
                    label: product.name,
                    value: product.id
                }
            });
        }).catch(error => console.error(error));
        return options;
    }


    function getTreeData(data) {
        let stack = [],
            result = [];
        result = data.reduce((acc, cur) => {
            let newNode = {
                key: cur.id,
                title: cur.ar_name,
                children: []
            };
            acc.push(newNode);
            return acc;
        }, []);

        let temp, children, childNode;
        const addChildren = () => {
            children = data.filter(item => item.parent === temp.id);
            children.forEach(child => {
                childNode = {
                    key: child.slug,
                    title: child.name,
                    children: []
                };
                temp.children.push(childNode);
                stack.push({
                    id: child.id,
                    children: childNode.children
                });
            });
        }

        while (stack.length) {
            temp = stack[stack.length - 1];
            stack.pop();
            addChildren();
        }

        return result;
    }

    const saveProduct = async (e) => {
        e.preventDefault();
        if (e.currentTarget.checkValidity() === false) {
            e.stopPropagation();
            window.scrollTo(0, 0)

        }
        setValidated(true);
        const newProduct = {
            ar_name: arName,
            en_name: enName,
            ar_subtitle: arSubtitle,
            en_subtitle: enSubtitle,
            slug: slug,
            sku: sku,
            price: parseFloat(price),
            sale_price: parseFloat(salePrice),
            max_quantity: parseInt(maxQuantity),
            en_description: enDescription,
            ar_description: arDescription,
            promotion_ar_title: promotionArTitle,
            promotion_en_title: promotionEnTitle,
            stock: parseInt(stock),
            vendor,
            ar_tags: arTags,
            en_tags: enTags,
            categories: productCats,
            is_out_of_stock: Boolean(isOutOfStock),
            is_taxable: Boolean(isTaxable),
            is_on_sale: Boolean(isOnSale),
            require_shipping: Boolean(requireShipping),
            is_featured: Boolean(isFeatured),
            images
        }

        const isValidPayload = isValidProductPayload(newProduct);
        if (isValidPayload) {
            setLoading(true);
            try {
                if (productImages.length > 0) {
                    const oldImages = images.filter(img => img.url);
                    const uploadedImages = await uploadCloudImages(productImages, `products/${product.slug}`);
                    if (images && images.length > 0) newProduct.images = [...oldImages, ...uploadedImages];
                }
                const productUpdated = await updateProduct(product.id, newProduct);
                setLoading(false);
                if (productUpdated) {
                    toast(
                        <PNotify title="Success" icon="fas fa-check" text="Product updated successfully." />,
                        {
                            containerId: "default",
                            className: "notification-success"
                        }
                    );
                    history.push("/products")
                }

            } catch (error) {
                setLoading(false);
                window.scrollTo(0, 0)
                if (Array.isArray(error.response.data.message)) {
                    setError(error.response.data.message)
                } else {
                    setError([error.response.data.message])
                }
            }
        }
    }


    const handleOnPublishProduct = async (e) => {
        e.preventDefault();
        const status = product.is_published;
        const successMessage = status ? 'unPublihed' : 'published'
        setLoading(true);
        try {
            const productPublished = await updateProduct(product.id, { is_published: !product.is_published });
            setLoading(false);
            if (productPublished) {
                toast(
                    <PNotify title="Success" icon="fas fa-check" text={`Product ${successMessage} successfully.`} />,
                    {
                        containerId: "default",
                        className: "notification-success"
                    }
                );
                history.push("/products")

            }
        } catch (error) {
            setLoading(false);
        }
    }

    function openModal(e, info) {
        e.preventDefault();
        SetOnlyOneImage(info.type !== 'gallery');
        setModalOpen(info);
    }

    function chooseMedia(selectedMedia) {
        setModalOpen(false);
        if (!selectedMedia.length) return;
        if (modalOpen.type === 'gallery') {
            setImages([...images, ...selectedMedia]);
        } else if (modalOpen.type === 'file') {
            let id = modalOpen.id;
            setFiles(files.map((file, index) => {
                if (index === id) {
                    return {
                        name: selectedMedia[0].name,
                        url: selectedMedia[0].copy_link
                    }
                }
                return file;
            }));
        }
    }

    function selectDefaultImage(e, id) {
        e.target.checked && setDefault(id);
    }

    function removeImage(e, index) {
        e.preventDefault();
        const _images = images.filter((image, i) => {
            if (i == index) {                // destroy image here if it is uploaded to cloudinary
                if (image.public_id) {
                    deleteCloudImage(image.public_id);
                    const currentInages = images.filter((im, i) => im.public_id && im.public_id !== image.public_id)
                    setLoading(true);
                    updateProduct(product.id, { images: currentInages }).then(res => setLoading(false)).catch(err => setLoading(false));
                }
            }
            return i !== index
        })
        setImages(_images);
    }




    function addArTags(tags) {
        setArTags(tags)
    }

    function addEnTags(tags) {
        setEnTags(tags)
    }



    const handleSelectedFiles = (files) => {
        setProductImages(files)
    }



    console.log("product images", productImages)

    return (
        <>
            <Breadcrumb current="Edit Product" paths={[{
                name: "Home",
                url: "/"
            }, {
                name: "Products",
                url: "/products"
            }]} />

            {loading ? <Loader />
                :
                <Form className="ecommerce-form"
                    noValidate
                    validated={validated}
                    action="#"
                    method="post"
                    enctype="multipart/form-data"
                    onSubmit={saveProduct}>
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
                                            <p>
                                                <a href="#see" target="_blank" onClick={e => e.preventDefault()}>Click here to see the product</a>
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
                                                                disabled
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
                                                                onChange={e => setPromotionArTitle(e.target.value)}
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
                                                            <ReactQuill className='ar-quill' style={{ border: validated && (arDescription === "" || arDescription === "<p><br></p>") ? "1px solid #dc3545" : "none" }} theme="snow" value={arDescription} onChange={setArDescription} />

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
                                                            Vendor
                                                        </Col>
                                                        <Col lg={7} xl={8}>
                                                            <Form.Control as="select" required className="form-control-modern" value={vendor} onChange={e => setVendor(e.target.value)} >
                                                                <option value="">Choose a Vendor</option>

                                                                {
                                                                    vendors.length && vendors.map((vend, index) => {
                                                                        return <option key={vend.id + index} value={vend.id}>{vend.ar_name}</option>
                                                                    })
                                                                }
                                                            </Form.Control>
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
                                                                required
                                                                onChange={e => setStock(e.target.value)}
                                                            />
                                                            <Form.Control.Feedback type="invalid">This field is required.</Form.Control.Feedback>

                                                        </Col>
                                                    </Form.Group>


                                                    <Form.Group as={Row}>
                                                        <Col as={Form.Label} lg={5} xl={3} className="control-label text-lg-right mb-lg-0 mb">
                                                            Price (SAR) <span className="required">*</span>
                                                        </Col>
                                                        <Col lg={7} xl={8}>
                                                            <Form.Control
                                                                type="number"
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
                                                                type="number"
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
                                                            <Form.Control as="select" className="form-control-modern" value={isOutOfStock} onChange={(e) => setIsOutOfStock(e.target.value)}>
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
                                                                treeData={getTreeData(categories)}
                                                                checkedKeys={productCats}
                                                                onCheck={keys => setProductCats(keys)}
                                                            />
                                                        </Form.Control>
                                                    </Form.Group>


                                                    <Form.Group>
                                                        <Form.Label className="control-label text-lg-right pt-2 mt-1 mb-2">Arabic Tags</Form.Label>
                                                        <PtTagsInput value={product.ar_tags} ref={arTagsInputRef} onChange={addArTags} />

                                                    </Form.Group>

                                                    <Form.Group>
                                                        <Form.Label className="control-label text-lg-right pt-2 mt-1 mb-2">English Tags</Form.Label>
                                                        <PtTagsInput value={product.en_tags} ref={enTagsInputRef} onChange={addEnTags} />
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
                                                                                    src={image.url ? image.url : image.copy_link}
                                                                                    alt={image.alt_text ? image.alt_text : 'product'}
                                                                                    width="300"
                                                                                    height="300"
                                                                                />
                                                                            </a>
                                                                        </div>
                                                                        <div className="mg-thumb-options">
                                                                            {/* <div className="mg-zoom" onClick={() => openLightBox(index)}>
                                                                                <i className="fas fa-search"></i>
                                                                            </div> */}
                                                                            <div className="mg-toolbar">

                                                                                <div className="mg-option set-default float-right">
                                                                                    <a href="#delete" className="text-white mg-remove" onClick={e => removeImage(e, index)}><i className="far fa-trash-alt d-block"></i></a>
                                                                                </div>
                                                                            </div>
                                                                        </div>
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
                    {/* <Row className="mb-4"> */}
                    {/* <Col>
                            <Card className="card-modern card-big-info">
                                <Card.Body>
                                    <Tabs className="tabs-modern row" selectedTabClassName="active" selectedTabPanelClassName="show">
                                        <Col lg="2-5" xl="1-5">
                                            <TabList className="nav flex-column">
                                                <Tab><a className="nav-link" href="#price" onClick={e => e.preventDefault()}>Price</a></Tab>
                                                <Tab><a className="nav-link" href="#inventory" onClick={e => e.preventDefault()}>Inventory</a></Tab>
                                                {virtual ? ''
                                                    : <Tab><a className="nav-link" href="#shipping" onClick={e => e.preventDefault()}>Shipping</a></Tab>
                                                }
                                                <Tab><a className="nav-link" href="#linked" onClick={e => e.preventDefault()}>Linked Products</a></Tab>
                                                <Tab><a className="nav-link" href="#attrs" onClick={e => e.preventDefault()}>Attributes</a></Tab>
                                                {type === 'variable' ?
                                                    <Tab><a className="nav-link" href="#attrs" onClick={attrsForVariationUpdate}>Variations</a></Tab>
                                                    : ''
                                                }
                                                <Tab><a className="nav-link" href="#advanced" onClick={e => e.preventDefault()}>Advanced</a></Tab>
                                            </TabList>
                                        </Col> */}
                    {/* 
                                        <Col lg="3-5" xl="4-5">
                                            <TabPanel className="tab-pane fade">
                                                {type === 'simple' ?
                                                    <>
                                                        <Form.Group as={Row} className="align-items-center">
                                                            <Col as={Form.Label} lg={5} xl={3} className="control-label text-lg-right mb-lg-0">Regular Price ($)</Col>
                                                            <Col lg={7} xl={6}>
                                                                <Form.Control
                                                                    type="text"
                                                                    className="form-control-modern"
                                                                    name="price"
                                                                    required
                                                                    value={product.price ? product.price : ''}
                                                                    onChange={e => productChange('price', e.target.value)}
                                                                />
                                                            </Col>
                                                        </Form.Group>
                                                        <Form.Group as={Row} className="align-items-center">
                                                            <Col as={Form.Label} lg={5} xl={3} className="control-label text-lg-right mb-lg-0">Sale Price ($)</Col>
                                                            <Col lg={7} xl={6}>
                                                                <Form.Control
                                                                    type="text"
                                                                    className="form-control-modern"
                                                                    name="sale_price"
                                                                    value={product.sale_price ? product.sale_price : ''}
                                                                    onChange={e => productChange('sale_price', e.target.value)}
                                                                />
                                                            </Col>
                                                            {saleSchedule ? ''
                                                                :
                                                                <Col lg={{ offset: 5 }} xl={{ span: "auto", offset: 0 }} className="col-auto">
                                                                    <Button
                                                                        href="#setSchedule"
                                                                        className="set-schedule p-0"
                                                                        variant="link"
                                                                        onClick={e => { e.preventDefault(); setSaleSchedule(true) }}
                                                                    >Schedule</Button>
                                                                </Col>
                                                            }
                                                        </Form.Group>
                                                        {saleSchedule ?
                                                            <Form.Group>
                                                                <Row className="align-items-center">
                                                                    <Col as={Form.Label} lg={5} xl={3} className="control-label text-lg-right mb-lg-0">Sale Price Dates</Col>
                                                                    <Col lg={7} xl={6}>
                                                                        <InputGroup className="input-daterange">
                                                                            <InputGroup.Prepend><InputGroup.Text><i className="fas fa-calendar-alt"></i></InputGroup.Text></InputGroup.Prepend>
                                                                            <Form.Control
                                                                                as="div"
                                                                                className="py-0"
                                                                            >
                                                                                <DatePicker
                                                                                    selected={saleStart}
                                                                                    onChange={date => setSaleStart(date)}
                                                                                    maxDate={saleEnd}
                                                                                />
                                                                            </Form.Control>
                                                                            <InputGroup.Text className="border-left-0 border-right-0 rounded-0">to</InputGroup.Text>
                                                                            <Form.Control
                                                                                as="div"
                                                                                className="py-0"
                                                                            >
                                                                                <DatePicker
                                                                                    selected={saleEnd}
                                                                                    onChange={date => setSaleEnd(date)}
                                                                                    minDate={saleStart}
                                                                                />
                                                                            </Form.Control>
                                                                        </InputGroup>
                                                                    </Col>
                                                                    <Col lg={{ offset: 5 }} xl={{ span: "auto", offset: 0 }} className="col-auto">
                                                                        <Button
                                                                            href="#unsetSchedule"
                                                                            className="cancel-schedule float-right p-0"
                                                                            variant="link"
                                                                            onClick={e => { e.preventDefault(); setSaleSchedule(false); }}
                                                                        >Cancel</Button>
                                                                    </Col>
                                                                </Row>
                                                            </Form.Group>
                                                            : ''
                                                        }
                                                    </>
                                                    : ''
                                                }
                                                {downloadable ?
                                                    <Form.Group>
                                                        <Row className="mb-3">
                                                            <Col lg={5} xl={3} className="text-lg-right">
                                                                <Form.Label className="control-label mt-3 mb-0">Downloadalbe files</Form.Label>
                                                            </Col>
                                                            <Col lg={7} xl={9}>
                                                                <Table className="table-downloadable" responsive={true} style={{ minWidth: "600px" }}>
                                                                    <thead>
                                                                        <tr>
                                                                            <th>Name</th>
                                                                            <th>File URL</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {
                                                                            files.map((file, index) => (
                                                                                <tr key={`file-${index}`}>
                                                                                    <td>
                                                                                        <Form.Control
                                                                                            type="text"
                                                                                            className="form-control-modern"
                                                                                            value={file.name}
                                                                                            onChange={e => fileNameChange(e, index)}
                                                                                        />
                                                                                    </td>
                                                                                    <td>
                                                                                        <InputGroup>
                                                                                            <Form.Control
                                                                                                type="text"
                                                                                                className="form-control-modern"
                                                                                                value={file.url}
                                                                                                placeholder="file path"
                                                                                                onChange={e => filePathChange(e, index)}
                                                                                            />
                                                                                            <InputGroup.Append>
                                                                                                <Button
                                                                                                    type="button"
                                                                                                    variant="primary"
                                                                                                    onClick={e => openModal(e, { type: 'file', id: index })}
                                                                                                >Choose File</Button>
                                                                                                <Button
                                                                                                    type="button"
                                                                                                    className="btn-remove"
                                                                                                    variant="danger"
                                                                                                    onClick={() => removeFile(index)}
                                                                                                ><i className="bx bx-trash text-r mt-1"></i>
                                                                                                </Button>
                                                                                            </InputGroup.Append>
                                                                                        </InputGroup>
                                                                                    </td>
                                                                                </tr>
                                                                            ))
                                                                        }
                                                                    </tbody>
                                                                    <tfoot>
                                                                        <tr>
                                                                            <th colSpan="2"><a href="#addFile" className="btn btn-primary" onClick={addFile}>Add file</a></th>
                                                                        </tr>
                                                                    </tfoot>
                                                                </Table>
                                                            </Col>
                                                        </Row>
                                                    </Form.Group>
                                                    : ''
                                                }
                                                <Form.Group as={Row} className="align-items-center">
                                                    <Col as={Form.Label} lg={5} xl={3} className="control-label text-lg-right mb-lg-0">Tax Status
                                                        <PtToolTip placement="top" trigger="hover" tooltip="Define whether or not the entire product is taxable, or just the cost of shipping it." />
                                                    </Col>
                                                    <Col lg={7} xl={6}>
                                                        <Form.Control
                                                            as="select"
                                                            className="form-control-modern"
                                                            value={product.tax_status}
                                                            onChange={e => productChange('tax_status', e.target.value)}
                                                        >
                                                            <option value="taxable">Taxable</option>
                                                            <option value="shipping">Shipping Only</option>
                                                            <option value="none">None</option>
                                                        </Form.Control>
                                                    </Col>
                                                </Form.Group>
                                                <Form.Group as={Row} className="align-items-center">
                                                    <Col as={Form.Label} lg={5} xl={3} className="control-label text-lg-right mb-lg-0">
                                                        Tax Class
                                                        <PtToolTip placement="top" trigger="hover" tooltip="Choose a tax class for this product. Tax classes are used to apply different tax rates specific to certain types of product." />
                                                    </Col>
                                                    <Col lg={7} xl={6}>
                                                        <Form.Control
                                                            as="select"
                                                            className="form-control-modern"
                                                            value={product.tax_type_id ? product.tax_type_id : ""}
                                                            onChange={e => productChange('tax_type_id', parseInt(e.target.value))}
                                                        >
                                                            {
                                                                taxTypes.map((tax, index) => (
                                                                    <option value={tax.slug} key={`tax-type-${index}`}>{tax.name}</option>
                                                                ))
                                                            }
                                                        </Form.Control>
                                                    </Col>
                                                </Form.Group>
                                            </TabPanel>

                                            <TabPanel className="tab-pane fade">
                                                <Form.Group as={Row} className="align-items-center">
                                                    <Col as={Form.Label} lg={5} xl={3} className="control-label text-lg-right mb-lg-0 mb">
                                                        SKU
                                                        <PtToolTip placement="top" trigger="hover" tooltip="SKU refers to a Stock-keeping unit, a unique identifier for each distinct product and service that can be purchased." />
                                                    </Col>
                                                    <Col lg={7} xl={6}>
                                                        <Form.Control
                                                            type="text"
                                                            className="form-control-modern"
                                                            value={product.sku}
                                                            onChange={e => productChange('sku', e.target.value)}
                                                        />
                                                    </Col>
                                                </Form.Group>
                                                {type === 'simple' ?
                                                    <>
                                                        <Form.Group>
                                                            <Row className="align-items-center">
                                                                <Col as={Form.Label} lg={5} xl={3} className="control-label text-lg-right mb-lg-0">Manage Stock?</Col>
                                                                <Col lg={7} xl={6}>
                                                                    <Form.Check className="checkbox">
                                                                        <Form.Check.Label className="my-2">
                                                                            <Form.Check.Input
                                                                                className="checkbox-style-1 mt-0"
                                                                                type="checkbox"
                                                                                checked={manageStock}
                                                                                onChange={e => setManageStock(e.target.checked)}
                                                                            />
                                                                            Enable stock management at product level
                                                                        </Form.Check.Label>
                                                                    </Form.Check>
                                                                </Col>
                                                            </Row>
                                                            {manageStock ?
                                                                <>
                                                                    <Row className="pt-4 mb-3 align-items-center">
                                                                        <Col as={Form.Label} lg={5} xl={3} className="control-label text-lg-right mb-lg-0">
                                                                            Stock Quantity
                                                                            <PtToolTip placement="top" trigger="hover" tooltip="Stock quantity. If this is a variable product this value will be used to control stock for all variations, unless you define stock at variation level." />
                                                                        </Col>
                                                                        <Col lg={7} xl={6}>
                                                                            <Form.Control
                                                                                type="number"
                                                                                className="form-control-modern"
                                                                                value={product.stock_quantity}
                                                                                onChange={e => productChange('stock_quantity', parseInt(e.target.value))}
                                                                            />
                                                                        </Col>
                                                                    </Row>
                                                                    <Row className="pt-3 mb-3 align-items-center">
                                                                        <Col as={Form.Label} lg={5} xl={3} className="control-label text-lg-right mb-lg-0">
                                                                            Allow Backorders
                                                                            <PtToolTip placement="top" trigger="hover" tooltip="If managing stock, this controls whether or not backorders are allowed. If enabled, stock quantity can go below 0" />
                                                                        </Col>
                                                                        <Col lg={7} xl={6}>
                                                                            <Form.Control
                                                                                as="select"
                                                                                className="form-control-modern"
                                                                                value={product.allow_backorder}
                                                                                onChange={e => productChange('allow_backorder', e.target.value)}
                                                                            >
                                                                                <option value="no">Do not allow</option>
                                                                                <option value="yes">Allow</option>
                                                                            </Form.Control>
                                                                        </Col>
                                                                    </Row>
                                                                    <Row className="py-3 mb-3 align-items-center">
                                                                        <Col as={Form.Label} lg={5} xl={3} className="control-label text-lg-right mb-lg-0">
                                                                            Low stock threshold
                                                                            <PtToolTip placement="top" trigger="hover" tooltip="When product stock reaches this amount you will be notified by email" />
                                                                        </Col>
                                                                        <Col lg={7} xl={6}>
                                                                            <Form.Control
                                                                                type="number"
                                                                                min="0"
                                                                                className="form-control-modern"
                                                                                value={product.low_stock_threshold}
                                                                                onChange={e => productChange('low_stock_threshold', parseInt(e.target.value))}
                                                                            />
                                                                        </Col>
                                                                    </Row>
                                                                </>
                                                                : ''
                                                            }
                                                        </Form.Group>
                                                        {
                                                            !manageStock ?
                                                                <Form.Group as={Row} className="align-items-center">
                                                                    <Col as={Form.Label} lg={5} xl={3} className="control-label text-lg-right mb-lg-0">
                                                                        Stock Status
                                                                        <PtToolTip placement="top" trigger="hover" tooltip="Controls whether or not the product is listed as 'in stock' or 'out of stock' on the frontend." />
                                                                    </Col>
                                                                    <Col lg={7} xl={6}>
                                                                        <Form.Control
                                                                            as="select"
                                                                            className="form-control-modern"
                                                                            value={product.stock_status}
                                                                            onChange={e => productChange('stock_status', e.target.value)}
                                                                        >
                                                                            <option value="in-stock">In Stock</option>
                                                                            <option value="out-of-stock">Out of Stock</option>
                                                                            <option value="on-backorder">On Backorder</option>
                                                                        </Form.Control>
                                                                    </Col>
                                                                </Form.Group>
                                                                : ''
                                                        }
                                                    </>
                                                    : ''
                                                }
                                                <Form.Group as={Row} className="align-items-center">
                                                    <Col as={Form.Label} lg={5} xl={3} className="control-label text-lg-right mb-lg-0">Sold Individually</Col>
                                                    <Col lg={7} xl={6}>
                                                        <Form.Check className="checkbox">
                                                            <Form.Check.Label className="my-2">
                                                                <Form.Check.Input
                                                                    type="checkbox"
                                                                    className="checkbox-style-1 mt-0"
                                                                    checked={product.sold_individually}
                                                                    onChange={e => productChange('sold_individually', e.target.checked)}
                                                                />
                                                                Enable this to only allow one of this item to be bought in a single order
                                                            </Form.Check.Label>
                                                        </Form.Check>
                                                    </Col>
                                                </Form.Group>
                                            </TabPanel>

                                            {!virtual ?
                                                <TabPanel className="tab-pane fade">
                                                    <Form.Group as={Row} className="align-items-center">
                                                        <Col as={Form.Label} lg={5} xl={3} className="control-label text-lg-right mb-lg-0">
                                                            Weight (kg)
                                                            <PtToolTip placement="top" trigger="hover" tooltip="Weight in decimal form" />
                                                        </Col>
                                                        <Col lg={7} xl={6}>
                                                            <Form.Control
                                                                type="number"
                                                                className="form-control-modern"
                                                                value={product.weight ? product.weight : ''}
                                                                onChange={e => productChange('weight', e.target.value)}
                                                            />
                                                        </Col>
                                                    </Form.Group>
                                                    <Form.Group as={Row} className="align-items-center">
                                                        <Col as={Form.Label} lg={5} xl={3} className="control-label text-lg-right mb-lg-0">
                                                            Dimensions (cm)
                                                            <PtToolTip placement="top" trigger="hover" tooltip="LxWxH decimal form" />
                                                        </Col>
                                                        <Col lg={7} xl={6}>
                                                            <Row>
                                                                <Col xl={4} className="mb-3 mb-xl-0">
                                                                    <Form.Control
                                                                        type="number"
                                                                        className="form-control-modern"
                                                                        placeholder="Length"
                                                                        value={product.length ? product.length : ''}
                                                                        onChange={e => productChange('length', parseInt(e.target.value))}
                                                                    />
                                                                </Col>
                                                                <Col xl={4} className="mb-3 mb-xl-0">
                                                                    <Form.Control
                                                                        type="number"
                                                                        className="form-control-modern"
                                                                        placeholder="Width"
                                                                        value={product.width ? product.width : ''}
                                                                        onChange={e => productChange('width', parseInt(e.target.value))}
                                                                    />
                                                                </Col>
                                                                <Col xl={4} className="mb-3 mb-xl-0">
                                                                    <Form.Control
                                                                        type="number"
                                                                        className="form-control-modern"
                                                                        placeholder="Height"
                                                                        value={product.height ? product.height : ''}
                                                                        onChange={e => productChange('height', parseInt(e.target.value))}
                                                                    />
                                                                </Col>
                                                            </Row>
                                                        </Col>
                                                    </Form.Group>
                                                </TabPanel>
                                                : ''
                                            }

                                            <TabPanel className="tab-pane fade">
                                                <Form.Group as={Row} className="align-items-center">
                                                    <Col as={Form.Label} lg={5} xl={3} className="control-label text-lg-right mb-lg-0">
                                                        Upsells
                                                        <PtToolTip placement="top" trigger="hover" tooltip="Upsells are products which you recommend instead of the currently viewed product, for example, products that are more profitable or better quality or more expensive." />
                                                    </Col>
                                                    <Col lg={7} xl={6}>
                                                        <SelectAsync
                                                            isMulti={true}
                                                            loadOptions={searchProducts}
                                                        />
                                                    </Col>
                                                </Form.Group>
                                                <Form.Group as={Row} className="align-items-center">
                                                    <Col as={Form.Label} lg={5} xl={3} className="control-label text-lg-right mb-lg-0">
                                                        Cross-sells
                                                        <PtToolTip placement="top" trigger="hover" tooltip="Cross-sells are products which you promote in the cart, based on the current product." />
                                                    </Col>
                                                    <Col lg={7} xl={6}>
                                                        <SelectAsync
                                                            isMulti={true}
                                                            loadOptions={searchProducts}
                                                        />
                                                    </Col>
                                                </Form.Group>
                                            </TabPanel>

                                            <TabPanel className="tab-pane fade">
                                                <div className="ecommerce-attribues-wrapper">
                                                    {
                                                        productAttrs.length ?
                                                            <>
                                                                <Form.Group as={Row} className="ecommerce-attribute-add justify-content-center mb-0 pb-3 border-bottom">
                                                                    <Col xl={9}>
                                                                        <Form.Control
                                                                            as="select"
                                                                            className="form-control-modern float-left w-auto mr-3"
                                                                            value={selectedAttr}
                                                                            onChange={e => setSelectedAttr(e.target.value)}
                                                                        >
                                                                            {
                                                                                productAttrs.map((attr, index) => (
                                                                                    <option value={attr.slug} key={`attr-${index}`}>{attr.name}</option>
                                                                                ))
                                                                            }
                                                                        </Form.Control>
                                                                        <Button
                                                                            href="#addAttr"
                                                                            className="ecommerce-attribute-add-new font-weight-semibold float-left"
                                                                            variant="primary"
                                                                            disabled={selectedAttr === ''}
                                                                            onClick={addAttr}
                                                                        >+ New</Button>
                                                                    </Col>
                                                                </Form.Group>
                                                                {attrs.map((attr, index) => (
                                                                    <Form.Group as={Row} className="justify-content-center ecommerce-attribute-row" key={`product-attr-${index}`}>
                                                                        <Col xl={3} className="mb-3 mb-xl-0">
                                                                            <Form.Label className="control-label">Name</Form.Label>
                                                                            <Form.Control as="label" className="form-control-modern mb-2">{attr.name}</Form.Control>
                                                                            <Form.Check
                                                                                custom
                                                                                className="for-variations"
                                                                                id={`show_product_${index}`}
                                                                                label="Show on product page."
                                                                                checked={attr.showOnProductPage}
                                                                                onChange={e => changeAttr(index, "showOnProductPage", e.target.checked)}
                                                                            />
                                                                            {type === 'variable' ?
                                                                                <Form.Check
                                                                                    custom
                                                                                    className="for-variations"
                                                                                    id={`use_variation_${index}`}
                                                                                    label="Used for variations."
                                                                                    checked={attr.usedForVariation}
                                                                                    onChange={e => changeAttr(index, "usedForVariation", e.target.checked)}
                                                                                />
                                                                                : ''
                                                                            }
                                                                        </Col>
                                                                        <Col xl={6}>
                                                                            <a href="#removeAttr" className="ecommerce-attribute-remove text-color-danger float-right" onClick={e => removeAttr(e, attr.slug)}>Remove</a>
                                                                            <Form.Label className="control-label">Value(s)</Form.Label>
                                                                            <Select
                                                                                value={attr.selectedTerms}
                                                                                isMulti={true}
                                                                                onChange={options => changeAttr(index, "selectedTerms", options)}
                                                                                options={attr.terms.map(term => { return { value: term.slug, label: attr.slug === 'color' ? term.slug : term.name } })}
                                                                            />
                                                                        </Col>
                                                                    </Form.Group>
                                                                ))
                                                                }
                                                            </>
                                                            :
                                                            <Card.Body className="p-3 border">
                                                                <div className="widget-summary widget-summary-sm">
                                                                    <div className="widget-summary-col widget-summary-col-icon">
                                                                        <div className="summary-icon bg-primary">
                                                                            <i className="fas fa-life-ring"></i>
                                                                        </div>
                                                                    </div>
                                                                    <div className="widget-summary-col">
                                                                        <div className="summary">
                                                                            <h4 className="title">Before you can add a attribute you need to create attributeds on Products/Attribute Page.</h4>
                                                                        </div>
                                                                        <div className="summary-footer">
                                                                            <a href="#docs" target="_blank">(Learn More)</a>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </Card.Body>
                                                    }
                                                </div>
                                            </TabPanel>

                                            {type === 'variable' ?
                                                <TabPanel className="tab-pane fade">
                                                    <div className="ecommerce-variations-wrapper">
                                                        {
                                                            attrsForVariation.length ?
                                                                <>
                                                                    <Form.Group>
                                                                        <div className="d-flex float-left align-items-center">
                                                                            <Form.Label className="control-label mb-0 text-nowrap mr-2">Default Form Values</Form.Label>
                                                                            {attrsForVariation.map((attr, index) => (
                                                                                <Form.Control
                                                                                    as="select"
                                                                                    className="form-control-modern mr-2"
                                                                                    key={`variation-attr-${index}`}
                                                                                    value={variation[index]}
                                                                                    onChange={e => variationChange(e, index)}
                                                                                >
                                                                                    <option value=''>Any {attr.name}</option>
                                                                                    {
                                                                                        attr.terms.map(term => (
                                                                                            <option key={`${attr.slug}-term-${term.id}`} value={term.id}>{attr.slug === 'color' ? term.slug : term.name}</option>
                                                                                        ))
                                                                                    }
                                                                                </Form.Control>
                                                                            ))}
                                                                        </div>
                                                                        <div className="float-right text-right">
                                                                            <Button
                                                                                href="#addVariation"
                                                                                className="ecommerce-variations-add font-weight-semibold"
                                                                                variant="primary"
                                                                                onClick={addVariant}
                                                                            >+ Add variation</Button>
                                                                        </div>
                                                                    </Form.Group>
                                                                    {variants.map((variant, index) => (
                                                                        <div className="ecommerce-variations-group" key={`variant-${index}`}>
                                                                            <SlideToggle collapsed={true}>
                                                                                {({ onToggle, setCollapsibleElement, toggleState }) => (
                                                                                    <div className="ecommerce-variation">
                                                                                        <div className="ecommerce-variation-header d-flex justify-content-between">
                                                                                            <Form.Group className="d-flex mb-0">
                                                                                                {attrsForVariation.map((attr, attrIndex) => (
                                                                                                    <Form.Control
                                                                                                        as="select"
                                                                                                        className="form-control-modern mx-2 w-auto"
                                                                                                        key={`variant-${index}-attr-${attr.slug}`}
                                                                                                        value={variant.excerpt[attrIndex].termId}
                                                                                                        onChange={e => variantTermChange(e, index, attrIndex)}
                                                                                                    >
                                                                                                        <option value=''>Any {attr.name}</option>
                                                                                                        {
                                                                                                            attr.terms.map(term => (
                                                                                                                <option key={`${attr.slug}-term-${term.id}`} value={term.id}>{attr.slug === 'color' ? term.slug : term.name}</option>
                                                                                                            ))
                                                                                                        }
                                                                                                    </Form.Control>
                                                                                                ))}
                                                                                            </Form.Group>
                                                                                            <div className="ecommerce-variation-header-action d-flex align-items-center">
                                                                                                <a href="#toggle" className="ecommerce-variation-slide-toggle mr-2" onClick={e => { e.preventDefault(); onToggle(); }}>{toggleState === 'COLLAPSED' ? 'Expand' : 'Collapse'}</a>
                                                                                                <a href="#remove" className="ecommerce-variation-remove text-color-danger" onClick={e => removeVariant(e, index)}>Remove</a>
                                                                                            </div>
                                                                                        </div>
                                                                                        <div className="overflow-hidden" ref={setCollapsibleElement}>
                                                                                            <div className="ecommerce-variation-content d-block">
                                                                                                <Form.Group as={Row}>
                                                                                                    <Col className="col-6">
                                                                                                        <div className="variation-img">
                                                                                                            <Button
                                                                                                                href="#variationimage"
                                                                                                                variant="outline-primary"
                                                                                                                onClick={e => openModal(e, { type: 'variant', id: [index] })}
                                                                                                            >
                                                                                                                {variant.media.length ?
                                                                                                                    <PtLazyLoad
                                                                                                                        src={variant.media[0].virtual ? variant.media[0].copy_link : `${process.env.PUBLIC_URL}/mock-server/images/${variant.media[0].copy_link}`}
                                                                                                                        alt={variant.media[0].alt_text ? variant.media[0].alt_text : 'product'}
                                                                                                                        width="100"
                                                                                                                        height="100"
                                                                                                                    />
                                                                                                                    : <img
                                                                                                                        src={`${process.env.PUBLIC_URL}/assets/images/porto-placeholder-66x66.png`}
                                                                                                                        alt="category"
                                                                                                                        width="100"
                                                                                                                        height="100"
                                                                                                                    />
                                                                                                                }
                                                                                                            </Button>
                                                                                                        </div>
                                                                                                    </Col>
                                                                                                    <Col className="col-6">
                                                                                                        <Form.Label className="control-label">SKU</Form.Label>
                                                                                                        <Form.Control type="text" className="form-control-modern" />
                                                                                                    </Col>
                                                                                                </Form.Group>
                                                                                                <Form.Group>
                                                                                                    <Form.Check
                                                                                                        custom
                                                                                                        inline
                                                                                                        className="checkbox-default mr-3 align-items-center"
                                                                                                        id={`virtual-check-${index}`}
                                                                                                        checked={variant.virtual}
                                                                                                        onChange={e => variantItemChange(index, 'virtual', e.target.checked)}
                                                                                                        label="Virtual"
                                                                                                    />
                                                                                                    <Form.Check
                                                                                                        custom
                                                                                                        inline
                                                                                                        className="checkbox-default mr-3 align-items-center"
                                                                                                        id={`download-check-${index}`}
                                                                                                        checked={variant.downloadable}
                                                                                                        onChange={e => variantItemChange(index, 'downloadable', e.target.checked)}
                                                                                                        label="Downloadable"
                                                                                                    />
                                                                                                    <Form.Check
                                                                                                        custom
                                                                                                        inline
                                                                                                        className="checkbox-default align-items-center"
                                                                                                        id={`stock-check-${index}`}
                                                                                                        checked={variant.manageStock}
                                                                                                        onChange={e => variantItemChange(index, 'manageStock', e.target.checked)}
                                                                                                        label="Manage stock?"
                                                                                                    />
                                                                                                </Form.Group>
                                                                                                <Form.Group>
                                                                                                    <Row>
                                                                                                        <Col className="col-6">
                                                                                                            <Form.Label className="control-label">Regular Price ($)</Form.Label>
                                                                                                            <Form.Control
                                                                                                                type="text"
                                                                                                                className="form-control-modern"
                                                                                                                required
                                                                                                                value={variant.price ? variant.price : ''}
                                                                                                                onChange={e => variantItemChange(index, 'price', e.target.value)}
                                                                                                            />
                                                                                                        </Col>
                                                                                                        <Col className="col-6">
                                                                                                            <Form.Label className="control-label">Sale Price ($)</Form.Label>
                                                                                                            <div className="d-flex">
                                                                                                                <Form.Control
                                                                                                                    type="text"
                                                                                                                    className="form-control-modern"
                                                                                                                    value={variant.sale_price ? variant.sale_price : ''}
                                                                                                                    onChange={e => variantItemChange(index, 'sale_price', e.target.value)}
                                                                                                                />
                                                                                                                <Button
                                                                                                                    href="#toggleSchedule"
                                                                                                                    className="toggle-schedule"
                                                                                                                    variant="link"
                                                                                                                    onClick={e => { e.preventDefault(); variantItemChange(index, 'sale_schedule', !variant.saleSchedule) }}
                                                                                                                >Schedule</Button>
                                                                                                            </div>
                                                                                                        </Col>
                                                                                                    </Row>
                                                                                                </Form.Group>
                                                                                                {variant.sale_schedule ?
                                                                                                    <Row className="mt-3">
                                                                                                        <Col className="col-6">
                                                                                                            <InputGroup>
                                                                                                                <InputGroup.Append><InputGroup.Text>From</InputGroup.Text></InputGroup.Append>
                                                                                                                <Form.Control
                                                                                                                    as="div"
                                                                                                                    className="py-0"
                                                                                                                >
                                                                                                                    <DatePicker
                                                                                                                        selected={variant.saleStart}
                                                                                                                        onChange={date => variantItemChange(index, 'saleStart', date)}
                                                                                                                        maxDate={variant.saleEnd}
                                                                                                                    />
                                                                                                                </Form.Control>
                                                                                                            </InputGroup>
                                                                                                        </Col>
                                                                                                        <Col className="col-6">
                                                                                                            <InputGroup>
                                                                                                                <InputGroup.Prepend><InputGroup.Text>To</InputGroup.Text></InputGroup.Prepend>
                                                                                                                <Form.Control
                                                                                                                    as="div"
                                                                                                                    className="py-0"
                                                                                                                >
                                                                                                                    <DatePicker
                                                                                                                        selected={variant.saleEnd}
                                                                                                                        onChange={date => variantItemChange(index, 'saleEnd', date)}
                                                                                                                        minDate={variant.saleStart}
                                                                                                                    />
                                                                                                                </Form.Control>
                                                                                                            </InputGroup>
                                                                                                        </Col>
                                                                                                    </Row>
                                                                                                    : ''
                                                                                                }
                                                                                                {variant.manageStock ?
                                                                                                    <Row className="mt-3">
                                                                                                        <Col className="col-6">
                                                                                                            <Form.Label className="control-label">Stock Quantity</Form.Label>
                                                                                                            <Form.Control
                                                                                                                type="number"
                                                                                                                min="0"
                                                                                                                className="form-control-modern"
                                                                                                                value={variant.stock_quantity ? variant.stock_quantity : ''}
                                                                                                                onChange={e => variantItemChange(index, 'stock_quantity', parseInt(e.target.value))}
                                                                                                            />
                                                                                                        </Col>
                                                                                                        <Col className="col-6">
                                                                                                            <Form.Label className="control-label">Allow backorders</Form.Label>
                                                                                                            <Form.Control
                                                                                                                as="select"
                                                                                                                className="form-control-modern"
                                                                                                                value={variant.allow_backorder}
                                                                                                                onChange={e => variantItemChange(index, 'allow_backorder', e.target.value)}
                                                                                                            >
                                                                                                                <option value="no">Do not allow</option>
                                                                                                                <option value="yes">Allow</option>
                                                                                                            </Form.Control>
                                                                                                        </Col>
                                                                                                    </Row>
                                                                                                    : <Row className="mt-3">
                                                                                                        <Col>
                                                                                                            <Form.Label className="control-label">Stock Status</Form.Label>
                                                                                                            <Form.Control
                                                                                                                as="select"
                                                                                                                className="form-control-modern"
                                                                                                                value={variant.stock_status}
                                                                                                                onChange={e => variantItemChange(index, 'stock_status', e.target.value)}
                                                                                                            >
                                                                                                                <option value="in-stock">In Stock</option>
                                                                                                                <option value="out-of-stock">Out of Stock</option>
                                                                                                                <option value="on-backorder">On Backorder</option>
                                                                                                            </Form.Control>
                                                                                                        </Col>
                                                                                                    </Row>
                                                                                                }
                                                                                                {
                                                                                                    variant.virtual ? ''
                                                                                                        : <Row className="mt-3">
                                                                                                            <Col className="col-6 mb-3">
                                                                                                                <Form.Label className="control-label">Weight (kg)</Form.Label>
                                                                                                                <Form.Control
                                                                                                                    type="number"
                                                                                                                    className="form-control-modern"
                                                                                                                    value={variant.weight ? variant.weight : ''}
                                                                                                                    onChange={e => variantItemChange(index, 'weight', parseInt(e.target.value))}
                                                                                                                />
                                                                                                            </Col>
                                                                                                            <Col className="col-6 mb-3">
                                                                                                                <Form.Label className="control-label">Dimensions (cm)</Form.Label>
                                                                                                                <Row>
                                                                                                                    <Col className="col-4">
                                                                                                                        <Form.Control
                                                                                                                            type="number"
                                                                                                                            className="form-control-modern"
                                                                                                                            placeholder="Length"
                                                                                                                            value={variant.length ? variant.length : ''}
                                                                                                                            onChange={e => variantItemChange(index, 'length', parseInt(e.target.value))}
                                                                                                                        />
                                                                                                                    </Col>
                                                                                                                    <Col className="col-4">
                                                                                                                        <Form.Control
                                                                                                                            type="number"
                                                                                                                            className="form-control-modern"
                                                                                                                            placeholder="Width"
                                                                                                                            value={variant.width ? variant.width : ''}
                                                                                                                            onChange={e => variantItemChange(index, 'width', parseInt(e.target.value))}
                                                                                                                        />
                                                                                                                    </Col>
                                                                                                                    <Col className="col-4">
                                                                                                                        <Form.Control
                                                                                                                            type="number"
                                                                                                                            className="form-control-modern"
                                                                                                                            placeholder="Height"
                                                                                                                            value={variant.height ? variant.height : ''}
                                                                                                                            onChange={e => variantItemChange(index, 'height', parseInt(e.target.value))}
                                                                                                                        />
                                                                                                                    </Col>
                                                                                                                </Row>
                                                                                                            </Col>
                                                                                                        </Row>
                                                                                                }
                                                                                                <Row className="mt-3">
                                                                                                    <Col className="col-12">
                                                                                                        <Form.Label className="control-label">Tax Class</Form.Label>
                                                                                                        <Form.Control
                                                                                                            as="select"
                                                                                                            className="form-control-modern"
                                                                                                            value={variant.tax_type_id}
                                                                                                            onChange={e => variantItemChange(index, 'tax_type_id', parseInt(e.target.value))}
                                                                                                        >
                                                                                                            <option value="">Same as parent</option>
                                                                                                            {
                                                                                                                taxTypes.map((tax, taxIndex) => (
                                                                                                                    <option value={tax.slug} key={`variant-${index}tax-type-${taxIndex}`}>{tax.name}</option>
                                                                                                                ))
                                                                                                            }
                                                                                                        </Form.Control>
                                                                                                    </Col>
                                                                                                </Row>
                                                                                                <Row className="mt-3">
                                                                                                    <Col className="col-12">
                                                                                                        <Form.Label className="control-label">Description</Form.Label>
                                                                                                        <Form.Control
                                                                                                            s="textarea"
                                                                                                            className="form-control-modern" rows="2"
                                                                                                            value={variant.description ? variant.description : ''}
                                                                                                            onChange={e => variantItemChange(index, 'description', e.target.value)}
                                                                                                        />
                                                                                                    </Col>
                                                                                                </Row>
                                                                                                {variant.downloadable ?
                                                                                                    <Row className="mt-3">
                                                                                                        <Col className="col-12">
                                                                                                            <Form.Label className="control-label">Downloadable files</Form.Label>
                                                                                                            <Table responsive={true} className="table-downloadable" style={{ minWidth: "600px" }}>
                                                                                                                <thead>
                                                                                                                    <tr>
                                                                                                                        <th>Name</th>
                                                                                                                        <th>File URL</th>
                                                                                                                    </tr>
                                                                                                                </thead>
                                                                                                                <tbody>
                                                                                                                    {
                                                                                                                        variant.files.map((file, fileId) => (
                                                                                                                            <tr key={`variant-${index}-file-${fileId}`}>
                                                                                                                                <td>
                                                                                                                                    <Form.Control
                                                                                                                                        type="text"
                                                                                                                                        className="form-control-modern"
                                                                                                                                        value={file.name}
                                                                                                                                        onChange={e => variantFileChange(index, fileId, 'name', e.target.value)}
                                                                                                                                    />
                                                                                                                                </td>
                                                                                                                                <td>
                                                                                                                                    <InputGroup>
                                                                                                                                        <Form.Control
                                                                                                                                            type="text"
                                                                                                                                            className="form-control-modern"
                                                                                                                                            value={file.url}
                                                                                                                                            placeholder="file path"
                                                                                                                                            onChange={e => variantFileChange(index, fileId, 'url', e.target.value)}
                                                                                                                                        />
                                                                                                                                        <InputGroup.Append>
                                                                                                                                            <Button
                                                                                                                                                type="button"
                                                                                                                                                variant="primary"
                                                                                                                                                onClick={e => openModal(e, { type: 'variant', id: [index, fileId] })}
                                                                                                                                            >Choose File</Button>
                                                                                                                                            <Button
                                                                                                                                                type="button"
                                                                                                                                                className="btn-remove"
                                                                                                                                                variant="danger"
                                                                                                                                                onClick={() => removeVariantFile(index, fileId)}
                                                                                                                                            ><i className="bx bx-trash text-r mt-1"></i></Button>
                                                                                                                                        </InputGroup.Append>
                                                                                                                                    </InputGroup>
                                                                                                                                </td>
                                                                                                                            </tr>
                                                                                                                        ))
                                                                                                                    }
                                                                                                                </tbody>
                                                                                                                <tfoot>
                                                                                                                    <tr>
                                                                                                                        <th colSpan="2">
                                                                                                                            <Button
                                                                                                                                href="#addFile"
                                                                                                                                variant="primary"
                                                                                                                                onClick={e => addVariantFile(e, index)}
                                                                                                                            >Add file</Button>
                                                                                                                        </th>
                                                                                                                    </tr>
                                                                                                                </tfoot>
                                                                                                            </Table>
                                                                                                        </Col>
                                                                                                    </Row>
                                                                                                    : ''
                                                                                                }
                                                                                            </div>
                                                                                        </div>

                                                                                    </div>
                                                                                )}
                                                                            </SlideToggle>
                                                                        </div>
                                                                    ))}
                                                                </>
                                                                : <Card.Body className="p-3 border">
                                                                    <div className="widget-summary widget-summary-sm">
                                                                        <div className="widget-summary-col widget-summary-col-icon">
                                                                            <div className="summary-icon bg-primary"><i className="fas fa-life-ring"></i></div>
                                                                        </div>
                                                                        <div className="widget-summary-col">
                                                                            <div className="summary">
                                                                                <h4 className="title">Before you can add a variation you need to add some variation attributes on the Attributes tab.</h4>
                                                                            </div>
                                                                            <div className="summary-footer">
                                                                                <a className="text-muted text-uppercase primary-color" href="#docs" target="_blank">(Learn More)</a>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </Card.Body>
                                                        }
                                                    </div>
                                                </TabPanel>
                                                : ''
                                            }

                                            <TabPanel className="tab-pane fade">
                                                <Form.Group as={Row}>
                                                    <Col as={Form.Label} lg={5} xl={3} className="control-label text-lg-right pt-2 mt-1 mb-0">
                                                        Purchase Note
                                                        <PtToolTip placement="top" trigger="hover" tooltip="Enter an optional note to send the customer after purchase." />
                                                    </Col>
                                                    <Col lg={7} xl={6}>
                                                        <Form.Control
                                                            as="textarea"
                                                            className="form-control-modern"
                                                            rows="6"
                                                            value={product.purchase_note ? product.purchase_note : ''}
                                                            onChange={e => productChange('purchase_note', e.target.value)}
                                                        />
                                                    </Col>
                                                </Form.Group>
                                            </TabPanel>
                                        </Col> */}
                    {/* </Tabs>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row> */}

                    <Row className="action-buttons">
                        <Col md="auto" className="col-12">
                            <Button
                                type="submit"
                                className="btn-px-4 py-3 d-flex align-items-center font-weight-semibold line-height-1"
                                variant="primary"
                            ><i className="bx bx-save text-4 mr-2"></i>Save Product</Button>
                        </Col>

                        <Col md="auto" className="col-12">
                            <Button
                                //type="submit"
                                onClick={handleOnPublishProduct}
                                className="btn-px-4 py-3 d-flex align-items-center font-weight-semibold line-height-1"
                                variant="secondary"
                            ><i className="bx bx-save text-4 mr-2"></i>{product.is_published ? "unPublish Product" : "Publish Product"}  </Button>
                        </Col>

                        <Col md="auto" className="col-12">
                            <Button
                                as={Link}
                                to={`${process.env.PUBLIC_URL}/products`}
                                className="btn-px-4 py-3 border font-weight-semibold text-color-dark line-height-1 d-flex h-100 align-items-center"
                                variant="light"
                            >Back</Button>
                        </Col>
                    </Row>
                </Form>
            }

            <MediaGalleryModal chooseOne={onlyOneImage} handleSelectedFiles={handleSelectedFiles} isOpen={modalOpen ? true : false} onClose={chooseMedia} />

        </>
    )
}