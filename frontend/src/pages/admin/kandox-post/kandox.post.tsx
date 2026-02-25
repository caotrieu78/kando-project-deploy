import React, { useMemo, useState, useEffect } from "react";
import { message, Modal, Tabs, Tag, Pagination, Image, AutoComplete, Input } from "antd";
import { CheckOutlined, CloseOutlined, FilePdfOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import queryString from "query-string";

import PageContainer from "@/components/common/data-table/PageContainer";
import SearchFilter from "@/components/common/filter/SearchFilter";
import Access from "@/components/share/access";

import { PAGINATION_CONFIG } from "@/config/pagination";
import { ALL_PERMISSIONS } from "@/config/permissions";
import {
    useAllKandoxPostsQuery,
    useApproveKandoxPostMutation,
    useRejectKandoxPostMutation,
    useCountKandoxPostsByStatusQuery,
} from "@/hooks/useKandoxPostsQuery";

import type { IKandoxPost, KandoxPostStatus } from "@/types/backend";

const KandoxPostsPage: React.FC = () => {
    const backendURL = import.meta.env.VITE_BACKEND_URL;

    const [activeTab, setActiveTab] = useState<KandoxPostStatus | "ALL">("PENDING");
    const [query, setQuery] = useState(
        `page=1&size=${PAGINATION_CONFIG.DEFAULT_PAGE_SIZE}&sort=createdAt,desc`
    );
    const [page, setPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(PAGINATION_CONFIG.DEFAULT_PAGE_SIZE);
    const [searchValue, setSearchValue] = useState<string>("");

    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState<"approve" | "reject" | null>(null);
    const [selectedPost, setSelectedPost] = useState<IKandoxPost | null>(null);

    // Lưu trạng thái “xem thêm / thu gọn” từng bài viết
    const [expandedPosts, setExpandedPosts] = useState<Record<number, boolean>>({});

    // Gợi ý tên nhà hàng (autocomplete) -> unit.name
    const [searchInput, setSearchInput] = useState<string>("");
    const [restaurantOptions, setRestaurantOptions] = useState<{ value: string }[]>([]);

    const { data, isFetching, refetch } = useAllKandoxPostsQuery(query);
    const { data: countData } = useCountKandoxPostsByStatusQuery();
    const { mutateAsync: approvePost } = useApproveKandoxPostMutation();
    const { mutateAsync: rejectPost } = useRejectKandoxPostMutation();

    const posts = data?.result ?? [];
    const meta = data?.meta ?? { page, pageSize, total: 0 };

    // ========================= BUILD QUERY =========================
    useEffect(() => {
        const filters: string[] = [];
        if (activeTab !== "ALL") filters.push(`status='${activeTab}'`);
        if (searchValue)
            filters.push(
                `(title~'${searchValue}' or createdBy.name~'${searchValue}' or createdBy.unit.name~'${searchValue}')`
            );

        const q: any = { page, size: pageSize, sort: "createdAt,desc" };
        if (filters.length > 0) q.filter = filters.join(" and ");
        setQuery(queryString.stringify(q, { encode: false }));
    }, [activeTab, searchValue, page, pageSize]);

    // ========================= SUGGEST RESTAURANT NAMES =========================
    // Nguồn gợi ý: post.unit.name (tên nhà hàng)
    useEffect(() => {
        const keyword = (searchInput || "").trim().toLowerCase();

        const candidates = posts
            .map((p) => (p.unit?.name || "").trim())
            .filter(Boolean);

        const uniq = Array.from(new Set(candidates));

        const filtered = keyword
            ? uniq.filter((t) => t.toLowerCase().includes(keyword))
            : uniq;

        setRestaurantOptions(filtered.slice(0, 12).map((t) => ({ value: t })));
    }, [posts, searchInput]);

    // ========================= ACTIONS =========================
    const handleConfirm = async () => {
        if (!selectedPost || !modalType) return;
        try {
            if (modalType === "approve") {
                await approvePost(selectedPost.id!);
                message.success("Đã duyệt bài viết");
            } else {
                await rejectPost(selectedPost.id!);
                message.warning("Đã từ chối bài viết");
            }
            refetch();
        } catch (err: any) {
            message.error(err?.message || "Lỗi xử lý bài viết");
        } finally {
            setModalVisible(false);
            setSelectedPost(null);
            setModalType(null);
        }
    };

    // ========================= HELPERS =========================
    const getFilePath = (url?: string) => {
        if (!url) return "";
        if (url.startsWith("http")) return url;
        if (url.includes("uploads/")) return `${backendURL}/${url}`;
        return `${backendURL}/uploads/kando/${url}`;
    };

    const getAvatarPath = (avatar?: string) => {
        if (!avatar) return "/no-avatar.png";
        if (avatar.startsWith("http")) return avatar;
        if (avatar.includes("uploads/")) return `${backendURL}/${avatar}`;
        return `${backendURL}/uploads/avatar/${avatar}`;
    };

    const renderStatusBadge = (status?: KandoxPostStatus) => {
        switch (status) {
            case "APPROVED":
                return (
                    <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700">
                        Đã duyệt
                    </span>
                );
            case "REJECTED":
                return (
                    <span className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-700">
                        Từ chối
                    </span>
                );
            default:
                return (
                    <span className="text-xs px-2 py-0.5 rounded bg-yellow-100 text-yellow-700">
                        Chờ duyệt
                    </span>
                );
        }
    };

    const renderImages = (post: IKandoxPost) => {
        const images = [post.imageUrl1, post.imageUrl2, post.imageUrl3].filter(Boolean);
        if (!images.length) return null;

        return (
            <div className="mt-3">
                <Image.PreviewGroup>
                    <div className={`grid ${images.length > 1 ? "grid-cols-2 gap-1" : ""}`}>
                        {images.map((url, i) => (
                            <Image
                                key={i}
                                src={getFilePath(url!)}
                                alt={`Post image ${i + 1}`}
                                className={`object-cover rounded ${images.length === 1 ? "w-full max-h-64" : "h-40 w-full"
                                    }`}
                                fallback="/no-image.png"
                            />
                        ))}
                    </div>
                </Image.PreviewGroup>
            </div>
        );
    };

    const renderPdfFile = (post: IKandoxPost) => {
        if (!post.url) return null;
        const fileUrl = getFilePath(post.url);
        return (
            <div
                className="flex items-center gap-2 mt-3 px-3 py-2 border rounded-md bg-gray-50"
                style={{
                    borderColor: "rgba(0,0,0,0.05)",
                }}
            >
                <FilePdfOutlined style={{ color: "#f87171", fontSize: 18 }} />
                <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        color: "#f87171",
                        textDecoration: "underline",
                        wordBreak: "break-all",
                        fontSize: 13,
                    }}
                >
                    Xem file PDF đính kèm
                </a>
            </div>
        );
    };

    const tabItems = useMemo(
        () => [
            {
                key: "ALL",
                label: (
                    <div className="flex items-center gap-2">
                        <span>Tất cả</span>
                        <Tag color="blue" className="px-2 py-0.5 text-xs m-0">
                            {countData?.TOTAL ?? 0}
                        </Tag>
                    </div>
                ),
            },
            {
                key: "PENDING",
                label: (
                    <div className="flex items-center gap-2">
                        <span>Chờ duyệt</span>
                        <Tag color="orange" className="px-2 py-0.5 text-xs m-0">
                            {countData?.PENDING ?? 0}
                        </Tag>
                    </div>
                ),
            },
            {
                key: "APPROVED",
                label: (
                    <div className="flex items-center gap-2">
                        <span>Đã duyệt</span>
                        <Tag color="green" className="px-2 py-0.5 text-xs m-0">
                            {countData?.APPROVED ?? 0}
                        </Tag>
                    </div>
                ),
            },
            {
                key: "REJECTED",
                label: (
                    <div className="flex items-center gap-2">
                        <span>Từ chối</span>
                        <Tag color="red" className="px-2 py-0.5 text-xs m-0">
                            {countData?.REJECTED ?? 0}
                        </Tag>
                    </div>
                ),
            },
        ],
        [countData]
    );

    // ========================= UI =========================
    return (
        <PageContainer
            title="Danh sách bài viết KANDO"
            filter={
                <div className="flex items-center gap-3">
                    <AutoComplete
                        className="w-full"
                        options={restaurantOptions}
                        value={searchInput}
                        onChange={(val) => {
                            setSearchInput(val);
                        }}
                        onSelect={(val) => {
                            setSearchInput(val);
                            setSearchValue(val); // giữ nguyên logic searchValue
                        }}
                        filterOption={false}
                    >
                        <Input.Search
                            placeholder="Tìm theo tiêu đề, người đăng hoặc tên nhà hàng..."
                            allowClear
                            onSearch={(val) => {
                                setSearchInput(val);
                                setSearchValue(val); // giữ nguyên logic searchValue
                            }}
                            onChange={(e) => {
                                const val = e.target.value;
                                setSearchInput(val);
                            }}
                        />
                    </AutoComplete>

                    <button
                        className="px-3 py-1.5 text-sm border rounded"
                        onClick={() => {
                            setSearchInput("");
                            setSearchValue("");
                            refetch();
                        }}
                    >
                        Reset
                    </button>
                </div>
            }
        >
            <Tabs
                activeKey={activeTab}
                items={tabItems}
                onChange={(key) => setActiveTab(key as KandoxPostStatus | "ALL")}
                className="mb-4"
            />

            {isFetching ? (
                <div className="py-12 text-center text-gray-500">Đang tải dữ liệu...</div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 pb-6">
                        {posts.map((post) => {
                            const expanded = expandedPosts[post.id!] || false;
                            const content = post.content || "";

                            const isTruncated = content.length > 300;

                            return (
                                <div
                                    key={post.id}
                                    className="bg-white rounded-lg border shadow flex flex-col overflow-hidden"
                                >
                                    <div className="p-3 flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            {post.createdByAvatar ? (
                                                <img
                                                    src={getAvatarPath(post.createdByAvatar)}
                                                    alt="avatar"
                                                    className="w-10 h-10 rounded-full object-cover border"
                                                    onError={(e) =>
                                                    ((e.target as HTMLImageElement).src =
                                                        "/no-avatar.png")
                                                    }
                                                />
                                            ) : (
                                                (() => {
                                                    const displayName =
                                                        post.createdByName ||
                                                        post.createdByEmail ||
                                                        "U";
                                                    const initials = displayName
                                                        .split(" ")
                                                        .filter(Boolean)
                                                        .map((w) => w[0]?.toUpperCase())
                                                        .slice(0, 2)
                                                        .join("");
                                                    const bgColors = [
                                                        "#1677ff",
                                                        "#fa8c16",
                                                        "#52c41a",
                                                        "#13c2c2",
                                                        "#eb2f96",
                                                    ];
                                                    const bg =
                                                        bgColors[
                                                        (displayName.charCodeAt(0) +
                                                            displayName.length) %
                                                        bgColors.length
                                                        ];
                                                    return (
                                                        <div
                                                            style={{
                                                                width: 40,
                                                                height: 40,
                                                                borderRadius: "50%",
                                                                backgroundColor: bg,
                                                                display: "flex",
                                                                alignItems: "center",
                                                                justifyContent: "center",
                                                                color: "#fff",
                                                                fontWeight: 600,
                                                                textTransform: "uppercase",
                                                                fontSize: 14,
                                                            }}
                                                        >
                                                            {initials || "U"}
                                                        </div>
                                                    );
                                                })()
                                            )}
                                            <div>
                                                <div className="font-semibold text-sm">
                                                    {post.createdByName || "Người dùng"}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {dayjs(post.createdAt).format("DD/MM/YYYY HH:mm")}
                                                </div>
                                            </div>
                                        </div>
                                        {post.unit?.name && (
                                            <Tag color="blue" className="text-xs px-2 py-0.5">
                                                {post.unit.name}
                                            </Tag>
                                        )}
                                    </div>

                                    <div className="px-3 pb-3 flex-1">
                                        {post.title && (
                                            <h3 className="text-sm font-semibold mb-1">{post.title}</h3>
                                        )}

                                        <div
                                            className="text-xs text-gray-700 whitespace-pre-line"
                                            style={{
                                                maxHeight: expanded || !isTruncated ? "none" : "120px",
                                                overflow: "hidden",
                                                position: "relative",
                                            }}
                                        >
                                            {expanded || !isTruncated
                                                ? content
                                                : `${content.substring(0, 300)}...`}
                                        </div>

                                        {isTruncated && (
                                            <button
                                                onClick={() =>
                                                    setExpandedPosts((prev) => ({
                                                        ...prev,
                                                        [post.id!]: !expanded,
                                                    }))
                                                }
                                                className="text-xs text-blue-600 mt-1 hover:underline"
                                            >
                                                {expanded ? "Thu gọn ▲" : "Xem thêm ▼"}
                                            </button>
                                        )}

                                        {renderImages(post)}
                                        {renderPdfFile(post)}
                                    </div>

                                    <div className="px-3 py-2 border-t flex justify-between items-center">
                                        {renderStatusBadge(post.status)}
                                        {post.status === "PENDING" && (
                                            <div className="flex gap-1">
                                                <Access
                                                    permission={ALL_PERMISSIONS.KANDO_POSTS.APPROVE}
                                                    hideChildren
                                                >
                                                    <button
                                                        onClick={() => {
                                                            setSelectedPost(post);
                                                            setModalType("approve");
                                                            setModalVisible(true);
                                                        }}
                                                        className="px-2 py-1 text-xs bg-blue-600 text-white rounded"
                                                    >
                                                        <CheckOutlined /> Duyệt
                                                    </button>
                                                </Access>
                                                <Access
                                                    permission={ALL_PERMISSIONS.KANDO_POSTS.REJECT}
                                                    hideChildren
                                                >
                                                    <button
                                                        onClick={() => {
                                                            setSelectedPost(post);
                                                            setModalType("reject");
                                                            setModalVisible(true);
                                                        }}
                                                        className="px-2 py-1 text-xs border border-red-400 text-red-600 rounded"
                                                    >
                                                        <CloseOutlined /> Từ chối
                                                    </button>
                                                </Access>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex justify-end pr-4">
                        <Pagination
                            current={meta.page}
                            total={meta.total}
                            pageSize={meta.pageSize}
                            showSizeChanger
                            showQuickJumper
                            onChange={(p, size) => {
                                setPage(p);
                                setPageSize(size);
                            }}
                            showTotal={(total, range) => (
                                <div style={{ fontSize: 13 }}>
                                    <span style={{ fontWeight: 500 }}>
                                        {range[0]}–{range[1]}
                                    </span>{" "}
                                    trên{" "}
                                    <span style={{ fontWeight: 600, color: "#1677ff" }}>
                                        {total.toLocaleString()}
                                    </span>{" "}
                                    bài viết
                                </div>
                            )}
                        />
                    </div>
                </>
            )}

            <Modal
                open={modalVisible}
                title={modalType === "approve" ? "Duyệt bài viết" : "Từ chối bài viết"}
                okText={modalType === "approve" ? "Duyệt" : "Từ chối"}
                cancelText="Hủy"
                okButtonProps={{
                    danger: modalType === "reject",
                    type: modalType === "approve" ? "primary" : "default",
                }}
                onCancel={() => setModalVisible(false)}
                onOk={handleConfirm}
            >
                <p>
                    {modalType === "approve"
                        ? "Bạn có chắc chắn muốn duyệt bài viết này?"
                        : "Bạn có chắc chắn muốn từ chối bài viết này?"}
                </p>
            </Modal>
        </PageContainer>
    );
};

export default KandoxPostsPage;