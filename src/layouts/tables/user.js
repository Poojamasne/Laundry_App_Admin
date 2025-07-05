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
  CardMedia,
  Snackbar,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Search as SearchIcon,
  Close as CloseIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
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
const USERS_ENDPOINT = "/api/admin/getAllUsers";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
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

  // Format photo URL
  const formatPhotoUrl = (photo) => {
    if (!photo) return null;
    if (photo.startsWith("http")) return photo;
    if (photo.startsWith("File:")) {
      // Extract the path from the File: string
      const path = photo.split("'")[1];
      return `${API_BASE_URL}/${path}`;
    }
    return `${API_BASE_URL}/${photo}`;
  };

  // Fetch users data
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        showSnackbar("No token found, please login again", "error");
        return;
      }

      const response = await axios.get(`${API_BASE_URL}${USERS_ENDPOINT}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUsers(response.data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      showSnackbar("Error fetching users", "error");
    } finally {
      setLoading(false);
    }
  };

  // Delete user
  const deleteUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showSnackbar("No token found, please login again", "error");
        return;
      }

      // Replace with your actual delete endpoint
      await axios.delete(`${API_BASE_URL}/api/admin/users/${selectedUser.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchUsers();
      setIsDeleteModalOpen(false);
      showSnackbar("User deleted successfully");
    } catch (error) {
      console.error("Error deleting user:", error);
      showSnackbar("Error deleting user", "error");
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

  // Filter users based on search
  const filteredUsers = users.filter((user) => {
    if (
      searchQuery &&
      !user.name?.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !user.email?.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !user.mobile?.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !user.id?.toString().includes(searchQuery)
    ) {
      return false;
    }
    return true;
  });

  // Open user detail modal
  const openDetailModal = (user) => {
    setSelectedUser(user);
    setIsDetailModalOpen(true);
  };

  // Open delete modal
  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
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
          src={formatPhotoUrl(value)}
          alt="User photo"
          sx={{ width: 40, height: 40 }}
        />
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
          <IconButton
            color="error"
            size="small"
            onClick={() => openDeleteModal(row.original)}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  // Initial data fetch
  useEffect(() => {
    fetchUsers();
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
                  User Management
                </MDTypography>
                <Box display="flex" alignItems="center" gap={2}>
                  <TextField
                    variant="outlined"
                    size="small"
                    placeholder="Search users..."
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
                  table={{ columns, rows: filteredUsers }}
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

      {/* User Detail Modal */}
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
          {selectedUser && (
            <>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5">
                  {selectedUser.name}
                </Typography>
                <Box display="flex" gap={1}>
                  <Chip
                    label={`ID: ${selectedUser.id}`}
                    color="primary"
                    size="small"
                  />
                </Box>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Basic Information
                  </Typography>
                  <Typography variant="body1">
                    <strong>Email:</strong> {selectedUser.email || "N/A"}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Mobile:</strong> {selectedUser.mobile || "N/A"}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Gender:</strong> {selectedUser.gender || "N/A"}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Created At:</strong> {formatDate(selectedUser.created_at)}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Photo
                  </Typography>
                  {selectedUser.photo ? (
                    <CardMedia
                      component="img"
                      image={formatPhotoUrl(selectedUser.photo)}
                      alt="User photo"
                      sx={{ maxHeight: 200, width: "auto", borderRadius: 1 }}
                    />
                  ) : (
                    <Typography variant="body2">No photo available</Typography>
                  )}
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Address Information
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body1">
                    <strong>Address:</strong> {selectedUser.address || "N/A"}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Plot Number:</strong> {selectedUser.plot_number || "N/A"}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Floor:</strong> {selectedUser.floor || "N/A"}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body1">
                    <strong>Place Name:</strong> {selectedUser.place_name || "N/A"}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Pincode:</strong> {selectedUser.pincode || "N/A"}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Landmark:</strong> {selectedUser.landmark || "N/A"}
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Location Information
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body1">
                    <strong>Latitude:</strong> {selectedUser.latitude || "N/A"}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body1">
                    <strong>Longitude:</strong> {selectedUser.longitude || "N/A"}
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

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
        <DialogTitle>
          Delete User: {selectedUser?.name}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete this user? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <MDButton onClick={() => setIsDeleteModalOpen(false)} color="secondary">
            Cancel
          </MDButton>
          <MDButton onClick={deleteUser} color="error">
            Delete
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