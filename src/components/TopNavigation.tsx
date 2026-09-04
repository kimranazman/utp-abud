import { NavLink, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { useAvatarUrl } from "@/hooks/useAvatarUrl"
import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useIsMobile } from "@/hooks/use-mobile"
import { useUnreadMessages } from "@/hooks/useUnreadMessages"
import { NotificationBadge } from "@/components/ui/notification-badge"
import { CartButton } from "@/components/shop/CartButton"
import {
  Home,
  Users,
  Briefcase,
  Settings as SettingsIcon,
  User,
  LogOut,
  Shield,
  Globe,
  MessageCircle,
  Edit,
  LayoutDashboard,
  Menu,
  X,
  ChevronRight,
  ShoppingBag
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"

const mainItems = [
  { title: "Home", url: "/abud/", icon: Home },
]

const directoryItems = [
  { title: "Alumni Directory", url: "/abud/directory/alumni", icon: Users },
  { title: "Business Directory", url: "/abud/directory/business", icon: Briefcase },
]

export function TopNavigation() {
  const { user, signOut } = useAuth()
  const { thumbnailUrl } = useAvatarUrl()
  const navigate = useNavigate()
  const location = useLocation()
  const isMobile = useIsMobile()
  const { unreadCount, hasUnread } = useUnreadMessages()
  const [isAdmin, setIsAdmin] = useState(false)
  const [userBusinesses, setUserBusinesses] = useState<any[]>([])
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileName, setProfileName] = useState<string | null>(null)

  // Detect current section
  const isShopSection = location.pathname.startsWith('/shop')
  const isAbudSection = location.pathname.startsWith('/abud') || location.pathname === '/'


  useEffect(() => {
    async function checkAdminRole() {
      if (!user) return

      // Check if user has admin role - for now, we'll set this to false
      // This can be updated when the admin role system is implemented
      setIsAdmin(false)
    }

    async function fetchUserBusinesses() {
      if (!user) return

      const { data, error } = await supabase
        .from('user_businesses')
        .select('id, business_name')
        .eq('user_id', user.id)
        .eq('current_business', true)
        .order('created_at', { ascending: false })

      if (!error && data) {
        setUserBusinesses(data)
      }
    }

    async function fetchUserProfile() {
      if (!user) return

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', user.id)
        .single()

      if (!error && profile?.full_name) {
        setProfileName(profile.full_name)
      }
    }

    checkAdminRole()
    fetchUserBusinesses()
    fetchUserProfile()
  }, [user])

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? "text-utp-blue font-medium border-b-2 border-utp-blue"
      : "text-foreground hover:bg-utp-blue hover:text-white rounded-md"

  const handleMobileNavigation = (url: string) => {
    navigate(url)
    setMobileMenuOpen(false)
  }

  const handleSignOut = () => {
    signOut()
    setMobileMenuOpen(false)
  }

  return (
    <header className="h-14 border-b bg-background backdrop-blur-sm fixed top-0 left-0 right-0 z-50">
      <div className="container flex items-center justify-between h-full px-4">
        {/* Logo/Brand */}
        <div className="flex items-center gap-6">
          <NavLink
            to="/abud/"
            className="flex items-center gap-2 font-semibold text-lg text-foreground hover:text-utp-blue transition-colors"
          >
            <img
              src="/logo.svg"
              alt="UTP ABuD Logo"
              className="h-8 w-auto"
            />
            UTP ABuD
          </NavLink>

          {/* Desktop Navigation */}
          {!isMobile && (
            <nav className="flex items-center gap-6">
              {/* Cross-section navigation */}
              {isShopSection ? (
                <>
                  <NavLink
                    to="/shop"
                    end
                    className={({ isActive }) => `
                      flex items-center gap-2 px-3 py-2 text-sm transition-colors
                      ${getNavCls({ isActive })}
                    `}
                  >
                    <Home className="h-4 w-4" />
                    Shop Home
                  </NavLink>
                  <NavLink
                    to="/abud"
                    className={({ isActive }) => `
                      flex items-center gap-2 px-3 py-2 text-sm transition-colors
                      ${getNavCls({ isActive })}
                    `}
                  >
                    <Users className="h-4 w-4" />
                    Alumni Directory
                  </NavLink>
                </>
              ) : (
                <>
                  {mainItems.map((item) => (
                    <NavLink
                      key={item.title}
                      to={item.url}
                      end
                      className={({ isActive }) => `
                        flex items-center gap-2 px-3 py-2 text-sm transition-colors
                        ${getNavCls({ isActive })}
                      `}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.title}
                    </NavLink>
                  ))}

                  {/* Directory Submenu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-foreground">
                        <Briefcase className="h-4 w-4 mr-2" />
                        Directories
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      {directoryItems.map((item) => (
                        <DropdownMenuItem key={item.title} asChild>
                          <NavLink
                            to={item.url}
                            className="flex items-center gap-2 w-full"
                          >
                            <item.icon className="h-4 w-4" />
                            {item.title}
                          </NavLink>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* World Map Link */}
                  <NavLink
                    to="/abud/directory/alumni/map"
                    end
                    className={({ isActive }) => `
                      flex items-center gap-2 px-3 py-2 text-sm transition-colors
                      ${getNavCls({ isActive })}
                    `}
                  >
                    <Globe className="h-4 w-4" />
                    World Map
                  </NavLink>

                  {/* Shop Link - TEMPORARILY HIDDEN */}
                  {/* <NavLink
                    to="/shop"
                    className={({ isActive }) => `
                      flex items-center gap-2 px-3 py-2 text-sm transition-colors
                      ${getNavCls({ isActive })}
                    `}
                  >
                    <ShoppingBag className="h-4 w-4" />
                    Shop
                  </NavLink> */}

                  {/* Admin Link */}
                  {isAdmin && (
                    <NavLink
                      to="/abud/admin"
                      className={({ isActive }) => `
                        flex items-center gap-2 px-3 py-2 text-sm transition-colors
                        ${getNavCls({ isActive })}
                      `}
                    >
                      <Shield className="h-4 w-4" />
                      Admin
                    </NavLink>
                  )}
                </>
              )}
            </nav>
          )}
        </div>

        {/* Desktop User Menu and Messages */}
        {!isMobile && (
          <div className="flex items-center gap-2">
            {/* Cart Button - TEMPORARILY HIDDEN */}
            {/* <CartButton /> */}

            {/* Messages Link */}
            {user && (
              <NavLink
                to="/abud/chat"
                className={({ isActive }) => `
                  relative flex items-center gap-2 px-3 py-2 text-sm transition-colors
                  ${getNavCls({ isActive })}
                `}
              >
                <div className="relative">
                  <MessageCircle className="h-4 w-4" />
                  <NotificationBadge count={unreadCount} showCount={unreadCount <= 9} />
                </div>
                Messages
              </NavLink>
            )}

            {/* User Menu */}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8 cursor-pointer">
                      <AvatarImage src={thumbnailUrl || undefined} />
                      <AvatarFallback>
                        {user.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate(`/abud/profile/edit`)}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    User Dashboard
                  </DropdownMenuItem>
                  {userBusinesses.length > 0 && (
                    <>
                      <DropdownMenuItem onClick={() => navigate(`/abud/business/${userBusinesses[0].id}/edit`)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Business
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuItem onClick={() => navigate(`/abud/profile/${user?.id}`)}>
                    <User className="mr-2 h-4 w-4" />
                    View Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/abud/settings')}>
                    <SettingsIcon className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Sign In / Sign Up buttons for non-authenticated users */}
            {!user && (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  onClick={() => navigate('/abud/auth')}
                >
                  Sign In
                </Button>
                <Button
                  variant="default"
                  className="bg-utp-blue hover:bg-utp-blue/90"
                  onClick={() => navigate('/abud/auth')}
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Mobile Actions */}
        {isMobile && (
          <div className="flex items-center gap-1">
            {/* Mobile Cart Icon - TEMPORARILY HIDDEN */}
            {/* <CartButton /> */}

            {/* Mobile Message Icon */}
            {user && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/abud/chat')}
                className="h-9 w-9 relative flex items-center justify-center"
                aria-label={`Messages ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
              >
                <MessageCircle className="h-5 w-5" />
                <NotificationBadge count={unreadCount} showCount={unreadCount <= 9} />
              </Button>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(true)}
              className="h-9 w-9"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </div>
        )}

        {/* Mobile Menu Sheet */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="right" className="w-[300px] sm:w-[350px]">
            <SheetHeader className="flex flex-row items-center gap-3 pb-2">
              <img
                src="/logo.svg"
                alt="UTP ABuD Logo"
                className="h-8 w-auto"
              />
              <SheetTitle>UTP ABuD</SheetTitle>
            </SheetHeader>

            <div className="mt-6 flex flex-col gap-4">
              {/* User Section */}
              {user && (
                <>
                  <div className="flex items-center gap-3 px-2">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={thumbnailUrl || undefined} />
                      <AvatarFallback>
                        {user.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <p className="text-sm font-medium">{profileName || user.email?.split('@')[0] || 'User'}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* Main Navigation */}
              <div className="flex flex-col gap-1">
                {isShopSection ? (
                  <>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => handleMobileNavigation('/shop')}
                    >
                      <Home className="mr-3 h-4 w-4" />
                      Shop Home
                    </Button>

                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => handleMobileNavigation('/abud')}
                    >
                      <Users className="mr-3 h-4 w-4" />
                      Alumni Directory
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => handleMobileNavigation('/abud/')}
                    >
                      <Home className="mr-3 h-4 w-4" />
                      Home
                    </Button>

                    {/* Directories Section */}
                    <div className="mt-2 mb-1 px-3">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Directories
                      </p>
                    </div>
                    {directoryItems.map((item) => (
                      <Button
                        key={item.title}
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => handleMobileNavigation(item.url)}
                      >
                        <item.icon className="mr-3 h-4 w-4" />
                        {item.title}
                      </Button>
                    ))}

                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => handleMobileNavigation('/abud/directory/alumni/map')}
                    >
                      <Globe className="mr-3 h-4 w-4" />
                      World Map
                    </Button>

                    {/* Shop Button - TEMPORARILY HIDDEN */}
                    {/* <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => handleMobileNavigation('/shop')}
                    >
                      <ShoppingBag className="mr-3 h-4 w-4" />
                      Shop
                    </Button> */}
                  </>
                )}

                {/* Messages (authenticated only) */}
                {user && (
                  <Button
                    variant="ghost"
                    className="w-full justify-start relative"
                    onClick={() => handleMobileNavigation('/abud/chat')}
                  >
                    <div className="relative mr-3">
                      <MessageCircle className="h-4 w-4" />
                      <NotificationBadge count={unreadCount} showCount={false} />
                    </div>
                    Messages
                    {unreadCount > 0 && (
                      <span className="ml-auto text-xs text-muted-foreground">
                        {unreadCount}
                      </span>
                    )}
                  </Button>
                )}

                {/* Admin (admin only) */}
                {isAdmin && (
                  <>
                    <Separator className="my-2" />
                    <div className="mt-1 mb-1 px-3">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Administration
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => handleMobileNavigation('/abud/admin')}
                    >
                      <Shield className="mr-3 h-4 w-4" />
                      Admin Dashboard
                    </Button>
                  </>
                )}
              </div>

              {/* User Actions (authenticated only) */}
              {user && (
                <>
                  <Separator />
                  <div className="flex flex-col gap-1">
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => handleMobileNavigation('/abud/profile/edit')}
                    >
                      <LayoutDashboard className="mr-3 h-4 w-4" />
                      User Dashboard
                    </Button>

                    {userBusinesses.length > 0 && (
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => handleMobileNavigation(`/abud/business/${userBusinesses[0].id}/edit`)}
                      >
                        <Edit className="mr-3 h-4 w-4" />
                        Edit Business
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => handleMobileNavigation(`/abud/profile/${user?.id}`)}
                    >
                      <User className="mr-3 h-4 w-4" />
                      View Profile
                    </Button>

                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => handleMobileNavigation('/abud/settings')}
                    >
                      <SettingsIcon className="mr-3 h-4 w-4" />
                      Settings
                    </Button>
                  </div>

                  <Separator />
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-red-600 hover:text-red-600 hover:bg-red-50"
                    onClick={handleSignOut}
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    Sign Out
                  </Button>
                </>
              )}

              {/* Sign In (non-authenticated) */}
              {!user && (
                <>
                  <Separator />
                  <Button
                    variant="default"
                    className="w-full"
                    onClick={() => handleMobileNavigation('/abud/auth')}
                  >
                    Sign In
                  </Button>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}