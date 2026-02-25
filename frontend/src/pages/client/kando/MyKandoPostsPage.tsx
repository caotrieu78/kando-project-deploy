import React, { useEffect, useState } from "react";
import queryString from "query-string";
import "./my-kando-posts.css";
import { useMyKandoxPostsQuery } from "@/hooks/useKandoxPostsQuery";
import type { IKandoxPost, KandoxPostStatus } from "@/types/backend";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/constants/paths";
import Loading from "@/components/common/loading/loading";
import { FilePdfOutlined, CloseOutlined } from "@ant-design/icons";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

const MyKandoPostsPage: React.FC = () => {
    const backendURL = import.meta.env.VITE_BACKEND_URL;
    const navigate = useNavigate();

    const [statusFilter, setStatusFilter] = useState<"ALL" | KandoxPostStatus>("ALL");
    const [searchValue, setSearchValue] = useState("");
    const [page, setPage] = useState(DEFAULT_PAGE);
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
    const [query, setQuery] = useState(
        `page=${DEFAULT_PAGE}&size=${DEFAULT_PAGE_SIZE}&sort=createdAt,desc`
    );

    // State cho popup ảnh
    const [imagePopup, setImagePopup] = useState<{
        isOpen: boolean;
        images: string[];
        currentIndex: number;
    }>({
        isOpen: false,
        images: [],
        currentIndex: 0,
    });

    const [expandedPosts, setExpandedPosts] = useState<Set<number>>(new Set());

    // Gọi API
    const { data, isFetching, refetch } = useMyKandoxPostsQuery(query);
    const posts = data?.result ?? [];
    const meta = data?.meta ?? { page, pageSize, total: 0 };

    useEffect(() => {
        const filters: string[] = [];
        if (statusFilter !== "ALL") filters.push(`status='${statusFilter}'`);

        const q: any = {
            page,
            size: pageSize,
            sort: "createdAt,desc",
        };
        if (filters.length > 0) q.filter = filters.join(" and ");
        setQuery(queryString.stringify(q, { encode: false }));
    }, [statusFilter, page, pageSize]);

    const handleSearch = () => {
        const filters: string[] = [];
        if (searchValue)
            filters.push(`(title~'${searchValue}' or content~'${searchValue}')`);
        if (statusFilter !== "ALL") filters.push(`status='${statusFilter}'`);

        const q: any = {
            page: 1,
            size: pageSize,
            sort: "createdAt,desc",
        };
        if (filters.length > 0) q.filter = filters.join(" and ");
        setPage(1);
        setQuery(queryString.stringify(q, { encode: false }));
        refetch();
    };

    const getFilePath = (url?: string) => {
        if (!url) return "";
        if (url.startsWith("http")) return url;
        if (url.includes("uploads/")) return `${backendURL}/${url}`;
        return `${backendURL}/uploads/kando/${url}`;
    };

    // Render trạng thái
    const renderStatus = (status: KandoxPostStatus) => {
        const statusMap = {
            APPROVED: { label: "Đã duyệt", class: "approved" },
            REJECTED: { label: "Từ chối", class: "rejected" },
            PENDING: { label: "Chờ duyệt", class: "pending" },
        };
        const { label, class: className } = statusMap[status] || statusMap.PENDING;
        return <span className={`status ${className}`}>{label}</span>;
    };

    // Mở popup ảnh
    const openImagePopup = (images: string[], index: number) => {
        setImagePopup({
            isOpen: true,
            images,
            currentIndex: index,
        });
    };

    // Đóng popup ảnh
    const closeImagePopup = () => {
        setImagePopup({
            isOpen: false,
            images: [],
            currentIndex: 0,
        });
    };

    // Chuyển ảnh trước
    const prevImage = () => {
        setImagePopup((prev) => ({
            ...prev,
            currentIndex:
                prev.currentIndex === 0
                    ? prev.images.length - 1
                    : prev.currentIndex - 1,
        }));
    };

    // Chuyển ảnh sau
    const nextImage = () => {
        setImagePopup((prev) => ({
            ...prev,
            currentIndex:
                prev.currentIndex === prev.images.length - 1
                    ? 0
                    : prev.currentIndex + 1,
        }));
    };

    // Toggle "xem thêm"
    const toggleExpand = (postId: number) => {
        setExpandedPosts((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(postId)) {
                newSet.delete(postId);
            } else {
                newSet.add(postId);
            }
            return newSet;
        });
    };

    // Đóng popup khi nhấn ESC
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape" && imagePopup.isOpen) {
                closeImagePopup();
            }
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [imagePopup.isOpen]);

    const totalPages = Math.ceil((meta.total || 0) / pageSize);
    const startIndex = (page - 1) * pageSize + 1;
    const endIndex = Math.min(page * pageSize, meta.total || 0);

    if (isFetching && !data)
        return <Loading message="ĐANG TẢI BÀI VIẾT KANDO..." />;

    return (
        <section className="mykando-container">
            <h2 className="mykando-title">BÀI VIẾT KANDO</h2>

            {/* Thanh tìm kiếm */}
            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Tìm kiếm..."
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
                <button onClick={handleSearch}>TÌM</button>
                <button
                    className="create-btn"
                    onClick={() => navigate(PATHS.CLIENT.KANDO_POST)}
                >
                    TẠO BÀI VIẾT
                </button>
            </div>

            {/* Tabs bộ lọc */}
            <div className="tabs">
                {[
                    { key: "ALL", label: "TẤT CẢ" },
                    { key: "PENDING", label: "CHỜ DUYỆT" },
                    { key: "APPROVED", label: "ĐÃ DUYỆT" },
                    { key: "REJECTED", label: "TỪ CHỐI" },
                ].map((tab) => (
                    <button
                        key={tab.key}
                        className={`tab ${statusFilter === tab.key ? "active" : ""}`}
                        onClick={() => {
                            setStatusFilter(tab.key as any);
                            setPage(1);
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Hiển thị bài viết */}
            {isFetching && data && <p className="loading-text">Đang tải...</p>}
            {!isFetching && posts.length === 0 && (
                <p className="empty-text">Không có bài viết.</p>
            )}

            <div className="posts-grid">
                {posts.map((post: IKandoxPost) => {
                    const createdDate = post.createdAt ? new Date(post.createdAt) : null;
                    const formattedDate = createdDate
                        ? createdDate.toLocaleDateString("vi-VN")
                        : "";
                    const formattedTime = createdDate
                        ? createdDate.toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                        })
                        : "";

                    const images = [post.imageUrl1, post.imageUrl2, post.imageUrl3]
                        .filter((img): img is string => Boolean(img))
                        .map((img) => getFilePath(img));
                    const imageCount = images.length;

                    const isExpanded = post.id ? expandedPosts.has(post.id) : false;
                    const contentLength = post.content?.length || 0;
                    const shouldShowReadMore = contentLength > 150;

                    return (
                        <div key={post.id ?? Math.random()} className="post-card">
                            <div className="post-header">
                                <h3 title={post.title}>{post.title}</h3>
                                {renderStatus(post.status)}
                            </div>

                            <p className={`post-content ${isExpanded ? "expanded" : ""}`}>
                                {isExpanded || !shouldShowReadMore
                                    ? post.content
                                    : `${post.content?.substring(0, 150)}...`}
                            </p>

                            {shouldShowReadMore && post.id && (
                                <button
                                    className="read-more-btn"
                                    onClick={() => toggleExpand(post.id!)}
                                >
                                    {isExpanded ? "Thu gọn ▲" : "Xem thêm ▼"}
                                </button>
                            )}

                            {/* Ảnh minh họa */}
                            {imageCount > 0 && (
                                <div className={`post-images count-${imageCount}`}>
                                    {images.map((img, i) => (
                                        <img
                                            key={i}
                                            src={img}
                                            alt={`Ảnh ${i + 1}`}
                                            onClick={() => openImagePopup(images, i)}
                                            style={{ cursor: "pointer" }}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* PDF đính kèm */}
                            {post.url && (
                                <div className="post-pdf">
                                    <FilePdfOutlined className="pdf-icon" />
                                    <a
                                        href={getFilePath(post.url)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="pdf-link"
                                    >
                                        Xem file PDF đính kèm
                                    </a>
                                </div>
                            )}

                            <div className="post-footer">
                                <span>
                                    {formattedDate} • {formattedTime}
                                </span>
                                {post.unit?.name && (
                                    <span className="unit-badge">{post.unit.name}</span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Phân trang */}
            {meta.total > 0 && (
                <div className="custom-pagination">
                    <div className="page-info">
                        {startIndex}–{endIndex} trên{" "}
                        <strong>{meta.total.toLocaleString()}</strong> bài viết
                    </div>

                    <div className="page-controls">
                        <button
                            disabled={page <= 1}
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                        >
                            ‹
                        </button>

                        <span className="page-number">
                            {page} / {totalPages || 1}
                        </span>

                        <button
                            disabled={page >= totalPages}
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        >
                            ›
                        </button>

                        <select
                            value={pageSize}
                            onChange={(e) => {
                                setPageSize(Number(e.target.value));
                                setPage(1);
                            }}
                        >
                            {[10, 20, 50].map((size) => (
                                <option key={size} value={size}>
                                    {size} / trang
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            {/* Popup xem ảnh full */}
            {imagePopup.isOpen && (
                <div className="image-popup-overlay" onClick={closeImagePopup}>
                    <div className="image-popup-content" onClick={(e) => e.stopPropagation()}>
                        <button className="popup-close" onClick={closeImagePopup}>
                            <CloseOutlined />
                        </button>

                        {imagePopup.images.length > 1 && (
                            <>
                                <button className="popup-nav prev" onClick={prevImage}>
                                    ‹
                                </button>
                                <button className="popup-nav next" onClick={nextImage}>
                                    ›
                                </button>
                            </>
                        )}

                        <img
                            src={imagePopup.images[imagePopup.currentIndex]}
                            alt={`Ảnh ${imagePopup.currentIndex + 1}`}
                            className="popup-image"
                        />

                        {imagePopup.images.length > 1 && (
                            <div className="popup-counter">
                                {imagePopup.currentIndex + 1} / {imagePopup.images.length}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
};

export default MyKandoPostsPage;
