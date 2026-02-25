import { useEffect, useState } from "react";
import { useAppSelector } from "@/redux/hooks";

interface IProps {
    children: (hasPermission: boolean) => React.ReactNode;
    permission: { method: string; apiPath: string; module: string };
}

const AccessDisabled = ({ permission, children }: IProps) => {
    const [allow, setAllow] = useState<boolean>(false);

    const permissions = useAppSelector(
        (state) => state.account?.user?.role?.permissions || []
    );

    useEffect(() => {
        if (permissions.length > 0) {
            const found = permissions.find(
                (item) =>
                    item.apiPath === permission.apiPath &&
                    item.method === permission.method &&
                    item.module === permission.module
            );
            setAllow(!!found);
        } else {
            setAllow(false);
        }
    }, [permissions, permission]);

    const aclDisabled = import.meta.env.VITE_ACL_ENABLE === "false";

    return <>{children(allow || aclDisabled)}</>;
};

export default AccessDisabled;
