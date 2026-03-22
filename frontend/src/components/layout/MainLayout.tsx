import { getDashboardStats } from "@/features/dashboard/api/dashboardApi";
import { useNotifications } from "@/features/notifications/hooks/useNotifications";
import { formatLocalClockTime, getTicketStatusColor } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import {
  ActionIcon,
  AppShell,
  Badge,
  Burger,
  Button,
  Divider,
  Group,
  Indicator,
  NavLink,
  Popover,
  ScrollArea,
  Stack,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconBell } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";

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
    allowedRoles: ["Admin"],
  },
  {
    label: "Departments",
    link: "/app/departments",
    allowedRoles: ["Admin", "Technician"],
  },
  { label: "Users", link: "/app/users", allowedRoles: ["Admin"] },
  {
    label: "Assets",
    link: "/app/assets",
    allowedRoles: ["Admin", "Technician"],
  },
];

export function MainLayout() {
  const openStatusColor = getTicketStatusColor("Open");
  const [opened, { toggle }] = useDisclosure();
  const [popoverOpened, setPopoverOpened] = useState(false);
  const { logout, user } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const { notifications, markAsRead, markAllAsSeen } = useNotifications();
  const unseenCount = notifications.filter((n) => !n.isSeen).length;

  const { data: stats } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: getDashboardStats,
    enabled: !!user,
    refetchInterval: 30000,
  });

  const handleNotificationClick = async (
    notificationId: number,
    isRead: boolean,
    relatedTicketId: number | null,
    message: string,
  ) => {
    if (!isRead) {
      await markAsRead(notificationId);
    }

    setPopoverOpened(false);
    if (relatedTicketId) {
      if (message.toLowerCase().includes("approval")) {
        if (user?.role === "Admin") {
          navigate("/app/approvals");
        } else {
          navigate(`/app/tickets/${relatedTicketId}`);
        }
      } else {
        navigate(`/app/tickets/${relatedTicketId}`);
      }
    }
  };

  const links = navData.map((item) => {
    if (
      item.allowedRoles &&
      (!user || !item.allowedRoles.includes(user.role))
    ) {
      return null;
    }

    const isActive = location.pathname.startsWith(item.link);

    let rightSection = undefined;
    if (item.label === "Tickets" && stats && stats.openTickets > 0) {
      rightSection = (
        <Badge
          color={openStatusColor}
          size="sm"
          variant="filled"
          circle
          style={
            isActive
              ? {
                  backgroundColor: "white",
                  color: `var(--mantine-color-${openStatusColor}-7)`,
                  border: `1px solid var(--mantine-color-${openStatusColor}-7)`,
                }
              : undefined
          }
        >
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
        active={isActive}
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
            <Popover
              width={320}
              position="bottom-end"
              withArrow
              shadow="md"
              opened={popoverOpened}
              onChange={setPopoverOpened}
            >
              <Popover.Target>
                <Indicator
                  color="red"
                  size={18}
                  label={unseenCount}
                  disabled={unseenCount === 0}
                  offset={4}
                >
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    size="lg"
                    radius="xl"
                    onClick={() => {
                      const willOpen = !popoverOpened;
                      setPopoverOpened(willOpen);
                      if (willOpen && unseenCount > 0) {
                        markAllAsSeen().catch(console.error);
                      }
                    }}
                  >
                    <IconBell size={20} />
                  </ActionIcon>
                </Indicator>
              </Popover.Target>

              <Popover.Dropdown p={0}>
                <Text
                  fw={600}
                  p="xs"
                  bg="gray.0"
                  style={{ borderBottom: "1px solid #eee" }}
                >
                  Notifications ({notifications.length})
                </Text>

                <ScrollArea.Autosize mah={350}>
                  {notifications.length === 0 ? (
                    <Text p="md" c="dimmed" size="sm" ta="center">
                      All caught up!
                    </Text>
                  ) : (
                    <Stack gap={0}>
                      {notifications.map((n) => (
                        <div key={n.id}>
                          <UnstyledButton
                            w="100%"
                            p="sm"
                            onClick={() =>
                              handleNotificationClick(
                                n.id,
                                n.isRead,
                                n.relatedTicketId,
                                n.message,
                              ).catch(console.error)
                            }
                            style={(theme) => ({
                              backgroundColor: n.isRead
                                ? "transparent"
                                : theme.colors.blue[0],
                              "&:hover": {
                                backgroundColor: theme.colors.gray[1],
                              },
                            })}
                          >
                            <Text size="sm" fw={n.isRead ? 400 : 600}>
                              {n.message}
                            </Text>
                            <Text size="xs" c="dimmed" mt={4}>
                              {formatLocalClockTime(n.createdAt)}
                            </Text>
                          </UnstyledButton>
                          <Divider />
                        </div>
                      ))}
                    </Stack>
                  )}
                </ScrollArea.Autosize>
              </Popover.Dropdown>
            </Popover>

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
