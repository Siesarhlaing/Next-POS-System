'use client';

import { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, CardHeader, Typography, Grid, TextField, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, Accordion, AccordionSummary, AccordionDetails, TablePagination,
  Snackbar, Alert, LinearProgress, Collapse
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  KeyboardArrowDown as ArrowDownIcon,
  KeyboardArrowUp as ArrowUpIcon
} from '@mui/icons-material';
import dayjs from 'dayjs';

import saleService from '@/services/sale.service';
import constants from "@/utils/constants";


function Row({ row }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TableRow hover sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell width="50px">
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <ArrowUpIcon /> : <ArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>{row.sale_id}</TableCell>
        <TableCell>{row.sale?.total_item}</TableCell>
        <TableCell>{row.sale?.total_amount?.toLocaleString()} (MMK)</TableCell>
        <TableCell>
          {row.sale?.date ? dayjs(row.sale.date).format('YYYY-MM-DD HH:mm:ss') : ''}
        </TableCell>
      </TableRow>
      
      {/* Expanded Details Row */}
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 2, bgcolor: '#fafafa', p: 2, borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom component="div" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                Items Detail
              </Typography>
              <Table size="small" aria-label="purchases">
                <TableHead sx={{ bgcolor: '#eee' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Item</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Qty</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>UnitPrice (MMK)</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Total (MMK)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row.items?.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell>{sub.item?.name}</TableCell>
                      <TableCell>{sub.total_sale_item}</TableCell>
                      <TableCell>{sub.item?.price?.toLocaleString()}</TableCell>
                      <TableCell>{sub.total_sale_amount?.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

export default function SalesHistoryPage() {
  // Search & Pagination States
  const [fromDate, setFromDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [toDate, setToDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [page, setPage] = useState(0); 
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [items, setItems] = useState([]);
  const [recordTotal, setRecordTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const [snackbar, setSnackbar] = useState({ open: false, text: '', color: 'success' });

  const showSnackbar = (text, color = 'success') => {
    setSnackbar({ open: true, text, color });
  };

  const getAllSales = () => {
    setLoading(true);

    const apiParams = {
      search: { fromDate, toDate },
      page: page + 1,
      itemsPerPage,
      sortBy: [{ key: 'id', order: 'desc' }]
    };

    saleService.GetAll(apiParams)
      .then((res) => {
        const rawData = res.data?.data || [];
        
      
        const grouped = rawData.reduce((acc, current) => {
          let s_id = current.sale_id;
          if (!acc[s_id]) {
            acc[s_id] = {
              sale_id: s_id,
              sale: current.sale,
              items: []
            };
          }
          acc[s_id].items.push(current);
          return acc;
        }, {});

        
        const sortedItems = Object.values(grouped).sort((a, b) => b.sale_id - a.sale_id);
        
        setItems(sortedItems);
        setRecordTotal(res.data?.total || 0);
      })
      .catch((err) => {
        if (err.message === constants.UnauthorizeMsg) {
          showSnackbar('Unauthorized access', 'error');
        } else {
          showSnackbar(err.message || 'Error loading data', 'error');
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

 
  useEffect(() => {
    getAllSales();
  }, [page, itemsPerPage]);

  const handleSearch = () => {
    setPage(0);
    getAllSales();
  };

  const handleReset = () => {
    setFromDate(dayjs().format('YYYY-MM-DD'));
    setToDate(dayjs().format('YYYY-MM-DD'));
    setPage(0);
    setTimeout(() => getAllSales(), 50);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Search Filter Panel */}
      <Accordion defaultExpanded sx={{ mb: 3, borderRadius: '8px !important' }} elevation={2}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography sx={{ fontWeight: 'bold' }}>Search</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3} justifyContent="center" alignItems="center">
            <Grid item xs={12} sm={5}>
              <Typography variant="body2" sx={{ mb: 0.5, fontWeight: '500' }}>From Date :</Typography>
              <TextField
                fullWidth
                size="small"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={5}>
              <Typography variant="body2" sx={{ mb: 0.5, fontWeight: '500' }}>To Date :</Typography>
              <TextField
                fullWidth
                size="small"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sx={{ textAlign: 'right', mt: 1 }}>
              <Button variant="contained" color="primary" size="small" onClick={handleSearch} sx={{ mr: 2 }}>
                Search
              </Button>
              <Button variant="contained" color="warning" size="small" onClick={handleReset}>
                Reset
              </Button>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Sales History List Table Card */}
      <Card elevation={2} sx={{ borderRadius: 2 }}>
        <CardHeader title={<Typography variant="h6" sx={{ fontWeight: 'bold' }}>Sales History List</Typography>} />
        {loading && <LinearProgress />}
        <CardContent sx={{ p: 0 }}>
          <TableContainer component={Paper} square elevation={0}>
            <Table size="small">
              <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell /> {/* Expand Arrow Column */}
                  <TableCell sx={{ fontWeight: 'bold' }}>Sale Id</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Total Qty</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Total Amount</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.length === 0 && !loading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                      No sales history found.
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((row) => (
                    <Row key={row.sale_id} row={row} />
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
            rowsPerPageOptions={[1, 2, 3, 10, 20, 40, 80, 100]}
          />
        </CardContent>
      </Card>

      {/* Toast Notification */}
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