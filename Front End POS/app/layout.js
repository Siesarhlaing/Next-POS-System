'use client';

import { useState, useEffect } from 'react';
import { Inter } from 'next/font/google';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Box, CssBaseline, AppBar, Toolbar, Typography, Drawer, 
  List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, IconButton 
} from '@mui/material';
import {
  Menu as MenuIcon, Home as HomeIcon, PointOfSale as CashierIcon,
  Category as CategoryIcon, Inventory as ItemIcon, SupervisorAccount as RoleIcon, People as UserIcon
} from '@mui/icons-material';

const inter = Inter({ subsets: ['latin'] });
const drawerWidth = 240;

export default function RootLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const router = useRouter();
  const pathname = usePathname();

  
  const isLoginPage = pathname === '/' || pathname === '/login';

  useEffect(() => {
   
    const token = localStorage.getItem('token'); 
    
    
    if (!token && !isLoginPage) {
      
      router.push('/');
    } else if (token && isLoginPage) {
      
      router.push('/home');
    }
    
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, [pathname, router]); 

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  
  const menuItems = [
    { text: 'Home', icon: <HomeIcon />, path: '/home' },
    { text: 'Cashier', icon: <CashierIcon />, path: '/cashier' },
    { text: 'Category', icon: <CategoryIcon />, path: '/category' },
    { text: 'Items', icon: <ItemIcon />, path: '/item' },
    { text: 'Roles', icon: <RoleIcon />, path: '/role' },
    { text: 'Users', icon: <UserIcon />, path: '/user' },
  ];

  const drawerContent = (
    <Box sx={{ bgcolor: '#ffffff', height: '100%', position: 'relative' }}>
      <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f8f9fa' }}>
        <Typography variant="h5" sx={{ fontWeight: '800', color: '#1976d2' }}>NEXT TGI POS</Typography>
      </Toolbar>
      <Divider />
      <List sx={{ px: 1, mt: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton 
              onClick={() => { router.push(item.path); setMobileOpen(false); }}
              sx={{ borderRadius: 2, '&:hover': { bgcolor: '#e3f2fd', color: '#1976d2', '& .MuiListItemIcon-root': { color: '#1976d2' } } }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: '#546e7a' }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} slotProps={{ typography: { fontWeight: '600', fontSize: '14px' } }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      
      <Box sx={{ p: 2, position: 'absolute', bottom: 0, width: '100%' }}>
        <Divider />
        <ListItemButton 
          onClick={() => { localStorage.removeItem('token'); router.push('/'); }}
          sx={{ borderRadius: 2, mt: 1, color: '#d32f2f', '&:hover': { bgcolor: '#ffebee' } }}
        >
          <ListItemText primary="Log Out" slotProps={{ typography: { fontWeight: '700' } }} />
        </ListItemButton>
      </Box>
    </Box>
  );

  if (loading) {
    return (
      <html lang="en">
        <body className={inter.className}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: '#f8f9fa' }}>
            <Typography variant="h6" color="text.secondary">Loading Application...</Typography>
          </Box>
        </body>
      </html>
    );
  }

  
  if (isLoginPage) {
    return (
      <html lang="en">
        <body className={inter.className} style={{ margin: 0 }}>
          <CssBaseline />
          {children}
        </body>
      </html>
    );
  }


  return (
    <html lang="en">
      <body className={inter.className} style={{ margin: 0, backgroundColor: '#f8f9fa' }}>
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
          <CssBaseline />
          
          <AppBar position="fixed" elevation={1} sx={{ width: { sm: `calc(100% - ${drawerWidth}px)` }, ml: { sm: `${drawerWidth}px` }, bgcolor: '#ffffff', color: '#2c3e50', borderBottom: '1px solid #e0e0e0' }}>
            <Toolbar>
              <IconButton color="inherit" aria-label="open drawer" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2, display: { sm: 'none' } }}>
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold' }}>
                POS Dashboard
              </Typography>
            </Toolbar>
          </AppBar>

          <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
            <Drawer variant="temporary" open={mobileOpen} onClose={handleDrawerToggle} ModalProps={{ keepMounted: true }} sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }}>
              {drawerContent}
            </Drawer>
            <Drawer variant="permanent" sx={{ display: { xs: 'none', sm: 'block' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }} open>
              {drawerContent}
            </Drawer>
          </Box>

          <Box component="main" sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` }, pt: '88px', bgcolor: '#f8f9fa' }}>
            {children}
          </Box>
        </Box>
      </body>
    </html>
  );
}