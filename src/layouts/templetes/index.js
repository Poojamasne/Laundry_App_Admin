import { useEffect, useState } from "react";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";
import { TEMPLET_SCREEN_CONFIG } from "config/templeteScreenConfig";
import { useParams } from "react-router-dom";
import ImportExportActions from "./ImportExportActions";

export function TempletesScreen() {
  const { templateType } = useParams();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTemplateData = async () => {
      try {
        // const config = TEMPLET_SCREEN_CONFIG[templateType];
        // if (!config) {
        //   throw new Error("Invalid template type");
        // }
        // const response = await fetch(config.apiEndpoint);
        // const result = await response.json();
        // if (result && result.success) {
        //   setData(result.data);
        // } else {
        //   throw new Error("No data found in the response");
        // }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplateData();
  }, [templateType]);

  if (loading) {
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
                >
                  <MDTypography variant="h6" color="white">
                    Loading {TEMPLET_SCREEN_CONFIG[templateType]?.header || "Data"}...
                  </MDTypography>
                </MDBox>
              </Card>
            </Grid>
          </Grid>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  if (error) {
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
                  bgColor="error"
                  borderRadius="lg"
                  coloredShadow="error"
                >
                  <MDTypography variant="h6" color="white">
                    {error}
                  </MDTypography>
                </MDBox>
              </Card>
            </Grid>
          </Grid>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  const templateConfig = TEMPLET_SCREEN_CONFIG[templateType];

  const handleImport = (importResult) => {
    // Optional: Refresh data or update state based on import result
    console.log("Import result:", importResult);
  };

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
              >
                <MDTypography variant="h6" color="white">
                  {templateConfig.header}
                </MDTypography>
              </MDBox>

              <div mt={8}>
                <ImportExportActions
                  pt={3}
                  mt
                  templateConfig={templateConfig}
                  onImport={handleImport}
                />
              </div>

              {/* <MDBox pt={3} sx={{ display: "flex", flexDirection: "column", height: "400px" }}>
                <MDBox sx={{ flex: 1, overflow: "auto" }}>
                  <DataTable
                    table={{
                      columns: templateConfig.columns,
                      rows: data,
                    }}
                    isSorted={false}
                    entriesPerPage={false}
                    showTotalEntries={false}
                    noEndBorder
                  />
                </MDBox>
              </MDBox> */}
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}
