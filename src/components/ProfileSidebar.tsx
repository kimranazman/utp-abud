import { useState, useEffect } from "react"
import { NavLink, useLocation, useNavigate } from "react-router-dom"
import {
  User,
  FileText,
  Briefcase,
  Award,
  Link,
  Users,
  Eye,
  Settings,
  ArrowLeft,
  MessageCircle,
  Shield,
  TrendingUp,
  HandCoins
} from "lucide-react"
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
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar"

const profileItems = [
  { title: "Personal Details", url: "/abud/profile/edit", icon: User, stepId: 'personal' },
  { title: "Career History", url: "/abud/profile/edit", icon: Briefcase, stepId: 'career' },
  { title: "Businesses", url: "/abud/profile/edit", icon: Users, stepId: 'businesses' },
  { title: "Achievements", url: "/abud/profile/edit", icon: Award, stepId: 'achievements' },
  { title: "Contributions", url: "/abud/profile/edit", icon: FileText, stepId: 'contributions' },
  { title: "Links", url: "/abud/profile/edit", icon: Link, stepId: 'links' },
]

const profileActions = [
  { title: "Edit Profile", url: "/abud/profile/edit", icon: User },
  { title: "Messages", url: "/abud/chat", icon: MessageCircle },
  { title: "Settings", url: "/abud/settings", icon: Settings },
]

export function ProfileSidebar() {
  const { state } = useSidebar()
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
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
  
  const handleSectionClick = (stepId: string) => {
    // Navigate to ProfileEdit and trigger the edit for that specific section
    navigate('/abud/profile/edit')
    // Use a small delay to ensure the component is mounted before triggering the section edit
    setTimeout(() => {
      const event = new CustomEvent('editProfileSection', { detail: stepId })
      window.dispatchEvent(event)
    }, 100)
  }
  
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted/50"

  return (
    <Sidebar
      className={state === "collapsed" ? "w-14" : "w-60"}
    >
      {/* Header */}
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-2">
          <NavLink
            to="/abud/"
            className="flex items-center gap-2 hover:opacity-70 transition-opacity"
          >
            <ArrowLeft className="h-4 w-4" />
            {state !== "collapsed" && <span className="text-sm">Back to Directory</span>}
          </NavLink>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Profile Sections */}
        <SidebarGroup>
          <SidebarGroupLabel>Profile Sections</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {profileItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <button 
                      onClick={() => handleSectionClick(item.stepId)}
                      className="flex items-center gap-2 w-full p-2 text-left hover:bg-muted/50 rounded-md"
                    >
                      <item.icon className="h-4 w-4" />
                      {state !== "collapsed" && <span>{item.title}</span>}
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
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
                    <button
                      onClick={() => navigate('/abud/admin')}
                      className="flex items-center gap-2 w-full p-2 text-left hover:bg-muted/50 rounded-md"
                    >
                      <Shield className="h-4 w-4" />
                      {state !== "collapsed" && <span>Dashboard</span>}
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <button
                      onClick={() => navigate('/abud/admin/analytics')}
                      className="flex items-center gap-2 w-full p-2 text-left hover:bg-muted/50 rounded-md"
                    >
                      <TrendingUp className="h-4 w-4" />
                      {state !== "collapsed" && <span>Analytics</span>}
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <button
                      onClick={() => navigate('/abud/admin/contributions')}
                      className="flex items-center gap-2 w-full p-2 text-left hover:bg-muted/50 rounded-md"
                    >
                      <HandCoins className="h-4 w-4" />
                      {state !== "collapsed" && <span>Contributions</span>}
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <button
                      onClick={() => navigate('/abud/admin/messages')}
                      className="flex items-center gap-2 w-full p-2 text-left hover:bg-muted/50 rounded-md"
                    >
                      <MessageCircle className="h-4 w-4" />
                      {state !== "collapsed" && <span>Messages</span>}
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Profile Actions */}
        <SidebarGroup>
          <SidebarGroupLabel>Actions</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {profileActions.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <button 
                      onClick={() => navigate(item.url)}
                      className="flex items-center gap-2 w-full p-2 text-left hover:bg-muted/50 rounded-md"
                    >
                      <item.icon className="h-4 w-4" />
                      {state !== "collapsed" && <span>{item.title}</span>}
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}