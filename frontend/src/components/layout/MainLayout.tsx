import { getDashboardStats } from "@/features/dashboard/api/dashboardApi";
import { useAuthStore } from "@/stores/authStore";
import {
  AppShell,
  Badge,
  Burger,
  Button,
  Group,
  NavLink,
  Text,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { Link, Outlet, useLocation } from "react-router-dom";

interface NavItem {
  label: string;
  link: string;
  allowedRoles?: string[];
}

const navData: NavItem[] = [
  { label: "Dashboard", link: "/app/dashboard" },
  { label: "Tickets", link: "/app/tickets" },
  {
    label: "My Approvals",
    link: "/app/approvals",
    allowedRoles: ["Admin", "Technician"],
  },
  {
    label: "Departments",
    link: "/app/departments",
    allowedRoles: ["Admin", "Technician"],
  },
  { label: "Users", link: "/app/users", allowedRoles: ["Admin", "Technician"] },
  {
    label: "Assets",
    link: "/app/assets",
    allowedRoles: ["Admin", "Technician"],
  },
];

export function MainLayout() {
  const [opened, { toggle }] = useDisclosure();
  const { logout, user } = useAuthStore();
  const location = useLocation();

  const { data: stats } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: getDashboardStats,
    enabled: !!user,
    refetchInterval: 30000,
  });

  const links = navData.map((item) => {
    if (
      item.allowedRoles &&
      (!user || !item.allowedRoles.includes(user.role))
    ) {
      return null;
    }

    let rightSection = undefined;
    if (item.label === "Tickets" && stats && stats.openTickets > 0) {
      rightSection = (
        <Badge color="red" size="sm" variant="filled" circle>
          {stats.openTickets}
        </Badge>
      );
    }

    return (
      <NavLink
        key={item.label}
        label={item.label}
        component={Link}
        to={item.link}
        variant="filled"
        fw={500}
        rightSection={rightSection}
        active={location.pathname.startsWith(item.link)}
        onClick={() => {
          if (opened) toggle();
        }}
      />
    );
  });

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 250, breakpoint: "sm", collapsed: { mobile: !opened } }}
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
            <Text size="sm" visibleFrom="sm">
              {user?.email}
            </Text>
            <Button size="sm" variant="outline" onClick={logout}>
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
