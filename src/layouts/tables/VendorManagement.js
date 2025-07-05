import { useState, useEffect } from "react";
import axios from "axios";
import {
  Grid,
  Card,
  Box,
  TextField,
  Typography,
  Modal,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Divider,
  Tabs,
  Tab,
  Badge,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  CardMedia,
  Snackbar,
  Alert,
  Pagination,
} from "@mui/material";
import {
  Search as SearchIcon,
  Close as CloseIcon,
  Check as CheckIcon,
  Clear as ClearIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  MoreVert as MoreVertIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://laundry-app.synoventum.site";
const PENDING_VENDORS_ENDPOINT = "/api/admin/pending-vendors";
const VENDOR_UPDATE_ENDPOINT = "/api/admin/vendors";
const ALL_VENDORS_ENDPOINT = "/api/vendor/allVendor";
const VENDOR_STATUS_ENDPOINT = "/api/vendor/vendor/status";

export default function VendorManagement() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [tabValue, setTabValue] = useState(1);
  const [approvalStatus, setApprovalStatus] = useState(true);
  const [rejectionReason, setRejectionReason] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Fetch vendors data
  const fetchVendors = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        showSnackbar("No token found, please login again", "error");
        return;
      }

      // Use different endpoints based on filter
      if (filter === "Pending") {
        const response = await axios.get(`${API_BASE_URL}${PENDING_VENDORS_ENDPOINT}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setVendors(response.data.vendors || []);
        setPagination(prev => ({ ...prev, total: response.data.vendors?.length || 0 }));
      } else {
        const response = await axios.get(
          `${API_BASE_URL}${ALL_VENDORS_ENDPOINT}?page=${pagination.page}&limit=${pagination.limit}&status=${filter}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setVendors(response.data.data || []);
        setPagination(prev => ({ 
          ...prev, 
          total: response.data.total || 0 
        }));
      }
    } catch (error) {
      console.error("Error fetching vendors:", error);
      showSnackbar("Error fetching vendors", "error");
    } finally {
      setLoading(false);
    }
  };

  // Handle vendor approval/rejection
  const handleVendorApproval = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showSnackbar("No token found, please login again", "error");
        return;
      }

      // Determine which API to use based on user role or other logic
      if (filter === "Pending") {
        // Use admin approval endpoint
        await axios.put(
          `${API_BASE_URL}${VENDOR_UPDATE_ENDPOINT}/${selectedVendor.id}`,
          {
            admin_id: 1, // Assuming admin ID is 1
            status: approvalStatus ? "Approved" : "Rejected",
            rejection_reason: approvalStatus ? null : rejectionReason,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      } else {
        // Use vendor status update endpoint
        await axios.put(
          `${API_BASE_URL}${VENDOR_STATUS_ENDPOINT}/${selectedVendor.id}`,
          {
            status: approvalStatus ? "Approved" : "Rejected",
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      }
      
      fetchVendors();
      setIsApprovalModalOpen(false);
      showSnackbar(
        approvalStatus 
          ? "Vendor approved successfully" 
          : "Vendor rejected successfully"
      );
    } catch (error) {
      console.error("Error updating vendor status:", error);
      showSnackbar("Error updating vendor status", "error");
    }
  };

  // Handle page change
  const handlePageChange = (event, newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  // Show snackbar notification
  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Filter vendors based on search and status
  const filteredVendors = vendors.filter((vendor) => {
    // Apply search filter
    if (
      searchQuery &&
      !vendor.name?.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !vendor.email?.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !vendor.mobile?.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !vendor.id?.toString().includes(searchQuery)
    ) {
      return false;
    }

    return true;
  });

  // Get status color for chips
  const getStatusColor = (status) => {
    if (status === "Approved") return "success";
    if (status === "Rejected") return "error";
    return "warning";
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    switch (newValue) {
      case 0:
        setFilter("All");
        break;
      case 1:
        setFilter("Pending");
        break;
      case 2:
        setFilter("Approved");
        break;
      case 3:
        setFilter("Rejected");
        break;
      default:
        setFilter("Pending");
    }
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page when changing tabs
  };

  // Open vendor detail modal
  const openDetailModal = (vendor) => {
    setSelectedVendor(vendor);
    setIsDetailModalOpen(true);
  };

  // Columns for data table
  const columns = [
    { Header: "ID", accessor: "id", width: "8%" },
    { Header: "Name", accessor: "name", width: "15%" },
    { Header: "Email", accessor: "email", width: "20%" },
    { Header: "Mobile", accessor: "mobile", width: "12%" },
    {
      Header: "Photo",
      accessor: "photo",
      width: "10%",
      Cell: ({ value }) => (
        <Avatar
          src={value?.startsWith("http") ? value : `${API_BASE_URL}${value}`}
          variant="rounded"
          sx={{ width: 40, height: 40 }}
        />
      ),
    },
    {
      Header: "Status",
      accessor: "status",
      width: "10%",
      Cell: ({ value }) => (
        <Chip label={value} color={getStatusColor(value)} size="small" />
      ),
    },
    {
      Header: "Created At",
      accessor: "created_at",
      width: "15%",
      Cell: ({ value }) => formatDate(value),
    },
    {
      Header: "Actions",
      accessor: "actions",
      width: "20%",
      Cell: ({ row }) => (
        <Box display="flex" gap={1}>
          <IconButton 
            color="info" 
            size="small" 
            onClick={() => openDetailModal(row.original)}
          >
            <VisibilityIcon />
          </IconButton>
          {filter === "Pending" && (
            <>
              <IconButton
                color="success"
                size="small"
                onClick={() => {
                  setSelectedVendor(row.original);
                  setApprovalStatus(true);
                  setIsApprovalModalOpen(true);
                }}
                disabled={row.original.status !== "Pending"}
              >
                <CheckIcon />
              </IconButton>
              <IconButton
                color="error"
                size="small"
                onClick={() => {
                  setSelectedVendor(row.original);
                  setApprovalStatus(false);
                  setIsApprovalModalOpen(true);
                }}
                disabled={row.original.status !== "Pending"}
              >
                <ClearIcon />
              </IconButton>
            </>
          )}
          {filter !== "Pending" && (
            <IconButton
              color={row.original.status === "Approved" ? "error" : "success"}
              size="small"
              onClick={() => {
                setSelectedVendor(row.original);
                setApprovalStatus(row.original.status !== "Approved");
                setIsApprovalModalOpen(true);
              }}
            >
              {row.original.status === "Approved" ? <ClearIcon /> : <CheckIcon />}
            </IconButton>
          )}
        </Box>
      ),
    },
  ];

  // Initial data fetch and when filter or pagination changes
  useEffect(() => {
    fetchVendors();
  }, [filter, pagination.page]);

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
                  Vendor Management
                </MDTypography>
                <Box display="flex" alignItems="center" gap={2}>
                  <TextField
                    variant="outlined"
                    size="small"
                    placeholder="Search vendors..."
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

              <MDBox px={2} pt={2}>
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="vendor tabs">
                  <Tab
                    label="All Vendors"
                    icon={<Badge badgeContent={pagination.total} color="primary" />}
                  />
                  <Tab
                    label="Pending"
                    icon={
                      <Badge
                        badgeContent={
                          filter === "Pending" 
                            ? pagination.total 
                            : vendors.filter((v) => v.status === "Pending").length
                        }
                        color="warning"
                      />
                    }
                  />
                  <Tab
                    label="Approved"
                    icon={
                      <Badge
                        badgeContent={
                          filter === "Approved" 
                            ? pagination.total 
                            : vendors.filter((v) => v.status === "Approved").length
                        }
                        color="success"
                      />
                    }
                  />
                  <Tab
                    label="Rejected"
                    icon={
                      <Badge
                        badgeContent={
                          filter === "Rejected" 
                            ? pagination.total 
                            : vendors.filter((v) => v.status === "Rejected").length
                        }
                        color="error"
                      />
                    }
                  />
                </Tabs>
              </MDBox>

              <MDBox pt={3} pb={3}>
                <DataTable
                  table={{ columns, rows: filteredVendors }}
                  isSorted={false}
                  entriesPerPage={false}
                  showTotalEntries={false}
                  noEndBorder
                  loading={loading}
                />
                {filter !== "Pending" && (
                  <Box display="flex" justifyContent="center" mt={2}>
                    <Pagination
                      count={Math.ceil(pagination.total / pagination.limit)}
                      page={pagination.page}
                      onChange={handlePageChange}
                      color="primary"
                    />
                  </Box>
                )}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>

      {/* Vendor Detail Modal */}
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
          {selectedVendor && (
            <>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5">
                  {selectedVendor.name}
                </Typography>
                <Box display="flex" gap={1}>
                  <Chip
                    label={selectedVendor.status}
                    color={getStatusColor(selectedVendor.status)}
                  />
                </Box>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Basic Information
                  </Typography>
                  <Typography variant="body1">
                    <strong>ID:</strong> {selectedVendor.id}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Name:</strong> {selectedVendor.name}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Email:</strong> {selectedVendor.email}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Mobile:</strong> {selectedVendor.mobile}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Gender:</strong> {selectedVendor.gender || "N/A"}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Date of Birth:</strong> {formatDate(selectedVendor.dob)}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Photo
                  </Typography>
                  {selectedVendor.photo ? (
                    <CardMedia
                      component="img"
                      image={selectedVendor.photo.startsWith("http") 
                        ? selectedVendor.photo 
                        : `${API_BASE_URL}${selectedVendor.photo}`}
                      alt="Vendor photo"
                      sx={{ maxHeight: 200, width: "auto", borderRadius: 1 }}
                    />
                  ) : (
                    <Typography variant="body2">No photo available</Typography>
                  )}
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Bank Details
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body1">
                    <strong>Account Holder:</strong> {selectedVendor.accountholder_name || "N/A"}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Account Number:</strong> {selectedVendor.account_number || "N/A"}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body1">
                    <strong>IFSC Code:</strong> {selectedVendor.ifsc_code || "N/A"}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Aadhar Number:</strong> {selectedVendor.aadhar_number || "N/A"}
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Business Information
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body1">
                    <strong>Working Days:</strong> {selectedVendor.week_working_days || "N/A"}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Opening Time:</strong> {selectedVendor.opening_time || "N/A"}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body1">
                    <strong>Total Working Days:</strong> {selectedVendor.total_working_days || "N/A"}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Closing Time:</strong> {selectedVendor.closing_time || "N/A"}
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

      {/* Approval Modal */}
      <Dialog open={isApprovalModalOpen} onClose={() => setIsApprovalModalOpen(false)}>
        <DialogTitle>
          {selectedVendor && `${approvalStatus ? "Approve" : "Reject"} Vendor: ${selectedVendor.name}`}
        </DialogTitle>
        <DialogContent>
          {!approvalStatus && (
            <TextField
              fullWidth
              label="Rejection Reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              margin="normal"
              multiline
              rows={3}
            />
          )}
          <Typography variant="body1" mt={2}>
            Are you sure you want to {approvalStatus ? "approve" : "reject"} this vendor?
          </Typography>
        </DialogContent>
        <DialogActions>
          <MDButton onClick={() => setIsApprovalModalOpen(false)} color="secondary">
            Cancel
          </MDButton>
          <MDButton onClick={handleVendorApproval} color={approvalStatus ? "success" : "error"}>
            {approvalStatus ? "Approve" : "Reject"}
          </MDButton>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Footer />
    </DashboardLayout>
  );
}