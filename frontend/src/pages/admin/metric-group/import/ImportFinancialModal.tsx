import ImportBaseModal from "./ImportBaseModal";
import { callImportFinancialScores } from "@/config/api";

export default function ImportFinancialModal(props: any) {
    return (
        <ImportBaseModal
            {...props}
            title="Import Excel đồng hồ TÀI CHÍNH (Khối Nhà Hàng)"
            apiCall={callImportFinancialScores}
        />
    );
}
