import {
  IconLayoutDashboard,
  IconCar,
  IconUsers,
  IconFlag,
  IconArticle,
  IconMail,
  IconNews,
  IconBuildingStore,
  IconArrowLeft,
} from "@tabler/icons-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "Overview", url: "/admin", icon: IconLayoutDashboard },
  { title: "Listings", url: "/admin/listings", icon: IconCar },
  { title: "Users", url: "/admin/users", icon: IconUsers },
  { title: "Reports", url: "/admin/reports", icon: IconFlag },
  { title: "Blog", url: "/admin/blog", icon: IconArticle },
  { title: "Contact Messages", url: "/admin/contacts", icon: IconMail },
  { title: "Newsletter", url: "/admin/newsletter", icon: IconNews },
  { title: "Dealer Applications", url: "/admin/dealers", icon: IconBuildingStore },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/admin"}
                      className="hover:bg-muted/50"
                      activeClassName="bg-muted text-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink to="/" className="hover:bg-muted/50">
                <IconArrowLeft className="mr-2 h-4 w-4 shrink-0" />
                {!collapsed && <span>Back to Site</span>}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
