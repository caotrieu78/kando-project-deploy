import ImportBaseModal from "./ImportBaseModal";
import { callImportCustomerScores } from "@/config/api";

export default function ImportCustomerModal(props: any) {
    return (
        <ImportBaseModal
            {...props}
            title="Import Excel đồng hồ KHÁCH HÀNG (Khối Nhà Hàng)"
            apiCall={callImportCustomerScores}
        />
    );
}
