import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';

import Breadcrumb from '../../common/breadcrumb';
import DeleteConfirmModal from '../../features/modals/delete-confirm-modal';
import Loader from '../../features/loader';
import PNotify from '../../features/elements/p-notify';
import PtFileUpload from '../../features/elements/file-upload';
import { getCategory, getCategories, updateCategory, uploadCategoryImage, deleteCategory } from '../../../api/categories';
import { uploadDynamicImages } from '../../../api';

export default function CategoriesEdit({ history, ...props }) {
    const [error, setError] = useState([]);

    const [cat, setCat] = useState(null);
    const [categories, setCategories] = useState([]);
    const [parent, setParent] = useState(0);
    const [loading, setLoading] = useState(true);
    const [tree, setTree] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [modalGallery, setModalGallery] = useState(false);
    const [imageFile, setImageFile] = useState(null);

    const handleOnFileChange = file => {
        setImageFile(file);
    }

    const imageUploadFileRef = React.createRef();


    useEffect(() => {
        setLoading(true);
        getCategory(props.match.params.id).then(result => {
            if (!result) {
                return props.history.push(`${process.env.PUBLIC_URL}/pages/404`);
            }
            getCategories().then(categories => {
                setCategories(categories);
            });

            setCat(result);
            setLoading(false);
        });


    }, [props.match.params.id])

    const saveCategory = async (e) => {
        e.preventDefault();

        try {
            if (imageFile) {
                const images = await uploadDynamicImages([imageFile], `categories/${cat.slug}`);
                const imagePath = images[0];
                cat.image = imagePath.url;
            }
            const updated = await updateCategory(props.match.params.id, cat);
            if (updated) {
                history.push("/products/categories")
                toast(
                    <PNotify title="Success" icon="fas fa-check" text="Category saved successfully." />,
                    {
                        containerId: "default",
                        className: "notification-success"
                    }
                );
            } else {
                toast(
                    <PNotify title="Whhoos" icon="fas fa-check" text="Something went wrong." />,
                    {
                        containerId: "default",
                        className: "notification-danger"
                    }
                );
            }
        } catch (error) {
            window.scrollTo(0, 0)
            if (Array.isArray(error.response.data.message)) {
                setError(error.response.data.message)
            } else {
                setError([error.response.data.message])
            }
        }


    }

    const handleDeleteCategory = (e) => {
        e.preventDefault();
        setOpenModal(true);
    }






    const deleteConfirm = async (result) => {
        setOpenModal(false);
        try {
            const deleted = await deleteCategory(props.match.params.id);
            if (deleted) {
                history.push("/products/categories")
            } else {

            }
        } catch (err) {
            toast(
                <PNotify title='Whoops' icon="fas fa-exclamation-circle" text="Something went wrong." />,
                {
                    containerId: "default",
                    className: "notification-danger"
                }
            );
        }

        //result && props.history.push(`${process.env.PUBLIC_URL}/${cat.type}s/categories`);
    }

    function selectImage(e) {
        e.preventDefault();
        setModalGallery(true);
    }

    function closeModal(selectedMedia) {
        setModalGallery(false);
        if (selectedMedia.length) {
            setCat({
                ...cat,
                media: selectedMedia[0]
            });
        }
    }

    return (
        <>
            {
                loading ? <Loader />
                    :
                    <>
                        <Breadcrumb current="Edit Category" paths={[{
                            name: 'Home',
                            url: '/'
                        }, {
                            name: cat.type + 's',
                            url: `/${cat.type}s`
                        }, {
                            name: 'Categoriess',
                            url: `/${cat.type}s/categories`
                        }]} />

                        <Form className="ecommerce-form" action="#" method="post" onSubmit={saveCategory}>
                            <Row>
                                <Col>
                                    <Card className="card-modern card-big-info">
                                        <Card.Body>
                                            <Row>
                                                <Col lg="2-5" xl="1-5">
                                                    <i className="card-big-info-icon bx bx-slider"></i>
                                                    <h2 className="card-big-info-title">Category Details</h2>
                                                    <p className="card-big-info-desc">Add here the category description with all details and necessary information.</p>
                                                </Col>
                                                <Col lg="3-5" xl="4-5">
                                                    {
                                                        error.map(err => <Alert key="danger" variant="danger">
                                                            {err}
                                                        </Alert>)
                                                    }
                                                    <Form.Group as={Row} className="align-items-center">
                                                        <Col as={Form.Label} lg={5} xl={3} className="control-label text-lg-right mb-lg-0">Arabic Name</Col>
                                                        <Col lg={7} xl={6}>
                                                            <Form.Control
                                                                type="text"
                                                                className="form-control-modern"
                                                                maxLength="50"
                                                                name="ar_name"
                                                                value={cat.ar_name}
                                                                onChange={e => setCat({ ...cat, ar_name: e.target.value })}
                                                                required
                                                            />
                                                        </Col>
                                                    </Form.Group>

                                                    <Form.Group as={Row} className="align-items-center">
                                                        <Col as={Form.Label} lg={5} xl={3} className="control-label text-lg-right mb-lg-0">English Name</Col>
                                                        <Col lg={7} xl={6}>
                                                            <Form.Control
                                                                type="text"
                                                                className="form-control-modern"
                                                                maxLength="50"
                                                                name="en_name"
                                                                value={cat.en_name}
                                                                onChange={e => setCat({ ...cat, en_name: e.target.value })}
                                                                required
                                                            />
                                                        </Col>
                                                    </Form.Group>

                                                    <Form.Group as={Row} className="align-items-center">
                                                        <Col as={Form.Label} lg={5} xl={3} className="control-label text-lg-right mb-lg-0">Slug</Col>
                                                        <Col lg={7} xl={6}>
                                                            <Form.Control
                                                                type="text"
                                                                className="form-control-modern"
                                                                maxLength="50"
                                                                disabled
                                                                name="slug"
                                                                value={cat.slug}
                                                                onChange={e => setCat({ ...cat, slug: e.target.value })}
                                                            />
                                                        </Col>
                                                    </Form.Group>
                                                    <Form.Group as={Row} className="align-items-center">
                                                        <Col as={Form.Label} lg={5} xl={3} className="control-label text-lg-right mb-lg-0">Parent Category</Col>
                                                        <Col lg={7} xl={6}>
                                                            <Form.Control
                                                                as="select"
                                                                className="form-control-modern"
                                                                name="parent"
                                                                value={cat.parent}
                                                                onChange={e => setCat({ ...cat, parent: e.target.value })}
                                                            >
                                                                <option value="0">None</option>
                                                                {
                                                                    categories.map((item, index) => (
                                                                        <option key={'cat-' + index} value={item.id}>{item.ar_name}</option>
                                                                    ))
                                                                }
                                                            </Form.Control>
                                                        </Col>
                                                    </Form.Group>
                                                    {/* <Form.Group as={ Row }>
                                                        <Col as={ Form.Label } lg={ 5 } xl={ 3 } className="control-label text-lg-right mb-lg-0 pt-2 mt-1 mb-0">Description</Col>
                                                        <Col lg={ 7 } xl={ 6 }>
                                                            <Form.Control
                                                                as="textarea"
                                                                className="form-control-modern"
                                                                name="description"
                                                                rows="6"
                                                                maxLength="200"
                                                                value={ cat.description ? cat.description : '' }
                                                                onChange={ e => setCat( { ...cat, description: e.target.value } ) }
                                                            />
                                                        </Col>
                                                    </Form.Group> */}
                                                    <Form.Group as={Row} className="align-items-center">
                                                        <Col as={Form.Label} lg={5} xl={3} className="control-label text-lg-right mb-lg-0">Category Image</Col>
                                                        <PtFileUpload ref={imageUploadFileRef} handleOnFileChange={handleOnFileChange} />
                                                        <span className="help-block">&nbsp; Supported extentions are .(png - jpeg - jpg)</span>
                                                    </Form.Group>

                                                    <Form.Group as={Row} className="align-items-center">
                                                        <Col as={Form.Label} lg={5} xl={3} className="control-label text-lg-right mb-lg-0">Category Image</Col>
                                                        <Col lg={7} xl={6}>
                                                            {/* <Button
                                                                href="#mediaGallery"
                                                                className="ml-auto mr-3"
                                                                variant="primary"
                                                                onClick={selectImage}
                                                            >
                                                                Select Image
                                                            </Button> */}

                                                            <div className="category-image d-inline-block">
                                                                {/* {cat.image ?
                                                                    <img
                                                                        src={cat.media.virtual ? cat.media.copy_link : getCroppedImageUrl(`${process.env.PUBLIC_URL}/mock-server/images/${cat.media.copy_link}`, 150)}
                                                                        alt={cat.media.alt_text ? cat.media.alt_text : 'category'}
                                                                        width={60}
                                                                        height={60}
                                                                    />
                                                                    : <img
                                                                        src={`${process.env.PUBLIC_URL}/assets/images/porto-placeholder-66x66.png`}
                                                                        alt="category"
                                                                        width="60"
                                                                        height="60"
                                                                    />
                                                                } */}
                                                                <img
                                                                    src={`${process.env.REACT_APP_BASE_URL}/${cat.image}`}
                                                                    alt="category"
                                                                    width="60"
                                                                    height="60"
                                                                />
                                                            </div>
                                                        </Col>
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                            <Row className="action-buttons">
                                <Col md="auto" className="col-6">
                                    <Button
                                        type="submit"
                                        className="btn-px-4 py-3 d-flex align-items-center font-weight-semibold line-height-1"
                                        variant="primary"
                                    ><i className="bx bx-save text-4 mr-2"></i> Save Category</Button>
                                </Col>
                                <Col md="auto" className="col-6 px-md-0 mt-0">
                                    <Button
                                        as={Link}
                                        to={`/products/categories`}
                                        className="btn-px-4 py-3 border font-weight-semibold text-color-dark line-height-1 d-flex h-100 align-items-center"
                                        variant="light"
                                    >Back</Button>
                                </Col>
                                <Col md="auto" className="col-6 ml-md-auto mt-3 mt-md-0">
                                    <Button
                                        href="#delete"
                                        className="btn-px-4 py-3 d-flex align-items-center font-weight-semibold line-height-1"
                                        variant="danger"
                                        onClick={handleDeleteCategory}
                                    ><i className="bx bx-trash text-4 mr-2"></i> Delete Category</Button>
                                </Col>
                            </Row>
                        </Form>

                    </>
            }

            <DeleteConfirmModal isOpen={openModal} onClose={deleteConfirm} />
        </>
    )
}