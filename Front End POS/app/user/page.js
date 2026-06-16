'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Grid, 
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TablePagination,
  Snackbar,
  Alert,
  LinearProgress,
  Autocomplete,
  Avatar
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  AddCircle as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon
} from '@mui/icons-material';

import userService from '@/services/user.service';
import constants from "@/utils/constants";

export default function UserListPage() {
  const router = useRouter();
  const port = "http://localhost:8080";

 
  const [items, setItems] = useState([]);
  const [roleList, setRoleList] = useState([]);
  const [recordTotal, setRecordTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, text: '', color: 'success' });

  // Filter Search States
  const [searchName, setSearchName] = useState('');
  const [selectedRole, setSelectedRole] = useState(null);

  // Pagination State
  const [page, setPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const showSnackbar = (text, color = 'success') => {
    setSnackbar({ open: true, text, color });
  };

  
  useEffect(() => {
    userService.GetRoleList()
      .then((res) => {
        setRoleList(res.data || []);
      })
      .catch((err) => showSnackbar(err.message, 'error'));
  }, []);

  
  const getAllUsers = () => {
    setLoading(true);
    
    const apiParams = {
      search: {
        name: searchName,
        role_id: selectedRole ? selectedRole.id : ""
      },
      page: page + 1, 
      itemsPerPage,
      sortBy: [{ key: "id", order: "desc" }]
    };

    userService.GetAll(apiParams)
      .then((res) => {
        setItems(res.data?.data || []);
        setRecordTotal(res.data?.total || 0);
      })
      .catch((err) => {
        if (err.message === constants.UnauthorizeMsg) {
          showSnackbar('Unauthorized Access', 'error');
        } else {
          showSnackbar(err.message || 'Error fetching users', 'error');
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  
  useEffect(() => {
    getAllUsers();
  }, [page, itemsPerPage]);

  const handleSearch = () => {
    setPage(0);
    getAllUsers();
  };

  const handleReset = () => {
    setSearchName('');
    setSelectedRole(null);
    setPage(0);
    setTimeout(() => getAllUsers(), 50);
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure want to delete this user?")) {
      userService.Delete(id)
        .then((res) => {
          const isSuccess = res.data?.success;
          showSnackbar(res.data?.message || 'Deleted successfully', isSuccess ? 'success' : 'error');
          getAllUsers();
        })
        .catch((err) => showSnackbar(err.message, 'error'));
    }
  };

  return (
    <Box sx={{ p: 3, width: '100%' }}>
      
      {}
      <Accordion defaultExpanded sx={{ mb: 3, borderRadius: '8px !important' }} elevation={2}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography sx={{ fontWeight: 'bold' }}>Search Option</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {}
          <Grid container spacing={2} sx={{ alignItems: 'center' }}>
            
            <Grid xs={12} sm={1} sx={{ textAlign: { sm: 'right' } }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Name</Typography>
            </Grid>
            <Grid xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                variant="outlined"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
              />
            </Grid>

            <Grid xs={12} sm={1} sx={{ textAlign: { sm: 'right' } }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Role</Typography>
            </Grid>
            <Grid xs={12} sm={4}>
              <Autocomplete
                size="small"
                options={roleList}
                getOptionLabel={(option) => option.name || ''}
                value={selectedRole}
                onChange={(event, newValue) => setSelectedRole(newValue)}
                renderInput={(params) => <TextField {...params} variant="outlined" />}
              />
            </Grid>

            <Grid xs={12} sx={{ textAlign: 'right', mt: 1 }}>
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
              <IconButton color="primary" onClick={() => router.push('/user/entry')}>
                <AddIcon fontSize="large" />
              </IconButton>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>User List</Typography>
            </Box>
          }
        />
        {loading && <LinearProgress />}
        <CardContent sx={{ p: 0 }}>
          <TableContainer component={Paper} square elevation={0}>
            <Table size="small">
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', width: '120px' }}>Action</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Role</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Image</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.length === 0 && !loading ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                      No users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell>
                        <IconButton color="error" size="small" onClick={() => handleDelete(row.id)} sx={{ mr: 1 }}>
                          <DeleteIcon />
                        </IconButton>
                        <IconButton color="warning" size="small" onClick={() => router.push(`/user/entry?id=${row.id}`)}>
                          <EditIcon />
                        </IconButton>
                      </TableCell>
                      <TableCell>{row.name}</TableCell>
                      <TableCell>{row.role?.name || "_"}</TableCell>
                      <TableCell>
                        <Avatar 
                          src={row.image ? `${port}/uploads/images/user/${row.image}` : "/assets/logo.png"} 
                          alt="User Image"
                          variant="rounded"
                          sx={{ width: 40, height: 40 }}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={recordTotal}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={itemsPerPage}
            onRowsPerPageChange={(e) => {
              setItemsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[1, 2, 5, 10, 20, 40, 80, 100]}
          />
        </CardContent>
      </Card>

      {}
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