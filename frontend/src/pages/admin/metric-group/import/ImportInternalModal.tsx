import ImportBaseModal from "./ImportBaseModal";
import { callImportInternalScores } from "@/config/api";

export default function ImportInternalModal(props: any) {
    return (
        <ImportBaseModal
            {...props}
            title="Import Excel đồng hồ NỘI BỘ (Khối Nhà Hàng)"
            apiCall={callImportInternalScores}
        />
    );
}
