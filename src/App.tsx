import "@mantine/core/styles.css";
import { MantineProvider, Container, Title, Stack } from "@mantine/core";
import { UsersSection } from "./components/users/UsersSection";
import { BooksSection } from "./components/books/BooksSection";
import { LoansSection } from "./components/loans/LoansSection";

export default function App() {
  return (
    <MantineProvider>
      <Container size="md" py="xl">
        <Title order={1} mb="xl">
          📚 Library Management System
        </Title>
        <Stack gap="xl">
          <UsersSection />
          <BooksSection />
          <LoansSection />
        </Stack>
      </Container>
    </MantineProvider>
  );
}