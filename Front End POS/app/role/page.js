'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box, Card, CardContent, CardHeader, Typography, Grid, TextField, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, Accordion, AccordionSummary, AccordionDetails, TablePagination,
  Snackbar, Alert, LinearProgress
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  AddCircle as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon
} from '@mui/icons-material';

import roleService from '@/services/role.service';
import constants from "@/utils/constants";



export default function RoleListPage() {
  const router = useRouter();

  // States
  const [items, setItems] = useState([]);
  const [recordTotal, setRecordTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Notification State
  const [snackbar, setSnackbar] = useState({ open: false, text: '', color: 'success' });

  // Pagination & Search State
  const [searchName, setSearchName] = useState('');
  const [pagination, setPagination] = useState({
    page: 0, 
    itemsPerPage: 10,
    sortBy: 'id',
    sortOrder: 'desc'
  });

  const showSnackbar = (text, color = 'success') => {
    setSnackbar({ open: true, text, color });
  };


  const getAllRoles = () => {
    setLoading(true);
    
    
    const apiParams = {
      search: { name: searchName },
      page: pagination.page + 1, 
      itemsPerPage: pagination.itemsPerPage,
      sortBy: [{ key: pagination.sortBy, order: pagination.sortOrder }]
    };

    roleService.GetAll(apiParams)
      .then((res) => {
        setItems(res.data?.data || []);
        setRecordTotal(res.data?.total || 0);
      })
      .catch((err) => {
        if (err.message === constants.UnauthorizeMsg) {
          showSnackbar('Unauthorized Access', 'error');
        } else {
          showSnackbar(err.message || 'Error fetching roles', 'error');
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    getAllRoles();
  }, [pagination.page, pagination.itemsPerPage]);

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 0 })); 
    getAllRoles();
  };

  const handleReset = () => {
    setSearchName('');
    setPagination(prev => ({ ...prev, page: 0 }));
    
    setTimeout(() => getAllRoles(), 50);
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure want to delete ?")) {
      roleService.Delete(id)
        .then((res) => {
          showSnackbar(res.data?.message || 'Deleted successfully', res.data?.success ? 'success' : 'error');
          getAllRoles();
        })
        .catch((err) => {
          showSnackbar(err.message, 'error');
        });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Search Accordion */}
      <Accordion defaultExpanded sx={{ mb: 3, borderRadius: '8px !important' }} elevation={2}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography sx={{ fontWeight: 'bold' }}>Search</Typography>
        </AccordionSummary>
        
          <AccordionDetails>
  {}
  <Grid container spacing={2} sx={{ alignItems: 'center' }}>
    
    {}
    <Grid xs={12} sm={2} sx={{ textAlign: { sm: 'right' } }}>
      <Typography>Name</Typography>
    </Grid>
    
    {}
            <Grid xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                variant="outlined"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
              />
            </Grid>
            <Grid xs={12} sm={6} sx={{ textAlign: 'right' }}>
              <Button variant="contained" color="warning" size="small" onClick={handleReset} sx={{ mr: 2 }}>
                Clear
              </Button>
              <Button variant="contained" color="primary" size="small" onClick={handleSearch}>
                Search
              </Button>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {}
      <Card elevation={2} sx={{ borderRadius: 2 }}>
        <CardHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton color="primary" onClick={() => router.push('/role/entry')}>
                <AddIcon fontSize="large" />
              </IconButton>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Role List</Typography>
            </Box>
          }
        />
        {loading && <LinearProgress />}
        <CardContent sx={{ p: 0 }}>
          <TableContainer component={Paper} square elevation={0}>
            <Table size="small">
              <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', width: '150px' }}>Action</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.length === 0 && !loading ? (
                  <TableRow>
                    <TableCell colSpan={2} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                      No roles found.
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell>
                        <IconButton color="error" size="small" onClick={() => handleDelete(row.id)} sx={{ mr: 1 }}>
                          <DeleteIcon />
                        </IconButton>
                        <IconButton color="warning" size="small" onClick={() => router.push(`/role/entry?id=${row.id}`)}>
                          <EditIcon />
                        </IconButton>
                      </TableCell>
                      <TableCell>{row.name}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={recordTotal}
            page={pagination.page}
            onPageChange={(e, newPage) => setPagination(prev => ({ ...prev, page: newPage }))}
            rowsPerPage={pagination.itemsPerPage}
            onRowsPerPageChange={(e) => setPagination(prev => ({ ...prev, itemsPerPage: parseInt(e.target.value, 10), page: 0 }))}
            rowsPerPageOptions={[1, 2, 3, 10, 20, 40, 80, 100]}
          />
        </CardContent>
      </Card>

      {/* Global Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity={snackbar.color === 'success' ? 'success' : 'error'} sx={{ width: '100%' }}>
          {snackbar.text}
        </Alert>
      </Snackbar>
    </Box>
  );
}