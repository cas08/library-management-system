import {useState, useEffect} from "react";
import {Button, Modal, Stack, TextInput, PasswordInput, Badge, Group, Text} from "@mantine/core";
import {useDisclosure} from "@mantine/hooks";
import {apiFetch, getToken, setToken, clearToken, API} from "../../api/apiFetch";
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

    return (
        <Section title="Auth" color="violet">
            <Group gap="sm" align="center">
                {currentUser ? (
                    <Badge color="green" size="lg" variant="light">
                        {currentUser.name} ({currentUser.role})
                    </Badge>
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
                    <TextInput label="Name" value={regForm.name}
                               onChange={(e) => {
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
