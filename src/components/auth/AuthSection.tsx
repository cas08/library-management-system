import {useState, useEffect} from "react";
import {Avatar, Badge, Button, Group, Modal, PasswordInput, Stack, Text, TextInput} from "@mantine/core";
import {useDisclosure} from "@mantine/hooks";
import {apiFetch, API, clearToken, getToken, resolveAssetUrl, setToken} from "../../api/apiFetch";
import {Section} from "../shared/Section";
import {ResultModal} from "../shared/ResultModal";
import type {AuthUser} from "../../types/frontend";

export function AuthSection() {
    const [result, setResult] = useState<unknown>(null);
    const [res, {open: openRes, close: closeRes}] = useDisclosure(false);

    const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
    const [authVersion, setAuthVersion] = useState(0);

    const [registerModal, {open: openRegister, close: closeRegister}] = useDisclosure(false);
    const [regForm, setRegForm] = useState({name: "", email: "", password: ""});

    const [loginModal, {open: openLogin, close: closeLogin}] = useDisclosure(false);
    const [loginForm, setLoginForm] = useState({email: "", password: ""});

    const [requestResetModal, {open: openRequestReset, close: closeRequestReset}] = useDisclosure(false);
    const [requestResetForm, setRequestResetForm] = useState({email: ""});

    const [resetModal, {open: openReset, close: closeReset}] = useDisclosure(false);
    const [resetForm, setResetForm] = useState({token: "", password: ""});

    const show = (data: unknown) => {
        setResult(data);
        openRes();
    };

    useEffect(() => {
        let cancelled = false;
        apiFetch("/users/me").then((r) => {
            if (cancelled) return;
            setCurrentUser(r.ok ? r.data as AuthUser : null);
        });
        return () => {
            cancelled = true;
        };
    }, [authVersion]);

    const handleAuthSuccess = (token: string) => {
        setToken(token);
        setAuthVersion((v) => v + 1);
    };

    const handleLogout = () => {
        clearToken();
        setCurrentUser(null);
    };

    useEffect(() => {
        const handler = (event: MessageEvent) => {
            if (event.origin !== window.location.origin) return;
            if (event.data?.type === "google-auth" && event.data?.token) {
                handleAuthSuccess(event.data.token);
            }
        };
        window.addEventListener("message", handler);
        return () => window.removeEventListener("message", handler);
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const resetToken = params.get("reset");
        if (resetToken) {
            setResetForm({token: resetToken, password: ""});
            openReset();
            params.delete("reset");
            const qs = params.toString();
            window.history.replaceState(null, "", window.location.pathname + (qs ? `?${qs}` : ""));
        }
    }, [openReset]);

    const handleGoogleLogin = () => {
        const width = 500;
        const height = 600;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;
        window.open(
            `${API}/auth/google`,
            "google-oauth",
            `width=${width},height=${height},left=${left},top=${top}`
        );
    };

    const avatarSrc = resolveAssetUrl(currentUser?.avatarUrl);

    return (
        <Section title="Auth" color="violet">
            <Group gap="sm" align="center">
                {currentUser ? (
                    <>
                        <Avatar src={avatarSrc} alt={currentUser.name} radius="xl" size="md"/>
                        <Badge color="green" size="lg" variant="light">
                            {currentUser.name} ({currentUser.role})
                        </Badge>
                    </>
                ) : (
                    <Badge color="gray" size="lg" variant="light">
                        Not logged in
                    </Badge>
                )}
            </Group>

            <Button variant="light" color="green" onClick={openRegister}>
                POST /auth/register
            </Button>
            <Modal opened={registerModal} onClose={closeRegister} title="Register" centered>
                <Stack>
                    <TextInput label="Name" value={regForm.name} onChange={(e) => {
                        const v = e.target.value;
                        setRegForm((f) => ({...f, name: v}));
                    }}/>
                    <TextInput label="Email" value={regForm.email} onChange={(e) => {
                        const v = e.target.value;
                        setRegForm((f) => ({...f, email: v}));
                    }}/>
                    <PasswordInput label="Password (min 8 chars)" value={regForm.password} onChange={(e) => {
                        const v = e.target.value;
                        setRegForm((f) => ({...f, password: v}));
                    }}/>
                    <Button color="green" onClick={async () => {
                        closeRegister();
                        const r = await apiFetch("/auth/register", {method: "POST", body: JSON.stringify(regForm)});
                        if (r.ok && r.data.token) handleAuthSuccess(r.data.token);
                        show(r.data);
                    }}>Register</Button>
                </Stack>
            </Modal>

            <Button variant="light" color="teal" onClick={openLogin}>
                POST /auth/login
            </Button>
            <Modal opened={loginModal} onClose={closeLogin} title="Login" centered>
                <Stack>
                    <TextInput label="Email" value={loginForm.email} onChange={(e) => {
                        const v = e.target.value;
                        setLoginForm((f) => ({...f, email: v}));
                    }}/>
                    <PasswordInput label="Password" value={loginForm.password} onChange={(e) => {
                        const v = e.target.value;
                        setLoginForm((f) => ({...f, password: v}));
                    }}/>
                    <Button color="teal" onClick={async () => {
                        closeLogin();
                        const r = await apiFetch("/auth/login", {method: "POST", body: JSON.stringify(loginForm)});
                        if (r.ok && r.data.token) handleAuthSuccess(r.data.token);
                        show(r.data);
                    }}>Login</Button>
                </Stack>
            </Modal>

            <Button variant="light" color="indigo" onClick={handleGoogleLogin}>
                Google OAuth
            </Button>

            <Button variant="light" color="orange" onClick={openRequestReset}>
                POST /auth/request-password-reset
            </Button>
            <Modal opened={requestResetModal} onClose={closeRequestReset} title="Forgot password" centered>
                <Stack>
                    <Text size="sm" c="dimmed">
                        Введіть email - якщо він зареєстрований, надішлемо лист з посиланням.
                    </Text>
                    <TextInput label="Email" value={requestResetForm.email} onChange={(e) => {
                        const v = e.target.value;
                        setRequestResetForm({email: v});
                    }}/>
                    <Button color="orange" onClick={async () => {
                        closeRequestReset();
                        const r = await apiFetch("/auth/request-password-reset", {
                            method: "POST",
                            body: JSON.stringify(requestResetForm),
                        });
                        show(r.data);
                    }}>Send reset email</Button>
                </Stack>
            </Modal>

            <Button variant="light" color="yellow" onClick={openReset}>
                POST /auth/reset-password
            </Button>
            <Modal opened={resetModal} onClose={closeReset} title="Reset password" centered>
                <Stack>
                    <Text size="sm" c="dimmed">
                        Вставте токен з листа та задайте новий пароль.
                    </Text>
                    <TextInput label="Reset token" value={resetForm.token} onChange={(e) => {
                        const v = e.target.value;
                        setResetForm((f) => ({...f, token: v}));
                    }}/>
                    <PasswordInput label="New password (min 8 chars)" value={resetForm.password} onChange={(e) => {
                        const v = e.target.value;
                        setResetForm((f) => ({...f, password: v}));
                    }}/>
                    <Button color="yellow" onClick={async () => {
                        closeReset();
                        const r = await apiFetch("/auth/reset-password", {
                            method: "POST",
                            body: JSON.stringify(resetForm),
                        });
                        show(r.data);
                        if (r.ok) setResetForm({token: "", password: ""});
                    }}>Reset password</Button>
                </Stack>
            </Modal>

            {currentUser && (
                <Button variant="light" color="red" onClick={handleLogout}>
                    Logout
                </Button>
            )}

            {getToken() && (
                <Button variant="subtle" size="xs" color="gray" onClick={() => {
                    navigator.clipboard.writeText(getToken()!);
                    show({message: "Token copied to clipboard", token: getToken()});
                }}>
                    <Text size="xs">Copy JWT</Text>
                </Button>
            )}

            <ResultModal opened={res} onClose={closeRes} result={result}/>
        </Section>
    );
}
