import ListUnv from '@/Components/Admin/Unv/ListUnv';
import AdminLayout from '@/Layouts/AdminLayout';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import '../../assets/css/Admin/UniversityMan.css';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import { DecoupledEditor } from 'ckeditor5';
import {
    Alignment,
    AutoLink,
    Autosave,
    BlockQuote,
    BlockToolbar,
    Bold,
    Bookmark,
    Code,
    CodeBlock,
    Essentials,
    FontBackgroundColor,
    FontColor,
    FontFamily,
    FontSize,
    GeneralHtmlSupport,
    Highlight,
    HorizontalLine,
    Indent,
    IndentBlock,
    Italic,
    Link,
    Paragraph,
    PlainTableOutput,
    RemoveFormat,
    Strikethrough,
    Style,
    Subscript,
    Superscript,
    Table,
    TableCaption,
    TableCellProperties,
    TableColumnResize,
    TableLayout,
    TableProperties,
    TableToolbar,
    Underline,
} from 'ckeditor5';
import translations from 'ckeditor5/translations/vi.js';
import 'ckeditor5/ckeditor5.css';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const LICENSE_KEY = 'GPL';

export default function UniversityManagement() {
    const navigate = useNavigate();
    const editorContainerRef = useRef(null);
    const editorToolbarRef = useRef(null);
    const editorRef = useRef(null);
    const [isLayoutReady, setIsLayoutReady] = useState(false);
    const [listUnv, setListUnv] = useState([]);
    const [categories, setCategories] = useState([]);
    const [currentAdmin, setCurrentAdmin] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUniversitiesData = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get('/api/admin/universities', {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
                        },
                    });
                const { universities, categories, currentAdmin } = response.data;
                setListUnv(universities);
                setCategories(categories);
                setCurrentAdmin(currentAdmin);
            } catch (error) {
                console.error('Error fetching universities data:', error);
                if (error.response?.status === 401) {
                    toast.error('Vui lòng đăng nhập lại!');
                    navigate('/admin/login');
                } else {
                    toast.error('Không thể tải danh sách trường đại học. Vui lòng thử lại!');
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchUniversitiesData();
    }, [navigate]);

    useEffect(() => {
        const channel = window.Echo.channel('channel-admin');

        channel.listen('.university.updated', (e) => {
            const { type, truong } = e;
            console.log('Received update:', type, truong);
            
            setListUnv((prev) => {
                if (!truong || !truong.Id) return prev;

                if (type === 'Add') {
                    return [truong, ...prev];
                }

                if (type === 'Update') {
                    return prev.map((item) => (item.Id === truong.Id ? truong : item));
                }

                if (type === 'Delete') {
                    return prev.filter((item) => item.Id !== truong.Id);
                }

                return prev;
            });
        }).error((error) => {
            console.error('Subscription error:', error);
            toast.error('Lỗi kết nối thời gian thực. Vui lòng kiểm tra lại!');
        });

        return () => {
            window.Echo.leave('channel-admin');
        };
    }, []);

    useEffect(() => {
        setIsLayoutReady(true);
        return () => setIsLayoutReady(false);
    }, []);

    const editorConfig = useMemo(() => {
        if (!isLayoutReady) {
            return {};
        }

        return {
            toolbar: {
                items: [
                    'undo',
                    'redo',
                    '|',
                    'fontSize',
                    'fontFamily',
                    'fontColor',
                    'fontBackgroundColor',
                    '|',
                    'bold',
                    'italic',
                    'underline',
                    'strikethrough',
                    'subscript',
                    'superscript',
                    'code',
                    'removeFormat',
                    '|',
                    'horizontalLine',
                    'link',
                    'bookmark',
                    'insertTable',
                    'insertTableLayout',
                    'highlight',
                    'blockQuote',
                    'codeBlock',
                    '|',
                    'alignment',
                    '|',
                    'outdent',
                    'indent',
                ],
                shouldNotGroupWhenFull: false,
            },
            plugins: [
                Alignment,
                AutoLink,
                Autosave,
                BlockQuote,
                BlockToolbar,
                Bold,
                Bookmark,
                Code,
                CodeBlock,
                Essentials,
                FontBackgroundColor,
                FontColor,
                FontFamily,
                FontSize,
                GeneralHtmlSupport,
                Highlight,
                HorizontalLine,
                Indent,
                IndentBlock,
                Italic,
                Link,
                Paragraph,
                PlainTableOutput,
                RemoveFormat,
                Strikethrough,
                Style,
                Subscript,
                Superscript,
                Table,
                TableCaption,
                TableCellProperties,
                TableColumnResize,
                TableLayout,
                TableProperties,
                TableToolbar,
                Underline,
            ],
            blockToolbar: [
                'fontSize',
                'fontColor',
                'fontBackgroundColor',
                '|',
                'bold',
                'italic',
                '|',
                'link',
                'insertTable',
                'insertTableLayout',
                '|',
                'outdent',
                'indent',
            ],
            fontFamily: {
                supportAllValues: true,
            },
            fontSize: {
                options: [10, 12, 14, 'default', 18, 20, 22],
                supportAllValues: true,
            },
            htmlSupport: {
                allow: [
                    {
                        name: /^.*$/,
                        styles: true,
                        attributes: true,
                        classes: true,
                    },
                ],
            },
            language: 'vi',
            licenseKey: LICENSE_KEY,
            link: {
                addTargetToExternalLinks: true,
                defaultProtocol: 'https://',
                decorators: {
                    toggleDownloadable: {
                        mode: 'manual',
                        label: 'Downloadable',
                        attributes: {
                            download: 'file',
                        },
                    },
                },
            },
            table: {
                contentToolbar: [
                    'tableColumn',
                    'tableRow',
                    'mergeTableCells',
                    'tableProperties',
                    'tableCellProperties',
                ],
            },
            translations: [translations],
        };
    }, [isLayoutReady]);

    // Render giao diện
    if (isLoading) {
        return (
            <AdminLayout>
                <div className="container d-flex justify-content-center align-items-center vh-100">
                    <div className="text-white">Đang tải...</div>
                </div>
            </AdminLayout>
        );
    }

    if (!currentAdmin) {
        return (
            <AdminLayout>
                <div className="container d-flex justify-content-center align-items-center vh-100">
                    <div className="bg-dark shadow p-5 rounded text-center" style={{ maxWidth: '500px', width: '100%' }}>
                        <div className="alert alert-danger mb-4" role="alert">
                            <h4 className="alert-heading">Truy cập bị từ chối</h4>
                            <p>Bạn không có quyền truy cập vào trang này.</p>
                        </div>
                        <button
                            className="btn btn-outline-primary"
                            onClick={() => navigate('/admin/login')}
                        >
                            Quay lại trang đăng nhập
                        </button>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="container p-4 rounded-3" style={{ backgroundColor: '#343a40', minWidth: '100%' }}>
                <ListUnv
                    universities={listUnv}
                    categories={categories}
                    editorConfig={editorConfig}
                    editorContainerRef={editorContainerRef}
                    editorToolbarRef={editorToolbarRef}
                    editorRef={editorRef}
                    isLayoutReady={isLayoutReady}
                    CKEditor={CKEditor}
                    DecoupledEditor={DecoupledEditor}
                />
            </div>
        </AdminLayout>
    );
}