import {useState} from "react";
import {Avatar, Button, FileInput, Group, Modal, Stack, Text, TextInput} from "@mantine/core";
import {useDisclosure} from "@mantine/hooks";
import {API, apiFetch, resolveAssetUrl} from "../../api/apiFetch";
import {Section} from "../shared/Section";
import {ResultModal} from "../shared/ResultModal";

export function UsersSection() {
    const [result, setResult] = useState<unknown>(null);
    const [res, {open: openRes, close: closeRes}] = useDisclosure(false);

    const [getIdModal, {open: openGetId, close: closeGetId}] = useDisclosure(false);
    const [getUserId, setGetUserId] = useState("");

    const [avatarModal, {open: openAvatar, close: closeAvatar}] = useDisclosure(false);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    const show = (data: unknown) => {
        setResult(data);
        openRes();
    };

    const refreshAvatar = async () => {
        const r = await apiFetch("/users/me");
        if (r.ok && r.data && typeof r.data === "object") {
            const url = resolveAssetUrl((r.data as { avatarUrl?: string | null }).avatarUrl);
            setAvatarPreview(url ? `${url}?t=${Date.now()}` : null);
        }
    };

    return (
        <Section title="Users" color="blue">
            <Button variant="light" onClick={async () => {
                show((await apiFetch("/users")).data);
            }}>
                GET /users
            </Button>

            <Button variant="light" onClick={async () => {
                show((await apiFetch("/users/me")).data);
            }}>
                GET /users/me
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
                    <Button onClick={async () => {
                        closeGetId();
                        show((await apiFetch(`/users/${getUserId}`)).data);
                    }}>
                        Send
                    </Button>
                </Stack>
            </Modal>

            <Button variant="light" color="cyan" onClick={async () => {
                await refreshAvatar();
                openAvatar();
            }}>
                Avatar
            </Button>
            <Modal opened={avatarModal} onClose={closeAvatar} title="My avatar" centered>
                <Stack>
                    <Group>
                        <Avatar src={avatarPreview} size={96} radius="xl"/>
                        <Text size="sm" c="dimmed">
                            JPEG або PNG, до 5 МБ. Зображення стискається до 512×512.
                        </Text>
                    </Group>
                    <FileInput
                        label="Виберіть файл"
                        placeholder="avatar.jpg"
                        accept="image/jpeg,image/png"
                        value={avatarFile}
                        onChange={setAvatarFile}
                    />
                    <Group>
                        <Button
                            color="cyan"
                            disabled={!avatarFile}
                            onClick={async () => {
                                if (!avatarFile) return;
                                const fd = new FormData();
                                fd.append("avatar", avatarFile);
                                const r = await apiFetch("/users/me/avatar", {method: "POST", body: fd});
                                show(r.data);
                                if (r.ok) {
                                    setAvatarFile(null);
                                    await refreshAvatar();
                                }
                            }}
                        >
                            POST /users/me/avatar
                        </Button>
                        <Button
                            color="red"
                            variant="light"
                            onClick={async () => {
                                const r = await apiFetch("/users/me/avatar", {method: "DELETE"});
                                show(r.data);
                                if (r.ok) {
                                    setAvatarPreview(null);
                                }
                            }}
                        >
                            DELETE /users/me/avatar
                        </Button>
                    </Group>
                    <Text size="xs" c="dimmed">
                        Файли локального драйвера віддаються з <code>{API}/uploads/avatars/…</code>
                    </Text>
                </Stack>
            </Modal>

            <ResultModal opened={res} onClose={closeRes} result={result}/>
        </Section>
    );
}
