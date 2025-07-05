// Material Dashboard 2 React layouts
import Dashboard from "layouts/dashboard";
import SignIn from "layouts/authentication/sign-in";
import Banner from "layouts/tables/banners";
import Hosts from "layouts/tables/user";
import Categories from "layouts/tables/Categories";
import VendorManagement from "layouts/tables/VendorManagement";
import PendingDeliveryman from "layouts/tables/PendingDeliveryman";
import Coupons from "layouts/tables/coupons";
import Orders from "layouts/tables/Orders";
import Reviews from "layouts/tables/reviews";
// @mui icons
import Icon from "@mui/material/Icon";
// @mui icons

const routes = [
  {
    route: "/authentication/sign-in",
    component: <SignIn />,
  },
  {
    type: "collapse",
    name: "Dashboard",
    key: "dashboard",
    icon: <Icon fontSize="small">dashboard</Icon>,
    route: "/dashboard",
    component: <Dashboard />,
  },
  {
    type: "collapse",
    name: "Users",
    key: "users",
    icon: <Icon fontSize="small">group</Icon>, 
    route: "/users",
    component: <Hosts />,
    permission: "user_management",
  },
  {
    type: "collapse",
    name: "Banners",
    key: "banners",
    icon: <Icon fontSize="small">collections</Icon>, 
    route: "/banners",
    component: <Banner />,
  },
  {
    type: "collapse",
    name: "Orders",
    key: "orders",
    icon: <Icon fontSize="small">receipt</Icon>, 
    route: "/orders",
    component: <Orders />,  
  },
  {
    type: "collapse",
    name: "Reviews",
    key: "reviews",
    icon: <Icon fontSize="small">rate_review</Icon>, 
    route: "/reviews",
    component: <Reviews />,
  },
  {
    type: "collapse",
    name: "Categories",
    key: "Categories",
    icon: <Icon fontSize="small">category</Icon>, 
    route: "/Categories",
    component: <Categories />,
  },
  {
    type: "collapse",
    name: "Vendor Management",
    key: "vendor-management",
    icon: <Icon fontSize="small">business</Icon>, 
    route: "/vendor-management", 
    component: <VendorManagement />
  },
  {
    type: "collapse",
    name: "Pending Deliveryman",
    key: "pending-deliveryman",
    icon: <Icon fontSize="small">pending_actions</Icon>, 
    route: "/pending-deliveryman", 
    component: <PendingDeliveryman />
  },
  {
    type: "collapse",
    name: "Coupons",
    key: "coupons",
    icon: <Icon fontSize="small">local_offer</Icon>, 
    route: "/coupons", 
    component: <Coupons />
  }
  
];

export default routes;
