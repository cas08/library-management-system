import "@mantine/core/styles.css";
import { useEffect } from "react";
import { MantineProvider, Container, Title, Stack } from "@mantine/core";
import { AuthSection } from "./components/auth/AuthSection";
import { UsersSection } from "./components/users/UsersSection";
import { BooksSection } from "./components/books/BooksSection";
import { LoansSection } from "./components/loans/LoansSection";

export default function App() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token && window.opener) {
      window.opener.postMessage({ type: "google-auth", token }, window.location.origin);
      window.close();
    }
  }, []);

  return (
    <MantineProvider>
      <Container size="md" py="xl">
        <Title order={1} mb="xl">
          Library Management System
        </Title>
        <Stack gap="xl">
          <AuthSection />
          <BooksSection />
          <UsersSection />
          <LoansSection />
        </Stack>
      </Container>
    </MantineProvider>
  );
}
