import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Form, Card, Button, InputGroup } from 'react-bootstrap';
import { toast } from 'react-toastify';

import Breadcrumb from '../../common/breadcrumb';
import PtTable from '../../features/elements/table';
import PNotify from '../../features/elements/p-notify';

// import { getCategoriesTree, getProduct, getProducts } from '../../../api';
import { deleteProduct, getProducts } from '../../../api/products';
import { removeXSSAttacks, getCroppedImageUrl } from '../../../utils';
import { getAllCategories, getCategories } from '../../../api/categories';
import { getProductsList } from '../../../api/data.factory';

export default function ProductList() {
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState({
        data: [],
        total: 0
    });
    const pageSize = 10;
    const totalPages = Math.ceil(products.total / pageSize)



    const [categories, setCategories] = useState([]);
    const [ajax, setAjax] = useState({
        data: [],
        total: 0
    });
    const [tree, setTree] = useState([]);

    // Filter Variables
    const [cat, setCat] = useState('');
    const [type, setType] = useState('');
    const [search, setSearch] = useState('');

    const [selectAll, setSelectAll] = useState(false);
    const [tableRef, setTableRef] = useState(null);
    const [selected, setSelected] = useState([]);
    const [bulk, setBulk] = useState('');

    // Columns
    const columns = [{
        id: 'en_name',
        Header: 'English Name',
        sortable: true,
        style: {
            lineHeight: 1
        },
        className: "d-block ws-nowrap",
        accessor: d => {
            return { id: d._id, en_name: d.en_name, images: d.images, slug: d.slug }
        },
        Cell: row => (
            <>
                {row.value.images.length ?
                    <img
                        className="mr-1"
                        src={row.value.images[0].url}
                        // alt={row.value.media[0].alt_text ? row.value.images[0].alt_text : 'category'}
                        width="60"
                        height="60"
                    />
                    : <img
                        className="mr-1"
                        src={`${process.env.PUBLIC_URL}/assets/images/porto-placeholder-66x66.png`}
                        alt="category"
                        width="60"
                        height="60"
                    />
                }
            <Link to={`${process.env.PUBLIC_URL}/products/${row.value.slug}`}>
                    <strong>{row.value.en_name}</strong>
                </Link>
            </>
        )
    },
    {
        Header: 'Arabic Name',
        accessor: 'ar_name',
        sortable: true,
        Cell: row => row.value
    },
    {
        Header: 'Vendor',
        accessor: 'vendor',
        sortable: true,
        Cell: row => row.value ? row.value.ar_name : ''
    },
    {
        Header: 'Stock',
        id: 'stock',
        accessor: 'stock',
        sortable: true,
        Cell: row => row.value
    },
    {
        Header: 'Price',
        id: 'price',
        accessor: 'price',
        sortable: true,
        Cell: row => row.value
    },
    {
        Header: 'Categories',
        id: 'categories',
        accessor: 'categories',
        Cell: row => <span style={{
            display: "-webkit-box",
            overflow: "hidden",
            WebkitLineClamp: "4",
            WebkitBoxOrient: "vertical"
        }} > {row.value ? row.value.map(cat => cat.ar_name).join(', ') : ''}</span >
    },
    //{
    //     Header: 'Tags',
    //     accessor: 'tags',
    //     Cell: row => row.value ? row.value.map(cat => cat.name).join(', ') : ''
    // },

    {
        Header: 'Featured',
        accessor: 'is_featured',
        sortable: true,
        Cell: row => (
            <div className='center'>
                <i className={`${row.value ? 'fas' : 'far'} fa-star`}></i>
            </div>

        )
    },
    {
        Header: 'Published',
        accessor: 'is_published',
        sortable: true,
        Cell: row => (
            <div>
                <i className={`fa ${row.value ? 'fa-eye-slash' : 'fa-eye'}`}></i>
            </div>
        )
    },
    {
        Header: 'Date',
        accessor: 'createdAt',
        sortable: true
    },
    {
        id: 'actions',
        Header: 'Actions',
        className: 'actions',
        headerClassName: "justify-content-center",
        width: 100,
        accessor: d => {
            return { id: d.id, slug: d.slug }
        },
        Cell: row => (
            <>
                <Link to={`${process.env.PUBLIC_URL}/products/${row.value.slug}`} className="on-default edit-row mr-2"><i className="fas fa-pencil-alt"></i></Link>
                <a href="#del" className="on-default remove-row" onClick={e => deleteRow(e, row.value.id)}><i className="far fa-trash-alt"></i></a>
            </>
        )
    }
    ];

    useEffect(() => {

        //fetchData()

        // getCategoriesTree('products').then(data => {
        //     setTree(data);
        // });
    }, [])



    const fetchData = async (state) => {
        let filtered = [...state.filtered];
        cat !== '' && filtered.push({ id: 'categories', value: cat });
        type !== '' && filtered.push({ id: 'type', value: type });

        setLoading(true);

        const from = state.page * state.pageSize;
        const to = (state.page + 1) * state.pageSize
        const sortBy = state.sorted
        try {
            setLoading(true)
            const [prodsRes, catsRes] = await Promise.all([getProducts(), getAllCategories()]);
            if (prodsRes, catsRes) {
                const products = getProductsList(prodsRes.products, from, to, filtered, sortBy);
                setProducts(products)
                setCategories(catsRes)
            }
            setLoading(false)
        } catch (error) {
            console.log("error feching products list ", error)
        }
    }


    const handleGetProducts = async () => {
        try {
            setLoading(true)
            const [prodsRes, catsRes] = await Promise.all([getProducts(), getAllCategories()]);
            if (prodsRes, catsRes) {
                const productsList = getProductsList(prodsRes.products, 0, pageSize, [], []);
                console.log(productsList)
                setProducts(productsList)
                setCategories(catsRes)
            }
            setLoading(false)
        } catch (error) {
            console.log("error feching products list ", error)
        }
    }


    // useEffect(() => {
    //     setSelected(selected.map(item => {
    //         return {
    //             ...item,
    //             selected: selectAll
    //         }
    //     }));
    // }, [selectAll])

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

    const deleteRow = async (e, id) => {
        e.preventDefault();
        if (window.confirm("Are you sure you want to delete this data?")) {
            try {
                const deleted = await deleteProduct(id);
                if (deleted) {
                    handleGetProducts();
                    toast(
                        <PNotify title="Success" icon="fas fa-check" text={`Product deleted successfully.`} />,
                        {
                            containerId: "default",
                            className: "notification-success"
                        }
                    );
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
        }
    }

    // function bulkAction(e) {
    //     e.preventDefault();
    //     if (!bulk) {
    //         return toast(
    //             <PNotify title="Warning" icon="fas fa-exclamation" text="Please choose one of actions." />,
    //             {
    //                 containerId: "default",
    //                 className: "notification-warning"
    //             }
    //         );
    //     }
    //     if (bulk === 'delete') {
    //         if (!selected.find(item => item.selected)) {
    //             return toast(
    //                 <PNotify title="Warning" icon="fas fa-exclamation" text="Choose at least one item." />,
    //                 {
    //                     containerId: "default",
    //                     className: "notification-warning"
    //                 }
    //             );
    //         }
    //         setAjax({
    //             ...ajax,
    //             data: ajax.data.filter(media => selected.find(item => item.id === media.id && !item.selected))
    //         });
    //     }
    // }

    function searchProducts(e) {
        e.preventDefault();
        //console.log("search", tableRef.current.)
        //tableRef.current.wrappedInstance.filterColumn({ id: 'en_name' }, search);

        tableRef.current.filterColumn({ id: 'en_name' }, search);
    }

    // function fetchData(state) {
    //     let filtered = [...state.filtered];
    //     cat !== '' && filtered.push({ id: 'categories', value: cat });
    //     type !== '' && filtered.push({ id: 'type', value: type });
    //     setLoading(true);
    //     getProducts(state.page * state.pageSize, (state.page + 1) * state.pageSize, filtered, state.sorted).then(results => {
    //         setLoading(false);
    //         setAjax({
    //             data: results.data,
    //             total: parseInt(results.total / state.pageSize) + !(!(results.total % state.pageSize))
    //         });
    //         setSelected(results.data.map(media => {
    //             return {
    //                 id: media.id,
    //                 selected: false
    //             }
    //         }));
    //         setSelectAll(false);
    //     });
    // }

    function featuredToggle(e, id, value) {
        // e.preventDefault();
        // setAjax({
        //     ...ajax,
        //     data: ajax.data.map(product => {
        //         if (product.id === id) product.featured = value;
        //         return product;
        //     })
        // });
    }

    return (
        <>
            <Breadcrumb current={'All Products'} paths={[{ name: 'Home', url: '/' }]} />

            <Card className="card-modern">
                <Card.Body>

                    <Form method="GET" action="#" onSubmit={searchProducts}>

                        <div className="datatables-header-footer-wrapper overflow-lg-auto overflow-xl-unset">


                            <div className="datatable-header">
                                <Row className="align-items-lg-center mb-3">
                                    <Col lg="auto" className="mb-3 mb-lg-0">
                                        <Button
                                            as={Link}
                                            to={`${process.env.PUBLIC_URL}/products/create`}
                                            className="font-weight-semibold"
                                            variant="primary"
                                            size="md"
                                        >+ Add Product</Button>
                                    </Col>
                                    <Col lg="auto" className="col-8 ml-lg-auto mb-3 mb-lg-0">
                                        <div className="d-flex align-items-lg-center flex-column flex-lg-row">
                                            <Form.Label className="ws-nowrap mr-3 mb-0">Filter By:</Form.Label>
                                            <Form.Control
                                                as="select"
                                                className="select-style-1 filter-by my-1 mr-2 w-lg-auto"
                                                value={cat}
                                                onChange={e => setCat(e.target.value)}
                                            >
                                                <option value=''>All Category</option>
                                                {categories.map((item, index) => (
                                                    <option key={`cat-${index}`} value={item.slug} dangerouslySetInnerHTML={removeXSSAttacks('&ndash;'.repeat(item.depth) + item.ar_name)}></option>
                                                ))}
                                            </Form.Control>
                                            {/* <Form.Control
                                                as="select"
                                                className="select-style-1 filter-by my-1 mr-2"
                                                value={type}
                                                onChange={e => setType(e.target.value)}
                                            >
                                                <option value=''>All Type</option>
                                                <option value="simple">Simple</option>
                                                <option value="variable">Variable</option>
                                            </Form.Control> */}
                                            <Button
                                                type="submit"
                                                className="filter-btn my-1"
                                                variant="primary"
                                            >Filter</Button>
                                        </div>
                                    </Col>
                                    <Col lg="auto" className="col-12">
                                        <div className="search search-style-1 mx-lg-auto my-1">
                                            <InputGroup>
                                                <Form.Control
                                                    type="text"
                                                    className="search-term"
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
                                type="normal"
                                className="table table-ecommerce-simple -striped mb-0"
                                data={products.data}
                                loading={loading}
                                columns={columns}
                                pages={totalPages}
                                pageSize={pageSize}
                                manual
                                onFetchData={fetchData}
                                // selectAll={selectAll}
                                // toggleAll={() => setSelectAll(!selectAll)}
                                isSelected={key => isSelected(key)}
                                toggleSelection={onSelectChange}
                                onChangeRef={ref => setTableRef(ref)}
                            />

                            {/* 



                                    <PtTable
                                        type='rormal'
                                        className="table table-ecommerce-simple -striped mb-0"
                                        data={categories.data}
                                        loading={loading}
                                        columns={columns}
                                        pages={categories.total}
                                        pageSize={12}
                                        manual
                                        onFetchData={fetchData}
                                        //selectAll={selectAll}
                                        //toggleAll={() => setSelectAll(!selectAll)}
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
                              */}
                        </div>

                    </Form>
                </Card.Body>
            </Card>
        </>
    )
}