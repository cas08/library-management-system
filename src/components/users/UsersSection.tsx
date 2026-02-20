import { useState } from "react";
import { Button, Modal, Stack, TextInput } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { apiFetch } from "../../api/apiFetch";
import { Section } from "../shared/Section";
import { ResultModal } from "../shared/ResultModal";

export function UsersSection() {
  const [result, setResult] = useState<unknown>(null);
  const [res, { open: openRes, close: closeRes }] = useDisclosure(false);

  const [getIdModal, { open: openGetId, close: closeGetId }] = useDisclosure(false);
  const [getUserId, setGetUserId] = useState("");

  const [createModal, { open: openCreate, close: closeCreate }] = useDisclosure(false);
  const [newUser, setNewUser] = useState({ name: "", email: "" });

  const show = (data: unknown) => { setResult(data); openRes(); };

  return (
    <Section title="👤 Users" color="blue">
      <Button variant="light" onClick={async () => { show((await apiFetch("/users")).data); }}>
        GET /users
      </Button>

      <Button variant="light" onClick={openGetId}>GET /users/:id</Button>
      <Modal opened={getIdModal} onClose={closeGetId} title="Get User by ID" centered>
        <Stack>
          <TextInput
            label="User ID"
            placeholder="Enter user id"
            value={getUserId}
            onChange={(e) => setGetUserId(e.target.value)}
          />
          <Button onClick={async () => { closeGetId(); show((await apiFetch(`/users/${getUserId}`)).data); }}>
            Send
          </Button>
        </Stack>
      </Modal>

      <Button variant="light" onClick={openCreate}>POST /users</Button>
      <Modal opened={createModal} onClose={closeCreate} title="Create User" centered>
        <Stack>
          <TextInput
            label="Name"
            value={newUser.name}
            onChange={(e) => { const v = e.target.value; setNewUser((u) => ({ ...u, name: v })); }}
          />
          <TextInput
            label="Email"
            value={newUser.email}
            onChange={(e) => { const v = e.target.value; setNewUser((u) => ({ ...u, email: v })); }}
          />
          <Button
            onClick={async () => {
              closeCreate();
              show((await apiFetch("/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newUser),
              })).data);
            }}
          >
            Create
          </Button>
        </Stack>
      </Modal>

      <ResultModal opened={res} onClose={closeRes} result={result} />
    </Section>
  );
}
