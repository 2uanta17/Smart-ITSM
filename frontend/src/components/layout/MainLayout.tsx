import { useAuthStore } from "@/stores/authStore";
import { AppShell, Group, Burger, Text, NavLink, Button } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconDeviceDesktopAnalytics,
  IconHierarchy2,
  IconUserShield,
} from "@tabler/icons-react";
import { Link, Outlet, useLocation } from "react-router-dom";

const navData = [
  {
    label: "Dashboard",
    link: "/app/dashboard",
    icon: IconDeviceDesktopAnalytics,
  },
  {
    label: "Departments",
    link: "/app/departments",
    icon: IconHierarchy2,
    adminOnly: true,
  },
  { label: "Users", link: "/app/users", icon: IconUserShield, adminOnly: true },
];

export function MainLayout() {
  const [opened, { toggle }] = useDisclosure();
  const { logout, user } = useAuthStore();
  const location = useLocation();

  const links = navData.map((item) => {
    if (item.adminOnly && user?.role !== "Admin") return null;

    return (
      <NavLink
        key={item.label}
        label={item.label}
        component={Link}
        to={item.link}
        leftSection={<item.icon size={20} />}
        variant="filled"
        fw={500}
        active={location.pathname.startsWith(item.link)}
      />
    );
  });

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: "sm", collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
            />
            <Text fw={700}>IT Service Management</Text>
          </Group>
          <Group>
            <Text size="sm">{user?.email}</Text>
            <Button
              size="sm"
              variant="outline"
              style={{ cursor: "pointer" }}
              onClick={logout}
            >
              Logout
            </Button>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">{links}</AppShell.Navbar>

      <AppShell.Main bg="gray.0">
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
