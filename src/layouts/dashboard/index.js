/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

import { useState, useEffect } from "react";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Avatar from "@mui/material/Avatar";
import Rating from "@mui/material/Rating";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ReportsBarChart from "examples/Charts/BarCharts/ReportsBarChart";
import ReportsLineChart from "examples/Charts/LineCharts/ReportsLineChart";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";

// Data
import reportsBarChartData from "layouts/dashboard/data/reportsBarChartData";
import reportsLineChartData from "layouts/dashboard/data/reportsLineChartData";

// Dashboard components
import Projects from "layouts/dashboard/components/Projects";
import OrdersOverview from "layouts/dashboard/components/OrdersOverview";

function Dashboard() {
  const { sales, tasks } = reportsLineChartData;
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch("https://laundry-app.synoventum.site/api/admin/dashboard");
        const data = await response.json();
        setDashboardData(data.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox py={3}>
          <MDTypography variant="h6" textAlign="center">
            Loading dashboard data...
          </MDTypography>
        </MDBox>
      </DashboardLayout>
    );
  }

  if (!dashboardData) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox py={3}>
          <MDTypography variant="h6" textAlign="center">
            Failed to load dashboard data. Please try again later.
          </MDTypography>
        </MDBox>
      </DashboardLayout>
    );
  }

  // Prepare data for charts
  const prepareRatingData = () => {
    const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    
    dashboardData.reviews.forEach(review => {
      ratingCounts[review.ratings]++;
    });

    return {
      labels: ["1 Star", "2 Stars", "3 Stars", "4 Stars", "5 Stars"],
      datasets: { label: "Ratings", data: Object.values(ratingCounts) }
    };
  };

  const ratingChartData = prepareRatingData();

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="dark"
                icon="people"
                title="Total Users"
                count={dashboardData.total_users}
                percentage={{
                  color: "success",
                  amount: "",
                  label: "",
                }}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                icon="local_shipping"
                title="Total Deliveries"
                count={dashboardData.total_deliveries}
                percentage={{
                  color: "success",
                  amount: "",
                  label: "",
                }}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="success"
                icon="store"
                title="Total Vendors"
                count={dashboardData.total_vendors}
                percentage={{
                  color: "success",
                  amount: "",
                  label: "",
                }}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="primary"
                icon="shopping_cart"
                title="Total Orders"
                count={dashboardData.total_orders}
                percentage={{
                  color: "success",
                  amount: "",
                  label: "",
                }}
              />
            </MDBox>
          </Grid>
        </Grid>
        <MDBox mt={4.5}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={6}>
              <MDBox mb={3}>
                <ReportsBarChart
                  color="info"
                  title="Customer Ratings Distribution"
                  description="Distribution of customer ratings"
                  date=""
                  chart={ratingChartData}
                />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={6}>
              <MDBox mb={3}>
                <ReportsLineChart
                  color="success"
                  title="Recent Activity"
                  description="Recent orders and reviews"
                  date=""
                  chart={sales}
                />
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>
        <MDBox>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={8}>
              <Projects />
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <Card>
                <MDBox pt={3} px={3}>
                  <MDTypography variant="h6" fontWeight="medium">
                    Recent Reviews
                  </MDTypography>
                </MDBox>
                <MDBox p={2}>
                  {dashboardData.reviews.slice(0, 5).map((review) => (
                    <MDBox key={review.id} display="flex" alignItems="center" py={1} mb={1}>
                      <Avatar 
                        src={review.user_photo?.includes('http') ? review.user_photo : null} 
                        alt={review.user_name || 'User'} 
                      />
                      <MDBox ml={2} lineHeight={1}>
                        <MDTypography display="block" variant="button" fontWeight="medium">
                          {review.user_name || 'Anonymous'}
                        </MDTypography>
                        <MDTypography variant="caption">
                          {review.service_name || 'Service'} | {new Date(review.created_at).toLocaleDateString()}
                        </MDTypography>
                        <MDBox>
                          <Rating value={review.ratings} readOnly precision={0.5} />
                        </MDBox>
                        <MDTypography variant="caption" color="text">
                          {review.review}
                        </MDTypography>
                      </MDBox>
                    </MDBox>
                  ))}
                </MDBox>
              </Card>
            </Grid>
          </Grid>
        </MDBox>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Dashboard;