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
  Rating,
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
const REVIEWS_ENDPOINT = "/api/admin/getAllReviews";

export default function ReviewManagement() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReview, setSelectedReview] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Format photo URL
  const formatPhotoUrl = (photo) => {
    if (!photo) return null;
    if (photo.startsWith("http")) return photo;
    if (photo.startsWith("File:")) {
      const path = photo.split("'")[1];
      return `${API_BASE_URL}/${path}`;
    }
    return `${API_BASE_URL}/${photo}`;
  };

  // Fetch reviews data
  const fetchReviews = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.post(
        `${API_BASE_URL}${REVIEWS_ENDPOINT}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setReviews(response.data.reviews || []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter reviews based on search
  const filteredReviews = reviews.filter((review) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      review.name?.toLowerCase().includes(searchLower) ||
      review.email?.toLowerCase().includes(searchLower) ||
      review.service_name?.toLowerCase().includes(searchLower) ||
      review.id?.toString().includes(searchQuery)
    );
  });

  // Open review detail modal
  const openDetailModal = (review) => {
    setSelectedReview(review);
    setIsDetailModalOpen(true);
  };

  // Initial data fetch
  useEffect(() => {
    fetchReviews();
  }, []);

  // Columns for data table
  const columns = [
    { Header: "ID", accessor: "id", width: "8%" },
    {
      Header: "User",
      accessor: "name",
      width: "15%",
      Cell: ({ value, row }) => (
        <Box display="flex" alignItems="center" gap={1}>
          <Avatar src={formatPhotoUrl(row.original.photo)} sx={{ width: 32, height: 32 }} />
          <Typography variant="body2">{value}</Typography>
        </Box>
      ),
    },
    {
      Header: "Service",
      accessor: "service_name",
      width: "15%",
    },
    {
      Header: "Rating",
      accessor: "ratings",
      width: "12%",
      Cell: ({ value }) => <Rating value={value} precision={0.5} readOnly />,
    },
    {
      Header: "Review",
      accessor: "review",
      width: "25%",
      Cell: ({ value }) => (
        <Typography variant="body2" sx={{
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {value}
        </Typography>
      ),
    },
    {
      Header: "Date",
      accessor: "created_at",
      width: "15%",
      Cell: ({ value }) => formatDate(value),
    },
    {
      Header: "Actions",
      accessor: "actions",
      width: "10%",
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
                  Review Management
                </MDTypography>
                <Box display="flex" alignItems="center" gap={2}>
                  <TextField
                    variant="outlined"
                    size="small"
                    placeholder="Search reviews..."
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
                  table={{ columns, rows: filteredReviews }}
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

      {/* Review Detail Modal */}
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
          {selectedReview && (
            <>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5">
                  Review #{selectedReview.id}
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <Rating value={selectedReview.ratings} precision={0.5} readOnly />
                  <Typography variant="body1">
                    {selectedReview.ratings} stars
                  </Typography>
                </Box>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Review Details
                  </Typography>
                  <Typography variant="body1">
                    <strong>Review:</strong> {selectedReview.review}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Created At:</strong> {formatDate(selectedReview.created_at)}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Service Information
                  </Typography>
                  <Typography variant="body1">
                    <strong>Service:</strong> {selectedReview.service_name}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Price:</strong> ₹{selectedReview.service_price}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Category ID:</strong> {selectedReview.category_id}
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                User Information
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Avatar 
                      src={formatPhotoUrl(selectedReview.photo)} 
                      sx={{ width: 64, height: 64 }} 
                    />
                    <Box>
                      <Typography variant="body1">
                        <strong>Name:</strong> {selectedReview.name}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Email:</strong> {selectedReview.email}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Mobile:</strong> {selectedReview.mobile}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body1">
                    <strong>Address:</strong> {selectedReview.address}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Landmark:</strong> {selectedReview.landmark}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Pincode:</strong> {selectedReview.pincode}
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Additional Information
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body1">
                    <strong>Vendor ID:</strong> {selectedReview.vendor_id || "N/A"}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Deliveryboy ID:</strong> {selectedReview.deliveryboy_id || "N/A"}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body1">
                    <strong>Location:</strong> {selectedReview.latitude && selectedReview.longitude 
                      ? `${selectedReview.latitude}, ${selectedReview.longitude}`
                      : "N/A"}
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