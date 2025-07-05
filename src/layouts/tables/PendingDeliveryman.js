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
  Snackbar,
  Alert,
  CardMedia,
} from "@mui/material";
import {
  Search as SearchIcon,
  Close as CloseIcon,
  Check as CheckIcon,
  Clear as ClearIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

const API_BASE_URL = "https://laundry-app.synoventum.site";
const PENDING_DELIVERYMEN_ENDPOINT = "/api/admin/pending-deliverymans";
const DELIVERYMAN_UPDATE_ENDPOINT = "/api/admin/deliverymans";

export default function DeliverymanManagement() {
  const [deliverymen, setDeliverymen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDeliveryman, setSelectedDeliveryman] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [approvalStatus, setApprovalStatus] = useState(true);
  const [rejectionReason, setRejectionReason] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Fetch pending deliverymen data
  const fetchDeliverymen = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        showSnackbar("No token found, please login again", "error");
        return;
      }

      const response = await axios.get(`${API_BASE_URL}${PENDING_DELIVERYMEN_ENDPOINT}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      // Map the response to match your table structure
      const mappedData = response.data.vendors.map(vendor => ({
        ...vendor,
        deliverymanId: vendor.id,
        fullName: vendor.full_name,
        phone: vendor.mobile,
        approved: vendor.register_status === "Approved" ? true : 
                 vendor.register_status === "Rejected" ? false : null,
        photo: vendor.photo ? `${API_BASE_URL}/${vendor.photo}` : null
      }));
      
      setDeliverymen(mappedData || []);
    } catch (error) {
      console.error("Error fetching deliverymen:", error);
      showSnackbar("Error fetching deliverymen", "error");
    } finally {
      setLoading(false);
    }
  };

  // Handle deliveryman approval/rejection
  const handleDeliverymanStatusUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showSnackbar("No token found, please login again", "error");
        return;
      }

      await axios.put(
        `${API_BASE_URL}${DELIVERYMAN_UPDATE_ENDPOINT}/${selectedDeliveryman.id}`,
        {
          admin_id: 1, // Assuming admin ID is 1
          status: approvalStatus ? "Approved" : "Rejected",
          ...(!approvalStatus && { rejection_reason: rejectionReason })
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      
      fetchDeliverymen();
      setIsApprovalModalOpen(false);
      showSnackbar(
        `Deliveryman ${approvalStatus ? "approved" : "rejected"} successfully`
      );
    } catch (error) {
      console.error("Error updating deliveryman status:", error);
      showSnackbar("Error processing status update", "error");
    }
  };

  // Show snackbar notification
  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Filter deliverymen based on search and status
  const filteredDeliverymen = deliverymen.filter((deliveryman) => {
    // Apply status filter
    if (filter === "approved" && deliveryman.register_status !== "Approved") return false;
    if (filter === "pending" && deliveryman.register_status !== "Pending") return false;
    if (filter === "rejected" && deliveryman.register_status !== "Rejected") return false;

    // Apply search filter
    if (
      searchQuery &&
      !deliveryman.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !deliveryman.email?.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !deliveryman.phone?.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !deliveryman.deliverymanId.toString().includes(searchQuery)
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
        setFilter("all");
        break;
      case 1:
        setFilter("approved");
        break;
      case 2:
        setFilter("pending");
        break;
      case 3:
        setFilter("rejected");
        break;
      default:
        setFilter("all");
    }
  };

  // Open deliveryman detail modal
  const openDetailModal = (deliveryman) => {
    setSelectedDeliveryman(deliveryman);
    setIsDetailModalOpen(true);
  };

  // Open approval modal
  const openApprovalModal = (deliveryman, status) => {
    setSelectedDeliveryman(deliveryman);
    setApprovalStatus(status);
    setIsApprovalModalOpen(true);
    if (!status) setRejectionReason(""); // Reset rejection reason when opening reject modal
  };

  // Columns for data table
  const columns = [
    { Header: "ID", accessor: "deliverymanId", width: "8%" },
    { Header: "Full Name", accessor: "fullName", width: "15%" },
    { Header: "Email", accessor: "email", width: "20%" },
    { Header: "Phone", accessor: "phone", width: "12%" },
    {
      Header: "Photo",
      accessor: "photo",
      width: "10%",
      Cell: ({ value }) => (
        <Avatar
          src={value || "/default-avatar.png"}
          sx={{ width: 40, height: 40 }}
        />
      ),
    },
    {
      Header: "Status",
      accessor: "register_status",
      width: "10%",
      Cell: ({ value }) => (
        <Chip label={value || "Pending"} color={getStatusColor(value)} size="small" />
      ),
    },
    {
      Header: "Actions",
      accessor: "actions",
      width: "25%",
      Cell: ({ row }) => (
        <Box display="flex" gap={1}>
          <IconButton
            color="info"
            size="small"
            onClick={() => openDetailModal(row.original)}
          >
            <VisibilityIcon />
          </IconButton>
          <IconButton
            color="success"
            size="small"
            onClick={() => openApprovalModal(row.original, true)}
            disabled={row.original.register_status === "Approved"}
          >
            <CheckIcon />
          </IconButton>
          <IconButton
            color="error"
            size="small"
            onClick={() => openApprovalModal(row.original, false)}
            disabled={row.original.register_status === "Rejected"}
          >
            <ClearIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  // Initial data fetch
  useEffect(() => {
    fetchDeliverymen();
  }, []);

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
                  Deliveryman Management
                </MDTypography>
                <Box display="flex" alignItems="center" gap={2}>
                  <TextField
                    variant="outlined"
                    size="small"
                    placeholder="Search deliverymen..."
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
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="deliveryman tabs">
                  <Tab
                    label="All Deliverymen"
                    icon={<Badge badgeContent={deliverymen.length} color="primary" />}
                  />
                  <Tab
                    label="Approved"
                    icon={
                      <Badge
                        badgeContent={deliverymen.filter((d) => d.register_status === "Approved").length}
                        color="success"
                      />
                    }
                  />
                  <Tab
                    label="Pending"
                    icon={
                      <Badge
                        badgeContent={deliverymen.filter((d) => d.register_status === "Pending").length}
                        color="warning"
                      />
                    }
                  />
                  <Tab
                    label="Rejected"
                    icon={
                      <Badge
                        badgeContent={deliverymen.filter((d) => d.register_status === "Rejected").length}
                        color="error"
                      />
                    }
                  />
                </Tabs>
              </MDBox>

              <MDBox pt={3} pb={3}>
                <DataTable
                  table={{ columns, rows: filteredDeliverymen }}
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

      {/* Deliveryman Detail Modal */}
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
          {selectedDeliveryman && (
            <>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5">{selectedDeliveryman.fullName}</Typography>
                <Box display="flex" gap={1}>
                  <Chip
                    label={selectedDeliveryman.register_status || "Pending"}
                    color={getStatusColor(selectedDeliveryman.register_status)}
                  />
                </Box>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Personal Information
                  </Typography>
                  <Typography variant="body1">
                    <strong>ID:</strong> {selectedDeliveryman.id}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Full Name:</strong> {selectedDeliveryman.full_name}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Email:</strong> {selectedDeliveryman.email}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Phone:</strong> {selectedDeliveryman.mobile}
                  </Typography>
                  <Typography variant="body1">
                    <strong>WhatsApp:</strong> {selectedDeliveryman.whatsapp_number || "N/A"}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Date of Birth:</strong> {formatDate(selectedDeliveryman.dob)}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Age:</strong> {selectedDeliveryman.age}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Gender:</strong> {selectedDeliveryman.gender}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Address Information
                  </Typography>
                  <Typography variant="body1">
                    <strong>City:</strong> {selectedDeliveryman.city || "N/A"}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Address:</strong> {selectedDeliveryman.address || "N/A"}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Latitude:</strong> {selectedDeliveryman.latitude || "N/A"}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Longitude:</strong> {selectedDeliveryman.longitude || "N/A"}
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Health Information
                  </Typography>
                  <Typography variant="body1">
                    <strong>Health Disability:</strong> {selectedDeliveryman.health_disability || "N/A"}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Health Insurance:</strong> {selectedDeliveryman.health_insurance || "N/A"}
                  </Typography>
                  {selectedDeliveryman.health_insurance === "Yes" && (
                    <>
                      <Typography variant="body1">
                        <strong>Company Name:</strong> {selectedDeliveryman.company_name || "N/A"}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Insurance Number:</strong> {selectedDeliveryman.insurance_number || "N/A"}
                      </Typography>
                    </>
                  )}
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Work Information
                  </Typography>
                  <Typography variant="body1">
                    <strong>Working Shift:</strong> {selectedDeliveryman.working_shift || "N/A"}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Payment Type:</strong> {selectedDeliveryman.payment_type || "N/A"}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Status:</strong> {selectedDeliveryman.status || "N/A"}
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Bank Details
                  </Typography>
                  <Typography variant="body1">
                    <strong>Account Holder:</strong> {selectedDeliveryman.account_holdername || "N/A"}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Account Number:</strong> {selectedDeliveryman.account_number || "N/A"}
                  </Typography>
                  <Typography variant="body1">
                    <strong>IFSC Code:</strong> {selectedDeliveryman.ifsc_code || "N/A"}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Emergency Contact
                  </Typography>
                  <Typography variant="body1">
                    <strong>Emergency Number:</strong> {selectedDeliveryman.emergency_number || "N/A"}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Relative Name:</strong> {selectedDeliveryman.relative_name || "N/A"}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Relation:</strong> {selectedDeliveryman.relation || "N/A"}
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Document Photos
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2">Profile Photo</Typography>
                  {selectedDeliveryman.photo ? (
                    <CardMedia
                      component="img"
                      image={`${API_BASE_URL}/${selectedDeliveryman.photo}`}
                      alt="Profile"
                      sx={{ height: 140, borderRadius: 1 }}
                    />
                  ) : (
                    <Typography variant="body2">No photo available</Typography>
                  )}
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2">Aadhar Front</Typography>
                  {selectedDeliveryman.front_aadhar_card ? (
                    <CardMedia
                      component="img"
                      image={`${API_BASE_URL}/${selectedDeliveryman.front_aadhar_card}`}
                      alt="Aadhar Front"
                      sx={{ height: 140, borderRadius: 1 }}
                    />
                  ) : (
                    <Typography variant="body2">Not available</Typography>
                  )}
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2">PAN Card</Typography>
                  {selectedDeliveryman.front_pan_card ? (
                    <CardMedia
                      component="img"
                      image={`${API_BASE_URL}/${selectedDeliveryman.front_pan_card}`}
                      alt="PAN Card"
                      sx={{ height: 140, borderRadius: 1 }}
                    />
                  ) : (
                    <Typography variant="body2">Not available</Typography>
                  )}
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
          {selectedDeliveryman &&
            `${approvalStatus ? "Approve" : "Reject"} Deliveryman: ${
              selectedDeliveryman.full_name
            }`}
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
              required
            />
          )}
          <Typography variant="body2" color="textSecondary" mt={2}>
            {approvalStatus
              ? "Are you sure you want to approve this deliveryman?"
              : "Please provide a reason for rejecting this deliveryman."}
          </Typography>
        </DialogContent>
        <DialogActions>
          <MDButton onClick={() => setIsApprovalModalOpen(false)} color="secondary">
            Cancel
          </MDButton>
          <MDButton
            onClick={handleDeliverymanStatusUpdate}
            color={approvalStatus ? "success" : "error"}
            disabled={!approvalStatus && !rejectionReason}
          >
            {approvalStatus ? "Approve" : "Reject"}
          </MDButton>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Footer />
    </DashboardLayout>
  );
}