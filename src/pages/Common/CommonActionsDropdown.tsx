import { Dropdown, Button } from "antd";
import { DeleteIcon, EditIcon, ViewIcon } from "./SVG/svg.functions";
import type { MenuProps } from "antd";

const CommonDropdown = ({
  onView,
  onEdit,
  onDelete,
  showView = true,
  showEdit = true,
  showDelete = true,
}: {
  onView: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showView?: boolean;
  showEdit?: boolean;
  showDelete?: boolean;
}) => {
  const items = [
    showView && {
      icon: <ViewIcon />,
      label: <span className="ml-2">View</span>,
      key: "view",
      onClick: onView,
    },
    onEdit && showEdit && {
      icon: <EditIcon />,
      label: <span className="ml-2">Edit</span>,
      key: "edit",
      onClick: onEdit,
    },
    onDelete && showDelete && {
      icon: <DeleteIcon />,
      label: <span className="ml-2">Delete</span>,
      key: "delete",
      onClick: onDelete,
    },
  ].filter(Boolean) as MenuProps["items"];

  return (
    <Dropdown menu={{ items }} trigger={["click"]}>
      <Button
        type="text"
        className="flex items-center justify-center w-10 h-8 px-3"
      >
        •••
      </Button>
    </Dropdown>
  );
};

export default CommonDropdown;
