import {Stack, Group, Badge, Divider} from "@mantine/core";
import type {ReactNode} from "react";

interface SectionProps {
    title: string;
    color: string;
    children: ReactNode;
}

export function Section({title, color, children}: SectionProps) {
    return (
        <Stack gap="xs">
            <Group gap="xs" align="center">
                <Badge color={color} size="lg" variant="filled" radius="sm">
                    {title}
                </Badge>
            </Group>
            <Divider/>
            <Group gap="sm" wrap="wrap">
                {children}
            </Group>
        </Stack>
    );
}
