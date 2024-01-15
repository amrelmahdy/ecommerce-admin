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
import PtTagsInput from '../../features/elements/tags-input';
import Breadcrumb from '../../common/breadcrumb';
import MediaGalleryModal from '../../features/modals/media-gallery-modal';
import PNotify from '../../features/elements/p-notify';
import PtLazyLoad from '../../features/lazyload';
import PtToolTip from '../../features/elements/tooltip';
import { getCategories } from '../../../api/categories';
import { getVendors } from '../../../api/vendors';

import { addProduct } from '../../../api/products';
import { isValidProductPayload } from '../../../api/data.factory';
import { uploadDynamicImages } from '../../../api';

export default function ProductAdd({ history }) {
    const [error, setError] = useState([]);
    const enTagsInputRef = useRef(null);
    const arTagsInputRef = useRef(null);
    const [validated, setValidated] = useState(false);
    const [loading, setLoading] = useState(false);

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
    const [requireShipping, setRequireShipping] = useState(true);
    const [isTaxable, setIsTaxable] = useState(true);
    const [isOnSale, setIsOnSale] = useState(false);
    const [isFeatured, setIsFeatured] = useState(false);
    const [productCats, setProductCats] = useState([]);
    const [productImages, setProductImages] = useState([]);
    const [arTags, setArTags] = useState([]);
    const [enTags, setEnTags] = useState([]);
    const [vendor, setVendor] = useState(null);

    const [images, setImages] = useState([]);



    const [categories, setCategories] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [onlyOneImage, SetOnlyOneImage] = useState(false);






    useEffect(() => {
        fetchCategories()
        fetchVendors()
    }, [])

    const fetchCategories = async () => {
        try {
            const categories = await getCategories();
            setCategories(getTreeData(categories));
        } catch (error) {
            console.log("error fetching categories", error)
        }
    }

    const fetchVendors = async () => {
        try {
            const vendors = await getVendors();
            setVendors(vendors)
        } catch (error) {
            console.log("error fetching categories", error)
        }
    }

    function getTreeData(data) {
        let result = [];
        result = data.reduce((acc, cur) => {
            let newNode = {
                key: cur.id,
                title: cur.ar_name,
                children: []
            };
            acc.push(newNode);
            return acc;
        }, []);
        return result;
    }

    async function handleAddProduct(e) {
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
            images: []
        }
        const isValidPayload = isValidProductPayload(newProduct);
        if (isValidPayload) {
            setLoading(true);
            try {
                if (productImages.length > 0) {
                    const images = await uploadDynamicImages(productImages, `products/${newProduct.slug}`);
                    if (images && images.length > 0) newProduct.images = images
                }

                const productCreated = await addProduct(newProduct);
                setLoading(false);
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
                console.log("error.response", error.response)
                setLoading(false);
                window.scrollTo(0, 0)
                if(Array.isArray(error.response.data.message)){
                    setError(error.response.data.message)
                } else {
                    setError([error.response.data.message])
                }
                // if(typeof )
                // if (error.response.status === 400) {

                //     //setError(error.response.data.message)
                // } else if (error.response.status === 409) {
                //     console.log("error.response", error.response.data)
                //     //setError([error.response.data.message])

                // }
            }
        } else {
            setError(['Please fill in the required fields with the red *'])
        }
    }

    function openModal(e, info) {
        e.preventDefault();
        SetOnlyOneImage(info.type !== 'gallery');
        setModalOpen(info);
    }

    function chooseMedia(selectedMedia) {
        setImages(selectedMedia)
        setModalOpen(false);
    }


    const handleSelectedFiles = (files) => {
        setProductImages(files)
    }


    function addArTags(tags) {
        setArTags(tags)
    }

    function addEnTags(tags) {
        setEnTags(tags)
    }

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


                                                        <Form.Group>
                                                            <Form.Label className="control-label text-lg-right pt-2 mt-1 mb-2">Arabic Tags</Form.Label>
                                                            <PtTagsInput ref={arTagsInputRef} onChange={addArTags} />

                                                        </Form.Group>

                                                        <Form.Group>
                                                            <Form.Label className="control-label text-lg-right pt-2 mt-1 mb-2">English Tags</Form.Label>
                                                            <PtTagsInput ref={enTagsInputRef} onChange={addEnTags} />
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