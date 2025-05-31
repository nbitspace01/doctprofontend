import { Dropdown, Button } from "antd";
import { DeleteIcon, EditIcon, ViewIcon } from "./SVG/svg.functions";

const CommonDropdown = ({
  onView,
  onEdit,
  onDelete,
}: {
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  const items = [
    {
      icon: <ViewIcon />,
      label: <span className="ml-2">View</span>,
      key: "view",
      onClick: onView,
    },
    {
      icon: <EditIcon />,
      label: <span className="ml-2">Edit</span>,
      key: "edit",
      onClick: onEdit,
    },
    {
      icon: <DeleteIcon />,
      label: <span className="ml-2">Delete</span>,
      key: "delete",
      onClick: onDelete,
    },
  ];

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
