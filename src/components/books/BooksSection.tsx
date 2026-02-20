import { useState } from "react";
import { Button, Modal, Stack, TextInput, NumberInput, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { apiFetch } from "../../api/apiFetch";
import { Section } from "../shared/Section";
import { ResultModal } from "../shared/ResultModal";

export function BooksSection() {
  const [result, setResult] = useState<unknown>(null);
  const [res, { open: openRes, close: closeRes }] = useDisclosure(false);

  const [getIdModal, { open: openGetId, close: closeGetId }] = useDisclosure(false);
  const [getBookId, setGetBookId] = useState("");

  const [createModal, { open: openCreate, close: closeCreate }] = useDisclosure(false);
  const [newBook, setNewBook] = useState({ title: "", author: "", year: new Date().getFullYear(), isbn: "" });

  const [updateModal, { open: openUpdate, close: closeUpdate }] = useDisclosure(false);
  const [updBook, setUpdBook] = useState({ id: "", title: "", author: "", year: new Date().getFullYear(), isbn: "", available: "true" });

  const [deleteModal, { open: openDelete, close: closeDelete }] = useDisclosure(false);
  const [deleteBookId, setDeleteBookId] = useState("");

  const show = (data: unknown) => { setResult(data); openRes(); };

  return (
    <Section title="📘 Books" color="green">
      <Button variant="light" color="green" onClick={async () => { show((await apiFetch("/books")).data); }}>
        GET /books
      </Button>

      <Button variant="light" color="green" onClick={openGetId}>GET /books/:id</Button>
      <Modal opened={getIdModal} onClose={closeGetId} title="Get Book by ID" centered>
        <Stack>
          <TextInput label="Book ID" value={getBookId} onChange={(e) => setGetBookId(e.target.value)} />
          <Button color="green" onClick={async () => { closeGetId(); show((await apiFetch(`/books/${getBookId}`)).data); }}>Send</Button>
        </Stack>
      </Modal>

      <Button variant="light" color="green" onClick={openCreate}>POST /books</Button>
      <Modal opened={createModal} onClose={closeCreate} title="Create Book" centered>
        <Stack>
          <TextInput label="Title" value={newBook.title} onChange={(e) => { const v = e.target.value; setNewBook((b) => ({ ...b, title: v })); }} />
          <TextInput label="Author" value={newBook.author} onChange={(e) => { const v = e.target.value; setNewBook((b) => ({ ...b, author: v })); }} />
          <NumberInput label="Year" value={newBook.year} onChange={(v) => setNewBook((b) => ({ ...b, year: Number(v) }))} />
          <TextInput label="ISBN" value={newBook.isbn} onChange={(e) => { const v = e.target.value; setNewBook((b) => ({ ...b, isbn: v })); }} />
          <Button color="green" onClick={async () => {
            closeCreate();
            show((await apiFetch("/books", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newBook) })).data);
          }}>Create</Button>
        </Stack>
      </Modal>

      <Button variant="light" color="green" onClick={openUpdate}>PUT /books/:id</Button>
      <Modal opened={updateModal} onClose={closeUpdate} title="Update Book" centered>
        <Stack>
          <TextInput label="Book ID" value={updBook.id} onChange={(e) => { const v = e.target.value; setUpdBook((b) => ({ ...b, id: v })); }} />
          <TextInput label="Title" value={updBook.title} onChange={(e) => { const v = e.target.value; setUpdBook((b) => ({ ...b, title: v })); }} />
          <TextInput label="Author" value={updBook.author} onChange={(e) => { const v = e.target.value; setUpdBook((b) => ({ ...b, author: v })); }} />
          <NumberInput label="Year" value={updBook.year} onChange={(v) => setUpdBook((b) => ({ ...b, year: Number(v) }))} />
          <TextInput label="ISBN" value={updBook.isbn} onChange={(e) => { const v = e.target.value; setUpdBook((b) => ({ ...b, isbn: v })); }} />
          <TextInput label='Available ("true" / "false")' value={updBook.available} onChange={(e) => { const v = e.target.value; setUpdBook((b) => ({ ...b, available: v })); }} />
          <Button color="green" onClick={async () => {
            const { id, available, ...rest } = updBook;
            closeUpdate();
            show((await apiFetch(`/books/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...rest, available: available === "true" }) })).data);
          }}>Update</Button>
        </Stack>
      </Modal>

      <Button variant="light" color="red" onClick={openDelete}>DELETE /books/:id</Button>
      <Modal opened={deleteModal} onClose={closeDelete} title="Delete Book" centered>
        <Stack>
          <Text size="sm" c="dimmed">This will permanently delete the book.</Text>
          <TextInput label="Book ID" value={deleteBookId} onChange={(e) => setDeleteBookId(e.target.value)} />
          <Button color="red" onClick={async () => {
            closeDelete();
            show((await apiFetch(`/books/${deleteBookId}`, { method: "DELETE" })).data);
          }}>Delete</Button>
        </Stack>
      </Modal>

      <ResultModal opened={res} onClose={closeRes} result={result} />
    </Section>
  );
}
