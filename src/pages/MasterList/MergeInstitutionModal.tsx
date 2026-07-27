import React, { useMemo, useState } from "react";
import { Modal, Select, Alert, Typography } from "antd";

export interface MergeCandidate {
  id: string;
  name: string;
  /** Optional secondary label (e.g. branch/city/status) to disambiguate. */
  hint?: string;
}

/**
 * Merge a duplicate/misspelled institution (source) into a canonical one
 * (target). Every profile that referenced the source by name is reassigned to
 * the target on the backend, then the source row is deleted. Use this instead
 * of a plain delete whenever an entry is a wrong copy of one that should stay.
 */
const MergeInstitutionModal: React.FC<{
  open: boolean;
  entityLabel: string; // e.g. "hospital"
  source: MergeCandidate | null;
  candidates: MergeCandidate[];
  loading?: boolean;
  onCancel: () => void;
  onConfirm: (targetId: string) => void;
}> = ({ open, entityLabel, source, candidates, loading, onCancel, onConfirm }) => {
  const [targetId, setTargetId] = useState<string | undefined>();

  const options = useMemo(
    () =>
      candidates
        .filter((c) => c.id !== source?.id)
        .map((c) => ({
          value: c.id,
          label: c.hint ? `${c.name} — ${c.hint}` : c.name,
        })),
    [candidates, source],
  );

  const handleConfirm = () => {
    if (targetId) onConfirm(targetId);
  };

  return (
    <Modal
      title={`Merge ${entityLabel}`}
      open={open}
      okText="Merge & delete duplicate"
      okButtonProps={{ danger: true, disabled: !targetId, loading }}
      onOk={handleConfirm}
      onCancel={() => {
        setTargetId(undefined);
        onCancel();
      }}
      destroyOnClose
    >
      <Alert
        type="warning"
        showIcon
        className="mb-4"
        message={
          <span>
            All profiles that reference{" "}
            <Typography.Text strong>{source?.name}</Typography.Text> will be
            moved to the {entityLabel} you pick, then{" "}
            <Typography.Text strong>{source?.name}</Typography.Text> is deleted.
            This cannot be undone.
          </span>
        }
      />
      <div className="mb-2 text-sm text-gray-600">
        Keep this {entityLabel} (the correct one):
      </div>
      <Select
        showSearch
        className="w-full"
        placeholder={`Search for the correct ${entityLabel}…`}
        value={targetId}
        onChange={setTargetId}
        options={options}
        optionFilterProp="label"
        filterOption={(input, option) =>
          String(option?.label ?? "")
            .toLowerCase()
            .includes(input.toLowerCase())
        }
      />
    </Modal>
  );
};

export default MergeInstitutionModal;
