import React, { useState } from "react";
import "@/styles/tooplate-neural-style.css";
import { callUploadSingleFile } from "@/config/api";
import { useCreateKandoxPostMutation } from "@/hooks/useKandoxPostsQuery";
import type { IKandoxPost } from "@/types/backend";
import { Image, message } from "antd";
import { DeleteOutlined, UploadOutlined, FilePdfOutlined } from "@ant-design/icons";

const KandoPostPage: React.FC = () => {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [images, setImages] = useState<string[]>([]);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const createPost = useCreateKandoxPostMutation();

    const backendURL = import.meta.env.VITE_BACKEND_URL;

    /** ====== Upload file dùng chung ====== */
    const handleUploadFile = async (
        e: React.ChangeEvent<HTMLInputElement>,
        type: "image" | "pdf"
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validation
        if (type === "image") {
            if (!file.type.startsWith("image/")) {
                message.error("Vui lòng chọn file ảnh hợp lệ!");
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                message.warning("Ảnh không được vượt quá 5MB!");
                return;
            }
            if (images.length >= 3) {
                message.warning("Chỉ được tải tối đa 3 ảnh!");
                return;
            }
        } else {
            if (file.type !== "application/pdf") {
                message.error("Chỉ được tải lên file PDF!");
                return;
            }
            if (file.size > 10 * 1024 * 1024) {
                message.warning("File PDF không được vượt quá 10MB!");
                return;
            }
        }

        setUploading(true);
        try {
            const res = await callUploadSingleFile(file, "kando");
            const fileName = res?.data?.fileName;
            if (fileName) {
                if (type === "image") {
                    setImages((prev) => [...prev, fileName]);
                    message.success("Tải ảnh thành công!");
                } else {
                    setPdfUrl(fileName);
                    message.success("Tải PDF thành công!");
                }
            }
        } catch {
            message.error("Lỗi khi tải file!");
        } finally {
            setUploading(false);
            e.target.value = "";
        }
    };

    /** ====== Xóa ảnh hoặc PDF ====== */
    const handleRemoveImage = (idx: number) =>
        setImages((prev) => prev.filter((_, i) => i !== idx));
    const handleRemovePdf = () => setPdfUrl(null);

    /** ====== Gửi bài viết ====== */
    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) {
            message.warning("Vui lòng nhập đầy đủ tiêu đề và nội dung!");
            return;
        }

        const payload: IKandoxPost = {
            title,
            content,
            imageUrl1: images[0] || undefined,
            imageUrl2: images[1] || undefined,
            imageUrl3: images[2] || undefined,
            url: pdfUrl || undefined,
            status: "PENDING",
        };

        createPost.mutate(payload, {
            onSuccess: () => {
                message.success("Tạo bài viết KANDO thành công!");
                setTitle("");
                setContent("");
                setImages([]);
                setPdfUrl(null);
            },
            onError: () => {
                message.error("Tạo bài viết thất bại!");
            },
        });
    };

    return (
        <section id="contact">
            <h2 className="section-title">BÀI VIẾT KANDO</h2>
            <form className="contact-form glass-card" onSubmit={handleFormSubmit}>
                {/* Tiêu đề */}
                <div className="form-group">
                    <input
                        type="text"
                        placeholder="Tiêu đề bài viết"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>

                {/* Nội dung */}
                <div className="form-group">
                    <textarea
                        rows={6}
                        placeholder="Nội dung bài viết"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                    ></textarea>
                </div>

                {/* ====== Upload ảnh + PDF nằm ngang ====== */}
                <div
                    className="form-group"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-start",
                        flexWrap: "wrap",
                        gap: "25px",
                        marginBottom: "25px",
                    }}
                >
                    {/* Upload ảnh */}
                    <div>
                        <label
                            htmlFor="upload-image"
                            style={{
                                display: "block",
                                marginBottom: "8px",
                                fontSize: "14px",
                                opacity: 0.8,
                            }}
                        >
                            Ảnh minh họa (tối đa 3 ảnh)
                        </label>

                        <label
                            htmlFor="upload-image"
                            className="upload-btn"
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "8px",
                                padding: "8px 18px",
                                borderRadius: "20px",
                                background:
                                    "linear-gradient(90deg, #00e5ff, #ff00ff)",
                                color: "#fff",
                                cursor: uploading ? "not-allowed" : "pointer",
                                opacity: uploading ? 0.7 : 1,
                                fontSize: "13px",
                                fontWeight: 600,
                                border: "none",
                            }}
                        >
                            <UploadOutlined /> Tải ảnh
                        </label>
                        <input
                            id="upload-image"
                            type="file"
                            accept="image/*"
                            disabled={uploading || images.length >= 3}
                            onChange={(e) => handleUploadFile(e, "image")}
                            style={{ display: "none" }}
                        />
                    </div>

                    {/* Upload PDF */}
                    <div>
                        <label
                            htmlFor="upload-pdf"
                            style={{
                                display: "block",
                                marginBottom: "8px",
                                fontSize: "14px",
                                opacity: 0.8,
                            }}
                        >
                            File đính kèm (PDF)
                        </label>

                        <label
                            htmlFor="upload-pdf"
                            className="upload-btn"
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "8px",
                                padding: "8px 18px",
                                borderRadius: "20px",
                                background:
                                    "linear-gradient(90deg, #ff00ff, #00e5ff)",
                                color: "#fff",
                                cursor: uploading ? "not-allowed" : "pointer",
                                opacity: uploading ? 0.7 : 1,
                                fontSize: "13px",
                                fontWeight: 600,
                                border: "none",
                            }}
                        >
                            <FilePdfOutlined /> Tải PDF
                        </label>
                        <input
                            id="upload-pdf"
                            type="file"
                            accept="application/pdf"
                            disabled={uploading}
                            onChange={(e) => handleUploadFile(e, "pdf")}
                            style={{ display: "none" }}
                        />
                    </div>
                </div>

                {/* ====== Preview ảnh ====== */}
                {images.length > 0 && (
                    <Image.PreviewGroup>
                        <div
                            style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: "10px",
                                marginBottom: "15px",
                            }}
                        >
                            {images.map((img, idx) => {
                                const url = img.startsWith("http")
                                    ? img
                                    : `${backendURL}/uploads/kando/${img}`;
                                return (
                                    <div
                                        key={idx}
                                        style={{
                                            position: "relative",
                                            width: "120px",
                                            height: "120px",
                                            borderRadius: "8px",
                                            overflow: "hidden",
                                            border:
                                                "1px solid rgba(255,255,255,0.2)",
                                        }}
                                    >
                                        <Image
                                            src={url}
                                            alt={`preview-${idx}`}
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                objectFit: "cover",
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveImage(idx)}
                                            style={{
                                                position: "absolute",
                                                top: 6,
                                                right: 6,
                                                background: "rgba(0,0,0,0.6)",
                                                border: "none",
                                                borderRadius: "6px",
                                                cursor: "pointer",
                                                padding: "4px 6px",
                                                color: "#fff",
                                            }}
                                        >
                                            <DeleteOutlined />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </Image.PreviewGroup>
                )}

                {/* ====== Hiển thị PDF đã tải ====== */}
                {pdfUrl && (
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            marginBottom: "20px",
                        }}
                    >
                        <FilePdfOutlined
                            style={{ color: "#f87171", fontSize: "18px" }}
                        />
                        <a
                            href={`${backendURL}/uploads/kando/${pdfUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                color: "#f87171",
                                textDecoration: "underline",
                                fontSize: "13px",
                            }}
                        >
                            {pdfUrl}
                        </a>
                        <button
                            type="button"
                            onClick={handleRemovePdf}
                            style={{
                                background: "transparent",
                                border: "none",
                                color: "#ff7676",
                                cursor: "pointer",
                            }}
                        >
                            <DeleteOutlined />
                        </button>
                    </div>
                )}

                {/* Submit */}
                <button
                    type="submit"
                    className="neural-btn"
                    disabled={createPost.isPending || uploading}
                >
                    {createPost.isPending || uploading
                        ? "Đang xử lý..."
                        : "ĐĂNG BÀI VIẾT"}
                </button>
            </form>
        </section>
    );
};

export default KandoPostPage;
