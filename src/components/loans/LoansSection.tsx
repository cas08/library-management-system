import { useState } from "react";
import { Button, Modal, Stack, TextInput } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { apiFetch } from "../../api/apiFetch";
import { Section } from "../shared/Section";
import { ResultModal } from "../shared/ResultModal";

export function LoansSection() {
  const [result, setResult] = useState<unknown>(null);
  const [res, { open: openRes, close: closeRes }] = useDisclosure(false);

  const [createModal, { open: openCreate, close: closeCreate }] = useDisclosure(false);
  const [newLoan, setNewLoan] = useState({ userId: "", bookId: "" });

  const [returnModal, { open: openReturn, close: closeReturn }] = useDisclosure(false);
  const [returnLoanId, setReturnLoanId] = useState("");

  const show = (data: unknown) => { setResult(data); openRes(); };

  return (
    <Section title="🔄 Loans" color="orange">
      <Button variant="light" color="orange" onClick={async () => { show((await apiFetch("/loans")).data); }}>
        GET /loans
      </Button>

      <Button variant="light" color="orange" onClick={openCreate}>POST /loans</Button>
      <Modal opened={createModal} onClose={closeCreate} title="Issue Book (Create Loan)" centered>
        <Stack>
          <TextInput label="User ID" value={newLoan.userId} onChange={(e) => { const v = e.target.value; setNewLoan((l) => ({ ...l, userId: v })); }} />
          <TextInput label="Book ID" value={newLoan.bookId} onChange={(e) => { const v = e.target.value; setNewLoan((l) => ({ ...l, bookId: v })); }} />
          <Button color="orange" onClick={async () => {
            closeCreate();
            show((await apiFetch("/loans", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newLoan) })).data);
          }}>Issue</Button>
        </Stack>
      </Modal>

      <Button variant="light" color="orange" onClick={openReturn}>POST /loans/:id/return</Button>
      <Modal opened={returnModal} onClose={closeReturn} title="Return Book" centered>
        <Stack>
          <TextInput label="Loan ID" value={returnLoanId} onChange={(e) => setReturnLoanId(e.target.value)} />
          <Button color="orange" onClick={async () => {
            closeReturn();
            show((await apiFetch(`/loans/${returnLoanId}/return`, { method: "POST" })).data);
          }}>Return</Button>
        </Stack>
      </Modal>

      <ResultModal opened={res} onClose={closeRes} result={result} />
    </Section>
  );
}
