import { useState, useEffect } from "react";
import axios from "axios";
import {
  Grid,
  Card,
  Box,
  TextField,
  Typography,
  Modal,
  Chip,
  Divider,
  Avatar,
  IconButton,
  Button as MDButton,
} from "@mui/material";
import { Search as SearchIcon, Visibility as VisibilityIcon } from "@mui/icons-material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://laundry-app.synoventum.site";
const ORDERS_ENDPOINT = "/api/admin/getOrders";

export default function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Format currency
  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount).toFixed(2)}`;
  };

  // Get status color for chips
  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "warning";
      case "inprogress": return "info";
      case "out_for_delivery": return "primary";
      case "Delivered": return "success";
      case "rejected": return "error";
      default: return "default";
    }
  };

  // Fetch orders data
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.post(
        `${API_BASE_URL}${ORDERS_ENDPOINT}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setOrders(response.data.orders || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter orders based on search
  const filteredOrders = orders.filter((order) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      order.booking_id?.toLowerCase().includes(searchLower) ||
      order.user_name?.toLowerCase().includes(searchLower) ||
      order.vendor_name?.toLowerCase().includes(searchLower) ||
      order.id?.toString().includes(searchQuery)
    );
  });

  // Open order detail modal
  const openDetailModal = (order) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  };

  // Initial data fetch
  useEffect(() => {
    fetchOrders();
  }, []);

  // Columns for data table
  const columns = [
    { Header: "ID", accessor: "id", width: "8%" },
    { Header: "Booking ID", accessor: "booking_id", width: "15%" },
    {
      Header: "Customer",
      accessor: "user_name",
      width: "12%",
      Cell: ({ value, row }) => (
        <Box>
          <Typography variant="body2">{value}</Typography>
          <Typography variant="caption">ID: {row.original.user_id}</Typography>
        </Box>
      ),
    },
    {
      Header: "Vendor",
      accessor: "vendor_name",
      width: "12%",
      Cell: ({ value, row }) => (
        <Box>
          <Typography variant="body2">{value}</Typography>
          <Typography variant="caption">ID: {row.original.vendor_id}</Typography>
        </Box>
      ),
    },
    {
      Header: "Amount",
      accessor: "total_amount",
      width: "10%",
      Cell: ({ value }) => formatCurrency(value),
    },
    {
      Header: "Status",
      accessor: "order_status",
      width: "12%",
      Cell: ({ value }) => (
        <Chip
          label={value.replace(/_/g, " ")}
          color={getStatusColor(value)}
          size="small"
        />
      ),
    },
    {
      Header: "Booking Date",
      accessor: "booking_datetime",
      width: "15%",
      Cell: ({ value }) => formatDate(value),
    },
    {
      Header: "Actions",
      accessor: "actions",
      width: "15%",
      Cell: ({ row }) => (
        <IconButton
          color="info"
          size="small"
          onClick={() => openDetailModal(row.original)}
        >
          <VisibilityIcon />
        </IconButton>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                bgColor="info"
                borderRadius="lg"
                coloredShadow="info"
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <MDTypography variant="h6" color="white">
                  Order Management
                </MDTypography>
                <Box display="flex" alignItems="center" gap={2}>
                  <TextField
                    variant="outlined"
                    size="small"
                    placeholder="Search orders..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{
                      backgroundColor: "white",
                      borderRadius: 1,
                      width: 250,
                    }}
                    InputProps={{
                      startAdornment: <SearchIcon sx={{ color: "text.secondary", mr: 1 }} />,
                    }}
                  />
                </Box>
              </MDBox>

              <MDBox pt={3} pb={3}>
                <DataTable
                  table={{ columns, rows: filteredOrders }}
                  isSorted={false}
                  entriesPerPage={false}
                  showTotalEntries={false}
                  noEndBorder
                  loading={loading}
                />
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>

      {/* Order Detail Modal */}
      <Modal open={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "70%",
            maxWidth: 800,
            bgcolor: "background.paper",
            p: 4,
            boxShadow: 24,
            borderRadius: 2,
            maxHeight: "80vh",
            overflowY: "auto",
          }}
        >
          {selectedOrder && (
            <>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5">
                  Order #{selectedOrder.id} - {selectedOrder.booking_id}
                </Typography>
                <Chip
                  label={selectedOrder.order_status.replace(/_/g, " ")}
                  color={getStatusColor(selectedOrder.order_status)}
                />
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Order Information
                  </Typography>
                  <Typography variant="body1">
                    <strong>Total Amount:</strong> {formatCurrency(selectedOrder.total_amount)}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Booking Date:</strong> {formatDate(selectedOrder.booking_datetime)}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Created At:</strong> {formatDate(selectedOrder.created_at)}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Cancelled:</strong> {selectedOrder.is_cancel ? "Yes" : "No"}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Service Information
                  </Typography>
                  <Typography variant="body1">
                    <strong>Service IDs:</strong> {selectedOrder.service_ids}
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Customer Information
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body1">
                    <strong>Name:</strong> {selectedOrder.user_name}
                  </Typography>
                  <Typography variant="body1">
                    <strong>User ID:</strong> {selectedOrder.user_id}
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Vendor Information
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body1">
                    <strong>Name:</strong> {selectedOrder.vendor_name}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Vendor ID:</strong> {selectedOrder.vendor_id}
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Delivery Information
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body1">
                    <strong>Deliveryman:</strong> {selectedOrder.deliveryman || "N/A"}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Deliveryman ID:</strong> {selectedOrder.deliveryman_id || "N/A"}
                  </Typography>
                </Grid>
              </Grid>

              <Box display="flex" justifyContent="flex-end" mt={3}>
                <MDButton
                  variant="gradient"
                  color="secondary"
                  onClick={() => setIsDetailModalOpen(false)}
                >
                  Close
                </MDButton>
              </Box>
            </>
          )}
        </Box>
      </Modal>

      <Footer />
    </DashboardLayout>
  );
}