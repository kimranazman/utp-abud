import { useState, useEffect } from "react"
import { 
  Home, 
  Users, 
  Building2, 
  FolderOpen, 
  Settings, 
  User,
  LogOut,
  Shield,
  MessageCircle,
  TrendingUp,
  HandCoins,
  Activity
} from "lucide-react"
import { NavLink, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { supabase } from '@/integrations/supabase/client'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"

const directoryItems = [
  { title: "Alumni Directory", url: "/abud/directory/alumni", icon: Users },
  { title: "Business Directory", url: "/abud/directory/business", icon: Building2 },
]

const mainItems = [
  { title: "Home", url: "/abud/", icon: Home },
  { title: "Directory", url: "/abud/directory", icon: FolderOpen },
]

export function AppSidebar() {
  const { state } = useSidebar()
  const location = useLocation()
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const currentPath = location.pathname
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const checkAdminRole = async () => {
      if (user) {
        try {
          const { data } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .eq('role', 'admin')
            .maybeSingle();
          
          setIsAdmin(!!data);
        } catch (error) {
          setIsAdmin(false);
        }
      }
    };

    checkAdminRole();
  }, [user])

  const isActive = (path: string) => currentPath === path
  const isDirectoryActive = directoryItems.some((item) => isActive(item.url)) || isActive("/directory")
  
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted/50"

  return (
    <Sidebar
      className={state === "collapsed" ? "w-14" : "w-60"}
    >
      {/* Header */}
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
            <Users className="h-5 w-5 text-primary-foreground" />
          </div>
          {state !== "collapsed" && (
            <div className="flex flex-col">
              <span className="font-semibold text-sm">UTP Alumni</span>
              <span className="text-xs text-muted-foreground">Directory</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end={item.url === "/"} 
                      className={getNavCls}
                    >
                      <item.icon className="h-4 w-4" />
                      {state !== "collapsed" && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Directory Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Directory</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {directoryItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="h-4 w-4" />
                      {state !== "collapsed" && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Business Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Business</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/abud/business/edit" className={getNavCls}>
                    <Building2 className="h-4 w-4" />
                    {state !== "collapsed" && <span>My Businesses</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin Section - Only visible to admins */}
        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to="/abud/admin"
                      className={({ isActive }) =>
                        isActive ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted/50"
                      }
                    >
                      <Shield className="h-4 w-4" />
                      {state !== "collapsed" && <span>Dashboard</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to="/abud/admin/analytics"
                      className={({ isActive }) =>
                        isActive ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted/50"
                      }
                    >
                      <TrendingUp className="h-4 w-4" />
                      {state !== "collapsed" && <span>Analytics</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to="/abud/admin/contributions"
                      className={({ isActive }) =>
                        isActive ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted/50"
                      }
                    >
                      <HandCoins className="h-4 w-4" />
                      {state !== "collapsed" && <span>Contributions</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to="/abud/admin/messages"
                      className={({ isActive }) =>
                        isActive ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted/50"
                      }
                    >
                      <MessageCircle className="h-4 w-4" />
                      {state !== "collapsed" && <span>Messages</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Profile Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Profile</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/abud/profile/edit" className={getNavCls}>
                    <User className="h-4 w-4" />
                    {state !== "collapsed" && <span>Edit Profile</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/abud/settings" className={getNavCls}>
                    <Settings className="h-4 w-4" />
                    {state !== "collapsed" && <span>Settings</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t p-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-muted rounded-full flex items-center justify-center">
            <User className="h-4 w-4" />
          </div>
          {state !== "collapsed" && (
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-sm font-medium truncate">
                {user?.user_metadata?.full_name || user?.email}
              </span>
              <span className="text-xs text-muted-foreground">Alumni</span>
            </div>
          )}
          <SidebarMenuButton
            size="sm"
            onClick={signOut}
            className="h-8 w-8 hover:bg-muted"
          >
            <LogOut className="h-4 w-4" />
          </SidebarMenuButton>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}