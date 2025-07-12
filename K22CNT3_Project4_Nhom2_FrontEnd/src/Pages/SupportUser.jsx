import MainLayout from '@/Layouts/MainLayout';
import React, { useEffect, useState, useRef, useMemo } from 'react';
import '../assets/css/customDatePicker.css';
import '../assets/css/supportUser.css';
import SuggestUniversity from '@/Components/Support/SuggestUniversity';
import AlertComponent from '@/Components/AlertComponent';
import ReportSystemError from '@/Components/Support/ReportSystemError';
import ReportViolation from '@/Components/Support/ReportViolation';
import SuggestionWebsite from '@/Components/Support/SuggestionWebsite';
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

const LICENSE_KEY =
    'GPL';

export default function SupportUser() {
    const [image, setImage] = useState(null);
    const [imageName, setImageName] = useState('');
    const [showCreateUnv, setShowCreateUnv] = useState(false);
    const [showReportSystemError, setReportSystemError] = useState(false);
    const [showReportViolation, setReportViolation] = useState(false);
    const [showSuggestiontWebsite, setSuggestiontWebsite] = useState(false);
    const [alert, setAlert] = useState(null);
    const editorContainerRef = useRef(null);
    const editorToolbarRef = useRef(null);
    const editorRef = useRef(null);
    const [isLayoutReady, setIsLayoutReady] = useState(false);

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

    const handleFileChange = (e) => {
        if (!e || !e.target || !e.target.files || e.target.files.length === 0) {
            setImage(null);
            setImageName('');
            return;
        }
        const file = e.target.files[0];
        setImage(URL.createObjectURL(file));
        setImageName(file.name);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) {
            setImage(URL.createObjectURL(file));
            setImageName(file.name);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleCreateUnv = () => {
        setShowCreateUnv((prev) => !prev);
        setReportSystemError(false);
        setReportViolation(false);
        setSuggestiontWebsite(false);
    };

    const handleReportSystemError = () => {
        setReportSystemError((prev) => !prev);
        setShowCreateUnv(false);
        setReportViolation(false);
        setSuggestiontWebsite(false);
    };

    const handleReportViolation = () => {
        setReportViolation((prev) => !prev);
        setReportSystemError(false);
        setShowCreateUnv(false);
        setSuggestiontWebsite(false);
    };

    const handleSuggestionWebsite = () => {
        setSuggestiontWebsite((prev) => !prev);
        setReportSystemError(false);
        setReportViolation(false);
        setShowCreateUnv(false);
    };

    return (
        <MainLayout>
            {alert && (
                <AlertComponent
                    message={alert.message}
                    type={alert.type}
                    duration={4000}
                    onClose={() => setAlert(null)}
                />
            )}
            <div className="bg-gradient-to-r bg-top-sup text-white py-16 text-center relative">
                <h1 className="text-4xl font-bold">Hỗ trợ cộng đồng sinh viên</h1>
                <p className="text-lg mt-2">Chúng tôi có thể giúp gì bạn?</p>
                <div className="max-w-xl mx-auto mt-6">
                    <div className="flex items-center bg-white rounded shadow px-3 py-2">
                        <input
                            type="text"
                            disabled
                            placeholder="Tìm kiếm thông tin hỗ trợ..."
                            className="flex-grow outline-none border-0 text-black"
                        />
                        <button className="text-blue-600 pl-3">
                            <i className="fa-duotone fa-solid fa-magnifying-glass"></i>
                        </button>
                    </div>
                </div>
            </div>
            <div className="py-12 bg-bottom-sup">
                <h2 className="text-2xl font-semibold text-center mb-8">Danh mục hỗ trợ</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto px-4">
                    <div
                        className="bg-items-sup rounded-xl p-6 text-center shadow hover:shadow-lg transition transform hover:-translate-y-1 cursor-pointer"
                        onClick={handleCreateUnv}
                    >
                        <div className="text-5xl mb-4">
                            <i className="fa-regular fa-building-columns"></i>
                        </div>
                        <h3 className="text-lg font-medium">Đề xuất thêm trường mới</h3>
                    </div>
                    <div
                        className="bg-items-sup rounded-xl p-6 text-center shadow hover:shadow-lg transition transform hover:-translate-y-1 cursor-pointer"
                        onClick={handleReportSystemError}
                    >
                        <div className="text-5xl mb-4">
                            <i className="fa-duotone fa-solid fa-bug-slash"></i>
                        </div>
                        <h3 className="text-lg font-medium">Báo lỗi hệ thống</h3>
                    </div>
                    <div
                        className="bg-items-sup rounded-xl p-6 text-center shadow hover:shadow-lg transition transform hover:-translate-y-1 cursor-pointer"
                        onClick={handleReportViolation}
                    >
                        <div className="text-5xl mb-4">
                            <i className="fa-duotone fa-solid fa-comment-slash"></i>
                        </div>
                        <h3 className="text-lg font-medium">Báo cáo vi phạm</h3>
                    </div>
                    <div
                        className="bg-items-sup rounded-xl p-6 text-center shadow hover:shadow-lg transition transform hover:-translate-y-1 cursor-pointer"
                        onClick={handleSuggestionWebsite}
                    >
                        <div className="text-5xl mb-4">
                            <i className="fa-regular fa-thought-bubble"></i>
                        </div>
                        <h3 className="text-lg font-medium">Gửi góp ý</h3>
                    </div>
                </div>
            </div>
            {showCreateUnv && (
                <SuggestUniversity
                    handleDrop={handleDrop}
                    handleFileChange={handleFileChange}
                    handleDragOver={handleDragOver}
                    image={image}
                    imageName={imageName}
                    setAlert={setAlert}
                    setShowCreateUnv={setShowCreateUnv}
                    editorConfig={editorConfig}
                    editorContainerRef={editorContainerRef}
                    editorToolbarRef={editorToolbarRef}
                    editorRef={editorRef}
                    isLayoutReady={isLayoutReady}
                    CKEditor={CKEditor}
                    DecoupledEditor={DecoupledEditor}
                />
            )}
            {showReportSystemError && (
                <ReportSystemError
                    handleDrop={handleDrop}
                    handleFileChange={handleFileChange}
                    handleDragOver={handleDragOver}
                    image={image}
                    imageName={imageName}
                    setAlert={setAlert}
                    setReportSystemError={setReportSystemError}
                    editorConfig={editorConfig}
                    editorContainerRef={editorContainerRef}
                    editorToolbarRef={editorToolbarRef}
                    editorRef={editorRef}
                    isLayoutReady={isLayoutReady}
                    CKEditor={CKEditor}
                    DecoupledEditor={DecoupledEditor}
                />
            )}
            {showReportViolation && (
                <ReportViolation
                    handleDrop={handleDrop}
                    handleFileChange={handleFileChange}
                    handleDragOver={handleDragOver}
                    image={image}
                    imageName={imageName}
                    setAlert={setAlert}
                    setReportViolation={setReportViolation}
                    editorConfig={editorConfig}
                    editorContainerRef={editorContainerRef}
                    editorToolbarRef={editorToolbarRef}
                    editorRef={editorRef}
                    isLayoutReady={isLayoutReady}
                    CKEditor={CKEditor}
                    DecoupledEditor={DecoupledEditor}
                />
            )}
            {showSuggestiontWebsite && (
                <SuggestionWebsite
                    setAlert={setAlert}
                    setSuggestiontWebsite={setSuggestiontWebsite}
                    editorConfig={editorConfig}
                    editorContainerRef={editorContainerRef}
                    editorToolbarRef={editorToolbarRef}
                    editorRef={editorRef}
                    isLayoutReady={isLayoutReady}
                    CKEditor={CKEditor}
                    DecoupledEditor={DecoupledEditor}
                />
            )}
        </MainLayout>
    );
}