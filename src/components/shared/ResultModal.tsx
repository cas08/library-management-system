import {Modal, Code} from "@mantine/core";

interface ResultModalProps {
    opened: boolean;
    onClose: () => void;
    result: unknown;
}

export function ResultModal({opened, onClose, result}: ResultModalProps) {
    return (
        <Modal opened={opened} onClose={onClose} title="Result" size="lg" centered>
            <Code block style={{whiteSpace: "pre-wrap", wordBreak: "break-all"}}>
                {JSON.stringify(result, null, 2)}
            </Code>
        </Modal>
    );
}
