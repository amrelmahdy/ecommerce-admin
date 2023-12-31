import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Card, Form, Button, InputGroup } from 'react-bootstrap';
import { toast } from 'react-toastify';

import Breadcrumb from '../../common/breadcrumb';
import PtTable from '../../features/elements/table';
import MediaGalleryModal from '../../features/modals/media-gallery-modal';
import PNotify from '../../features/elements/p-notify';
import PtLazyLoad from '../../features/lazyload';

import { getCategories, addCategory } from '../../../api/categories';
import { removeXSSAttacks, getCroppedImageUrl } from '../../../utils';

export default function CategoriesList(props) {
    const type = props.type;
    const [isFirst, setIsFirst] = useState(true);
    const [loading, setLoading] = useState(true);
    const [ajax, setAjax] = useState({
        data: [],
        total: 0
    });


    const [categories, setCategories] = useState({
        data: [],
        total: 0
    });

    const [tree, setTree] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [search, setSearch] = useState('');
    const [tableRef, setTableRef] = useState(null);
    const [selected, setSelected] = useState([]);
    const [bulk, setBulk] = useState('');
    const [enName, setEnName] = useState('');
    const [arName, setArName] = useState('');
    const [slug, setSlug] = useState('');
    const [parent, setParent] = useState(0);
    const [modalOpen, setModalOpen] = useState(false);

    // Columns
    const columns = [{
        id: 'en_name',
        Header: 'English Name',
        sortable: true,
        className: "d-block ws-nowrap",
        accessor: d => {
            {
                console.log("data", d)
                return { id: d.id, en_name: d.en_name, image: d.image, depth: d.depth }
            }
        },
        Cell: row => (
            <>
                {row.value.image &&
                    <img
                        className="border mr-1"
                        src={`${process.env.REACT_APP_BASE_URL}${row.value.image}`}
                        alt="category"
                        width="60"
                        height="60"
                    />
                }
                <Link to={`${process.env.PUBLIC_URL}/categories/${row.value.id}`}>
                    <strong dangerouslySetInnerHTML={removeXSSAttacks('&ndash;'.repeat(row.value.depth) + row.value.en_name)}></strong>
                </Link>
            </>
        )
    }, {
        Header: 'Arabic Name',
        accessor: 'ar_name',
        sortable: true
    },
    {
        Header: 'Parent',
        accessor: 'parent.en_name',
        sortable: true
    },
    {
        Header: 'Slug',
        accessor: 'slug',
        sortable: true
    },

    {
        Header: 'Actions',
        accessor: 'id',
        className: 'actions',
        headerClassName: "justify-content-center",
        width: 100,
        Cell: row => (
            <>
                <Link to={`${process.env.PUBLIC_URL}/categories/${row.value}`} className="on-default edit-row mr-2"><i className="fas fa-pencil-alt"></i></Link>
                <a href="#del" className="on-default remove-row" onClick={e => deleteRow(e, row.value)}><i className="far fa-trash-alt"></i></a>
            </>
        )
    }];

    useEffect(() => {
        setSelected(selected.map(item => {
            return {
                ...item,
                selected: selectAll
            }
        }));
    }, [selectAll])

    function isSelected(key) {
        return selected.find(item => item.id === key && item.selected);
    }

    function onSelectChange(e, value, row) {
        setSelected(selected.map(item => {
            if (item.id === row.id) {
                return {
                    ...item,
                    selected: !item.selected
                };
            }
            return item;
        }));
    }

    function deleteRow(e, index) {
        e.preventDefault();
        if (window.confirm("Are you sure you want to delete this data?")) {
            setAjax({
                ...ajax,
                data: ajax.data.filter(cat => cat.id !== index)
            });
            setTree(tree.filter(cat => cat.id !== index));
        }
    }

    function bulkAction(e) {
        e.preventDefault();
        if (!bulk) {
            return toast(
                <PNotify title="Warning" icon="fas fa-exclamation" text="Please choose one of actions." />,
                {
                    containerId: "default",
                    className: "notification-warning"
                }
            );
        }
        if (bulk === 'delete') {
            if (!selected.find(item => item.selected)) {
                return toast(
                    <PNotify title="Warning" icon="fas fa-exclamation" text="Choose at least one item." />,
                    {
                        containerId: "default",
                        className: "notification-warning"
                    }
                );
            }
            setAjax({
                ...ajax,
                data: ajax.data.filter(media => selected.find(item => item.id === media.id && !item.selected))
            });
        }
    }

    function searchCategories(e) {
        e.preventDefault();
        tableRef.current.wrappedInstance.filterColumn({ id: 'en_name' }, search);
    }

    async function fetchData(state) {
        console.log(state)
        handleGetCategories(state.page * state.pageSize, (state.page + 1) * state.pageSize, state.filtered, state.sorted, state)
    }


    const handleGetCategories = (from = 0, to, filters = [], sortBy = [], state = undefined) => {
        setLoading(true);
        getCategories(from, to, filters, sortBy)
            .then(results => {

                const pageSize = state ? state.pageSize : 12


                console.log("(results.total / pageSize ) + !(!(results.total % pageSize))",)

                setLoading(false);
                setCategories({
                    data: results.data,
                    total: parseInt(results.total / pageSize) + !(!(results.total % pageSize))
                });
                setSelectAll(false);
            });
    }


    async function handleAddCategory(e) {
        e.preventDefault();
        const newCat = {
            ar_name: enName,
            en_name: arName,
            slug
        }

        if (parent != 0) newCat.parent = parent


        try {
            const created = await addCategory(newCat);

            if (created) {
                handleGetCategories(0, 12, [], [])

                toast(
                    <PNotify title="Success" icon="fas fa-check" text="Category added successfully." />,
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
        } catch (err) {
            let title = "Whoops"
            let message = "Something went wrong please try again later"
            if (err.response.status == 409) {
                title = "Conflict"
                message = err.response.data.message
            }

            toast(
                <PNotify title={title} icon="fas fa-exclamation-circle" text={message} />,
                {
                    containerId: "default",
                    className: "notification-danger"
                }
            );
        }
    }

    // setArName("");
    // setEnName("");
    // setSlug("");
    // setParent(0);

    // let index = ajax.data.findIndex(cat => cat.id === parent);
    // let treeIndex = tree.findIndex(cat => cat.id === parent);
    // let newId = ajax.total + 1 + parseInt(Math.random() * 100);
    // let newCat = {
    //     id: newId,
    //     name: name,
    //     slug: slug,
    //     parent: parent,
    //     description: desc,
    //     media: media,
    //     count: 0,
    //     depth: index >= 0 ? ajax.data[index].depth + 1 : 0
    // };
    // let temp = [...ajax.data];
    // temp.splice(index + 1, 0, newCat);
    // tree.splice(treeIndex + 1, 0, newCat);
    // // setTree
    // setAjax({
    //     ...ajax,
    //     data: temp
    // });
    // setSelected([
    //     ...selected,
    //     {
    //         id: newId,
    //         selected: false
    //     }
    // ]);
    // setName('');
    // setSlug('');
    // setDesc('');
    // setMedia(null);
    // setTree([...tree]);
    // setParent(0);






    function selectImage(e) {
        e.preventDefault();
        setModalOpen(true);
    }

    function closeModal(selectedMedia) {
        setModalOpen(false);
        if (selectedMedia.length) {
            //setMedia(selectedMedia[0]);
        }
    }


    return (
        <>
            <Breadcrumb current={`${type === 'products' ? 'Product' : 'Post'} categories`} paths={[{
                name: 'Home',
                url: '/'
            }, {
                name: type,
                url: '/' + type
            }]} />

            <Row>
                <Col xl={4}>
                    <Form method="post" action="#" onSubmit={handleAddCategory}>
                        <Card className="card-modern">
                            <Card.Body>
                                <Form.Group className="align-items-center">
                                    <Form.Label className="control-label">English name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        maxLength="20"
                                        className="form-control-modern"
                                        name="en_name"
                                        value={enName}
                                        onChange={e => setEnName(e.target.value)}
                                        required
                                    />
                                    <span className="help-block">Name for the category in english.</span>
                                </Form.Group>
                                <Form.Group className="align-items-center">
                                    <Form.Label className="control-label">Arabic Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        maxLength="20"
                                        className="form-control-modern"
                                        name="ar_name"
                                        value={arName}
                                        onChange={e => setArName(e.target.value)}
                                        required
                                    />
                                    <span className="help-block">Name for the category in arabic.</span>
                                </Form.Group>
                                <Form.Group className="align-items-center">
                                    <Form.Label className="control-label">Slug</Form.Label>
                                    <Form.Control
                                        type="text"
                                        maxLength="20"
                                        className="form-control-modern"
                                        name="slug"
                                        value={slug}
                                        onChange={e => setSlug(e.target.value)}
                                    />
                                    <span className="help-block">Unique slug/reference for the category.</span>
                                </Form.Group>
                                <Form.Group className="align-items-center">
                                    <Form.Label className="control-label">Parent Category</Form.Label>
                                    <Form.Control
                                        as="select"
                                        className="form-control-modern"
                                        name="parent"
                                        value={parent}
                                        onChange={e => setParent(e.target.value)}
                                    >
                                        <option value="0">None</option>
                                        {
                                            categories.data.map((cat, index) => {
                                                if (!cat.parent) {
                                                    return <option key={'cat-' + index} value={cat.id} dangerouslySetInnerHTML={removeXSSAttacks("&nbsp;".repeat(cat.depth * 3) + cat.en_name)}></option>
                                                }
                                            })
                                        }
                                    </Form.Control>
                                    <span className="help-block">Parent category to which current category belongs.</span>
                                </Form.Group>
                                {/* <Form.Group className="align-items-center">
                                    <Form.Label className="control-label">Description</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        className="form-control-modern"
                                        name="description"
                                        rows="5"
                                        maxLength="200"
                                        value={desc}
                                        onChange={e => setDesc(e.target.value)}
                                    />
                                    <span className="help-block">Add description for the category.</span>
                                </Form.Group> */}
                                <Form.Group className="d-flex align-items-center">
                                    <Button
                                        href="#mediaGallery"
                                        className="mr-3"
                                        variant="primary"
                                        onClick={selectImage}
                                    >
                                        Add image
                                    </Button>
                                    <div className="category-image d-inline-block">
                                        {/* {media ?
                                            <PtLazyLoad
                                                src={media.virtual ? media.copy_link : getCroppedImageUrl(`${process.env.PUBLIC_URL}/mock-server/images/${media.copy_link}`, 150)}
                                                alt={media.alt_text ? media.alt_text : 'category'}
                                                width="60"
                                                height="60"
                                            />
                                            : <img
                                                src={`${process.env.PUBLIC_URL}/assets/images/porto-placeholder-66x66.png`}
                                                alt="category"
                                                width="60"
                                                height="60"
                                            />
                                        } */}
                                    </div>
                                </Form.Group>
                                <Form.Group>
                                    <Button type="submit" variant="primary">Add category</Button>
                                </Form.Group>
                            </Card.Body>
                        </Card>
                    </Form>
                </Col>

                <Col xl={8} className="mt-xl-0 mt-3">
                    <Form id="tags-list-form" method="get" onSubmit={searchCategories}>
                        <Card className="card-modern">
                            <Card.Body>
                                <div className="datatables-header-footer-wrapper">
                                    <div className="datatable-header">
                                        <Row className="align-items-center mb-3">
                                            <Col sm="auto" className="col-sm-auto ml-auto pl-lg-1">
                                                <div className="search search-style-1 mx-lg-auto w-auto">
                                                    <InputGroup>
                                                        <Form.Control
                                                            type="text"
                                                            className="search-term"
                                                            name="search-term"
                                                            id="search-term"
                                                            placeholder="Search"
                                                            value={search}
                                                            onChange={e => setSearch(e.target.value)}
                                                        />
                                                        <InputGroup.Append>
                                                            <Button variant="default" type="submit"><i className="bx bx-search"></i></Button>
                                                        </InputGroup.Append>
                                                    </InputGroup>
                                                </div>
                                            </Col>
                                        </Row>
                                    </div>

                                    <PtTable
                                        className="table table-ecommerce-simple -striped mb-0"
                                        data={categories.data}
                                        loading={loading}
                                        columns={columns}
                                        pages={categories.total}
                                        pageSize={12}
                                        manual
                                        onFetchData={fetchData}
                                        selectAll={selectAll}
                                        toggleAll={() => setSelectAll(!selectAll)}
                                        isSelected={key => isSelected(key)}
                                        toggleSelection={onSelectChange}
                                        onChangeRef={ref => setTableRef(ref)}
                                    />

                                    <div className="datatable-footer">
                                        <Row className="align-items-center justify-content-between mt-3">
                                            <Col md="auto" className="mb-3 mb-lg-0">
                                                <div className="d-flex">
                                                    <Form.Control
                                                        as="select"
                                                        className="select-style-1 bulk-action w-auto mr-3"
                                                        value={bulk}
                                                        onChange={e => setBulk(e.target.value)}
                                                        style={{ minWidth: "120px" }}
                                                    >
                                                        <option value="">Bulk Actions</option>
                                                        <option value="delete">Delete</option>
                                                    </Form.Control>
                                                    <Button
                                                        href="#bulk-action"
                                                        className="bulk-action-apply border font-weight-semibold text-color-dark text-3"
                                                        variant="light"
                                                        onClick={bulkAction}
                                                    >Apply</Button>
                                                </div>
                                            </Col>
                                            <Col lg="auto" className="mb-3 mb-lg-0">
                                                <div className="pagination-wrapper d-flex justify-content-lg-end">
                                                </div>
                                            </Col>
                                        </Row>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Form>
                </Col>
            </Row>

            <MediaGalleryModal chooseOne={true} isOpen={modalOpen} onClose={closeModal} />
        </>
    )
}