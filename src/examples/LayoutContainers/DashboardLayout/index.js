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

import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import MDBox from "components/MDBox";
import { useMaterialUIController, setLayout } from "context";

function DashboardLayout({ children }) {
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav, direction } = controller;
  const { pathname } = useLocation();

  useEffect(() => {
    setLayout(dispatch, "dashboard");
  }, [pathname]);

  return (
    <MDBox
      sx={({ breakpoints, transitions, functions: { pxToRem } }) => {
        const sidebarWidth = miniSidenav ? pxToRem(120) : pxToRem(274);
        
        return {
          position: "relative",
          width: "100vw",
          maxWidth: "100%",
          minHeight: "100vh",
          overflowX: "hidden",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "background.default",
          margin: 0,
          padding: 0,
          
          // RTL support
          ...(direction === "rtl" ? {
            [breakpoints.up("xl")]: {
              marginRight: sidebarWidth,
              width: `calc(100vw - ${sidebarWidth})`,
            }
          } : {
            [breakpoints.up("xl")]: {
              marginLeft: sidebarWidth,
              width: `calc(100vw - ${sidebarWidth})`,
            }
          }),
          
          transition: transitions.create(
            ["margin-left", "margin-right", "width"], 
            {
              easing: transitions.easing.easeInOut,
              duration: transitions.duration.standard,
            }
          ),
        };
      }}
    >
      <MDBox
        component="main"
        sx={{
          flex: 1,
          width: "100%",
          padding: 0,
          margin: 0,
          minHeight: "calc(100vh - 64px)", // Account for navbar
          "& > *": {  // Target all direct children
            width: "100%",
            maxWidth: "100%",
            padding: 0,
            margin: 0
          }
        }}
      >
        {children}
      </MDBox>
    </MDBox>
  );
}

// Typechecking props for the DashboardLayout
DashboardLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default DashboardLayout;